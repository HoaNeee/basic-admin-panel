/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import { Button, Card } from "antd";
import StatisticComponent from "../components/StatisticComponent";
import { LuChartNoAxesCombined, LuMapPinHouse } from "react-icons/lu";
import { AiOutlineLineChart } from "react-icons/ai";
import { MdCurrencyRupee, MdOutlineCreditCardOff } from "react-icons/md";
import { handleAPI } from "../apis/request";
import { VND } from "../helpers/formatCurrency";
import { FiShoppingBag } from "react-icons/fi";
import { SlBag } from "react-icons/sl";
import { LiaCoinsSolid, LiaUserCircleSolid } from "react-icons/lia";
import { RiFileListLine } from "react-icons/ri";
import type { PurchaseOrderModel } from "../models/puchaseOrder";
import type { Supplier } from "../models/supplier";
import ChartSalesAndPurchase from "../components/charts/ChartSalesAndPurchase";
import ChartOrder from "../components/charts/ChartOrder";
import TopSellAndLowStock from "../components/home/TopSellAndLowStock";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [statisticOrder, setStatisticOrder] = useState<{
    revenue: number;
    profit: number;
    cost: number;
    sales: number;
    delivereds: number;
    quantityInCart: number;
  }>();
  const [statisticPurchaseOrder, setStatisticPurchaseOrder] = useState<{
    totalOrders: PurchaseOrderModel[];
    received: PurchaseOrderModel[];
    canceled: PurchaseOrderModel[];
    delivering: PurchaseOrderModel[];
  }>();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await getStatisticOrder();
        await getStatisticPurchaseOrder();
        await getSupplier();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatisticOrder = async () => {
    const api = `/orders/statistic`;
    const response = await handleAPI(api);
    const { revenue, cost, sales, delivereds, quantityInCart } = response.data;
    const profit = revenue - cost;
    setStatisticOrder({
      revenue,
      cost,
      profit,
      sales,
      delivereds,
      quantityInCart,
    });
  };

  const getStatisticPurchaseOrder = async () => {
    const response = await handleAPI("/purchase-orders/statistic");
    setStatisticPurchaseOrder(response.data);
  };

  const getSupplier = async () => {
    const response = await handleAPI("/suppliers");
    setSuppliers(response.data);
  };

  return (
    <div className="relative flex flex-col gap-4">
      <Button
        onClick={async () => {
          const response = await handleAPI(
            "/products/test-socket",
            {
              message: "test socket",
            },
            "post"
          );
          console.log(response);
        }}
      >
        Test socket
      </Button>
      <div className="flex items-center gap-4 lg:flex-row flex-col">
        <Card className="lg:w-4/6 relative w-full">
          {isLoading && <Loading type="screen" />}
          <h3 className="mb-5 text-xl font-medium">Sales Overview</h3>
          <div className="grid md:grid-cols-4 md:gap-3 gap-5 grid-cols-2">
            <StatisticComponent
              className="border-gray-100 border-r-2 lg:px-6 px-0"
              label="Sales"
              icon={<LiaCoinsSolid size={33} className="text-blue-500" />}
              value={String(statisticOrder?.sales || 0)}
            />
            <StatisticComponent
              className="border-r-2 border-gray-100 lg:px-6 px-0"
              label="Revenue"
              icon={
                <LuChartNoAxesCombined size={33} className="text-purple-600" />
              }
              cnIcon="bg-purple-100/70"
              value={VND.format(statisticOrder?.revenue || 0)}
            />
            <StatisticComponent
              className="border-r-2 border-gray-100 lg:px-6 px-0"
              label="Profit"
              icon={
                <AiOutlineLineChart size={33} className="text-orange-400" />
              }
              cnIcon="bg-orange-100/60"
              value={VND.format(statisticOrder?.profit || 0)}
            />
            <StatisticComponent
              className="px-6"
              label="Cost"
              icon={<MdCurrencyRupee size={33} className="text-green-500" />}
              cnIcon="bg-green-100/60"
              value={VND.format(statisticOrder?.cost || 0)}
            />
          </div>
        </Card>
        <Card className="lg:flex-1 w-full relative">
          {isLoading && <Loading type="screen" />}
          <p className="h-7"></p>
          <div className="grid grid-cols-2 gap-4 h-full">
            <StatisticComponent
              className="border-r-2 border-gray-100"
              label="Quantity in Hand"
              icon={<FiShoppingBag size={33} className="text-orange-300" />}
              cnIcon="bg-orange-100/60"
              type="vertical"
              value={String(statisticOrder?.quantityInCart || 0)}
            />
            <StatisticComponent
              className=""
              label="To be received"
              icon={<LuMapPinHouse size={33} className="text-purple-500" />}
              cnIcon="bg-purple-100/60"
              type="vertical"
              value={String(statisticOrder?.delivereds || 0)}
            />
          </div>
        </Card>
      </div>

      {/* purchase */}
      <div className="flex items-center gap-4 lg:flex-row flex-col">
        <Card className="lg:w-4/6 w-full relative">
          {isLoading && <Loading type="screen" />}
          <h3 className="mb-5 text-xl font-medium">Purchase Overview</h3>
          <div className="grid md:grid-cols-4 md:gap-3 gap-5 grid-cols-2">
            <StatisticComponent
              className="border-gray-100 border-r-2 lg:px-6 px-0"
              label="Purchase"
              value={String(statisticPurchaseOrder?.totalOrders.length)}
              icon={<SlBag size={33} className="text-blue-400" />}
              cnIcon="bg-blue-100/50"
            />
            <StatisticComponent
              className="border-r-2 border-gray-100 lg:px-6 px-0"
              label="Cost"
              icon={<MdCurrencyRupee size={33} className="text-green-500" />}
              value={VND.format(
                statisticPurchaseOrder?.totalOrders.reduce((val, item) => {
                  return (
                    val +
                    item.products.reduce(
                      (val1, it) => val1 + it.unitCost * it.quantity,
                      0
                    )
                  );
                }, 0) || 0
              )}
              cnIcon="bg-green-100/70"
            />
            <StatisticComponent
              className="border-r-2 border-gray-100 lg:px-6 px-0"
              label="Cancel"
              icon={
                <MdOutlineCreditCardOff size={33} className="text-purple-400" />
              }
              cnIcon="bg-purple-100/60"
              value={VND.format(
                statisticPurchaseOrder?.canceled.reduce((val, item) => {
                  return (
                    val +
                    item.products.reduce(
                      (val1, it) => val1 + it.unitCost * it.quantity,
                      0
                    )
                  );
                }, 0) || 0
              )}
            />
            <StatisticComponent
              className="lg:px-6 px-0"
              label="Received"
              icon={<LuMapPinHouse size={33} className="text-yellow-500" />}
              cnIcon="bg-yellow-100/60"
              value={String(statisticPurchaseOrder?.received.length)}
            />
          </div>
        </Card>
        <Card
          className="lg:flex-1 w-full relative"
          styles={{
            body: {
              padding: "13px 20px",
            },
          }}
        >
          {isLoading && <Loading type="screen" />}
          <p className="text-lg font-medium mb-5">Product Summary</p>
          <div className="grid grid-cols-2 gap-4 h-full">
            <StatisticComponent
              className="border-r-2 border-gray-100"
              label="Number of Supplier"
              icon={<LiaUserCircleSolid size={33} className="text-blue-300" />}
              cnIcon="bg-blue-100/60"
              type="vertical"
              value={String(suppliers.length)}
            />
            <StatisticComponent
              className=""
              label="-"
              icon={<RiFileListLine size={33} className="text-purple-500" />}
              cnIcon="bg-purple-100/60"
              type="vertical"
              value={String(statisticOrder?.delivereds)}
            />
          </div>
        </Card>
      </div>
      <div className="grid lg:grid-cols-2 items-center grid-cols-1 gap-4 lg:flex-row flex-col">
        <Card className="w-full">
          <ChartSalesAndPurchase />
        </Card>
        <Card className="w-full">
          <h3 className="lg:text-xl text-lg font-medium">Order Summary</h3>
          <ChartOrder />
        </Card>
      </div>
      <TopSellAndLowStock />
    </div>
  );
};

export default Home;
