import { useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { api, get_api_form } from "../../lib/api";
import { useAppSelector } from "../../redux/hooks";
import { AxiosError } from "axios";

interface ProductData {
  name: string;
  description: string;
  price: string;
  sub_cat: number;
  buisness: number;
  images: (string | File)[];
}

interface Category {
  id: string;
  name: string;
}

export default function AddProduct({
  bid,
  skip,
}: {
  bid: number;
  skip: () => void;
}) {
  const [productData, setProductData] = useState<ProductData>({
    name: "",
    description: "",
    price: "",
    sub_cat: 0,
    buisness: bid,
    images: [],
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [addedProducts, setAddedProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewProducts, setViewProducts] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (files.length + productData.images.length > 5) {
      setImageError("Maximum 5 images allowed");
      return;
    }

    const invalidFiles = Array.from(files).filter(
      (file) => file.size > 1024 * 1024
    );
    if (invalidFiles.length > 0) {
      setImageError("Some files exceed 1MB limit");
      return;
    }

    setProductData((prev) => ({
      ...prev,
      images: [...prev.images, ...Array.from(files)],
    }));
    setImageError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !productData.name ||
      !productData.description ||
      !productData.price ||
      productData.sub_cat === 0 ||
      productData.images.length === 0
    ) {
      setErrorMessage("Please fill all required fields");
      return;
    }

    try {
      const response = await get_api_form(
        user?.access_token,
        user?.refresh_token
      ).post("users/addproduct/", productData);
      if (response.status === 201) {
        setAddedProducts((prev) => [...prev, productData]);
        setProductData({
          name: "",
          description: "",
          price: "",
          sub_cat: 0,
          buisness: bid,
          images: [],
        });
        setSelectedCategory("");
        setErrorMessage(null);
        toast.success("Product added successfully!");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      if (error instanceof AxiosError) {
        // console.error("Error sending OTP:", error.message);
        if (error.status === 415) toast.error("Unsupported Media Type");
      } else {
        console.error("Unknown error:", error);
        toast.error("Failed to add product");
      }
    } finally {
      //   setLoading(false);
    }
  };

  const getProductCategories = async (value: string) => {
    setSelectedCategory(value);
    try {
      const response = await api.get(`users/searchpcats/?q=${value}/`);
      if (response.status === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category.name);
    setProductData((prev) => ({ ...prev, sub_cat: Number(category.id) }));
    setCategories([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 ">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 mt-2 bg-white border-b border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900">
            Add New Product
          </h1>
          <p className="text-gray-500 mt-1">Fill in the details below</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                placeholder="e.g. Ergonomic Office Chair"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedCategory}
                    onChange={(e) => getProductCategories(e.target.value)}
                    placeholder="Search or select category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {categories.length > 0 && selectedCategory && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {categories.map((category) => (
                        <li
                          key={category.id}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center text-sm"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category.name}
                          <FaArrowUp className="text-gray-400 transform -rotate-45" />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images
              </label>
              <div className="mt-1">
                <div className="flex items-center space-x-4">
                  <label className="flex-1">
                    <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors relative overflow-hidden">
                      {productData.images.length > 0 ? (
                        <img
                          src={
                            typeof productData.images[0] === "string"
                              ? productData.images[0]
                              : URL.createObjectURL(productData.images[0])
                          }
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <svg
                            className="mx-auto h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            Click to upload images
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG up to 1MB
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </label>
                  {productData.images.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setProductData({ ...productData, images: [] })
                      }
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                {imageError && (
                  <p className="mt-1 text-sm text-red-600">{imageError}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                placeholder="Describe your product features, benefits, etc."
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {productData.description.length}/200 characters
              </p>
            </div>

            {errorMessage && (
              <div>
                <p className="text-xs text-red-500">{errorMessage}</p>
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4">
              {addedProducts.length > 0 && (
                <button
                  type="button"
                  className="px-5 py-2.5 bg-black rounded-lg text-gray-300  transition-colors"
                  onClick={() => setViewProducts(true)}
                >
                  View Product
                </button>
              )}
              {addedProducts.length === 0 && (
                <button
                  type="button"
                  onClick={skip}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Product
              </button>
              {addedProducts.length > 0 && (
                <button
                  type="button"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700  transition-colors"
                  onClick={skip}
                >
                  Next
                </button>
              )}
            </div>
          </form>

          {addedProducts.length > 0 && viewProducts && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
              <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
                <button
                  onClick={() => setViewProducts(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Products ({addedProducts.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {addedProducts.map((product, index) => (
                    <div
                      key={index}
                      className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                    >
                      {product.images.length > 0 && (
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={
                              typeof product.images[0] === "string"
                                ? product.images[0]
                                : URL.createObjectURL(product.images[0])
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                        <p className="text-blue-600 font-medium mt-2">
                          ₹{product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
