import { lazy } from "react";
import Category from "../pages/Category";
import Businessses from "../pages/Business";
import BusinessPages from "../components/Business/businesspage";
import Users from "../pages/Users";

const Home = lazy(() => import("../pages/Home"));

const BusinessRoutes=[
  {
    index: true,
    element: <BusinessPages />,
  },

]

export const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/categories",
    element: <Category />,
  },
  {
    path: "/businesses",
   
        element:( <Businessses />),
        children: BusinessRoutes,
  },
  {
    path: "/users",
    element: <Users />,
  },
];
