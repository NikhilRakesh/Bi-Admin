"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FiPlus, FiSearch, FiChevronRight, FiArrowLeft } from "react-icons/fi";
import { api, token_api } from "../../lib/api";
import { useAppSelector } from "../../redux/hooks";

interface Category {
  id: number;
  name: string;
}

interface SpecificCategory {
  cat_name: string;
  id: number;
}

const CategorySkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="px-2 py-1 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between animate-pulse">
            <div className="h-4 w-24 bg-gray-300 rounded-md"></div>
            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function CategorySelector({
  bid,
  skip,
}: {
  bid: number;
  skip: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [specificCategories, setSpecificCategories] = useState<
    SpecificCategory[]
  >([]);
  const [selectedMainCategory, setSelectedMainCategory] =
    useState<Category | null>(null);
  const [selectedSpecificCategories, setSelectedSpecificCategories] = useState<
    number[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const { user } = useAppSelector((state) => state.auth);

  const fetchMainCategories = async () => {
    try {
      const response = await api.get(`users/popular_gencats/`);
      if (response.status === 200) {
        setMainCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await api.get(`users/search_gencats/?q=${query}`);
      setSearchResults(response.data.suggestions);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    }
  };

  const selectMainCategory = async (category: Category) => {
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).post(`users/add_bgencats/`, {
        cid: category.id,
        bid: bid,
      });

      if (response.status === 200) {
        setSelectedMainCategory(category);
        fetchSpecificCategories(category.id);
        setStep(2);
      }
    } catch (error) {
      console.error("Error selecting category:", error);
      toast.error("Failed to select category");
    } finally {
      //   setIsLoading(false);
    }
  };

  const fetchSpecificCategories = async (mainCategoryId: number) => {
    try {
      const response = await api.get(
        `users/get_descats/?gcid=${mainCategoryId}`
      );
      if (response.status === 200) {
        setSpecificCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      toast.error("Failed to load subcategories");
    } finally {
    }
  };

  const toggleSpecificCategory = (categoryId: number) => {
    setSelectedSpecificCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const saveSpecificCategories = async () => {
    if (selectedSpecificCategories.length === 0) {
      toast.error("Please select at least one subcategory");
      return;
    }

    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).post(`users/add_descats/`, {
        bid: bid,
        dcid: selectedSpecificCategories,
      });

      if (response.status === 200) {
        toast.success("Categories saved successfully");
        skip()
      }
    } catch (error) {
      console.error("Error saving categories:", error);
      toast.error("Failed to save categories");
    } finally {
      //   setIsLoading(false);
    }
  };

  const resetToMainCategories = () => {
    setStep(1);
    setSelectedMainCategory(null);
    setSelectedSpecificCategories([]);
    fetchMainCategories();
  };

  useEffect(() => {        
    fetchMainCategories();
  }, []);

  return (
    <div className="max-w-6xl max-h-screen overflow-y-scroll  mx-auto p-6 bg-white rounded-xl">
      <Toaster position="top-center" />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {step === 1
            ? "Select Your Business Category"
            : "Refine Your Category"}
        </h1>
        <p className="text-gray-600">
          {step === 1
            ? "Choose the main category that best describes your business"
            : "Select specific subcategories to help customers find you"}
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for categories..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
                {searchResults.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => selectMainCategory(category)}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-medium text-gray-800">
                      {category.name}
                    </span>
                    <FiChevronRight className="text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Popular Categories
            </h3>

            {mainCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mainCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => selectMainCategory(category)}
                    className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-800">
                      {category.name}
                    </span>
                    <FiPlus className="text-gray-400 hover:text-orange-500 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <CategorySkeleton />
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={resetToMainCategories}
              className="flex items-center text-orange-600 hover:text-orange-700 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to categories
            </button>

            <div className="bg-orange-50 text-orange-800 px-4 py-2 rounded-lg">
              <span className="font-medium">Main Category:</span>{" "}
              {selectedMainCategory?.name}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Select Specific Categories
            </h3>

            {specificCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {specificCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => toggleSpecificCategory(category.id)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedSpecificCategories.includes(category.id)
                        ? "bg-orange-100 border-orange-500"
                        : "bg-white border-gray-200 hover:shadow-md"
                    }`}
                  >
                    <span className="font-medium text-gray-800">
                      {category.cat_name}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedSpecificCategories.includes(category.id)
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {selectedSpecificCategories.includes(category.id) && (
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <CategorySkeleton />
            )}
          </div>

          <div className="flex justify-center pt-8">
            <button
              onClick={saveSpecificCategories}
              disabled={selectedSpecificCategories.length === 0}
              className={`px-8 py-3 rounded-xl text-white font-medium transition-all ${
                selectedSpecificCategories.length === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 shadow-md"
              }`}
            >
              {"Save & Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
