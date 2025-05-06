import { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiChevronRight, FiSave, FiX } from "react-icons/fi";
import { useAppSelector } from "../../redux/hooks";
import { token_api } from "../../lib/api";
import { TbEdit } from "react-icons/tb";
import { RiResetLeftFill } from "react-icons/ri";

interface SubCategory {
  id: number;
  cat_name: string;
  general_cat: number;
  maped: boolean;
}

interface SubCategoryResponse {
  results: SubCategory[];
  links: Links;
  count: number;
  page_size: number;
}

interface Category {
  id: number;
  cat_name: string;
  dcats_count: number;
}

interface Links {
  next: string | null;
  previous: string | null;
}

interface CategoryResponse {
  total_gcat_count: number;
  count: number;
  links: Links;
  page_size: number;
  results: Category[];
  total_dcat_count: number;
}

interface ParentCat {
  cat_name: string;
  id: number;
}

export default function CategoryManagement() {
  const [activeTab, setActiveTab] = useState<"business" | "product">(
    "business"
  );
  const [viewMode, setViewMode] = useState<"main" | "sub">("main");
  const [selectedParent, setSelectedParent] = useState<ParentCat | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [gCat, setGcat] = useState<CategoryResponse | null>(null);
  const [dCat, setDcat] = useState<SubCategoryResponse | null>(null);
  const [editData, setEditData] = useState<Category | SubCategory | null>(null);
  const [resfresh, setRefresh] = useState(false);

  const { user } = useAppSelector((state) => state.auth);

  const paginationData = viewMode === "main" ? gCat : dCat;
  const totalItems = paginationData?.count ?? 0;
  const pageSize = paginationData?.page_size ?? 10;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const hasPrev = Boolean(paginationData?.links?.previous);
  const hasNext = Boolean(paginationData?.links?.next);

  useEffect(() => {
    activeTab === "business" ? getGcat(null) : getPGcat(null);
  }, [activeTab, resfresh]);

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  async function getGcat(url: string | null | undefined) {
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).get(
        url ? url.replace("http://api.brandsinfo.in/", "") : "badmin/get_gcats/"
      );

      if (response.status === 200) {
        setGcat(response.data);
      }
    } catch (error) {
      console.log("error on GeneralCatagories:", error);
    }
  }

  async function getDcat(
    page: string | null | undefined,
    item: Category | null
  ) {
    try {
      if (item) {
        console.log(item, "dcat");

        setSelectedParent(() => ({ cat_name: item.cat_name, id: item.id }));
      }

      const url = page
        ? page.replace("http://api.brandsinfo.in/", "")
        : `badmin/get_dcats/?gid=${item?.id}`;

      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).get(url);

      if (response.status === 200) {
        setViewMode("sub");

        setDcat(response.data);
      }
    } catch (error) {
      console.log("Error fetching subcategories:", error);
    }
  }

  async function getPGcat(url: string | null | undefined) {
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).get(
        url
          ? url.replace("http://api.brandsinfo.in/", "")
          : "badmin/get_p_gcats/"
      );

      if (response.status === 200) {
        setGcat(response.data);
      }
    } catch (error) {
      console.log("error on getPGcat:", error);
    }
  }

  async function getPSubcat(
    page: string | null | undefined,
    item: Category | null
  ) {
    try {
      if (item) {
        console.log(item);

        setSelectedParent(() => ({ cat_name: item.cat_name, id: item.id }));
      }

      const url = page
        ? page.replace("http://api.brandsinfo.in/", "")
        : `badmin/get_p_subcats/?gid=${item?.id}`;

      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).get(url);

      if (response.status === 200) {
        setDcat(response.data);
        setViewMode("sub");
      }
    } catch (error) {
      console.log("Error fetching subcategories:", error);
    }
  }

  async function SearchCategories(query: string) {
    const trimmedQuery = query.trim();
    let url;

    setSearchTerm(trimmedQuery);
    if (!trimmedQuery) {
      if (activeTab === "business") {
        viewMode === "main"
          ? getGcat(null)
          : getDcat(null, selectedParent as Category | null);
        return;
      } else {
        viewMode === "main"
          ? getPGcat(null)
          : getPSubcat(null, selectedParent as Category | null);
        return;
      }
    }

    if (activeTab === "business") {
      url =
        viewMode === "main"
          ? `users/search_gencats/?q=${trimmedQuery}&for_admin=true`
          : `users/suggestions_bdcats/?q=${trimmedQuery}&for_admin=true`;
    } else {
      url =
        viewMode === "main"
          ? `users/search_p_gcats/?q=${trimmedQuery}&for_admin=true`
          : `users/search_p_sub_cats/?q=${trimmedQuery}&for_admin=true`;
    }

    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).get(url);

      if (response.status === 200) {
        viewMode === "main" ? setGcat(response.data) : setDcat(response.data);
      }
    } catch (error) {
      console.log("error on SearchCategories:", error);
    }
  }

  const handleAddCategory = async () => {
    let url;
    if (activeTab === "business") {
      url =
        viewMode === "main"
          ? "badmin/add_general_cats/"
          : "badmin/add_descriptive_cats/";
    } else {
      url =
        viewMode === "main" ? "badmin/add_p_gcats/" : "badmin/add_p_subcats/";
    }

    const body =
      viewMode === "main"
        ? { gcats: [categoryName] }
        : { gid: selectedParent?.id, dcats: categoryName.split(",") };
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).post(url, body);

      if (response.status === 201) {
        setRefresh(!resfresh);
        setCategoryName("");
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.log("error on GeneralCatagories:", error);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url =
      viewMode === "main"
        ? `badmin/edit_gcats/${editData?.id}/`
        : `badmin/edit_dcats/${editData?.id}/`;
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).patch(url, { cat_name: editData?.cat_name });

      if (response.status === 200) {
        if (viewMode == "main") {
          if (gCat) {
            const updatedResults = gCat.results.map((cat) =>
              cat.id === editData?.id
                ? { ...cat, cat_name: editData.cat_name }
                : cat
            );
            setGcat({
              ...gCat,
              results: updatedResults,
            });
          }
          closeEditModal();
        } else {
          if (dCat) {
            const updatedResults = dCat.results.map((cat) =>
              cat.id === editData?.id
                ? { ...cat, cat_name: editData.cat_name }
                : cat
            );

            setDcat({
              ...dCat,
              results: updatedResults,
            });
          }
          closeEditModal();
        }
      }
    } catch (error) {
      console.log("error on handleEdit:", error);
    }
  };

  function closeEditModal() {
    setIsEditModalOpen(false);
    setEditData(null);
  }

  function openEditModal(data: Category | SubCategory) {
    setEditData(data);
    setIsEditModalOpen(true);
  }

  return (
    <div className="max-h-screen overflow-y-auto p-6">
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Category Management
            </h1>
            <p className="text-gray-600">
              Organize your business and product categories
            </p>
          </div>
        </div>

        <div className="flex border-b border-gray-300 mb-6">
          <button
            onClick={() => {
              setActiveTab("business");
              setViewMode("main");
              setSelectedParent(null);
            }}
            className={`px-4 py-2 font-medium ${
              activeTab === "business"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Business Categories
          </button>
          <button
            onClick={() => {
              setActiveTab("product");
              setViewMode("main");
              setSelectedParent(null);
            }}
            className={`px-4 py-2 font-medium ${
              activeTab === "product"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Product Categories
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">
              Main Categories
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {gCat?.total_gcat_count}
            </p>
          </div>
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">
              Sub Categories
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {gCat?.total_dcat_count}
            </p>
          </div>
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">Actions</h3>
            <div className="mt-4">
              <button
                onClick={() => {
                  setIsAddModalOpen(true);
                  setCategoryName("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiPlus className="inline mr-2" />
                Add {viewMode === "main" ? "Main" : "Sub"} Category
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#fdfcf8] rounded-xl shadow-sm overflow-hidden border border-[#c5b648]">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  // activeTab === "business" ? getGcat(null) : getPGcat(null);
                  setViewMode("main");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded ${
                  viewMode === "main"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Main Categories
              </button>
              {viewMode !== "main" && (
                <button className="px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-gray-200">
                  Sub Categories
                </button>
              )}

              <button
                onClick={() => {
                  activeTab === "business" ? getGcat(null) : getPGcat(null);
                  setViewMode("main");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="px-3 py-1 rounded flex items-center gap-1 bg-red-100 text-red-800 hover:bg-gray-200"
              >
                <RiResetLeftFill size={14} />
                <span>reset</span>{" "}
              </button>
            </div>

            <div className="flex items-center space-x-4  ">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${viewMode} categories...`}
                  className="pl-10 pr-4 py-2 border border-[#c5b648] rounded-lg   outline-[#c5b648]"
                  value={searchTerm}
                  onChange={(e) => {
                    SearchCategories(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  {viewMode === "sub" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent Category
                    </th>
                  )}

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {viewMode === "main" ? "Sub Categories" : "Items"}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#fdfcf8] divide-y divide-gray-200">
                {viewMode === "main" ? (
                  gCat && gCat.results?.length > 0 ? (
                    gCat.results.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                activeTab === "business"
                                  ? getDcat(null, item)
                                  : getPSubcat(null, item);
                              }}
                              className="text-gray-500 hover:text-gray-700 mr-2"
                            >
                              <FiChevronRight />
                            </button>
                            <div className="text-sm font-medium text-gray-900">
                              {item.cat_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {item.dcats_count} subcategories
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <TbEdit />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No categories found
                      </td>
                    </tr>
                  )
                ) : dCat && dCat.results?.length > 0 ? (
                  dCat.results.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.cat_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {selectedParent?.cat_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {item.maped ? "Mapped" : "Unmapped"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <TbEdit />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No subcategories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-700">
              Showing {startItem} to {endItem} of {totalItems} {viewMode}{" "}
              categories
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  viewMode === "main"
                    ? getGcat(paginationData?.links?.previous)
                    : getDcat(paginationData?.links?.previous, null);
                }}
                disabled={!hasPrev}
                className={`px-3 py-1 rounded ${
                  !hasPrev
                    ? "bg-gray-200 text-gray-500"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => {
                  setCurrentPage((p) => p + 1);
                  viewMode === "main"
                    ? getGcat(paginationData?.links?.next)
                    : getDcat(paginationData?.links?.next, null);
                }}
                disabled={!hasNext}
                className={`px-3 py-1 rounded ${
                  !hasNext
                    ? "bg-gray-200 text-gray-500"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Add New {viewMode === "main" ? "Main" : "Sub"}{" "}
              {activeTab === "business" ? "Business" : "Product"} Category
            </h2>

            {viewMode === "sub" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <div className="w-full p-2 border border-[#c5b648] rounded-lg">
                  <p>{selectedParent?.cat_name}</p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                placeholder={`Enter ${
                  viewMode === "main" ? "main" : "sub"
                } category name`}
                className="w-full p-2 border border-[#c5b648] rounded-lg"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setCategoryName("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={
                  !categoryName.trim() ||
                  (viewMode === "sub" && !selectedParent)
                }
                className={`px-4 py-2 rounded-lg text-white ${
                  !categoryName.trim() ||
                  (viewMode === "sub" && !selectedParent)
                    ? "bg-blue-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-ubuntu">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold font-ubuntuMedium text-gray-800">
                Edit {viewMode === "main" ? "Main" : "Sub"} Category
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {viewMode === "main" ? "Main" : "Sub"} Category Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={editData?.cat_name}
                  onChange={(e) =>
                    setEditData((prev) =>
                      prev ? { ...prev, cat_name: e.target.value } : prev
                    )
                  }
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FiSave className="mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
