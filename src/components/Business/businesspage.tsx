import {
  FiSearch,
  FiTrash2,
  FiEye,
  FiStar,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";
import { useState, useEffect } from "react";

interface Business {
  id: string;
  name: string;
  type: string;
  package?: {
    name: string;
    level: "Basic" | "Standard" | "Premium";
  };
  rating: number;
  verified: boolean;
  assured: boolean;
  city: string;
  locality: string;
  profileImage: string;
  registrationDate: Date;
}

export default function BusinessPages() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const itemsPerPage = 10;

  useEffect(() => {
    const mockBusinesses: Business[] = Array.from({ length: 25 }, (_, i) => ({
      id: `biz-${i}`,
      name: `Business ${i + 1}`,
      type: ["Product", "Service", "Product", "Service"][
        Math.floor(Math.random() * 4)
      ],
      package:
        Math.random() > 0.3
          ? {
              name: ["Tire 1", "Tire 2", "Tire 3"][
                Math.floor(Math.random() * 3)
              ],
              level: ["Basic", "Standard", "Premium"][
                Math.floor(Math.random() * 3)
              ] as any,
            }
          : undefined,
      rating: Number((Math.random() * 5).toFixed(1)),
      verified: Math.random() > 0.5,
      assured: Math.random() > 0.7,
      city: ["New York", "Los Angeles", "Chicago", "Houston"][
        Math.floor(Math.random() * 4)
      ],
      locality: ["Downtown", "Uptown", "Midtown", "Suburb"][
        Math.floor(Math.random() * 4)
      ],
      profileImage: `https://randomuser.me/api/portraits/${
        Math.random() > 0.5 ? "men" : "women"
      }/${Math.floor(Math.random() * 50)}.jpg`,
      registrationDate: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ),
    }));
    setBusinesses(mockBusinesses);
  }, []);

  const filteredBusinesses = businesses.filter(
    (biz) =>
      biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.locality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (id: string) => {
    setBusinesses(businesses.filter((biz) => biz.id !== id));
    setIsDeleteModalOpen(false);
  };
  return (
    <div>
      <div className="mb-6 flex items-center  justify-between">
        <div className="relative w-1/2  ">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search businesses by name, type, or location..."
            className="w-full pl-10 pr-4 py-2  border border-[#c5b648] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="bg-[#fdfcf8] border border-[#c5b648] px-4 py-2 rounded-lg shadow-sm">
          <span className="text-gray-600">Total Businesses: </span>
          <span className="font-semibold">{filteredBusinesses.length}</span>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#c5b648]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#fdfcf8] divide-y divide-gray-200">
            {paginatedBusinesses.map((business) => (
              <tr key={business.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={business.profileImage}
                        alt={business.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {business.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Registered:{" "}
                        {business.registrationDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{business.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {business.package ? (
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        business.package.level === "Premium"
                          ? "bg-purple-100 text-purple-800"
                          : business.package.level === "Standard"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {business.package.name} ({business.package.level})
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      No Package
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiStar className="text-yellow-500 mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      {business.rating}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">/5</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{business.city}</div>
                  <div className="text-sm text-gray-500">
                    {business.locality}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {business.verified && (
                      <span className="flex items-center text-xs text-green-800">
                        <FiCheckCircle className="mr-1" /> Verified
                      </span>
                    )}
                    {business.assured && (
                      <span className="flex items-center text-xs text-blue-800">
                        <FiShield className="mr-1" /> Assured
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">
                    <FiEye />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBusiness(business);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-700">
            Showing{" "}
            {Math.min(
              (currentPage - 1) * itemsPerPage + 1,
              filteredBusinesses.length
            )}{" "}
            to {Math.min(currentPage * itemsPerPage, filteredBusinesses.length)}{" "}
            of {filteredBusinesses.length} businesses
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage * itemsPerPage >= filteredBusinesses.length}
              className={`px-3 py-1 rounded ${
                currentPage * itemsPerPage >= filteredBusinesses.length
                  ? "bg-gray-200 text-gray-500"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {isDeleteModalOpen && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedBusiness.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedBusiness.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Business
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
