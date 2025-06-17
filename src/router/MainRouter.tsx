import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Inventory from "../pages/Inventory";
import Reports from "../pages/Reports";
import Suppliers from "../pages/Suppliers";
import Orders from "../pages/Orders";
import ManageStore from "../pages/ManageStore";
import AddProduct from "../pages/AddProduct";
import Category from "../pages/Category";

// const mainRouter = createBrowserRouter([
//   {
//     path: "/",
//     element: <MainLayout />,
//     children: [
//       {
//         index: true,
//         element: <Home />,
//       },
//     ],
//   },
// ]);

const MainRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route element={<Home />} index />
          <Route path="inventories">
            <Route index element={<Inventory />} />
            <Route path="add-new-product" element={<AddProduct />} />
          </Route>
          <Route element={<Category />} path="categories" />
          <Route element={<Reports />} path="reports" />
          <Route element={<Suppliers />} path="suppliers" />
          <Route element={<Orders />} path="orders" />
          <Route element={<ManageStore />} path="manage-store" />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MainRouter;
