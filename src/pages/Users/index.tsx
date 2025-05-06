import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FiSearch, FiPlus, FiUser, FiPhone, FiUserCheck } from "react-icons/fi";
import { token_api } from "../../lib/api";
import { useAppSelector } from "../../redux/hooks";
import { MdBusinessCenter } from "react-icons/md";
import AddUserModal from "../../components/Users/addUserModal";
import BusinessAddModal from "../../components/Users/BusinessAddModal";
import { RiResetLeftFill } from "react-icons/ri";

interface User {
  first_name: string;
  mobile_number: string | null;
  date_joined: string;
  is_vendor: boolean;
  is_customer: boolean;
  id: number;
}

interface UserListResponse {
  count: number;
  page_size: number;
  total_user_count: number;
  total_customer_count: number;
  total_vendors_count: number;
  links: {
    next: string | null;
    previous: string | null;
  };
  results: User[];
}

export default function Users() {
  const [users, setUsers] = useState<UserListResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [uid, setUid] = useState<number | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isBusinessAddModalOpen, setIsBusinessAddModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
  });
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    getUsers(null, null);
  }, [refresh]);

  useEffect(() => {
    searchUsers();
  }, [searchTerm]);

  const paginationData = users;
  const totalItems = paginationData?.count ?? 0;
  const pageSize = paginationData?.page_size ?? 10;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const hasPrev = Boolean(paginationData?.links?.previous);
  const hasNext = Boolean(paginationData?.links?.next);

  const handleAddUser = async () => {
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).post("badmin/add_user/", newUser);

      if (response.status === 201) {
        toast.success(response.data.detail);
        setRefresh(!refresh);
        setNewUser({
          name: "",
          phone: "",
        });
        setIsAddUserModalOpen(false);
      }
    } catch (error) {
      console.log("error on handleAddUser:", error);
      toast.error("This number already exists.");
    }
  };

  async function getUsers(
    url: string | null | undefined,
    filter: null | string
  ) {
    let path;

    path = filter ? `badmin/get_users/${filter}` : `badmin/get_users/`;

    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).get(url ? url.replace("http://api.brandsinfo.in/", "") : path);

      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (error) {
      console.log("error on handleAddUser:", error);
    }
  }

  const openBusinessAddModal = (id: number) => {
    setUid(id);
    setIsBusinessAddModalOpen(true);
  };

  async function searchUsers() {
    if (!searchTerm.trim()) {
      getUsers(null, null);
      return;
    }
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).get(`users/search_users/?q=${searchTerm}`);

      if (response.status === 200) {
        setUsers((prev) =>
          prev ? { ...prev, results: response.data.results } : null
        );
      }
    } catch (error) {
      console.log("error on searchUsers:", error);
    }
  }

  return (
    <div className="max-h-screen p-6 overflow-y-auto">
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              User Management
            </h1>
            <p className="text-gray-600">Manage registered users and vendors</p>
          </div>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center px-4 py-2 bg-black text-gray-300 rounded-lg transition-colors"
          >
            <FiPlus className="mr-2" />
            Add New User
          </button>
        </div>

        <div className="mb-6 bg-[#fdfcf8]  rounded-xl shadow-sm ">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email or phone..."
                className="w-full pl-10 pr-4 py-2 outline-none border border-[#c5b648] rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center border-0 space-x-4">
              <select
                className="px-8 py-2  border border-[#c5b648] rounded-md text-sm"
                onChange={(e) =>
                  getUsers(
                    null,
                    e.target.value === "all" ? null : e.target.value
                  )
                }
              >
                <option value="all">All Users</option>
                <option value="?vendor=true">Vendors</option>
                <option value="?customer=true">Customers</option>
              </select>
            </div>
            <button
              onClick={() => getUsers(null, null)}
              className="bg-red-100 px-7 py-1 rounded-md border border-red-500 text-red-500 flex items-center gap-2"
            >
              <RiResetLeftFill />
              reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {users?.total_user_count}
            </p>
          </div>
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">Vendors</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {users?.total_vendors_count}
            </p>
          </div>
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">Customers</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {users?.total_customer_count}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#c5b648]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#fdfcf8] divide-y divide-gray-300">
                {users && users?.results?.length > 0 ? (
                  users?.results?.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiPhone className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {user.mobile_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {user.is_vendor && user.is_customer && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                              <FiUserCheck className="mr-1" /> V & C
                            </span>
                          )}

                          {user.is_vendor && !user.is_customer && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              <FiUserCheck className="mr-1" /> Vendor
                            </span>
                          )}

                          {user.is_customer && !user.is_vendor && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <FiUser className="mr-1" /> Customer
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.date_joined).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openBusinessAddModal(user.id)}
                          className="text-gray-300 bg-black   rounded-md text-sm px-2 py-1  "
                        >
                          <MdBusinessCenter className="inline mr-1" /> Add
                          Business
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No users found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm font-ubuntu text-gray-700">
              Showing {startItem} to {endItem} of {totalItems} users
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  getUsers(users?.links.previous, null);
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
                  getUsers(users?.links.next, null);
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

      {isAddUserModalOpen && (
        <AddUserModal
          handleAddUser={handleAddUser}
          onClose={() => setIsAddUserModalOpen(false)}
          newUser={newUser}
          setNewUser={setNewUser}
        />
      )}
      {isBusinessAddModalOpen && uid && (
        <BusinessAddModal
          uid={uid}
          close={() => setIsBusinessAddModalOpen(false)}
        />
      )}

      <Toaster />
    </div>
  );
}
