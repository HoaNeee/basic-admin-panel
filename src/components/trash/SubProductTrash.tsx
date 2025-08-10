import { useEffect, useState } from "react";
import { handleAPI } from "../../apis/request";
import type { SubProductModel } from "../../models/productModel";
import ListDataTrash from "./ListDataTrash";
import IMGDEFAULT from "../../assets/imagenotfound.png";
import { Checkbox, message } from "antd";

const SubProductTrash = () => {
  const [subProducts, setSubProducts] = useState<SubProductModel[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(10);
  const [keyword, setKeyword] = useState<string>("");
  const limit = 10;

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getSubProducts();
  }, [page, keyword]);

  const getSubProducts = async () => {
    try {
      setLoading(true);
      const response = await handleAPI(
        `/products/sub-product-trash?page=${page}&limit=${limit}&keyword=${keyword}`
      );
      setSubProducts(response.data.subProducts);
      setTotalRecord(response.data.totalRecord);
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
        dataSource={subProducts}
        api_all="/products/change-sub-trash-all"
        api_bulk="/products/bulk-sub-trash"
        api_change_trash="/products/change-sub-product-trash"
        selectedKeys={selectedKeys}
        setSelectedKeys={setSelectedKeys}
        tabName="Sub Product"
        rowKey="_id"
        renderItem={(item: SubProductModel) => {
          return (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedKeys.includes(item._id || "")}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKeys((prev) => [...prev, item._id || ""]);
                  } else {
                    setSelectedKeys((prev) =>
                      prev.filter((key) => key !== item._id)
                    );
                  }
                }}
              />
              <img
                src={
                  ((item.thumbnail || item.thumbnail_product) as string) ||
                  IMGDEFAULT
                }
                alt={item.title || "product deleted"}
                className="w-20 h-20 object-cover"
              />

              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold">
                  {item.title || "Untitled"}
                </h3>
                <p className="text-xs text-gray-500">{item.SKU || "No SKU"}</p>
              </div>
            </div>
          );
        }}
        messageApi={messageApi}
        onFetch={getSubProducts}
        pagination={{
          current: page,
          pageSize: limit,
          total: totalRecord,
          onChange: (page) => {
            setPage(page);
          },
          hideOnSinglePage: true,
        }}
        onSearch={(value) => {
          setKeyword(value);
          setPage(1);
        }}
        loading={loading}
      />
    </>
  );
};

export default SubProductTrash;
