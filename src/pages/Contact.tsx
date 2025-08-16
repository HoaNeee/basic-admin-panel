import { useEffect, useState } from "react";
import {
  Card,
  List,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  Tag,
  Typography,
  Space,
  Empty,
  Badge,
  Button,
  Modal,
  message,
  Tooltip,
  Avatar,
  Popconfirm,
} from "antd";
import {
  ContactsOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
  UndoOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { handleAPI } from "../apis/request";
import Loading from "../components/Loading";
import { appColor } from "../constants/appColor";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TextArea } = Input;

interface ContactProps {
  _id: string;
  email: string;
  name: string;
  message: string;
  phone: string;
  subject: "product" | "order" | "return" | "complaint" | "other";
  status: "pending" | "responded" | "resolved";
  replyMessage?: string;
}

const Contact = () => {
  const [contacts, setContacts] = useState<ContactProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactProps | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [filter, setFilter] = useState<{
    status: ContactProps["status"] | undefined;
    subject: ContactProps["subject"] | undefined;
  }>({
    status: undefined,
    subject: undefined,
  });
  const [stats, setStats] = useState<{
    totalContacts: number;
    resolvedContacts: number;
    responsedContacts: number;
    pendingContacts: number;
  }>({
    totalContacts: 0,
    resolvedContacts: 0,
    responsedContacts: 0,
    pendingContacts: 0,
  });

  const limit = 10;
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getCustomerContactsStats();
  }, []);

  useEffect(() => {
    getCustomerContacts();
  }, [page, totalRecord, keyword, filter]);

  const getCustomerContacts = async () => {
    try {
      setLoading(true);
      const api = `/customer-contacts?page=${page}&limit=${totalRecord}&keyword=${keyword}&status=${
        filter.status || ""
      }&subject=${filter.subject || ""}`;
      const response = await handleAPI(api);
      setContacts(response.data.contacts);
      setTotalRecord(response.data.totalRecord);
    } catch (error) {
      console.error("Error fetching customer contacts:", error);
      messageApi.error("Lỗi khi tải danh sách liên hệ!");
    } finally {
      setLoading(false);
    }
  };

  const getCustomerContactsStats = async () => {
    try {
      const api = `/customer-contacts/stats`;
      const response = await handleAPI(api);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching customer contacts stats:", error);
      message.error("Lỗi khi tải thống kê liên hệ!");
    }
  };

  const getStatusConfig = (status: ContactProps["status"]) => {
    switch (status) {
      case "pending":
        return {
          color: "warning",
          icon: <ClockCircleOutlined />,
          text: "Chờ xử lý",
        };
      case "responded":
        return {
          color: "processing",
          icon: <ExclamationCircleOutlined />,
          text: "Đã phản hồi",
        };
      case "resolved":
        return {
          color: "success",
          icon: <CheckCircleOutlined />,
          text: "Đã xử lý",
        };
      default:
        return {
          color: "default",
          icon: <ClockCircleOutlined />,
          text: "Không xác định",
        };
    }
  };

  const subjectConfig = (subject: string) => {
    switch (subject) {
      case "product":
        return {
          color: "green",
          icon: <ShoppingCartOutlined />,
          text: "Sản phẩm",
        };
      case "order":
        return {
          color: "blue",
          icon: <ShoppingCartOutlined />,
          text: "Đơn hàng",
        };
      case "return":
        return {
          color: "orange",
          icon: <UndoOutlined />,
          text: "Trả hàng",
        };
      case "complaint":
        return {
          color: "red",
          icon: <WarningOutlined />,
          text: "Khiếu nại",
        };
      case "other":
        return {
          color: "default",
          icon: <QuestionCircleOutlined />,
          text: "Khác",
        };
    }
  };

  const handleViewContact = (contact: ContactProps) => {
    setSelectedContact(contact);
    setIsModalVisible(true);
  };

  const handleReplyContact = (contact: ContactProps) => {
    setSelectedContact(contact);
    setReplyMessage(contact.replyMessage || "");
    setReplyModalVisible(true);
  };

  const handleSaveReply = async () => {
    if (!selectedContact) return;

    try {
      setIsPosting(true);
      const api = `/customer-contacts/reply/${selectedContact._id}`;
      await handleAPI(
        api,
        {
          replyMessage,
          status: "responded",
        },
        "post"
      );

      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === selectedContact._id
            ? { ...contact, replyMessage, status: "responded" as const }
            : contact
        )
      );

      messageApi.success("Đã gửi phản hồi thành công!");
      setReplyModalVisible(false);
      setReplyMessage("");
      setSelectedContact(null);
    } catch (error) {
      console.error("Error saving reply:", error);
      messageApi.error("Lỗi khi gửi phản hồi!");
    } finally {
      setIsPosting(false);
    }
  };

  const handleMarkResolved = async (contact: ContactProps) => {
    try {
      setIsPosting(true);
      await handleAPI(
        `customer-contacts/mark-resolved/${contact._id}`,
        {},
        "patch"
      );
      setContacts((prev) =>
        prev.map((c) =>
          c._id === contact._id ? { ...c, status: "resolved" } : c
        )
      );
      messageApi.success("Đã đánh dấu liên hệ là đã xử lý!");
    } catch (error) {
      console.log(error);
      messageApi.error("Lỗi khi đánh dấu đã xử lý!");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="relative">
      {contextHolder}
      {loading && <Loading type="screen" />}
      <Space align="center" style={{ marginBottom: "24px" }}>
        <ContactsOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
        <Title level={2} style={{ margin: 0 }}>
          Contact Management
        </Title>
      </Space>
      <Text type="secondary" style={{ display: "block", marginBottom: "24px" }}>
        Quản lý các yêu cầu liên hệ từ khách hàng
      </Text>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng liên hệ"
              value={stats.totalContacts}
              prefix={<ContactsOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={stats.pendingContacts}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã phản hồi"
              value={stats.responsedContacts}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã xử lý"
              value={stats.resolvedContacts}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Search
              placeholder="Tìm kiếm theo tên, email hoặc chủ đề..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={(value) => {
                setKeyword(value);
                setPage(1);
              }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              defaultValue="all"
              style={{ width: "100%" }}
              size="large"
              onChange={(e) => {
                setFilter({
                  ...filter,
                  status: e as ContactProps["status"] | undefined,
                });
                setPage(1);
              }}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="pending">Chờ xử lý</Select.Option>
              <Select.Option value="responded">Đã phản hồi</Select.Option>
              <Select.Option value="resolved">Đã xử lý</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              defaultValue="all"
              style={{ width: "100%" }}
              size="large"
              suffixIcon={<FilterOutlined />}
              onChange={(e) => {
                setFilter({
                  ...filter,
                  subject: e as ContactProps["subject"] | undefined,
                });
                setPage(1);
              }}
            >
              <Select.Option value="all">Tất cả chủ đề</Select.Option>
              <Select.Option value="product">Sản phẩm</Select.Option>
              <Select.Option value="order">Đơn hàng</Select.Option>
              <Select.Option value="complaint">Khiếu nại</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <MessageOutlined />
            <Text strong>Danh sách liên hệ ({contacts.length})</Text>
          </Space>
        }
      >
        {contacts.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có liên hệ nào phù hợp với bộ lọc"
          />
        ) : (
          <List
            loading={loading}
            itemLayout="vertical"
            size="large"
            dataSource={contacts}
            pagination={{
              pageSize: limit,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} liên hệ`,
              current: page,
              onChange: (page) => setPage(page),
              hideOnSinglePage: true,
            }}
            renderItem={(contact) => {
              const statusConfig = getStatusConfig(contact.status);
              return (
                <List.Item
                  key={contact._id}
                  actions={[
                    <Tooltip title="Xem chi tiết" key="view">
                      <Button
                        type="primary"
                        ghost
                        icon={<EyeOutlined />}
                        onClick={() => handleViewContact(contact)}
                      />
                    </Tooltip>,
                    <Tooltip title="Phản hồi" key="reply">
                      <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => handleReplyContact(contact)}
                        disabled={contact.status === "resolved"}
                      />
                    </Tooltip>,
                    <Tooltip title="Đánh dấu đã xử lý" key="mark-resolved">
                      <Popconfirm
                        title="Vui lòng xác nhận lại!"
                        onConfirm={() => handleMarkResolved(contact)}
                        okButtonProps={{ loading: isPosting }}
                      >
                        <Button
                          type="default"
                          icon={
                            <CheckCircleOutlined style={{ color: "green" }} />
                          }
                          disabled={contact.status === "resolved"}
                        />
                      </Popconfirm>
                    </Tooltip>,
                  ]}
                  extra={
                    <Badge
                      count={statusConfig.icon}
                      style={{ backgroundColor: "transparent" }}
                    >
                      <Avatar
                        style={{
                          backgroundColor: appColor.primary500,
                          verticalAlign: "middle",
                        }}
                        size="large"
                      >
                        {contact.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  }
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong style={{ fontSize: "16px" }}>
                          {subjectConfig(contact.subject)?.text}
                        </Text>
                        <Tag
                          color={statusConfig.color}
                          icon={statusConfig.icon}
                        >
                          {statusConfig.text}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <Space>
                          <UserOutlined />
                          <Text strong>{contact.name}</Text>
                        </Space>
                        <Space>
                          <MailOutlined />
                          <Text>{contact.email}</Text>
                        </Space>
                        <Space>
                          <PhoneOutlined />
                          <Text>{contact.phone}</Text>
                        </Space>
                      </Space>
                    }
                  />
                  <Paragraph
                    ellipsis={{ rows: 2, expandable: true, symbol: "xem thêm" }}
                    style={{ marginTop: "12px", color: "#666" }}
                  >
                    <MessageOutlined style={{ marginRight: "8px" }} />
                    {contact.message}
                  </Paragraph>

                  {contact.replyMessage && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        backgroundColor: "#f0f2f5",
                        borderRadius: "6px",
                        borderLeft: "4px solid #52c41a",
                      }}
                    >
                      <Text strong style={{ color: "#52c41a" }}>
                        Phản hồi:
                      </Text>
                      <Paragraph style={{ margin: "4px 0 0 0", color: "#666" }}>
                        {contact.replyMessage}
                      </Paragraph>
                    </div>
                  )}
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      <Modal
        title={
          <Space>
            <EyeOutlined />
            Chi tiết liên hệ
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedContact && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Họ tên:</Text>
                  <Text>{selectedContact.name}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Email:</Text>
                  <Text>{selectedContact.email}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Số điện thoại:</Text>
                  <Text>{selectedContact.phone}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Trạng thái:</Text>
                  <Tag color={getStatusConfig(selectedContact.status).color}>
                    {getStatusConfig(selectedContact.status).text}
                  </Tag>
                </Space>
              </Col>
              <Col span={24}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <Text strong>Chủ đề:</Text>
                  <Text>{subjectConfig(selectedContact.subject)?.text}</Text>
                </Space>
              </Col>
              <Col span={24}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <Text strong>Nội dung:</Text>
                  <Paragraph
                    style={{
                      padding: "12px",
                      backgroundColor: "#fafafa",
                      borderRadius: "6px",
                      margin: 0,
                    }}
                  >
                    {selectedContact.message}
                  </Paragraph>
                </Space>
              </Col>
              {selectedContact.replyMessage && (
                <Col span={24}>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Text strong style={{ color: "#52c41a" }}>
                      Phản hồi:
                    </Text>
                    <Paragraph
                      style={{
                        padding: "12px",
                        backgroundColor: "#f6ffed",
                        borderRadius: "6px",
                        border: "1px solid #b7eb8f",
                        margin: 0,
                      }}
                    >
                      {selectedContact.replyMessage}
                    </Paragraph>
                  </Space>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Phản hồi liên hệ
          </Space>
        }
        open={replyModalVisible}
        onCancel={() => {
          setReplyModalVisible(false);
          setReplyMessage("");
          setSelectedContact(null);
        }}
        onOk={handleSaveReply}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        width={600}
        maskClosable={!isPosting}
        okButtonProps={{
          loading: isPosting,
        }}
      >
        {selectedContact && (
          <div>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>Khách hàng: </Text>
                <Text>
                  {selectedContact.name} ({selectedContact.email})
                </Text>
              </div>
              <div>
                <Text strong>Chủ đề: </Text>
                <Text>{subjectConfig(selectedContact.subject)?.text}</Text>
              </div>
              <div>
                <Text strong>Nội dung yêu cầu:</Text>
                <Paragraph
                  style={{
                    padding: "12px",
                    backgroundColor: "#fafafa",
                    borderRadius: "6px",
                    margin: "8px 0",
                  }}
                >
                  {selectedContact.message}
                </Paragraph>
              </div>
              <div>
                <Text strong>Phản hồi:</Text>
                <TextArea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Nhập nội dung phản hồi..."
                  style={{ marginTop: "8px" }}
                />
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Contact;
