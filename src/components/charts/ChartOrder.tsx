/* eslint-disable @typescript-eslint/no-explicit-any */
import { Line } from "@ant-design/plots";
import { useEffect, useState } from "react";
import { handleAPI } from "../../apis/request";
import type { IChart } from "./ChartSalesAndPurchase";

const ChartOrder = () => {
  const [dataChart, setDataChart] = useState<IChart[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getDataChartOrder();
  }, []);

  const getDataChartOrder = async () => {
    try {
      setIsLoading(true);
      const api = `/orders/chart-2`;
      const response = await handleAPI(api);
      setDataChart(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    data: dataChart,
    xField: "label",
    yField: "value",
    style: {
      lineWidth: 3,
    },
    scale: { color: { range: ["orange", "#1395ec"] } },
    shapeField: "smooth",
    colorField: "name",
    area: {
      style: {
        fill: (data: any) => {
          if (data[0].name === "orders") {
            return "linear-gradient(-90deg, white 0%, #fff2e6 100%)";
          }
        },
      },
    },
  };
  return (
    <div className="w-full">
      <Line
        {...config}
        height={405}
        legend={{
          color: {
            position: "bottom",
            layout: {
              justifyContent: "center",
            },
          },
        }}
        loading={isLoading}
      />
    </div>
  );
};

export default ChartOrder;
