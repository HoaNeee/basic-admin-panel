/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { handleAPI } from "../apis/request";
import type { SaleOrder } from "../models/saleOrder";
import {
  Button,
  Card,
  Divider,
  Dropdown,
  List,
  message,
  Tag,
  type MenuProps,
} from "antd";
import { IoMdAirplane } from "react-icons/io";
import { VND } from "../helpers/formatCurrency";
import { format } from "date-fns";
import { ModalReason } from "./SaleOrders";
import Loading from "../components/Loading";
import { FaArrowLeftLong } from "react-icons/fa6";

const statusItems: MenuProps["items"] = [
  {
    key: "pending",
    label: "Pending",
    disabled: true,
  },
  {
    key: "confirmed",
    label: "Confirmed",
  },

  {
    key: "shipping",
    label: "Shipping",
  },
  {
    key: "canceled",
    label: "Canceled",
  },
  {
    key: "delivered",
    label: "Delivered",
  },
];

const SaleOrderDetail = () => {
  const [orderDetail, setOrderDetail] = useState<SaleOrder>();
  const [isUpdating, setIsUpdating] = useState(false);
  const [openModalReason, setOpenModalReason] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [messApi, context] = message.useMessage();
  const params = useParams();
  const order_id = params.id;

  useEffect(() => {
    if (order_id) {
      getOrderDetail(order_id);
    }
  }, [order_id]);

  const getOrderDetail = async (id: string) => {
    try {
      setIsLoading(true);
      const api = `/orders/detail/${id}`;
      const response = await handleAPI(api);

      setOrderDetail(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDiscount = (order?: SaleOrder) => {
    if (!order) {
      return <span>Not applicable</span>;
    }
    if (!order.promotion) {
      return <span>Not applicable</span>;
    }

    const type = order.promotion.promotionType;
    const total = order.products.reduce(
      (val, item) => val + item.price * item.quantity,
      0
    );

    if (type === "percent") {
      const subTract =
        total - (total * Number(orderDetail?.promotion?.value)) / 100;

      return (
        <span>
          ({order.promotion.value}%) -{VND.format(Number(subTract.toFixed(0)))}
        </span>
      );
    }

    return <span>-{order.promotion.value}</span>;
  };

  const handleChangeStatus = async (
    order_id: string,
    payload: {
      status: string;
      reasonCancel?: string;
      canceledBy?: string;
    }
  ) => {
    if (payload.status === "canceled") {
      setOpenModalReason(true);
      return;
    }
    try {
      setIsUpdating(true);
      await handleChangeStatusCall(order_id, payload);
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeStatusCall = async (
    order_id: string,
    payload: {
      status: string;
      resonCancel?: string;
      canceledBy?: string;
    }
  ) => {
    const api = `/orders/change-status/${order_id}`;
    const response: any = await handleAPI(api, payload, "patch");
    if (orderDetail) {
      setOrderDetail({
        ...orderDetail,
        status: payload.status,
      });
    }
    messApi.success(response.message);
  };

  const renderStatus = (value: string) => {
    let color = "";
    switch (value) {
      case "pending":
        color = "gold";
        break;
      case "delivered":
        color = "green";
        break;
      case "canceled":
        color = "gray";
        break;
      case "shipping":
        color = "red";
        break;
      case "confirmed":
        color = "blue";
        break;

      default:
        break;
    }
    return (
      <Dropdown
        menu={{
          items: statusItems,
          selectable: true,
          selectedKeys: [value],
          onSelect: async (e) => {
            handleChangeStatus(orderDetail?._id || "", { status: e.key });
          },
        }}
        trigger={["click"]}
        placement="bottomRight"
      >
        <Tag color={color} className="cursor-pointer capitalize">
          {value}
        </Tag>
      </Dropdown>
    );
  };

  return (
    <>
      {context}
      <Card className="w-full h-full relative">
        <div className="mb-3">
          <Link to={"/sale-orders"}>
            <Button icon={<FaArrowLeftLong />}></Button>
          </Link>
        </div>
        {(isUpdating || isLoading) && <Loading type="screen" />}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">
            Order Number: {orderDetail?.orderNo}
          </h2>
          <div className="flex my-2 items-center gap-2">
            <p className="text-gray-400">
              Order date:{" "}
              <span className="text-black">
                {format(orderDetail?.createdAt || new Date(), "PP")}
              </span>
            </p>
            <Divider type="vertical" />
            <div className="flex items-center gap-2 font-semibold text-green-600">
              <IoMdAirplane size={17} />
              <p>
                Estimated delivery:{" "}
                {format(orderDetail?.estimatedDelivery || new Date(), "PP")}
              </p>
            </div>
            <Divider type="vertical" />
            <p className="text-gray-500">
              Status: <span>{renderStatus(orderDetail?.status || "")}</span>
            </p>
          </div>
          {orderDetail &&
            orderDetail.status === "canceled" &&
            orderDetail.cancel && (
              <div className="my-2 flex flex-col gap-2">
                <div className="flex items-center gap-1 text-neutral-400 ">
                  <p>
                    Canceled At:{" "}
                    <span className="text-black">
                      {format(
                        orderDetail.cancel.canceledAt || new Date(),
                        "PP"
                      )}
                    </span>
                  </p>
                  <Divider type="vertical" />
                  <p>
                    Canceled By:{" "}
                    <span className="text-black">
                      {orderDetail.cancel.canceledBy}
                    </span>
                  </p>
                </div>
                <p className="my-2">
                  Reason: {orderDetail.cancel.reasonCancel}
                </p>
              </div>
            )}
          <div className="py-4 border-b-2 border-t-2 border-gray-100">
            <List
              dataSource={orderDetail?.products}
              renderItem={(item) => {
                return (
                  <List.Item className="w-full">
                    <div className="flex justify-between w-full lg:max-w-1/2">
                      <div className="flex gap-4 w-full">
                        <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-200/70">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="tracking-wider">{item.title}</p>
                          {item.options && (
                            <p className="text-neutral-400">
                              {item.options.join(" | ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-base font-semibold">
                          {VND.format(item.price)}
                        </p>
                        <p className="text-neutral-400 text-nowrap">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
          <div className="grid grid-cols-2 mt-3 border-b-2 border-gray-100 pb-5">
            <div className="">
              <p className="text-base font-medium">Payment</p>
              <p className="my-2">
                Cash on delivering <span className="uppercase ">(COD)</span>
              </p>
            </div>
            <div>
              <p className="text-base font-medium">Delivery</p>
              <p className="mt-3 mb-2 text-gray-400">Address</p>
              <div className="opacity-80 text-base tracking-wider">
                <p>{orderDetail?.shippingAddress.name}</p>
                <p>{orderDetail?.shippingAddress.address}</p>
                <p>{orderDetail?.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
          <div className="px-10">
            <p className="text-base font-medium mt-3">Order Summary</p>
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center justify-between text-base">
                <p className="">Subtotal</p>
                <p className="">
                  {VND.format(
                    orderDetail?.products.reduce(
                      (val, item) => val + item.price * item.quantity,
                      0
                    ) || 0
                  )}
                </p>
              </div>
              <div className="flex items-center justify-between px-2 text-gray-400">
                <p className="">Discount</p>
                <p className="">{renderDiscount(orderDetail)}</p>
              </div>
              <div className="flex items-center justify-between px-2 text-gray-400">
                <p className="">Delivery</p>
                <p className="">{VND.format(0)}</p>
              </div>
              <div className="border-1 my-2 border-gray-200/60 w-full"></div>
              <div className="flex items-center justify-between text-base">
                <p>Total</p>
                <p className="font-semibold text-lg">
                  {VND.format(orderDetail?.totalPrice || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <ModalReason
        isOpen={openModalReason}
        onClose={() => {
          setOpenModalReason(false);
        }}
        onOk={async (reason) => {
          if (orderDetail) {
            try {
              setIsUpdating(true);
              await handleChangeStatusCall(orderDetail._id, {
                status: "canceled",
                resonCancel: reason,
                canceledBy: "admin",
              });
              setOpenModalReason(false);
            } catch (error) {
              console.log(error);
            } finally {
              setIsUpdating(false);
            }
          }
        }}
        loading={isUpdating}
      />
    </>
  );
};

export default SaleOrderDetail;
