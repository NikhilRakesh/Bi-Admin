import { FiPackage, FiUsers, FiBriefcase, FiShoppingBag } from "react-icons/fi";
import MetricCard from "../../components/Analytics/MetricCard";
import ProgressBar from "../../components/Analytics/ProgressBar";
import PieChart from "../../components/Analytics/PieChart";
import PackageIndicator from "../../components/Analytics/PackageIndicator";
// import LineChart from "../../components/Analytics/LineChart";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout } from "../../redux/features/auth/authSlice";
import { token_api } from "../../lib/api";
import { useEffect, useState } from "react";
import IpLogsDashboard from "../../components/Analytics/IpLogsDashboard";

interface DashboardData {
  buisness_signup_rates: {
    created_on__day: number;
    count: number;
  }[];
  hybrid_bs: {
    count: number;
    percentage: number;
  };
  no_plan: number;
  product_bs: {
    count: number;
    percentage: number;
  };
  service_bs: {
    count: number;
    percentage: number;
  };
  tier_1_subs: number;
  tier_2_subs: number;
  tier_3_subs: number;
  total_buisnesses: number;
  total_products: number;
  total_services: number;
  total_users: number;
  user_distribution: {
    with_buisness: number;
    with_buisness_percentage: number;
    without_buisness: number;
    without_buisness_percentage: number;
  };
}

export default function Dashboard() {

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchDashBoardData();
  }, []);

  async function fetchDashBoardData() {
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).get("badmin/dash/");

      if (response.status === 200) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.log("error on fetchDashBoardData:", error);
    }
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return dashboardData ? (
    <div className="max-h-screen  p-6 w-full overflow-y-auto ">
      <div className="flex  items-center justify-between mb-8">
        <h1 className="text-3xl font-bold  text-gray-900 ">
          Analytics Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-black text-gray-300 text-sm px-2 py-1 rounded-md font-ubuntuMedium"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<FiBriefcase className="text-blue-500" />}
          title="Total Businesses"
          value={dashboardData?.total_buisnesses}
          trend=""
        />
        <MetricCard
          icon={<FiUsers className="text-green-500" />}
          title="Total Users"
          value={dashboardData?.total_users}
          trend="8% increase"
        />
        <MetricCard
          icon={<FiPackage className="text-purple-500" />}
          title="Total Services"
          value={dashboardData?.total_services}
          trend=""
        />
        <MetricCard
          icon={<FiShoppingBag className="text-amber-500" />}
          title="Total Products"
          value={dashboardData?.total_products}
          trend=""
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#fdfcf8] rounded-xl p-6 shadow-sm border border-[#c5b648]">
          <h2 className="text-xl font-semibold mb-4">Business Types</h2>
          <div className="space-y-4">
            <ProgressBar
              label="Service Based"
              value={dashboardData?.service_bs.count}
              total={dashboardData.total_buisnesses}
              color="bg-blue-500"
            />
            <ProgressBar
              label="Product Based"
              value={dashboardData?.product_bs.count}
              total={dashboardData.total_buisnesses}
              color="bg-green-500"
            />
            <ProgressBar
              label="Hybrid"
              value={dashboardData?.hybrid_bs.count}
              total={dashboardData.total_buisnesses}
              color="bg-purple-500"
            />
          </div>
        </div>

        <div className="bg-[#fdfcf8] rounded-xl p-6 shadow-sm border border-[#c5b648]">
          <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
          <PieChart
            data={[
              {
                name: "With Business",
                value: dashboardData?.user_distribution?.with_buisness,
                color: "bg-blue-500",
              },
              {
                name: "Without Business",
                value: dashboardData?.user_distribution?.without_buisness,
                color: "bg-gray-300",
              },
            ]}
          />
        </div>

        <div className="bg-[#fdfcf8] rounded-xl p-6 shadow-sm border border-[#c5b648]">
          <h2 className="text-xl font-semibold mb-4">Package Subscriptions</h2>
          <div className="space-y-4">
            <PackageIndicator
              tier="Tier 1"
              count={dashboardData?.tier_1_subs}
              color="bg-blue-100 text-blue-800"
            />
            <PackageIndicator
              tier="Tier 2"
              count={dashboardData?.tier_2_subs}
              color="bg-green-100 text-green-800"
            />
            <PackageIndicator
              tier="Tier 3"
              count={dashboardData?.tier_3_subs}
              color="bg-purple-100 text-purple-800"
            />
            <PackageIndicator
              tier="No Package"
              count={dashboardData?.no_plan}
              color="bg-gray-100 text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#fdfcf8] rounded-xl p-6 shadow-sm border border-gray-300">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold mb-4">
              Business Registrations
            </h2>
            <p className="text-xs text-orange-400">under development</p>
          </div>
          <LineChart
            data={analyticsData.growth.businesses}
            color="text-blue-500"
          />
        </div>
        <div className="bg-[#fdfcf8] rounded-xl p-6 shadow-sm border border-gray-300">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold mb-4">User Registrations</h2>
            <p className="text-xs text-orange-400">under development</p>
          </div>
          <LineChart data={analyticsData.growth.users} color="text-green-500" />
        </div>
      </div> */}
      <IpLogsDashboard />
    </div>
  ) : null;
}
