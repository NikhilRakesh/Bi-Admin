import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FiX, FiUpload, FiEdit2 } from "react-icons/fi";
import { get_api_form, token_api } from "../../lib/api";
import { useAppSelector } from "../../redux/hooks";

interface Business {
  id: number;
  name: string;
  building_name: string;
  buisness_type: string;
  image: string;
  description: string;
  pincode: string;
  city: number;
  locality: number;
  state: string;
  plan: string;
  rating: number;
  verified: boolean;
  assured: boolean;
  created_on: string;
}
interface BusinessEditModalProb {
  initialData: Business;
  onClose: () => void;
  isOpen: boolean;
  render: () => void;
}

export default function BusinessEditModal({
  isOpen,
  onClose,
  initialData,
  render,
}: BusinessEditModalProb) {
  const [formData, setFormData] = useState<Business>(initialData);
  const [previewImage, setPreviewImage] = useState(initialData?.image || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        toast.error("File size exceeds 1MB. Please upload a smaller file");
        return;
      }
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).patch(`users/buisnessesedit/${formData.id}/`, {
        name: formData.name,
        description: formData.description,
        building_name: formData.building_name,
      });

      if (response.status === 200) {
        render();
        onClose();
      }
    } catch (error) {
      console.error("Unknown error:", error);
      toast.error("Something went wrong, please try again.");
    }
  }

  const uploadImage = async () => {
    if (selectedImage) {
      setIsUploading(true);
      try {
        const response = await get_api_form(
          user?.access_token,
          user?.refresh_token
        ).patch(`users/buisnessesedit/${formData.id}/`, {
          ["image"]: selectedImage,
        });

        if (response.status === 200) {
          setIsUploading(false);
          setSelectedImage(null);
        }
      } catch (error) {
        setIsUploading(false);
        console.error("Unknown error:", error);
        toast.error("Something went wrong, please try again.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit Business Details
          </h2>
          <button
            onClick={() => {
              setSelectedImage(null), onClose();
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiEdit2 size={24} />
                    </div>
                  )}
                </div>
                <div>
                  {!selectedImage ? (
                    <label className="cursor-pointer">
                      <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <FiUpload className="mr-2" />
                        Upload Photo
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={uploadImage}
                        disabled={isUploading}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                          isUploading
                            ? "bg-gray-300 text-gray-600"
                            : "bg-green-600 text-white hover:bg-green-700"
                        } transition-colors`}
                      >
                        {isUploading ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Uploading...
                          </span>
                        ) : (
                          "Save Image"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewImage(initialData.image || "");
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="buildingName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Building Name
              </label>
              <input
                type="text"
                id="building_name"
                name="building_name"
                value={formData.building_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* <div className="mb-4">
              <label
                htmlFor="locality"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Locality*
              </label>
              <input
                type="text"
                id="locality"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City*
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="pincode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pincode*
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div> */}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
