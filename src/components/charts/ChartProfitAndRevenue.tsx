/* eslint-disable @typescript-eslint/no-explicit-any */
import { Line } from "@ant-design/plots";
import { useEffect, useState } from "react";
import { handleAPI } from "../../apis/request";
import type { IChart } from "./ChartSalesAndPurchase";

interface Props {
  typeDate: string;
}

const ChartProfitAndRevenue = (props: Props) => {
  const { typeDate } = props;

  const [dataChart, setDataChart] = useState<IChart[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const promises = await Promise.all([
          getDataOrderChart(),
          getDataPOChart(),
        ]);
        const [orders, pos] = promises;
        const data: IChart[] = [];
        for (let i = 0; i < orders.length; i++) {
          data.push({
            name: "profit",
            label: orders[i].label,
            value: orders[i].value - pos[i].value,
          });
        }
        setDataChart(
          data.concat(
            orders.map((item: IChart) => {
              return {
                ...item,
                name: "revenue",
              };
            })
          )
        );
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [typeDate]);

  const getDataOrderChart = async () => {
    try {
      setIsLoading(true);
      const api = `/orders/chart?type=${typeDate}`;
      const response = await handleAPI(api);
      return response.data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDataPOChart = async () => {
    try {
      setIsLoading(true);
      const api = `/purchase-orders/chart?type=${typeDate}`;
      const response = await handleAPI(api);
      return response.data;
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
        fill: "none",
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

export default ChartProfitAndRevenue;
