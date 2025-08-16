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
  Checkbox,
  Divider,
  Dropdown,
  Button,
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
  status: "sent" | "not-sent" | "cancel";
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
    status?: string;
  }>();
  const [sent, setSent] = useState("");
  const [stats, setStats] = useState<{
    totalSubscribers: number;
    sentSubscribers: number;
    notSentSubscribers: number;
    cancelSubscribers: number;
  }>({
    totalSubscribers: 0,
    sentSubscribers: 0,
    notSentSubscribers: 0,
    cancelSubscribers: 0,
  });
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const [messageApi, contextHolder] = message.useMessage();
  const limit = 10;

  useEffect(() => {
    getSubscribersStats();
  }, []);

  useEffect(() => {
    getSubscribers();
  }, [page, keyword, filter]);

  useEffect(() => {
    if (sent) {
      setTimeout(() => {
        setSent("");
      }, 2000);
    }
  }, [sent]);

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
      const api = `/subscribers?page=${page}&limit=${limit}&keyword=${keyword}&status=${
        filter?.status ? filter.status : ""
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

  const getSubscribersStats = async () => {
    try {
      setLoading(true);
      const api = `/subscribers/stats`;
      const response = await handleAPI(api);
      setStats(response.data);
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
          email: subscriber.email,
        },
        "patch"
      );
      messageApi.success("Update subscriber status successfully!");
      setSent(subscriber._id);
      await getSubscribers();
    } catch (error) {
      console.log(error);
      messageApi.error("Failed to update subscriber status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulk = async (action: string) => {
    try {
      setIsUpdating(true);
      await handleAPI(
        "/subscribers/bulk",
        {
          ids: selectedKeys,
          status: action,
        },
        "patch"
      );
      await getSubscribers();
      await getSubscribersStats();
      setSelectedKeys([]);
      messageApi.success(`${action} subscribers successfully!`);
    } catch (error) {
      console.log(error);
      messageApi.error("Failed to update subscriber status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSentAll = async () => {
    try {
      await handleAPI("/subscribers/send-all", {}, "patch");
      messageApi.success("Send all subscribers successfully!");
      await getSubscribers();
      setSelectedKeys([]);
    } catch (error) {
      console.log(error);
      messageApi.error("Failed to send all emails");
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
              value={stats.totalSubscribers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Emails Sent"
              value={stats.sentSubscribers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.notSentSubscribers}
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
                setFilter((prev) => ({ ...prev, status: e }));
              }}
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="sent">Đã gửi</Select.Option>
              <Select.Option value="not-sent">Chưa gửi</Select.Option>
              <Select.Option value="cancel">Đã hủy</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card
        extra={<Button onClick={handleSentAll}>Send all</Button>}
        title={
          <Space wrap>
            <MailOutlined />
            <Text strong>Danh sách Subscribers ({subscribers.length})</Text>
            {selectedKeys.length > 0 ? (
              <>
                <Divider type="vertical" />
                <div className="md:pb-0 flex flex-wrap items-center gap-4 pb-4 text-sm text-gray-500">
                  <p>({selectedKeys.length}) items selected</p>
                  <Dropdown
                    trigger={["click"]}
                    menu={{
                      items: [
                        {
                          key: "sent",
                          label: "Resend Email",
                          onClick: () => handleBulk("sent"),
                        },
                        {
                          key: "cancel",
                          label: "Cancel Subscription",
                          onClick: () => handleBulk("cancel"),
                        },
                      ],
                    }}
                  >
                    <Button>Bulk action</Button>
                  </Dropdown>
                </div>
              </>
            ) : null}
          </Space>
        }
      >
        {subscribers.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              checked={
                selectedKeys.length === subscribers.length &&
                subscribers.length > 0
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedKeys(subscribers.map((sub) => sub._id));
                } else setSelectedKeys([]);
              }}
              indeterminate={
                selectedKeys.length > 0 &&
                selectedKeys.length < subscribers.length
              }
              id="check-all-subscribers"
            />

            <label htmlFor="check-all-subscribers">Check All</label>
          </div>
        )}
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
            className=""
            renderItem={(subscriber) => (
              <List.Item
                actions={[
                  <Tag
                    onClick={() => handleSent(subscriber)}
                    key="status"
                    color={
                      subscriber.status === "sent"
                        ? "success"
                        : subscriber.status === "not-sent"
                        ? "warning"
                        : "default"
                    }
                    className={`cursor-pointer`}
                    icon={
                      subscriber.status === "sent" ? (
                        <CheckCircleOutlined />
                      ) : subscriber.status === "not-sent" ? (
                        <CloseCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                  >
                    {sent && sent === subscriber._id
                      ? "Đã gửi"
                      : subscriber.status === "sent"
                      ? "Gửi lại"
                      : subscriber.status === "cancel"
                      ? "Đã hủy"
                      : "Chưa gửi"}
                  </Tag>,
                ]}
              >
                <div
                  style={{
                    height: "-webkit-fill-available",
                  }}
                  className="mr-2"
                >
                  <Checkbox
                    checked={selectedKeys.includes(subscriber._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedKeys([...selectedKeys, subscriber._id]);
                      } else {
                        setSelectedKeys(
                          selectedKeys.filter((key) => key !== subscriber._id)
                        );
                      }
                    }}
                  />
                </div>
                <List.Item.Meta
                  avatar={
                    <Badge
                      count={
                        subscriber.status === "sent" ? (
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
                      {subscriber.status === "sent" && (
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
