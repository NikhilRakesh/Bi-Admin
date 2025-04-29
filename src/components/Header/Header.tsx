import { FaBlackTie, FaChartLine } from "react-icons/fa";
import { ImUsers } from "react-icons/im";
import {
  MdBusinessCenter,
  MdOutlineDashboard,
  MdOutlineProductionQuantityLimits,
} from "react-icons/md";
import { Link } from "react-router-dom";

export default function Header() {
  const iconLinks = [
    { Icon: MdOutlineDashboard, path: "/" },
    { Icon: MdBusinessCenter, path: "/" },
    { Icon: MdOutlineProductionQuantityLimits, path: "/" },
    { Icon: ImUsers, path: "/" },
    { Icon: FaChartLine, path: "/" },
    { Icon: MdBusinessCenter, path: "/" },
    { Icon: FaBlackTie, path: "/" },
  ];

  return (
    <div className="md:min-h-screen md:max-h-screen md:p-3 p-1 overflow-hidden md:static md:w-fit  fixed w-full bottom-0">
      <div className="bg-[#111111] h-full rounded-3xl overflow-hidden p-4 flex md:flex-col justify-around md:justify-center items-center md:space-y-16">
        {iconLinks.map((item, index) => (
          <div key={index}>
            <Link to={item.path}>
              <item.Icon className="text-[#868786]" size={25} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
