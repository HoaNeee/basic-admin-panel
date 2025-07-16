import { useEffect, useState } from "react";
import { handleAPI } from "../../apis/request";
import { Button, Card, List, Table } from "antd";
import { VND } from "../../helpers/formatCurrency";
import type { ProductModel } from "../../models/productModel";
import IMAGENOTFOUND from "../../assets/imagenotfound.png";
import { Link } from "react-router";

export interface ITopSell {
  quantity: number;
  price: number;
  SKU: string;
  options: string[];
  title: string;
  remaining: number;
  product_id: string;
}

interface IProduct extends ProductModel {
  thumbnailProduct?: string;
  product_id: string;
  options_info: {
    title: string;
    value: string;
  }[];
}

const TopSellAndLowStock = () => {
  const [dataTopSell, setDataTopSell] = useState<ITopSell[]>([]);
  const [dataLowQuantity, setDataLowQuantity] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        await getLowQuantity();
        await getTopSell();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  const getTopSell = async () => {
    const api = `/products/top-sell?page=1&limit=3`;
    const response = await handleAPI(api);
    console.log(response);
    setDataTopSell(response.data.products);
  };

  const getLowQuantity = async () => {
    const api = `/products/low-quantity?page=1&limit=3`;
    const response = await handleAPI(api);
    setDataLowQuantity(response.data);
  };

  return (
    <div className="flex gap-4 lg:flex-row flex-col">
      <Card className="lg:w-4/7 w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Top Selling Stock</h3>
          <Button type="link">See all</Button>
        </div>
        <div className="mt-4">
          <Table
            loading={isLoading}
            dataSource={dataTopSell}
            columns={[
              {
                key: "#",
                title: <p className="text-gray-500">#</p>,
                dataIndex: "",
                render(_, _record, index) {
                  return <p>{index + 1}</p>;
                },
              },
              {
                key: "name",
                title: <p className="text-gray-500">Name</p>,
                dataIndex: "title",
                render(val, record) {
                  return (
                    <p>
                      {val}
                      {record.options.length > 0 ? (
                        <span className="text-gray-500 block">
                          {record.options.join(", ")}
                        </span>
                      ) : (
                        ``
                      )}
                    </p>
                  );
                },
              },
              {
                key: "sold",
                title: <p className="text-gray-500">Sold Quantity</p>,
                dataIndex: "quantity",
              },
              {
                key: "remaining",
                title: <p className="text-gray-500">Remaining Quantity</p>,
                dataIndex: "remaining",
              },
              {
                key: "price",
                title: <p className="text-gray-500">Price</p>,
                dataIndex: "price",
                render(val) {
                  return <p>{VND.format(val)}</p>;
                },
              },
            ]}
            pagination={{
              pageSize: 3,
              hideOnSinglePage: true,
            }}
            rowKey={"SKU"}
          />
        </div>
      </Card>
      <Card className="lg:flex-1 w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Low Quantity Stock</h3>
          <Button type="link">See all</Button>
        </div>
        <div className="mt-4">
          <List
            loading={isLoading}
            dataSource={dataLowQuantity}
            renderItem={(item) => {
              return (
                <List.Item className="w-full">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-15 h-15 bg-[#f1f2f1] rounded-md">
                      {item.thumbnail || item.thumbnailProduct ? (
                        <img
                          src={
                            item.product_id
                              ? item.thumbnailProduct
                              : item.thumbnail
                          }
                          alt={item.title}
                          className="w-full h-full"
                        />
                      ) : (
                        <img
                          src={IMAGENOTFOUND}
                          alt={item.title}
                          className="w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        to={`/inventories/edit-product/${
                          item.product_id ? item.product_id : item._id
                        }`}
                        className="font-semibold opacity-80 capitalize"
                      >
                        {item.title}
                      </Link>
                      {item.options_info && (
                        <p className="text-gray-400 text-xs">
                          {item.options_info.map((it) => it.title).join(", ")}
                        </p>
                      )}
                      <p className="text-gray-500">Remaining: {item.stock}</p>
                    </div>
                    <div
                      title="Order more"
                      className="text-right text-xs px-1.5 py-0.5 rounded-lg bg-orange-100/50 text-orange-600 font-medium cursor-pointer"
                    >
                      Order
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default TopSellAndLowStock;
