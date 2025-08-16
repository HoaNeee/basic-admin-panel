/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, message, Popconfirm, Table, Rate, Select } from "antd";
import TableFilter from "../components/TableFilter";
import { handleAPI } from "../apis/request";
import { useEffect, useState, useCallback } from "react";
import type { ReviewModel } from "../models/reviewModel";
import { RiDeleteBin5Line } from "react-icons/ri";
import type { ColumnType } from "antd/es/table";
import { AiOutlineEye } from "react-icons/ai";
import {
  FiMessageSquare,
  FiUser,
  FiStar,
  FiImage,
  FiPackage,
  FiTrash2,
} from "react-icons/fi";
import ModalShowComment from "../components/modals/ModalShowComment";
import ModalShowFile from "../components/modals/ModalShowFile";

const Reviews = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewModel[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecord, setTotalRecord] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [openModalComment, setOpenModalComment] = useState(false);
  const [openModalFile, setOpenModalFile] = useState(false);
  const [reviewSelected, setReviewSelected] = useState<ReviewModel>();
  const [valuesFilter, setValuesFilter] = useState<any>();
  const [filter, setFilter] = useState<any>();
  const [statistics, setStatistics] = useState<{
    totalReviews: number;
    averageRating: number;
  }>();

  const [messApi, context] = message.useMessage();

  useEffect(() => {
    getStatstics();
  }, []);

  const getReviewsAndComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const api = `/reviews?page=${page}&limit=${limit}&keyword=${keyword}&star=${
        filter?.star || ""
      }`;
      const response = await handleAPI(api);
      setReviews(response.data.reviews);
      setTotalRecord(response.data.totalRecord);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, keyword, filter]);

  useEffect(() => {
    getReviewsAndComments();
  }, [getReviewsAndComments]);

  const getStatstics = async () => {
    try {
      const response: any = await handleAPI("/reviews/statistics");
      setStatistics({
        totalReviews: response.data.totalReviews,
        averageRating: response.data.averageRating,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const columns: ColumnType<ReviewModel>[] = [
    {
      key: "customer",
      title: (
        <div className="flex items-center gap-2">
          <FiUser className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">Customer</span>
        </div>
      ),
      dataIndex: "customer",
      render: (val) => {
        const fullName = `${val?.firstName || ""} ${
          val?.lastName || ""
        }`.trim();
        const initials =
          (val?.firstName?.[0] || "") + (val?.lastName?.[0] || "");

        return (
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full">
              <span className="text-sm font-medium text-blue-600">
                {initials}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {fullName || "Anonymous"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "title",
      title: (
        <div className="flex items-center gap-2">
          <FiMessageSquare className="w-4 h-4 text-green-600" />
          <span className="font-semibold">Review Title</span>
        </div>
      ),
      dataIndex: "title",
      render: (val) => {
        return (
          <div className="max-w-xs">
            <p className="font-medium text-gray-900 truncate" title={val}>
              {val || "-"}
            </p>
          </div>
        );
      },
    },
    {
      key: "product",
      title: (
        <div className="flex items-center gap-2">
          <FiPackage className="w-4 h-4 text-purple-600" />
          <span className="font-semibold">Product</span>
        </div>
      ),
      dataIndex: "product",
      render: (val) => {
        return (
          <div className="max-w-xs">
            <p className="text-gray-700 truncate" title={val?.title}>
              {val?.title}
            </p>
          </div>
        );
      },
    },
    {
      key: "file",
      title: (
        <div className="flex items-center gap-2">
          <FiImage className="w-4 h-4 text-orange-600" />
          <span className="font-semibold">Images</span>
        </div>
      ),
      dataIndex: "images",
      render: (val, record) => {
        const hasImages = val?.length > 0;

        return (
          <div className="flex items-center justify-center gap-2">
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                hasImages
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {hasImages ? `${val.length} files` : "No files"}
            </div>
            {hasImages && (
              <Button
                type="text"
                size="small"
                icon={<AiOutlineEye className="w-4 h-4" />}
                className="hover:text-orange-700 hover:bg-orange-50 text-orange-600"
                onClick={() => {
                  setOpenModalFile(true);
                  setReviewSelected(record);
                }}
              />
            )}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "star",
      title: (
        <div className="flex items-center gap-2">
          <FiStar className="w-4 h-4 text-yellow-600" />
          <span className="font-semibold">Rating</span>
        </div>
      ),
      dataIndex: "star",
      sorter: (a, b) => {
        return a.star - b.star;
      },
      render(val) {
        return (
          <div className="flex items-center justify-center">
            <Rate disabled value={val} className="text-sm" />
            <span className="ml-2 text-sm font-medium text-gray-700">
              {val}/5
            </span>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "reply",
      title: (
        <div className="flex items-center gap-2">
          <FiMessageSquare className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold">Comments</span>
        </div>
      ),
      dataIndex: "commentCount",
      render: (val, record) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                val > 0
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {val} {val === 1 ? "reply" : "replies"}
            </div>
            <Button
              type="text"
              size="small"
              icon={<AiOutlineEye className="w-4 h-4" />}
              className="hover:text-indigo-700 hover:bg-indigo-50 text-indigo-600"
              onClick={() => {
                setReviewSelected(record);
                setOpenModalComment(true);
              }}
            />
          </div>
        );
      },
      align: "center",
    },
    {
      key: "action",
      dataIndex: "",
      title: (
        <div className="flex items-center gap-2">
          <FiTrash2 className="w-4 h-4 text-red-600" />
          <span className="font-semibold">Actions</span>
        </div>
      ),
      render: (_, record) => {
        return (
          <div className="flex justify-center">
            <Popconfirm
              title="Delete Review"
              description="Are you sure you want to delete this review?"
              okButtonProps={{
                loading: isUpdating,
                danger: true,
              }}
              onConfirm={() => {
                handleDeleteReview(record._id);
              }}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<RiDeleteBin5Line className="w-4 h-4" />}
                className="hover:bg-red-50"
              />
            </Popconfirm>
          </div>
        );
      },
      fixed: "right",
      width: 80,
    },
  ];

  const handleDeleteReview = async (review_id: string) => {
    try {
      setIsUpdating(true);
      const api = `/reviews/delete/${review_id}`;
      const response: any = await handleAPI(api, undefined, "delete");
      messApi.success(response.message);
      setReviews(reviews.filter((it) => it._id !== review_id));
    } catch (error: any) {
      messApi.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {context}
      <div className="bg-gray-50 min-h-screen">
        <div className="px-6 py-4 mb-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                <FiMessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Product Reviews
                </h1>
                <p className="text-sm text-gray-500">
                  Manage customer reviews and ratings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Reviews</div>
                <div className="text-lg font-semibold text-gray-900">
                  {statistics?.totalReviews || 0}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Average Rating</div>
                <div className="flex items-center gap-1">
                  <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-lg font-semibold text-gray-900">
                    {statistics?.averageRating || "0.0"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6">
          {" "}
          <TableFilter
            title=""
            onSearch={(key) => {
              if (page !== 1) {
                setPage(1);
              }
              setKeyword(key);
            }}
            filter={
              <div className="flex flex-col gap-4">
                <div>
                  <Select
                    className="w-full"
                    placeholder="Filter by Rating"
                    onChange={(value) => {
                      setValuesFilter({
                        ...valuesFilter,
                        star: value,
                      });
                    }}
                    value={valuesFilter?.star || undefined}
                    allowClear
                    options={[
                      {
                        label: "5 Stars",
                        value: "5",
                      },
                      {
                        label: "4 Stars",
                        value: "4",
                      },
                      {
                        label: "3 Stars",
                        value: "3",
                      },
                      {
                        label: "2 Stars",
                        value: "2",
                      },
                      {
                        label: "1 Star",
                        value: "1",
                      },
                    ]}
                  />
                </div>
              </div>
            }
            onClearFilter={() => {
              setValuesFilter(undefined);
              setFilter(undefined);
            }}
            onFilter={() => {
              setPage(1);
              setFilter(valuesFilter);
            }}
          >
            <Table
              dataSource={reviews}
              columns={columns}
              rowKey={"_id"}
              loading={isLoading || isUpdating}
              pagination={{
                total: totalRecord,
                onChange(page, pageSize) {
                  setPage(page);
                  setLimit(pageSize);
                },
                pageSize: limit,
                current: page,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} reviews`,
              }}
              className="border-none"
              scroll={{
                x: 800,
              }}
              locale={{
                emptyText: (
                  <div className="py-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                      <FiMessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                      No reviews found
                    </h3>
                    <p className="text-gray-500">
                      No product reviews match your current search
                    </p>
                  </div>
                ),
              }}
            />
          </TableFilter>
        </div>
      </div>
      <ModalShowComment
        isOpen={openModalComment}
        onClose={() => {
          setOpenModalComment(false);
          setReviewSelected(undefined);
        }}
        review={reviewSelected}
        messApi={messApi}
      />
      <ModalShowFile
        isOpen={openModalFile}
        onClose={() => {
          setReviewSelected(undefined);
          setOpenModalFile(false);
        }}
        review={reviewSelected}
      />
    </>
  );
};

export default Reviews;
