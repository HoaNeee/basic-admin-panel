import { useState, useEffect } from "react";
import {
  List,
  Card,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  Avatar,
  Tag,
  Typography,
  Space,
  Empty,
  Badge,
  message,
} from "antd";
import {
  MailOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  SendOutlined,
} from "@ant-design/icons";
import Loading from "../components/Loading";
import { handleAPI } from "../apis/request";
import { appColor } from "../constants/appColor";
import { IoCheckmark, IoClose } from "react-icons/io5";

const { Title, Text } = Typography;
const { Search } = Input;

interface Subscriber {
  _id: string;
  email: string;
  isSent: boolean;
  subscribedAt?: string;
}

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(10);
  const [filter, setFilter] = useState<{
    isSent?: string;
  }>();
  const limit = 10;

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getSubscribers();
  }, [page, keyword, filter]);

  const totalSubscribers = subscribers.length;
  const sentCount = subscribers.filter((s) => s.isSent).length;
  const notSentCount = subscribers.filter((s) => !s.isSent).length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSearch = (value: string) => {
    if (page !== 1) {
      setPage(1);
    }
    setKeyword(value);
  };

  const getSubscribers = async () => {
    try {
      setLoading(true);
      const api = `/subscribers?page=${page}&limit=${limit}&keyword=${keyword}&isSent=${
        filter?.isSent ? filter.isSent : ""
      }`;
      const response = await handleAPI(api);
      setSubscribers(response.data.subscribers);
      setTotalRecord(response.data.totalRecord);
    } catch (error) {
      console.log(error);
      messageApi.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  const handleSent = async (subscriber: Subscriber) => {
    try {
      setIsUpdating(true);
      await handleAPI(
        `/subscribers/${subscriber._id}`,
        {
          isSent: subscriber.isSent,
          email: subscriber.email,
        },
        "patch"
      );
      messageApi.success("Update subscriber status successfully!");
      await getSubscribers();
    } catch (error) {
      console.log(error);
      messageApi.error("Failed to update subscriber status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      {contextHolder}
      {(isUpdating || loading) && <Loading type="screen" />}
      <Space align="center" style={{ marginBottom: "12px" }}>
        <UserOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
        <Title level={2} style={{ margin: 0 }}>
          Subscribers Management
        </Title>
      </Space>
      <Text type="secondary" style={{ display: "block", marginBottom: "24px" }}>
        Quản lý danh sách người đăng ký nhận email
      </Text>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Subscribers"
              value={totalSubscribers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Emails Sent"
              value={sentCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Pending"
              value={notSentCount}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={16}>
            <Search
              placeholder="Tìm kiếm email..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              defaultValue="all"
              style={{ width: "100%" }}
              size="large"
              suffixIcon={<FilterOutlined />}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, isSent: e }));
              }}
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="sent">Đã gửi</Select.Option>
              <Select.Option value="not-sent">Chưa gửi</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <MailOutlined />
            <Text strong>Danh sách Subscribers ({subscribers.length})</Text>
          </Space>
        }
      >
        {subscribers.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>Không có subscriber nào phù hợp với bộ lọc</span>
            }
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={subscribers}
            pagination={{
              pageSize: limit,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} subscribers`,
              current: page,
              total: totalRecord,
              onChange: (page) => setPage(page),
              hideOnSinglePage: true,
            }}
            renderItem={(subscriber) => (
              <List.Item
                actions={[
                  <Tag
                    onClick={() => handleSent(subscriber)}
                    key="status"
                    color={subscriber.isSent ? "success" : "warning"}
                    className={`cursor-pointer`}
                    icon={
                      subscriber.isSent ? (
                        <CheckCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                  >
                    {subscriber.isSent ? "Đã gửi" : "Chưa gửi"}
                  </Tag>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge
                      count={
                        subscriber.isSent ? (
                          <div className="flex items-center justify-center w-4 h-4 bg-green-500 rounded-full">
                            <IoCheckmark color="white" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-4 h-4 bg-red-500 rounded-full">
                            <IoClose color="white" />
                          </div>
                        )
                      }
                      offset={[-6, 6]}
                    >
                      <Avatar
                        style={{
                          backgroundColor: appColor.primary400,
                          verticalAlign: "middle",
                        }}
                        size="large"
                        icon={<MailOutlined />}
                      />
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong>{subscriber.email}</Text>
                      {subscriber.isSent && (
                        <SendOutlined
                          style={{ color: "#52c41a", fontSize: "12px" }}
                        />
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">
                        Đăng ký: {formatDate(subscriber.subscribedAt)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        ID: {subscriber._id}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Subscribers;
