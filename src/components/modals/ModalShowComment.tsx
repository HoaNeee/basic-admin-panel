/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Button, List, Modal, Popconfirm, Skeleton } from "antd";
import type { CommentModel, ReviewModel } from "../../models/reviewModel";
import type { MessageInstance } from "antd/es/message/interface";
import { handleAPI } from "../../apis/request";
import { useEffect, useState } from "react";
import AVATARDEFAULT from "../../assets/avatarNotFound.jpg";
import { LuTrash } from "react-icons/lu";

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  review?: ReviewModel;
  messApi?: MessageInstance;
}

const ModalShowComment = (props: Props) => {
  const { isOpen, onClose, review, messApi } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [totalRecord, setTotalRecord] = useState(4);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (review) {
      getComments(review._id);
    }
  }, [review, page]);

  const getComments = async (review_id: string) => {
    try {
      setIsLoading(true);
      const api = `/reviews/comments/${review_id}?page=${page}&limit=${limit}`;
      const response = await handleAPI(api);
      setComments(response.data.comments);
      setTotalRecord(response.data.totalRecord);
    } catch (error: any) {
      console.log(error);
      messApi?.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (comment_id: string) => {
    try {
      setIsUpdating(true);
      const api = `/reviews/comments/delete/${comment_id}`;
      const response: any = await handleAPI(api, undefined, "delete");
      setComments(comments.filter((it) => it._id !== comment_id));
      messApi?.success(response.message);
    } catch (error: any) {
      messApi?.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    if (page !== 1) {
      setPage(1);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={false}
      title="Comments of Reviews"
      centered
    >
      <List
        dataSource={comments}
        pagination={{
          hideOnSinglePage: true,
          total: totalRecord,
          pageSize: limit,
          current: page,
          onChange(page, pageSize) {
            setPage(page);
            setLimit(pageSize);
          },
        }}
        renderItem={(item) => {
          return (
            <List.Item
              key={item._id}
              actions={
                !isLoading
                  ? [
                      <Popconfirm
                        title="Are you sure?"
                        onConfirm={() => handleDeleteComment(item._id)}
                        okButtonProps={{
                          loading: isUpdating,
                        }}
                      >
                        <Button
                          type="link"
                          icon={<LuTrash size={20} />}
                          danger
                        />
                      </Popconfirm>,
                    ]
                  : undefined
              }
            >
              {isLoading && (
                <div className="w-full">
                  <div className="flex items-center gap-2">
                    <Skeleton.Avatar size={40} active />
                    <div className="flex flex-col gap-1">
                      <Skeleton.Input
                        size="small"
                        style={{
                          height: 15,
                          padding: 0,
                          margin: 0,
                        }}
                        active
                      />
                      <Skeleton.Input
                        size="small"
                        style={{
                          height: 10,
                          padding: 0,
                          margin: 0,
                        }}
                        active
                      />
                    </div>
                  </div>
                  <div className="w-full mt-1 pl-12">
                    <Skeleton.Input
                      size="small"
                      active
                      style={{
                        height: 10,
                      }}
                      block
                    />
                  </div>
                </div>
              )}
              {!isLoading && (
                <div>
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={item.customer.avatar || AVATARDEFAULT}
                      size={40}
                    />
                    <div className="flex flex-col gap-0">
                      <p>
                        {item.customer.firstName || ""}{" "}
                        {item.customer.lastName || ""}
                      </p>
                      <span className="text-xs text-gray-500">Reply</span>
                    </div>
                  </div>
                  <p className="text-sm pl-12 mt-3">
                    {item.content || (
                      <span className="text-gray-400">No content</span>
                    )}
                  </p>
                </div>
              )}
            </List.Item>
          );
        }}
      />
      <div className="text-right">
        <Button onClick={handleClose}>Cancel</Button>
      </div>
    </Modal>
  );
};

export default ModalShowComment;
