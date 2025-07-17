import { Column } from "@ant-design/plots";
import { Dropdown } from "antd";
import { handleAPI } from "../../apis/request";
import { useEffect, useState } from "react";

export interface IChart {
  name: string;
  label: string;
  value: number;
}

const ChartSalesAndPurchase = () => {
  const [type, setType] = useState("weekly");
  const [dataSales, setDataSales] = useState<IChart[]>([]);
  const [dataPurchase, setDataPurchase] = useState<IChart[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await getDataChartOrder();
        await getDataChartPurchase();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [type]);

  const getDataChartOrder = async () => {
    const api = `/orders/chart?type=${type}`;
    const response = await handleAPI(api);
    setDataSales(response.data);
  };
  const getDataChartPurchase = async () => {
    const api = `/purchase-orders/chart?type=${type}`;
    const response = await handleAPI(api);
    setDataPurchase(response.data);
  };

  const config = {
    data: dataSales.concat(dataPurchase),
    height: 400,
    xField: "label",
    yField: "value",
    colorField: "name",
    style: {
      lineWidth: 1,
    },
    group: true,
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h3 className="lg:text-xl text-lg font-medium">Sales & Purchase</h3>
        <div>
          <Dropdown.Button
            menu={{
              items: [
                {
                  label: "Weekly",
                  key: "weekly",
                },
                {
                  label: "Monthly",
                  key: "monthly",
                },
                {
                  label: "Year",
                  key: "year",
                },
              ],

              onClick(e) {
                setType(e.key);
              },
            }}
            trigger={["click"]}
          >
            <span className="capitalize">{type}</span>
          </Dropdown.Button>
        </div>
      </div>
      <Column
        {...config}
        loading={isLoading}
        legend={{
          color: {
            position: "bottom",
            layout: {
              justifyContent: "center",
            },
          },
        }}
      />
    </div>
  );
};

export default ChartSalesAndPurchase;
