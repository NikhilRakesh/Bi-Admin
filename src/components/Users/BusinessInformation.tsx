import { useState, useEffect } from "react";
import { api, get_api_form } from "../../lib/api";
import toast, { Toaster } from "react-hot-toast";
import { useAppSelector } from "../../redux/hooks";

interface BusinessInformationProbs {
  uid: number;
  bid: number | null;
  onContinue?: (data: BusinessFormData) => void;
  skip: () => void;
}

interface BusinessFormData {
  name: string;
  description: string;
  buisness_type: string;
  manager_name: string;
  building_name: string;
  landmark: string;
  locality: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
  whatsapp_number: string;
  email: string;
  incharge_number: string;
  uid: number;
}

interface Locality {
  id: number;
  locality_name: string;
}

export default function BusinessInformation({
  uid,
  onContinue,
  bid,
  skip,
}: BusinessInformationProbs) {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    description: "",
    buisness_type: "",
    manager_name: "",
    building_name: "",
    landmark: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    whatsapp_number: "",
    email: "",
    district: "",
    incharge_number: "",
    uid: uid,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null
  );
  const { user } = useAppSelector((state) => state.auth);
  const steps = [
    { number: 1, label: "Basic Info" },
    { number: 2, label: "Location" },
    { number: 3, label: "Contact" },
    { number: 4, label: "Profile Photo" },
  ];

  const apiKey = import.meta.env.VITE_Geocoding_api;

  useEffect(() => {
    const requiredFields = [
      "name",
      "buisness_type",
      "locality",
      "city",
      "state",
      "pincode",
      "whatsapp_number",
    ];

    if (bid) {
      nextStep();
    }

    const isValid = requiredFields.every((field) => {
      if (field === "pincode") return formData.pincode.length === 6;
      if (field === "whatsapp_number")
        return validatePhoneNumber(formData.whatsapp_number);
      return !!formData[field as keyof BusinessFormData];
    });

    const optionalValidations = [
      !formData.incharge_number ||
        validatePhoneNumber(formData.incharge_number),
      !formData.email || validateEmail(formData.email),
    ];

    setIsFormValid(isValid && optionalValidations.every((v) => v));
  }, [formData, errors, bid]);

  const validatePhoneNumber = (number: string): boolean => {
    return /^[6-9]\d{9}$/.test(number);
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        toast.error("File size exceeds 1MB. Please upload a smaller file");
        return;
      }
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  async function uploadProfilrPic() {
    if (!bid) {
      toast.error("Business not registered properly. try again.");
      return;
    } else if (!profilePic) {
      toast.error("Please select a photo.");
    }
    try {
      const response = await get_api_form(
        user?.access_token,
        user?.refresh_token
      ).patch(`users/buisnessesedit/${bid}/`, { ["image"]: profilePic });

      if (response?.status === 200) {
        setFormData({
          name: "",
          description: "",
          buisness_type: "",
          manager_name: "",
          building_name: "",
          landmark: "",
          locality: "",
          city: "",
          state: "",
          pincode: "",
          whatsapp_number: "",
          email: "",
          district: "",
          incharge_number: "",
          uid: uid,
        });
        setProfilePic(null);
        setProfilePicPreview(null);
        skip();
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && onContinue) {
      onContinue(formData);
    }
  };

  const handlePincodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: value }));

    if (value.length === 6) {
      setIsLoading(true);
      setErrors((prev) => ({ ...prev, pincode: "" }));

      try {
        const searchUrl = `https://nominatim.openstreetmap.org/search?postalcode=${value}&country=India&format=json`;
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.error || data.length === 0) {
          setErrors((prev) => ({ ...prev, pincode: "Invalid pincode" }));
          setIsLoading(false);
          return;
        }

        const geoResponse = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${data[0].lat},${data[0].lon}&key=${apiKey}`
        );
        const geoData = await geoResponse.json();

        const state = geoData.results[0]?.components.state;
        const district =
          geoData.results[0]?.components.city ||
          geoData.results[0]?.components.state_district;

        const localityResponse = await api.get(
          `users/getlocality/?city=${district}`
        );
        setFormData((prev) => ({
          ...prev,
          state: state || prev.state,
          district: district || prev.city,
          city: localityResponse.data.city,
        }));

        if (localityResponse.status === 200) {
          setLocalities(localityResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        setErrors((prev) => ({
          ...prev,
          pincode: "Failed to fetch location data",
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const nextStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name) newErrors.name = "Business name is required";
      if (!formData.buisness_type)
        newErrors.buisness_type = "Business type is required";
    }

    if (currentStep === 2) {
      if (!formData.locality) newErrors.locality = "Locality is required";
    }

    if (currentStep === 3) {
      if (!formData.whatsapp_number) {
        newErrors.whatsapp_number = "WhatsApp number is required";
      } else if (!validatePhoneNumber(formData.whatsapp_number)) {
        newErrors.whatsapp_number =
          "Please enter a valid 10-digit mobile number";
      }

      if (
        formData.incharge_number &&
        !validatePhoneNumber(formData.incharge_number)
      ) {
        newErrors.incharge_number =
          "Please enter a valid 10-digit mobile number";
      }

      if (formData.email && !validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    if (currentStep === 4) {
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="e.g. Urban Cafe"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Business Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your business in a few words"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Business Type <span className="text-red-500">*</span>
        </label>
        <select
          name="buisness_type"
          value={formData.buisness_type}
          onChange={handleChange}
          required
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.buisness_type ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="" className="text-gray-600">
            Type of Business
          </option>
          <option value="Products & Services">Products & Services</option>
          <option value="Product">Product</option>
          <option value="Service">Service</option>
        </select>
        {errors.buisness_type && (
          <p className="mt-1 text-sm text-red-500">{errors.buisness_type}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Manager Name
        </label>
        <input
          type="text"
          name="manager_name"
          value={formData.manager_name}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Full name of the manager"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Building Name/No.
          </label>
          <input
            type="text"
            name="building_name"
            value={formData.building_name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Sunshine Plaza, Unit 5"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Landmark
          </label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Near Central Park"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Pincode <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handlePincodeChange}
            required
            maxLength={6}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.pincode ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="6-digit pincode"
          />
          {isLoading && (
            <div className="absolute right-3 top-3.5">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
        {errors.pincode && (
          <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>
        )}
        {formData.pincode.length === 6 && !errors.pincode && !isLoading && (
          <p className="mt-1 text-sm text-green-600">✓ Valid pincode</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.state ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="State"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-500">{errors.state}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            District <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="district"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Locality <span className="text-red-500">*</span>
        </label>
        {localities.length > 0 ? (
          <select
            name="locality"
            value={formData.locality}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.locality ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select your locality</option>
            {localities.map((locality) => (
              <option key={locality.id} value={locality.id}>
                {locality.locality_name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            name="locality"
            value={formData.locality}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.locality ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Area/locality"
          />
        )}
        {errors.locality && (
          <p className="mt-1 text-sm text-red-500">{errors.locality}</p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          WhatsApp Number <span className="text-red-500">*</span>
        </label>
        <div className="flex">
          <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-lg bg-gray-50 text-gray-500">
            +91
          </div>
          <input
            type="tel"
            name="whatsapp_number"
            value={formData.whatsapp_number}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setFormData((prev) => ({ ...prev, whatsapp_number: value }));
              if (errors.whatsapp_number) {
                setErrors((prev) => ({ ...prev, whatsapp_number: "" }));
              }
            }}
            required
            className={`flex-1 px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.whatsapp_number ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="9999999999"
          />
        </div>
        {errors.whatsapp_number && (
          <p className="mt-1 text-sm text-red-500">{errors.whatsapp_number}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, email: e.target.value }));
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: "" }));
            }
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="contact@yourbusiness.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Incharge Contact Number
        </label>
        <input
          type="tel"
          name="incharge_number"
          value={formData.incharge_number}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
            setFormData((prev) => ({ ...prev, incharge_number: value }));
            if (errors.incharge_number) {
              setErrors((prev) => ({ ...prev, incharge_number: "" }));
            }
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.incharge_number ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Alternative contact number"
        />
        {errors.incharge_number && (
          <p className="mt-1 text-sm text-red-500">{errors.incharge_number}</p>
        )}
      </div>

      {/* <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Business Profile Picture
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            {profilePicPreview ? (
              <img
                src={profilePicPreview}
                alt="Profile preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-xs mt-1">Add Photo</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="hidden"
            />
          </label>
          <div className="text-sm text-gray-500">
            {profilePic
              ? profilePic.name
              : "Upload a profile picture for your business (optional)"}
          </div>
        </div>
      </div> */}
    </div>
  );

  const renderStep4 = () => {
    return (
      <div className="space-y-5 border">
        <label className="block text-center text-sm font-medium text-gray-700">
          Business Profile Picture
        </label>
        <div className="flex flex-col items-center space-y-4">
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            {profilePicPreview ? (
              <img
                src={profilePicPreview}
                alt="Profile preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-xs mt-1">Add Photo</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="hidden"
            />
          </label>
          <div className="text-sm text-gray-500">
            {profilePic
              ? profilePic.name
              : "Upload a profile picture for your business (optional)"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="px-8 pt-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Business Information
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Step {currentStep} of 4
              </span>
            </div>
          </div>

          <div className="mb-8 w-full">
            <div className="flex justify-between items-center w-full relative">
              <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                {steps.map((step) => (
                  <div key={step.number} className="relative">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                        currentStep === step.number
                          ? "bg-blue-600 text-white"
                          : currentStep > step.number
                          ? "bg-blue-300 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.number}
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 flex justify-between px-8 z-0">
                {steps.slice(0, -1).map((step) => (
                  <div
                    key={step.number}
                    className={`h-1 flex-1 mx-4 ${
                      currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Labels */}
            <div className="flex justify-between mt-8 px-2">
              {steps.map((step) => (
                <span
                  key={step.number}
                  className={`text-sm font-medium ${
                    currentStep === step.number
                      ? "text-blue-600 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </form>
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between">
            {currentStep !== 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Back
              </button>
            )}

            <div className="flex space-x-3 justify-end w-full">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isFormValid}
                  onClick={
                    profilePic
                      ? () => uploadProfilrPic()
                      : () => onContinue?.(formData)
                  }
                  className={`px-6 py-3 text-sm font-medium text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isFormValid
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-400 cursor-not-allowed"
                  }`}
                >
                  {!profilePic ? "Complete Registration" : "Upload Image"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
