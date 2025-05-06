"use client";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FiUpload,
  FiPlus,
} from "react-icons/fi";
import { api, get_api_form } from "../../lib/api";
import { useAppSelector } from "../../redux/hooks";
import { IoMdClose } from "react-icons/io";

interface Service {
  name: string;
  price: string;
  description: string;
  images: (string | File)[];
}

interface ServiceCategory {
  title: string;
  services: Service[];
}

export default function ServiceManager({
  bid,
  skip,
}: {
  bid: number;
  skip: () => void;
}) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [viewService, setViewService] = useState(false);
  const [service, setService] = useState<Service>({
    name: "",
    price: "",
    description: "",
    images: [],
  });
  const [errors, setErrors] = useState({
    category: "",
    service: "",
  });
  const { user } = useAppSelector((state) => state.auth);

  const handleCreateCategory = async () => {
    if (!currentCategory) {
      setErrors({ ...errors, category: "Category name is required" });
      return;
    }

    try {
      const response = await api.post("users/servicecats/", {
        cat_name: currentCategory,
        buisness: bid,
      });

      if (response.status === 201) {
        setCategoryId(response.data.id);
        setErrors({ ...errors, category: "" });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    } finally {
      //   setIsLoading(false);
    }
  };

  const handleCreateService = async () => {
    console.log(currentCategory);

    if (!categoryId) {
      setErrors({ ...errors, category: "Please select a category" });
      return;
    }

    if (!service.name || !service.price || !service.description) {
      setErrors({ ...errors, service: "Please fill all service details" });
      return;
    }

    if (service.images.length === 0) {
      setErrors({ ...errors, service: "Please upload at least one image" });
      return;
    }

    try {
      const response = await get_api_form(
        user?.access_token,
        user?.refresh_token
      ).post("users/services/", {
        name: service.name,
        price: service.price,
        images: service.images,
        description: service.description,
        cat: categoryId,
        buisness: bid,
      });

      if (response.status === 201) {
        const updatedCategories = [...categories];
        const categoryIndex = updatedCategories.findIndex(
          (c) => c.title === currentCategory
        );

        if (categoryIndex >= 0) {
          updatedCategories[categoryIndex].services.push({ ...service });
        } else {
          updatedCategories.push({
            title: currentCategory,
            services: [{ ...service }],
          });
        }

        setCategories(updatedCategories);
        resetServiceForm();
        toast.success("Service added successfully");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("Failed to add service");
    } finally {
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 1024 * 1024) {
        toast.error("File size should be less than 1MB");
        return;
      }
    }

    setService({
      ...service,
      images: [...service.images, ...Array.from(files)],
    });
  };

  const resetServiceForm = () => {
    setService({
      name: "",
      price: "",
      description: "",
      images: [],
    });
    setErrors({ ...errors, service: "" });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl">
      <Toaster position="top-center" />

      <div className="gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Service Category
            </h2>

            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={currentCategory}
                  onChange={(e) => {
                    setCurrentCategory(e.target.value);
                    setErrors({ ...errors, category: "" });
                  }}
                  placeholder="e.g. Hair Services"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              <button
                onClick={() => {
                  if (categoryId) {
                    setCurrentCategory("");
                    setCategoryId("");
                  } else {
                    handleCreateCategory();
                  }
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FiPlus /> {categoryId ? "Change" : "Create"}
              </button>
            </div>

            {categoryId && (
              <p className="text-sm text-gray-600 mt-3">
                Adding services to:{" "}
                <span className="font-medium">{currentCategory}</span>
              </p>
            )}
          </div>

          <div className="bg-white ">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Service Details
              </h2>
              {categories.length > 0 && (
                <button
                  onClick={() => setViewService(true)}
                  className="text-gray-50 bg-blue-500 px-2 text-sm py-1 rounded-md"
                >
                  view services
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={service.name}
                  onChange={(e) =>
                    setService({ ...service, name: e.target.value })
                  }
                  placeholder="e.g. Haircut & Styling"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={service.price}
                  onChange={(e) =>
                    setService({ ...service, price: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={service.description}
                onChange={(e) =>
                  setService({ ...service, description: e.target.value })
                }
                placeholder="Describe your service in detail..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Images
              </label>

              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors h-32 flex flex-col items-center justify-center">
                    <FiUpload className="w-6 h-6 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {service.images.length > 0
                        ? `${service.images.length} image(s) selected`
                        : "Click to upload images"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 5 images, 1MB each
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {service.images.length > 0 && (
                  <button
                    type="button"
                    className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={
                        typeof service.images[0] === "string"
                          ? service.images[0]
                          : URL.createObjectURL(service.images[0])
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
              </div>
            </div>

            {errors.service && (
              <p className="text-red-500 text-sm mt-2">{errors.service}</p>
            )}
            <div className="flex gap-2">
              {categories.length === 0 && (
                <button
                  type="button"
                  onClick={skip}
                  className="w-full mt-6 py-3 bg-black text-gray-300 rounded-md  transition-colors flex items-center justify-center gap-2"
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                onClick={handleCreateService}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FiPlus /> Add Service
              </button>

              {categories.length > 0 && (
                <button
                  type="button"
                  className="w-full mt-6 py-3 rounded-md bg-black text-gray-300 transition-colors"
                  onClick={skip}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        {viewService && (
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-700 bg-opacity-50 flex justify-center items-center h-screen w-full ">
            <div className="w-6/12">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Your Services
                  </h2>
                  <IoMdClose
                    className="text-red-500 cursor-pointer "
                    size={30}
                    onClick={() => setViewService(false)}
                  />
                </div>

                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No services added yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {categories.map((category, catIndex) => (
                      <div
                        key={catIndex}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <h3 className="font-medium text-gray-800 mb-3">
                          {category.title}
                        </h3>

                        <div className="space-y-3">
                          {category.services.map((service, svcIndex) => (
                            <div
                              key={svcIndex}
                              className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              {service.images.length > 0 && (
                                <div className="w-16 h-16 rounded-lg overflow-hidden">
                                  <img
                                    src={
                                      typeof service.images[0] === "string"
                                        ? service.images[0]
                                        : URL.createObjectURL(service.images[0])
                                    }
                                    alt={service.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 truncate">
                                  {service.name}
                                </h4>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {service.description}
                                </p>
                                <p className="text-orange-600 font-medium mt-1">
                                  ₹{service.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
