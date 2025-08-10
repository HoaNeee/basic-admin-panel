import { Tabs } from "antd";
import { MyCard } from "./Reports";
import ProductTrash from "../components/trash/ProductTrash";
import SubProductTrash from "../components/trash/SubProductTrash";
import BlogTrash from "../components/trash/BlogTrash";

const Trash = () => {
  return (
    <MyCard
      className="w-full h-full"
      title={<h2 className="text-lg ">Trash</h2>}
    >
      <Tabs
        tabBarStyle={{
          color: "black",
        }}
        items={[
          {
            key: "products",
            label: "Products",
            children: <ProductTrash />,
          },
          {
            key: "subProducts",
            label: "Sub Products",
            children: <SubProductTrash />,
          },
          {
            key: "blogs",
            label: "Blogs",
            children: <BlogTrash />,
          },
          {
            key: "categories",
            label: "Categories",
            children: <div>Categories</div>,
          },
        ]}
      />
    </MyCard>
  );
};

export default Trash;
