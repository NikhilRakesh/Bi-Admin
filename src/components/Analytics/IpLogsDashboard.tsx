import { useEffect, useState } from "react";
import { useAppSelector } from "../../redux/hooks";
import { token_api } from "../../lib/api";
import { IoIosClose } from "react-icons/io";
import { TfiLocationPin } from "react-icons/tfi";
import { FiUsers } from "react-icons/fi";
import { BiCodeCurly } from "react-icons/bi";

interface IpLogEntry {
  ip_address: string;
  visit_count: number;
  visited_paths: string[];
}

interface PaginationLinks {
  next: string | null;
  previous: string | null;
}

interface IpLogsResponse {
  count: number;
  page_size: number;
  links: PaginationLinks;
  results: IpLogEntry[];
}

const IpLogsDashboard = () => {
  const [data, setData] = useState<IpLogsResponse | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const [expandedIp, setExpandedIp] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchIpTrackLog(null);
  }, []);

  async function fetchIpTrackLog(url: string | null) {
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).get(
        url
          ? url.replace("http://api.brandsinfo.in/", "")
          : "analytics/get_ip_logs/"
      );

      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.log("error on fetchDashBoardData:", error);
    }
  }

  const toggleExpand = (ip: string) => {
    setExpandedIp(expandedIp === ip ? null : ip);
  };

  return data ? (
    <div className="">
      <div className="w-full">
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">IP Access Logs</h1>
          <p className="mt-2 text-gray-600">
            Total {data.count} records • {data.page_size} per page
          </p>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#fdfcf8] border border-gray-300 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-opacity-10 bg-gray-500">
                <TfiLocationPin className="text-red-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">Total IPs</h3>
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {data.count}
            </p>
          </div>
          <div className="bg-[#fdfcf8] border border-gray-300 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-opacity-10 bg-gray-500">
                <FiUsers className="text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">
                Todays IPs Count
              </h3>
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {data.page_size}
            </p>
          </div>
          <div className="bg-[#fdfcf8] border border-gray-300 rounded-xl shadow-sm p-6">
            <div className=" flex justify-between items-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-opacity-10 bg-gray-500">
                  <BiCodeCurly className="text-blue-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-500">
                  Path Visits
                </h3>
              </div>
              <button
                onClick={() => setOpenModal(true)}
                className="text-sm bg-black rounded-md text-gray-300 px-2 py-1"
              >
                view more
              </button>
            </div>
            {/* <div className="mt-4 space-y-3">
              {Object.entries(
                data.results.reduce((acc: Record<string, number>, entry) => {
                  entry.visited_paths.forEach((path) => {
                    acc[path] = (acc[path] || 0) + 1;
                  });
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1]) // Sort by count descending
                .map(([path, count]) => (
                  <div key={path} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                        {path}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                ))}
            </div> */}
          </div>
        </div>

        {openModal && (
          <div className="fixed top-0 w-full bg-gray-800 inset-0 flex justify-center bg-opacity-50 max-h-screen overflow-hidden py-10">
            <IoIosClose
              onClick={() => setOpenModal(false)}
              className="text-gray-200 absolute top-5 right-5"
              size={45}
            />
            <div className="w-8/12 relative shadow-sm  rounded-xl">
              <div className="bg-white   overflow-y-scroll h-full">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          IP Address
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Visit Count
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.results.map((entry, index) => (
                        <>
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <svg
                                    className="h-6 w-6 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {entry.ip_address}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Last seen: Today
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {entry.visit_count} visits
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => toggleExpand(entry.ip_address)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                {expandedIp === entry.ip_address
                                  ? "Hide Details"
                                  : "View Details"}
                              </button>
                            </td>
                          </tr>
                          {expandedIp === entry.ip_address && (
                            <tr className="bg-gray-50">
                              <td colSpan={3} className="px-6 py-4">
                                <div className="bg-gray-100 p-4 rounded-lg">
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                                    Visited Paths:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {entry.visited_paths.map((path, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                                      >
                                        {path}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 absolute bottom-0 py-2 px-4 w-full bg-gray-100 flex items-center justify-between">
                  <div>
                    {data.links.previous && (
                      <button
                        onClick={() => fetchIpTrackLog(data.links.previous)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Previous
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{data.results.length}</span>{" "}
                    of <span className="font-medium">{data.count}</span> results
                  </div>
                  <div>
                    {data.links.next && (
                      <button
                        onClick={() => fetchIpTrackLog(data.links.next)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default IpLogsDashboard;
