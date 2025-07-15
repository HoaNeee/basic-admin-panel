import { Card, Radio } from "antd";
import { handleAPI } from "../../apis/request";
import { useEffect, useState } from "react";
import type { PurchaseOrderModel } from "../../models/puchaseOrder";
import { VND } from "../../helpers/formatCurrency";
import Loading from "../../components/Loading";

const oneDay = 1000 * 60 * 60 * 24;

const StatisticPurchaseOrder = () => {
  const [dataStatistic, setDataStatistic] = useState<{
    totalOrders: PurchaseOrderModel[];
    received: PurchaseOrderModel[];
    canceled: PurchaseOrderModel[];
    delivering: PurchaseOrderModel[];
  }>();
  const [isLoading, setIsLoading] = useState(false);
  const [dateSelected, setDateSelected] = useState<{
    day?: string;
    from: string;
    to: string;
  }>({
    day: "7",
    from: new Date(new Date().getTime() - oneDay * 7).toISOString(),
    to: new Date().toISOString(),
  });

  useEffect(() => {
    getStatisticPurchaseOrder();
  }, [dateSelected]);

  const getStatisticPurchaseOrder = async () => {
    try {
      setIsLoading(true);
      const api = `/purchase-orders/statistic?from=${dateSelected.from}&to=${dateSelected.to}`;
      const response = await handleAPI(api);
      console.log(response);
      setDataStatistic(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderValue = (data: PurchaseOrderModel[]) => {
    const cost = data.reduce((val, item) => {
      return (
        val +
        item.products.reduce((val2, it) => val2 + it.quantity * it.unitCost, 0)
      );
    }, 0);

    return VND.format(cost);
  };

  return (
    <Card size="small" className="relative">
      {isLoading && <Loading type="screen" />}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Overall Orders</h3>
        <Radio.Group
          options={[
            {
              label: "Week",
              value: "week",
            },
            {
              label: "Monthly",
              value: "monthly",
            },
            {
              label: "Year",
              value: "year",
            },
          ]}
          defaultValue={"week"}
          buttonStyle="outline"
          optionType="button"
          onChange={(e) => {
            const value = e.target.value;
            switch (value) {
              case "week":
                setDateSelected({
                  day: "7",
                  from: new Date(
                    new Date().getTime() - oneDay * 7
                  ).toISOString(),
                  to: new Date().toISOString(),
                });
                break;
              case "monthly":
                setDateSelected({
                  day: "30",
                  from: new Date(
                    new Date().getTime() - oneDay * 30
                  ).toISOString(),
                  to: new Date().toISOString(),
                });
                break;
              case "year":
                setDateSelected({
                  day: "365",
                  from: new Date(
                    new Date().getTime() - oneDay * 365
                  ).toISOString(),
                  to: new Date().toISOString(),
                });
                break;

              default:
                break;
            }
          }}
        />
      </div>
      <div className="flex items-center flex-wrap mt-4 gap-3">
        <div className="flex flex-col gap-3 p-3 w-1/6 border-r-2 border-gray-100">
          <h3 className="font-bold text-base">Total Orders</h3>
          <div className="flex items-center justify-between">
            <p className="font-bold opacity-70">
              {dataStatistic?.totalOrders?.length || 0}
            </p>
          </div>
          <p className="text-gray-400">Last {dateSelected.day} days</p>
        </div>
        <div className="flex flex-col gap-3 p-3 w-1/4 border-r-2 border-gray-100 px-7">
          <h3 className="font-bold text-base text-yellow-500">
            Total Received
          </h3>
          <div className="flex items-center justify-between font-bold">
            <p className="opacity-70">{dataStatistic?.received?.length || 0}</p>
            <p className="opacity-70">
              {renderValue(dataStatistic?.received || [])}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-400">Last {dateSelected.day} days</p>
            <p className="text-gray-400">Revenue</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-3 w-1/4 border-r-2 border-gray-100 px-7">
          <h3 className="font-bold text-base text-purple-700">
            Total Returned
          </h3>
          <div className="flex items-center justify-between font-bold">
            <p className="opacity-70">{dataStatistic?.canceled?.length || 0}</p>
            <p className="opacity-70">
              {renderValue(dataStatistic?.canceled || [])}
            </p>
          </div>
          <div className="flex items-center justify-between ">
            <p className="text-gray-400">Last {dateSelected.day} days</p>
            <p className="text-gray-400">Cost</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-3 w-1/4 px-7">
          <h3 className="font-bold text-base text-red-600">On The Way</h3>
          <div className="flex items-center justify-between font-bold">
            <p className="opacity-70">
              {dataStatistic?.delivering?.length || 0}
            </p>
            <p className="opacity-70">
              {renderValue(dataStatistic?.delivering || [])}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-400">Ordered</p>
            <p className="text-gray-400">Cost</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatisticPurchaseOrder;
