import { lazy } from "react";
import Category from "../pages/Category";
import Users from "../pages/Users";
import Businesses from "../pages/Business";

const Home = lazy(() => import("../pages/Home"));

// const BusinessRoutes=[
//   {
//     index: true,
//     element: <BusinessPages />,
//   },

// ]

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
    element: <Businesses />,
  },
  {
    path: "/users",
    element: <Users />,
  },
];
