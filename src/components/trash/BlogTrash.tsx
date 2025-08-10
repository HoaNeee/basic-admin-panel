import { useEffect, useState } from "react";
import ListDataTrash from "./ListDataTrash";
import { handleAPI } from "../../apis/request";
import type { BlogModel } from "../../models/blogModel";
import { Checkbox, message } from "antd";
import IMGDEFAULT from "../../assets/imagenotfound.png";

const BlogTrash = () => {
  const [blogs, setBlogs] = useState<BlogModel[]>([]);
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getBlogs();
  }, []);

  const getBlogs = async () => {
    try {
      setLoading(true);
      const response = await handleAPI(
        `/blogs/trash?page=${page}&limit=${limit}&keyword=${keyword}`
      );
      setBlogs(response.data.blogs);
      setTotalRecord(response.data.totalRecord);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {contextHolder}
      <div className="flex-1">
        <ListDataTrash
          messageApi={messageApi}
          api_all="/blogs/change-trash-all"
          api_bulk="/blogs/bulk-trash"
          api_change_trash="/blogs/change-trash"
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
          tabName="Blog"
          dataSource={blogs}
          onSearch={(val) => {
            setKeyword(val);
          }}
          pagination={{
            current: page,
            pageSize: limit,
            total: totalRecord,
            onChange: (page) => {
              setPage(page);
            },
            hideOnSinglePage: true,
          }}
          onFetch={getBlogs}
          loading={loading}
          renderItem={(item: BlogModel) => {
            return (
              <div className="flex items-center gap-2 text-gray-500">
                <Checkbox
                  checked={selectedKeys.includes(item._id || "")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedKeys((prev) => [...prev, item._id || ""]);
                    } else {
                      setSelectedKeys((prev) =>
                        prev.filter((key) => key !== item._id)
                      );
                    }
                  }}
                />
                <img
                  src={(item.image as string) || IMGDEFAULT}
                  alt={item.title || "product deleted"}
                  className="w-20 h-20 object-cover"
                />

                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-black">
                    {item.title || "Untitled"}
                  </h3>
                  <p>{item.excerpt || "Unknown Excerpt"}</p>
                  <p>{item.author?.fullName || "Unknown Author"}</p>
                </div>
              </div>
            );
          }}
          rowKey="_id"
        />
      </div>
    </>
  );
};

export default BlogTrash;
