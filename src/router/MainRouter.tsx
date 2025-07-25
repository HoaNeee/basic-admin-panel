import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Inventory from "../pages/Inventory";
import Reports from "../pages/Reports";
import Suppliers from "../pages/Suppliers";
import Orders from "../pages/PurchaseOrders";
import ManageStore from "../pages/ManageStore";
import AddProduct from "../pages/product/AddProduct";
import Category from "../pages/Category";
import Variations from "../pages/Variations";
import VariationOptions from "../pages/VariationOptions";
import UpdateProduct from "../pages/product/UpdateProduct";
import Promotions from "../pages/Promotions";
import AddPurchaseOrder from "../pages/purchase-order/AddPurchaseOrder";
import SaleOrders from "../pages/SaleOrders";
import Customers from "../pages/Customers";
import Reviews from "../pages/Reviews";
import Setting from "../pages/Setting";
import Profile from "../pages/Profile";
import SaleOrderDetail from "../pages/SaleOrderDetail";
import Blogs from "../pages/Blogs";
import WriteBlog from "../pages/blog/WriteBlog";

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
          <Route path="sale-orders">
            <Route path="" element={<SaleOrders />} />
            <Route path=":id" element={<SaleOrderDetail />} />
          </Route>
          <Route path="purchase-orders">
            <Route index element={<Orders />} />
            <Route path="add-purchase-order" element={<AddPurchaseOrder />} />
          </Route>
          <Route element={<ManageStore />} path="manage-store" />
          <Route element={<Promotions />} path="promotions" />
          <Route element={<Customers />} path="customers" />
          <Route element={<Reviews />} path="reviews" />
          <Route path="profile" element={<Profile />} />
          <Route path="blogs">
            <Route index element={<Blogs />} />
            <Route path="write" element={<WriteBlog />} />
          </Route>

          <Route element={<Setting />} path="setting" />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MainRouter;
