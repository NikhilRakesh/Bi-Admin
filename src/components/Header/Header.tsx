import { useState } from "react";
import { FaBlackTie, FaChartLine } from "react-icons/fa";
import { ImUsers } from "react-icons/im";
import {
  MdBusinessCenter,
  MdOutlineDashboard,
  MdOutlineProductionQuantityLimits,
} from "react-icons/md";
import { SiSimpleanalytics } from "react-icons/si";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [iconLinks] = useState([
    { Icon: SiSimpleanalytics, path: "/" },
    { Icon: MdOutlineDashboard, path: "/categories" },
    { Icon: MdBusinessCenter, path: "/businesses" },
    { Icon: ImUsers, path: "/users" },
    { Icon: MdOutlineProductionQuantityLimits, path: "/productsandservices" },
    { Icon: FaChartLine, path: "/payments" },
    { Icon: FaBlackTie, path: "/vendors" },
  ]);

  const location = useLocation();

  return (
    <div className="md:min-h-screen md:max-h-screen md:p-3 p-1 overflow-hidden md:static md:w-fit  fixed w-full bottom-0">
      <div className="bg-[#111111] h-full rounded-3xl overflow-hidden p-4 flex md:flex-col justify-around md:justify-center items-center md:space-y-16">
        {iconLinks.map((item, index) => {
          let isActive = location.pathname === item.path;

          return (
            <div key={index}>
              <Link to={item.path}>
                <item.Icon
                  className={`${
                    isActive ? "text-[#fdfcf8]" : "text-[#868786]"
                  }`}
                  size={25}
                />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
