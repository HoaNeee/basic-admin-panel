/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, message, Popconfirm, Space, Table } from "antd";
import TableFilter from "../components/TableFilter";
import { handleAPI } from "../apis/request";
import { useEffect, useState } from "react";
import type { ReviewModel } from "../models/reviewModel";
import { RiDeleteBin5Line } from "react-icons/ri";
import type { ColumnType } from "antd/es/table";
import { AiOutlineEye } from "react-icons/ai";
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

  const [messApi, context] = message.useMessage();

  useEffect(() => {
    getReviewsAndComments();
  }, [page, keyword]);

  const getReviewsAndComments = async () => {
    try {
      setIsLoading(true);
      const api = `/reviews?page=${page}&limit=${limit}&keyword=${keyword}`;
      const response = await handleAPI(api);
      setReviews(response.data.reviews);
      setTotalRecord(response.data.totalRecord);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnType<ReviewModel>[] = [
    {
      key: "customer",
      title: "Customer",
      dataIndex: "customer",
      render: (val) => {
        return (
          <p>
            {val.firstName || ""} {val.lastName || ""}
          </p>
        );
      },
    },
    {
      key: "title",
      title: "Title",
      dataIndex: "title",
      render: (val) => {
        return <p className="font-medium">{val || "-"}</p>;
      },
    },

    {
      key: "product",
      title: "Product",
      dataIndex: "product",
      render: (val) => {
        return <p>{val.title}</p>;
      },
    },
    {
      key: "file",
      title: "File Upload",
      dataIndex: "images",
      render: (val, record) => {
        return (
          <div className="flex items-center gap-1">
            <p>{val?.length ? `${val.length} File` : "-"}</p>
            {val?.length && val.length > 0 ? (
              <div
                className="p-1 hover:bg-gray-200 cursor-pointer transition-all duration-300 rounded-md group"
                title="View Images"
                onClick={() => {
                  setOpenModalFile(true);
                  setReviewSelected(record);
                }}
              >
                <AiOutlineEye
                  size={16}
                  className="group-hover:text-orange-500 transition-all duration-300"
                />
              </div>
            ) : (
              <p></p>
            )}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "star",
      title: "Star Number",
      dataIndex: "star",
      sorter: (a, b) => {
        return a.star - b.star;
      },
      render(val) {
        return <p className="text-yellow-500">{val}</p>;
      },
      align: "center",
    },
    {
      key: "reply",
      title: "Comment Reply",
      dataIndex: "commentCount",
      render: (val, record) => {
        return (
          <div className="flex items-center gap-1">
            <p>{val} reply</p>
            <div
              className="p-1 hover:bg-gray-200 cursor-pointer transition-all duration-300 rounded-md group"
              title="View Detail"
              onClick={() => {
                setReviewSelected(record);
                setOpenModalComment(true);
              }}
            >
              <AiOutlineEye
                size={16}
                className="group-hover:text-orange-500 transition-all duration-300"
              />
            </div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "action",
      dataIndex: "",
      title: "Actions",
      render: (_, record) => {
        return (
          <Space>
            <Popconfirm
              title="Are you sure?"
              okButtonProps={{
                loading: isUpdating,
              }}
              onConfirm={() => {
                handleDeleteReview(record._id);
              }}
            >
              <Button
                type="link"
                icon={<RiDeleteBin5Line size={20} />}
                danger
              />
            </Popconfirm>
          </Space>
        );
      },
      fixed: "right",
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
      <div className="h-full w-full">
        <TableFilter
          title="Reviews Products"
          onSearch={(key) => {
            if (page !== 1) {
              setPage(1);
            }
            setKeyword(key);
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
            }}
          />
        </TableFilter>
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
