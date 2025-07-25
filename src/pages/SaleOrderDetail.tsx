/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
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
  type MenuProps,
} from "antd";
import {
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiPhone,
  FiCalendar,
  FiTruck,
  FiPackage,
  FiCreditCard,
  FiDollarSign,
  FiPercent,
  FiTag,
  FiClock,
  FiCheck,
  FiX,
  FiShoppingBag,
} from "react-icons/fi";
import { VND } from "../helpers/formatCurrency";
import { format } from "date-fns";
import { ModalReason } from "./SaleOrders";
import Loading from "../components/Loading";

const statusItems: MenuProps["items"] = [
  {
    key: "pending",
    label: (
      <div className="flex items-center gap-2">
        <FiClock className="w-4 h-4 text-yellow-500" />
        <span>Pending</span>
      </div>
    ),
    disabled: true,
  },
  {
    key: "confirmed",
    label: (
      <div className="flex items-center gap-2">
        <FiCheck className="w-4 h-4 text-blue-500" />
        <span>Confirmed</span>
      </div>
    ),
  },
  {
    key: "shipping",
    label: (
      <div className="flex items-center gap-2">
        <FiTruck className="w-4 h-4 text-purple-500" />
        <span>Shipping</span>
      </div>
    ),
  },
  {
    key: "canceled",
    label: (
      <div className="flex items-center gap-2">
        <FiX className="w-4 h-4 text-gray-500" />
        <span>Canceled</span>
      </div>
    ),
  },
  {
    key: "delivered",
    label: (
      <div className="flex items-center gap-2">
        <FiPackage className="w-4 h-4 text-green-500" />
        <span>Delivered</span>
      </div>
    ),
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

  const getOrderDetail = useCallback(async (id: string) => {
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
  }, []);

  useEffect(() => {
    if (order_id) {
      getOrderDetail(order_id);
    }
  }, [order_id, getOrderDetail]);

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
    } catch (error: any) {
      console.log(error);
      messApi.error(error.message || "An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeStatusCall = async (
    order_id: string,
    payload: {
      status: string;
      reasonCancel?: string;
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
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <FiClock className="w-3 h-3" />,
        label: "Pending",
      },
      delivered: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <FiPackage className="w-3 h-3" />,
        label: "Delivered",
      },
      canceled: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <FiX className="w-3 h-3" />,
        label: "Canceled",
      },
      shipping: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <FiTruck className="w-3 h-3" />,
        label: "Shipping",
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <FiCheck className="w-3 h-3" />,
        label: "Confirmed",
      },
    };

    const config = statusConfig[value as keyof typeof statusConfig];

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
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer hover:shadow-sm transition-shadow ${
            config?.color || "bg-gray-100 text-gray-800 border-gray-200"
          }`}
        >
          {config?.icon}
          <span className="capitalize">{config?.label || value}</span>
        </div>
      </Dropdown>
    );
  };

  return (
    <>
      {context}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/sale-orders">
              <Button
                icon={<FiArrowLeft className="w-4 h-4" />}
                className="flex items-center justify-center"
                size="large"
              />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Order Details
                </h1>
                <p className="text-sm text-gray-500">
                  Order #{orderDetail?.orderNo || "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {(isUpdating || isLoading) && <Loading type="screen" />}

        {/* Main Content */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Order Info Card */}
            <Card className="xl:col-span-2 shadow-sm border-0">
              <div className="space-y-6">
                {/* Order Header */}
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Order date:</span>
                      <span className="font-medium text-gray-900">
                        {format(orderDetail?.createdAt || new Date(), "PP")}
                      </span>
                    </div>
                    <Divider type="vertical" className="h-4" />
                    <div className="flex items-center gap-2 text-emerald-600">
                      <FiTruck className="w-4 h-4" />
                      <span className="font-medium">
                        Estimated delivery:{" "}
                        {format(
                          orderDetail?.estimatedDelivery || new Date(),
                          "PP"
                        )}
                      </span>
                    </div>
                    <Divider type="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Status:</span>
                      {renderStatus(orderDetail?.status || "")}
                    </div>
                  </div>
                </div>

                {/* Cancellation Info */}
                {orderDetail?.status === "canceled" && orderDetail.cancel && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                      <FiX className="w-4 h-4" />
                      Order Canceled
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-3 h-3 text-red-500" />
                          <span className="text-red-600">Canceled at:</span>
                          <span className="text-red-900 font-medium">
                            {format(
                              orderDetail.cancel.canceledAt || new Date(),
                              "PP"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUser className="w-3 h-3 text-red-500" />
                          <span className="text-red-600">Canceled by:</span>
                          <span className="text-red-900 font-medium">
                            {orderDetail.cancel.canceledBy}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-red-600">Reason:</span>
                        <p className="text-red-900 mt-1">
                          {orderDetail.cancel.reasonCancel}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiPackage className="w-5 h-5 text-gray-600" />
                    Order Items
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <List
                      dataSource={orderDetail?.products}
                      renderItem={(item, index) => (
                        <List.Item
                          className={`px-4 py-4 ${
                            index > 0 ? "border-t border-gray-100" : ""
                          }`}
                        >
                          <div className="flex justify-between w-full px-4">
                            <div className="flex gap-4 flex-1">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col gap-1 flex-1">
                                <h4 className="font-medium text-gray-900 line-clamp-2">
                                  {item.title}
                                </h4>
                                {item.options && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <FiTag className="w-3 h-3" />
                                    {item.options.join(" | ")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <p className="text-lg font-semibold text-gray-900">
                                {VND.format(item.price)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-2">
              <Card className="shadow-sm border-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiCreditCard className="w-5 h-5 text-gray-600" />
                    Payment
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900">
                        Cash on Delivery
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        COD
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Delivery Info */}
              <Card className="shadow-sm border-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5 text-gray-600" />
                    Delivery Address
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900">
                        {orderDetail?.shippingAddress.name}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FiMapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        {orderDetail?.shippingAddress.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">
                        {orderDetail?.shippingAddress.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Order Summary */}
              <Card className="shadow-sm border-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiDollarSign className="w-5 h-5 text-gray-600" />
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">
                        {VND.format(
                          orderDetail?.products.reduce(
                            (val, item) => val + item.price * item.quantity,
                            0
                          ) || 0
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <FiPercent className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500">Discount</span>
                      </div>
                      <span className="text-gray-500">
                        {renderDiscount(orderDetail)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <FiTruck className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500">Delivery</span>
                      </div>
                      <span className="text-gray-500">{VND.format(0)}</span>
                    </div>
                    <Divider className="my-3" />
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-xl text-gray-900">
                        {VND.format(orderDetail?.totalPrice || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
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
                reasonCancel: reason,
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
