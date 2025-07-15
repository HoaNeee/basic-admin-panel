import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Inventory from "../pages/Inventory";
import Reports from "../pages/Reports";
import Suppliers from "../pages/Suppliers";
import Orders from "../pages/Orders";
import ManageStore from "../pages/ManageStore";
import AddProduct from "../pages/product/AddProduct";
import Category from "../pages/Category";
import Variations from "../pages/Variations";
import VariationOptions from "../pages/VariationOptions";
import UpdateProduct from "../pages/product/UpdateProduct";
import Promotions from "../pages/Promotions";
import AddPurchaseOrder from "../pages/purchase-order/AddPurchaseOrder";

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
            <Route path="edit-product/:id" element={<UpdateProduct />} />
            <Route path="variations">
              <Route element={<Variations />} index />
              <Route element={<VariationOptions />} path="options" />
            </Route>
          </Route>
          <Route element={<Category />} path="categories" />
          <Route element={<Reports />} path="reports" />
          <Route element={<Suppliers />} path="suppliers" />
          <Route path="orders">
            <Route index element={<Orders />} />
            <Route path="add-purchase-order" element={<AddPurchaseOrder />} />
          </Route>
          <Route element={<ManageStore />} path="manage-store" />
          <Route element={<Promotions />} path="promotions" />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MainRouter;
