import { FiPlus } from "react-icons/fi";
import { Outlet } from "react-router-dom";

export default function Businesses() {
  return (
    <div className="max-h-screen overflow-y-auto  p-6">
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Business Directory
            </h1>
            <p className="text-gray-600">Manage registered businesses</p>
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <FiPlus className="mr-2" />
              Register New Business
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">Total Businesses</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              12
            </p>
          </div>
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">Product Based</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              12
            </p>
          </div>
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">Service Based</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
             12
            </p>
          </div>
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">Hybrid</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
             12
            </p>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
