import { FiSearch, FiStar, FiCheckCircle, FiShield } from "react-icons/fi";
import { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import BusinessEditModal from "./BusinessEditModal";
import { RiResetLeftFill } from "react-icons/ri";

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

interface PaginationLinks {
  next: string | null;
  previous: string | null;
}

interface BusinessApiResponse {
  count: number;
  page_size: number;
  results: Business[];
  links: PaginationLinks;
  total_buisness_count: number;
  total_hybrid_buisness_count: number;
  total_product_buisness_count: number;
  total_service_buisness_count: number;
}

interface BusinessPagesProps {
  businesses: BusinessApiResponse;
  fetchBusinessData: (url?: string | null) => void;
  render: () => void;
  searchBusiness: (searchTerm: string) => void;
}

export default function BusinessPages({
  businesses,
  fetchBusinessData,
  render,
  searchBusiness,
}: BusinessPagesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );

  useEffect(() => {
    if (searchTerm) {
      searchBusiness(searchTerm);
    } else {
      render();
    }
  }, [searchTerm]);

  const paginationData = businesses;
  const totalItems = paginationData?.count ?? 0;
  const pageSize = paginationData?.page_size ?? 10;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const hasPrev = Boolean(paginationData?.links?.previous);
  const hasNext = Boolean(paginationData?.links?.next);

  return (
    <div>
      <div className="mb-6 flex items-center  justify-between">
        <div className="relative w-1/2 flex gap-3 ">
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
          <button
            onClick={() => {
              setSearchTerm(""), render();
            }}
            className="bg-red-100 px-7 py-1 rounded-md border border-red-500 text-red-500 flex items-center gap-2"
          >
            <RiResetLeftFill />
            reset
          </button>
        </div>
        <div className="bg-[#fdfcf8] border border-[#c5b648] px-4 py-2 rounded-lg shadow-sm">
          <span className="text-gray-600">Total Businesses: </span>
          <span className="font-semibold">
            {businesses.total_buisness_count}
          </span>
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
            {businesses.results?.map((business) => (
              <tr key={business.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={business?.image}
                        alt={business.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {business.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Registered: {business.created_on}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {business.buisness_type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {business.plan !== "Default Plan" ? (
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        business.plan === "Tier 3"
                          ? "bg-purple-100 text-purple-800"
                          : business.plan === "Tier 2"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {business.plan}
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
                  <button
                    onClick={() => {
                      setSelectedBusiness(business), setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <FaRegEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm font-ubuntu text-gray-700">
            Showing {startItem} to {endItem} of {totalItems} users
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                fetchBusinessData(businesses.links.previous);
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
                fetchBusinessData(businesses?.links.next);
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
      {selectedBusiness && (
        <BusinessEditModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false), setSelectedBusiness(null);
          }}
          initialData={selectedBusiness}
          render={render}
        />
      )}
    </div>
  );
}
