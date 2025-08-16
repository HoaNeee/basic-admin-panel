/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Table,
  Tag,
  Dropdown,
  Input,
  Select,
  Modal,
  message,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DownOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { handleAPI } from "../apis/request";
import { Link, useNavigate } from "react-router";

const { Search } = Input;
const { Option } = Select;

interface BlogData {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  slug: string;
  tags: string[];
  readTime: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user_id: string;
}

const Blogs: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [totalRecord, setTotalRecord] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalReadTime: 0,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const api = `/blogs?page=${page}&limit=${limit}&status=${statusFilter}&search=${searchText}`;
      const response = await handleAPI(api);

      const blogsData = Array.isArray(response.data.blogs)
        ? response.data.blogs
        : [];
      setBlogs(blogsData);

      setTotalRecord(response.data.total);
    } catch (error: any) {
      messageApi.error("Error fetching blogs: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [messageApi, page, limit, statusFilter, searchText]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const getStatistics = useCallback(async () => {
    try {
      const response = await handleAPI("/blogs/stats");
      setStats(response.data);
    } catch (error: any) {
      messageApi.error("Error fetching blog stats: " + error.message);
    }
  }, [messageApi]);

  useEffect(() => {
    getStatistics();
  }, [getStatistics]);

  const handleDelete = async (id: string) => {
    try {
      await handleAPI(`/blogs/${id}`, {}, "delete");
      if (selectedRowKeys.includes(id)) {
        setSelectedRowKeys(selectedRowKeys.filter((key) => key !== id));
      }
      messageApi.success("Blog deleted successfully");
      fetchBlogs();
      getStatistics();
    } catch (error: any) {
      messageApi.error("Error deleting blog: " + error.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await handleAPI(`/blogs/edit/${id}`, { status: newStatus }, "patch");
      messageApi.success(`Blog ${newStatus} successfully`);
      fetchBlogs();
    } catch (error: any) {
      messageApi.error("Error updating blog status: " + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "green";
      case "draft":
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircleOutlined />;
      case "draft":
        return <ClockCircleOutlined />;
      default:
        return <StopOutlined />;
    }
  };

  const columns: ColumnsType<BlogData> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 300,
      render: (text: string, record: BlogData) => (
        <div>
          <div className="line-clamp-2 text-ellipsis overflow-hidden font-medium">
            {text}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {record.excerpt.length > 80
              ? record.excerpt.substring(0, 80) + "..."
              : record.excerpt}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 200,
      render: (tags: string[]) => (
        <div>
          {tags.slice(0, 3).map((tag) => (
            <Tag key={tag} style={{ marginBottom: 4, fontSize: "12px" }}>
              {tag}
            </Tag>
          ))}
          {tags.length > 3 && (
            <Tag color="default" style={{ fontSize: "12px" }}>
              +{tags.length - 3} more
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Read Time",
      dataIndex: "readTime",
      key: "readTime",
      width: 100,
      render: (time: number) => <span>{time} min</span>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: BlogData) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: "View",
                icon: <EyeOutlined />,
                onClick: () => {
                  messageApi.info("View functionality to be implemented");
                },
              },
              {
                key: "edit",
                label: "Edit",
                icon: <EditOutlined />,
                onClick: () => {
                  navigate(`/blogs/write?id=${record._id}`);
                },
              },
              {
                key: "status",
                label:
                  record.status === "published" ? "Set to Draft" : "Publish",
                icon:
                  record.status === "published" ? (
                    <ClockCircleOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  ),
                onClick: () =>
                  handleStatusChange(
                    record._id,
                    record.status === "published" ? "draft" : "published"
                  ),
              },
              {
                type: "divider",
              },
              {
                key: "delete",
                label: "Delete",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: "Delete Blog",
                    content: "Are you sure you want to delete this blog?",
                    onOk: () => handleDelete(record._id),
                  });
                },
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const handleBulkChange = (type: string) => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning("Please select at least one blog.");
      return;
    }

    let messageContent = "";
    if (type === "delete") {
      messageContent = `Are you sure you want to delete ${selectedRowKeys.length} blog(s)?`;
    } else {
      messageContent = `Are you sure you want to change the status of ${selectedRowKeys.length} blog(s)?`;
    }

    Modal.confirm({
      title: "Change of Selected Blogs",
      content: messageContent,
      onOk: async () => {
        try {
          const api = `/blogs/change-multi?type=${type}`;
          const response: any = await handleAPI(
            api,
            {
              ids: selectedRowKeys,
            },
            "patch"
          );
          messageApi.success(response.message);
          setSelectedRowKeys([]);
          fetchBlogs();
          getStatistics();
        } catch (error: any) {
          messageApi.error("Error deleting blogs: " + error.message);
        }
      },
    });
    // Implement bulk change logic here
  };

  return (
    <>
      {contextHolder}
      <div className="p-6">
        <div className="sm:grid-cols-2 lg:grid-cols-4 grid grid-cols-1 gap-4 mb-6">
          <Card>
            <Statistic
              title="Total Blogs"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
          <Card>
            <Statistic
              title="Published"
              value={stats.published}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
          <Card>
            <Statistic
              title="Drafts"
              value={stats.draft}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
          <Card>
            <Statistic
              title="Total Read Time"
              value={stats.totalReadTime}
              suffix="min"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </div>

        <Card
          title="Blog Management"
          extra={
            <Link to="/blogs/write">
              <Button type="primary" icon={<PlusOutlined />}>
                Write New Blog
              </Button>
            </Link>
          }
        >
          <div className="mb-4">
            <Row gutter={[16, 16]}>
              <Col lg={12} md={16} sm={24}>
                <Search
                  placeholder="Search blogs by title, content, or tags..."
                  onSearch={(value) => setSearchText(value)}
                  allowClear
                />
              </Col>
              <Col lg={6} md={8} sm={24}>
                <Select
                  placeholder="Filter by status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: "100%" }}
                >
                  <Option value="all">All Status</Option>
                  <Option value="published">Published</Option>
                  <Option value="draft">Draft</Option>
                </Select>
              </Col>
              <Col span={6}>
                {selectedRowKeys.length > 0 && (
                  <Dropdown
                    trigger={["click"]}
                    menu={{
                      items: [
                        {
                          key: "bulk-status",
                          label: "Change Status",
                          icon: <EditOutlined />,
                          children: [
                            {
                              key: "publish",
                              label: "Publish",
                            },
                            {
                              key: "draft",
                              label: "Set to Draft",
                            },
                          ],
                        },
                        {
                          key: "delete",
                          label: "Delete Selected",
                          icon: <DeleteOutlined />,
                          danger: true,
                        },
                      ],
                      onClick: (e) => {
                        handleBulkChange(e.key);
                      },
                    }}
                  >
                    <Button>
                      Bulk Actions <DownOutlined />
                    </Button>
                  </Dropdown>
                )}
              </Col>
            </Row>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={blogs}
            rowKey="_id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              total: totalRecord,
              pageSize: limit,
              current: page,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} blogs`,
              onChange: (page, pageSize) => {
                setPage(page);
                setLimit(pageSize);
              },
            }}
            scroll={{ x: 800, y: 500 }}
          />
        </Card>
      </div>
    </>
  );
};

export default Blogs;
