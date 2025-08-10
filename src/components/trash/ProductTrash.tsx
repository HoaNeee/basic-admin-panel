import { useEffect, useState } from "react";
import { handleAPI } from "../../apis/request";
import { type ProductModel } from "../../models/productModel";
import { Checkbox, message } from "antd";
import IMGDEFAULT from "../../assets/imagenotfound.png";
import ModalDetailProduct from "../modals/ModalDetailProduct";
import ListDataTrash from "./ListDataTrash";

const ProductTrash = () => {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(
    null
  );
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(10);
  const [keyword, setKeyword] = useState("");
  const limit = 10;

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getProducts();
  }, [page, keyword]);

  const getProducts = async () => {
    try {
      setLoading(true);
      const api = `/products/trash?page=${page}&limit=${limit}&keyword=${keyword}`;
      const response = await handleAPI(api);
      setProducts(response.data.products);
      setTotalRecord(response.data.totalRecord || 10);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <ListDataTrash
        api_all="/products/change-trash-all"
        api_bulk="/products/bulk-trash"
        api_change_trash="/products/change-trash"
        dataSource={products}
        rowKey="_id"
        selectedKeys={selectedKeys}
        setSelectedKeys={setSelectedKeys}
        tabName="product"
        loading={loading}
        messageApi={messageApi}
        onSearch={(val) => {
          setPage(1);
          setKeyword(val);
        }}
        pagination={{
          current: page,
          pageSize: limit,
          total: totalRecord,
          onChange: (page) => setPage(page),
          hideOnSinglePage: true,
        }}
        onFetch={getProducts}
        renderItem={(item: ProductModel) => {
          return (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedKeys.includes(item._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKeys((prev) => [...prev, item._id]);
                  } else {
                    setSelectedKeys((prev) =>
                      prev.filter((key) => key !== item._id)
                    );
                  }
                }}
              />
              <div className="flex gap-2 items-center">
                <div className="w-20 h-20 bg-[#f1f1f1]">
                  <img
                    src={item.thumbnail || IMGDEFAULT}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex text-gray-400 flex-col gap-0.5 flex-1">
                  <p
                    className="text-black font-semibold cursor-pointer"
                    onClick={() => {
                      setOpenModalDetail(true);
                      setSelectedProduct(item);
                    }}
                  >
                    {item.title}
                  </p>
                  <p>{item.SKU}</p>
                  <p>{item.productType}</p>
                </div>
              </div>
            </div>
          );
        }}
      />

      <ModalDetailProduct
        isOpen={openModalDetail}
        onClose={() => {
          setOpenModalDetail(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </>
  );
};

export default ProductTrash;
