import { useAppSelector } from "../../redux/hooks";
import { token_api } from "../../lib/api";
import { useEffect, useState } from "react";
import BusinessPages from "../../components/Business/businesspage";

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

export default function Businesses() {
  const { user } = useAppSelector((state) => state.auth);

  const [businesses, setBusinesses] = useState<BusinessApiResponse | null>(
    null
  );
  const [render, setRender] = useState(false);

  useEffect(() => {
    fetchBusinessData();
  }, [render]);


  async function fetchBusinessData(url: string | undefined | null = null) {
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).get(
        url
          ? url.replace("http://api.brandsinfo.in/", "")
          : "badmin/get_buisnesses/"
      );

      if (response.status === 200) {
        setBusinesses(response.data);
      }
    } catch (error) {
      console.log("error on fetchBusinessData:", error);
    }
  }

  async function searchBusiness(searchTerm:string) {
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).get(`users/search_buisnesses/?q=${searchTerm}`);

      if (response.status === 200) {
        setBusinesses(response.data);
      }
    } catch (error) {
      console.log("error on fetchBusinessData:", error);
    }
  }

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
          {/* <div className="flex space-x-4">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <FiPlus className="mr-2" />
              Register New Business
            </button>
          </div> */}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">
              Total Businesses
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {businesses?.total_buisness_count}
            </p>
          </div>
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">Product Based</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {businesses?.total_product_buisness_count}
            </p>
          </div>
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">Service Based</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {businesses?.total_service_buisness_count}
            </p>
          </div>
          <div className="bg-[#fdfcf8] rounded-xl shadow-sm p-6 border border-[#c5b648]">
            <h3 className="text-sm font-medium text-gray-500">Hybrid</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {businesses?.total_hybrid_buisness_count}
            </p>
          </div>
        </div>
        {businesses && (
          <BusinessPages
            businesses={businesses}
            fetchBusinessData={fetchBusinessData}
            render={() => setRender(!render)}
            searchBusiness={searchBusiness}
          />
        )}
      </div>
    </div>
  );
}
