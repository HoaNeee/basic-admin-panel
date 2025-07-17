import { Button, Card, Dropdown, Table } from "antd";
import StatisticComponent from "../components/StatisticComponent";
import { useEffect, useState, type ReactNode } from "react";
import { handleAPI } from "../apis/request";
import { VND } from "../helpers/formatCurrency";
import type { CategoryModel } from "../models/categoryModel";
import ChartProfitAndRevenue from "../components/charts/ChartProfitAndRevenue";
import Loading from "../components/Loading";
import type { ITopSell } from "../models/productModel";

export interface DataReport {
  totalProfit: number;
  cost: number;
  revenue: number;
  sales: number;
  profitOfMonth: number;
  profitOfYear: number;
}

interface ICategoriesTopSell extends CategoryModel {
  totalPrice: number;
  quantity: number;
}

const Reports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataReport, setDataReport] = useState<DataReport>();
  const [categoriesTopSell, setCategoriesTopSell] = useState<
    ICategoriesTopSell[]
  >([]);
  const [typeDate, setTypeDate] = useState("year");
  const [topProductsSell, setTopProductsSell] = useState<ITopSell[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await getDataReport();
        await getTopSellCategory();
        await getTopProductSelling();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDataReport = async () => {
    const api = `/reports/overview`;
    const response = await handleAPI(api);
    setDataReport(response.data);
  };
  const getTopSellCategory = async () => {
    const api = `/reports/top-sell-categories?page=1&limit=3`;
    const response = await handleAPI(api);
    setCategoriesTopSell(response.data);
  };

  const getTopProductSelling = async () => {
    const api = `/products/top-sell?page=1&limit=4`;
    const response = await handleAPI(api);
    const data: ITopSell[] = response.data.products;
    setTopProductsSell(data);
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-2 gap-4 max-h-fit">
        <MyCard
          title={<h3 className="font-medium text-base text-lg">Overview</h3>}
          className="relative"
        >
          {isLoading && <Loading type="screen" />}
          <div className="pb-5 border-b-2 border-gray-100 grid grid-cols-3">
            <StatisticComponent
              label="Total profit"
              type="vertical"
              cnLabel="mt-2"
              value={VND.format(Number(dataReport?.totalProfit))}
            />
            <StatisticComponent
              label="Revenue"
              type="vertical"
              cnLabel="mt-2 text-[#DBA362]"
              value={VND.format(Number(dataReport?.revenue))}
            />
            <StatisticComponent
              label="Sales"
              type="vertical"
              cnLabel="mt-2 text-purple-700"
              value={dataReport?.sales?.toString()}
            />
          </div>
          <div className="mt-5 grid grid-cols-3">
            <StatisticComponent
              label="Net Purchase value"
              type="vertical"
              cnLabel="mt-2"
              value={VND.format(Number(dataReport?.cost))}
            />
            {/* <StatisticComponent
              label="Sales value"
              type="vertical"
              cnLabel="mt-2 "
              
            /> */}
            <StatisticComponent
              label="MoM Profit"
              type="vertical"
              cnLabel="mt-2"
              value={VND.format(Number(dataReport?.profitOfMonth))}
            />
            <StatisticComponent
              label="YoY Profit"
              type="vertical"
              cnLabel="mt-2"
              value={VND.format(Number(dataReport?.profitOfYear))}
            />
          </div>
        </MyCard>
        <MyCard
          title={
            <h3 className="font-medium text-base text-lg">
              Best selling category
            </h3>
          }
          extra={<Button type="link">See all</Button>}
          className="relative"
        >
          {isLoading && <Loading type="screen" />}
          <Table
            dataSource={categoriesTopSell}
            columns={[
              {
                key: "name",
                title: <p className="opacity-70">Category</p>,
                dataIndex: "title",
              },
              {
                key: "total",
                title: <p className="opacity-70">Total price</p>,
                dataIndex: "totalPrice",
                align: "center",
                render(val) {
                  return <p>{VND.format(val)}</p>;
                },
              },
              {
                key: "quantity",
                title: <p className="opacity-70">Quantity</p>,
                dataIndex: "quantity",
                align: "center",
              },
            ]}
            pagination={{
              hideOnSinglePage: true,
            }}
            size="small"
            rowKey={"title"}
          />
        </MyCard>
      </div>

      <div className="mt-4">
        <MyCard
          title={
            <h3 className="font-medium text-base text-lg">Profit & Revenue</h3>
          }
          extra={
            <div>
              <Dropdown.Button
                menu={{
                  items: [
                    {
                      label: "Weekly",
                      key: "weekly",
                      danger: typeDate === "weekly",
                    },
                    {
                      label: "Monthly",
                      key: "monthly",
                      danger: typeDate === "monthly",
                    },
                    {
                      label: "Year",
                      key: "year",
                      danger: typeDate === "year",
                    },
                  ],

                  onClick(e) {
                    setTypeDate(e.key);
                  },
                }}
                trigger={["click"]}
              >
                <span className="capitalize">{typeDate}</span>
              </Dropdown.Button>
            </div>
          }
        >
          <ChartProfitAndRevenue typeDate={typeDate} />
        </MyCard>
      </div>
      <div className="mt-4">
        <MyCard
          title={
            <h3 className="font-medium text-base text-lg">
              Best selling product
            </h3>
          }
          extra={<Button type="link">See all</Button>}
        >
          {isLoading && <Loading type="screen" />}
          <Table
            rootClassName="table-product"
            dataSource={topProductsSell}
            columns={[
              {
                key: "title",
                title: <p className="opacity-70">Product</p>,
                dataIndex: "title",
                render: (value, record) => {
                  return (
                    <p>
                      {value}{" "}
                      {record.options && record.options.length > 0 && (
                        <span className="text-sm opacity-50">
                          ({record.options.join(", ")})
                        </span>
                      )}
                    </p>
                  );
                },
              },
              {
                key: "category",
                title: <p className="opacity-70">Category</p>,
                dataIndex: "categories_info",
                render: (value: CategoryModel[]) => {
                  return <p>{value.map((item) => item.title).join(", ")}</p>;
                },
              },
              {
                key: "quantity",
                title: <p className="opacity-70">Remaining</p>,
                dataIndex: "remaining",
                align: "center",
                render(value) {
                  return <p>{value} Packet</p>;
                },
              },
              {
                key: "turnOver",
                title: <p className="opacity-70">Turn Over</p>,
                dataIndex: "orderedPrice",
                align: "center",
                render(value, record) {
                  return <p>{VND.format(value * record.soldQuantity)}</p>;
                },
              },
            ]}
            pagination={{
              hideOnSinglePage: true,
            }}
            size="small"
            rowKey={"SKU"}
          />
        </MyCard>
      </div>
    </div>
  );
};

export const MyCard = ({
  title,
  children,
  extra,
  className,
}: {
  title?: string | ReactNode;
  children: ReactNode;
  extra?: ReactNode;
  className?: string;
}) => {
  return (
    <Card
      styles={{
        body: {
          paddingTop: 10,
        },
        header: {
          border: 0,
        },
      }}
      className={className}
      extra={extra}
      title={title}
    >
      {children}
    </Card>
  );
};

export default Reports;
