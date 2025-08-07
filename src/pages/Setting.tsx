/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Select,
  notification,
  Typography,
  Space,
  Popconfirm,
} from "antd";
import { SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import UploadImage from "../components/UploadImage";
import { handleAPI, uploadImage } from "../apis/request";
import Loading from "../components/Loading";
import { IoCloseOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { updateSetting } from "../redux/reducers/settingReducer";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface SettingData {
  siteName: string;
  logoLight: string;
  logoDark: string;
  favicon: string;

  domain: string;
  description: string;
  keywords: string[];

  companyName: string;
  email: string;
  phone: string;
  address: string;

  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;

  timezone: string;
  language: string;
  currency: string;

  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;

  // googleAnalyticsId: string;
  // facebookPixelId: string;

  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

const initialValues: SettingData = {
  siteName: "My e-commerce Store",
  logoLight: "",
  logoDark: "",
  favicon: "",
  domain: "https://yourdomain.com",
  description: "Your online store description",
  keywords: ["ecommerce", "online store", "shopping"],
  companyName: "My Company Ltd.",
  email: "contact@yourdomain.com",
  phone: "+1234567890",
  address: "123 Business St, City, Country",
  facebook: "https://facebook.com/yourcompany",
  instagram: "https://instagram.com/yourcompany",
  twitter: "https://twitter.com/yourcompany",
  youtube: "https://youtube.com/yourcompany",
  timezone: "UTC",
  language: "en",
  currency: "USD",
  smtpHost: "smtp.gmail.com",
  smtpPort: "587",
  smtpUsername: "",
  smtpPassword: "",
  metaTitle: "Kakrist Store - Best Products Online",
  metaDescription:
    "Shop the best products at our online store. Fast shipping, great prices, and excellent customer service.",
  ogImage: "",
  // googleAnalyticsId: "",
  // facebookPixelId: "",
};

const Setting: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoLightFileList, setLogoLightFileList] = useState<File | string>();
  const [logoDarkFileList, setLogoDarkFileList] = useState<File | string>();
  const [faviconFileList, setFaviconFileList] = useState<File | string>();
  const [ogImageFileList, setOgImageFileList] = useState<File | string>();

  const [showSubdomains, setShowSubdomains] = useState(false);
  const [listSubdomains, setListSubdomains] = useState<string[]>([]);
  const [subdomain, setSubdomain] = useState<string>("");

  const [notificationApi, contextHolder] = notification.useNotification();

  const setting = useSelector((state: RootState) => state.setting.setting);
  const dispatch = useDispatch();

  useEffect(() => {
    if (setting) {
      form.setFieldsValue(setting);
      setLogoLightFileList(setting.logoLight || "");
      setLogoDarkFileList(setting.logoDark || "");
      setFaviconFileList(setting.siteFavicon || "");
      setOgImageFileList(setting.ogImage || "");
      setListSubdomains(setting.subdomain || []);
    }
  }, [setting, form]);

  const handleSave = async (values: SettingData) => {
    try {
      setLoading(true);
      if (logoLightFileList) {
        if (typeof logoLightFileList === "string") {
          values.logoLight = logoLightFileList;
        } else {
          const res = await uploadImage("thumbnail", logoLightFileList);
          values.logoLight = res.data;
        }
      }
      if (logoDarkFileList) {
        if (typeof logoDarkFileList === "string") {
          values.logoDark = logoDarkFileList;
        } else {
          const res = await uploadImage("thumbnail", logoDarkFileList);
          values.logoDark = res.data;
        }
      }
      if (faviconFileList) {
        if (typeof faviconFileList === "string") {
          values.favicon = faviconFileList;
        } else {
          const res = await uploadImage("favicon", faviconFileList);
          values.favicon = res.data;
        }
      }

      if (ogImageFileList) {
        if (typeof ogImageFileList === "string") {
          values.ogImage = ogImageFileList;
        } else {
          const res = await uploadImage("ogImage", ogImageFileList);
          values.ogImage = res.data;
        }
      }

      const api = `/settings`;

      const response: any = await handleAPI(api, values, "patch");

      notificationApi.success({
        message: response.message,
        description: "Your settings have been saved successfully.",
      });
      dispatch(updateSetting(values));
    } catch (error: any) {
      notificationApi.error({
        message: "Error",
        description:
          error.message || "Failed to save settings. Please try again.",
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setLogoLightFileList(undefined);
    setLogoDarkFileList(undefined);
    setFaviconFileList(undefined);
    setOgImageFileList(undefined);

    notificationApi.info({
      message: "Form Reset",
      description: "All fields have been reset to their default values.",
    });
  };

  const handleRemoveSubdomain = async (subdomain: string) => {
    try {
      setLoading(true);
      if (!subdomain) {
        notificationApi.error({
          message: "Error",
          description: "Subdomain cannot be empty.",
        });
        return;
      }

      const api = `/settings/remove-subdomain`;
      const response: any = await handleAPI(api, { subdomain }, "delete");
      notificationApi.warning({
        message: response.message,
        description: `Subdomain ${subdomain} has been removed.`,
      });
      setListSubdomains((prev) =>
        prev.filter((item) => item.toLowerCase() !== subdomain.toLowerCase())
      );
    } catch (error) {
      notificationApi.error({
        message: "Error",
        description: "Failed to remove subdomain. Please try again.",
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubdomain = async (subdomain: string) => {
    try {
      if (!subdomain) {
        notificationApi.error({
          message: "Error",
          description: "Subdomain cannot be empty.",
        });
        return;
      }
      if (
        !subdomain
          .split("")
          .every((c) => (c >= "a" && c <= "z") || (c >= "0" && c <= "9"))
      ) {
        notificationApi.error({
          message: "Error",
          description:
            "Subdomain must contain only lowercase letters and numbers.",
        });
        return;
      }
      setLoading(true);
      const api = `/settings/create-subdomain`;
      const response: any = await handleAPI(api, { subdomain }, "post");
      notificationApi.success({
        message: response.message,
        description: `Subdomain ${subdomain} has been created.`,
      });
      setListSubdomains((prev) => [...prev, subdomain]);
      setSubdomain("");
    } catch (error: any) {
      notificationApi.error({
        message: "Error",
        description:
          error.message || "Failed to create subdomain. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ padding: "24px" }}>
        {loading && <Loading type="superScreen" />}
        <div style={{ marginBottom: "24px" }}>
          <Title level={2}>Settings</Title>
          <Text type="secondary">
            Configure your application settings and preferences
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSave}
          size="large"
          autoComplete="off"
        >
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="Branding & Logo" style={{ marginBottom: "24px" }}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Site Name"
                      name="siteName"
                      rules={[
                        { required: true, message: "Please enter site name!" },
                      ]}
                    >
                      <Input placeholder="Enter your site name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Company Name"
                      name="companyName"
                      rules={[
                        {
                          required: true,
                          message: "Please enter company name!",
                        },
                      ]}
                    >
                      <Input placeholder="Enter your company name" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item label="Light Logo">
                      <UploadImage
                        title="Upload Light Logo"
                        size="small"
                        file={
                          logoLightFileList
                            ? typeof logoLightFileList === "string"
                              ? logoLightFileList
                              : URL.createObjectURL(logoLightFileList)
                            : undefined
                        }
                        onDelete={() => setLogoLightFileList(undefined)}
                        onChange={(e) => {
                          if (e.target.files) {
                            setLogoLightFileList(e.target.files[0]);
                          }
                        }}
                        styles={{
                          margin: 0,
                          backgroundColor: "#f0f0f0",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Dark Logo">
                      <UploadImage
                        title="Upload Dark Logo"
                        size="small"
                        file={
                          logoDarkFileList
                            ? typeof logoDarkFileList === "string"
                              ? logoDarkFileList
                              : URL.createObjectURL(logoDarkFileList)
                            : undefined
                        }
                        onDelete={() => setLogoDarkFileList(undefined)}
                        onChange={(e) => {
                          if (e.target.files) {
                            setLogoDarkFileList(e.target.files[0]);
                          }
                        }}
                        styles={{
                          margin: 0,
                          backgroundColor: "#f0f0f0",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Favicon">
                      <UploadImage
                        title="Upload Favicon"
                        size="small"
                        file={
                          faviconFileList
                            ? typeof faviconFileList === "string"
                              ? faviconFileList
                              : URL.createObjectURL(faviconFileList)
                            : undefined
                        }
                        onDelete={() => setFaviconFileList(undefined)}
                        onChange={(e) => {
                          if (e.target.files) {
                            setFaviconFileList(e.target.files[0]);
                          }
                        }}
                        styles={{
                          margin: 0,
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card
                title="Website Information"
                style={{ marginBottom: "24px" }}
              >
                <Form.Item
                  label="Domain"
                  name="domain"
                  rules={[
                    { required: true, message: "Please enter domain!" },
                    { type: "string", message: "Please enter a valid URL!" },
                  ]}
                >
                  <Input
                    placeholder="https://yourdomain.com"
                    addonBefore="https://"
                  />
                </Form.Item>

                <Form.Item
                  label="Subdomain"
                  style={{
                    width: "100%",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      disabled={form.getFieldValue("domain") === ""}
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      name="subdomain"
                      placeholder="subdomain (e.g. shop, api, admin, etc.)"
                      style={{ flex: 1 }}
                      addonAfter={`.${(
                        form.getFieldValue("domain") || ""
                      ).replace("https://", "")}`}
                      addonBefore="https://"
                    />
                    <div className="md:block hidden">
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        size="large"
                        onClick={() => handleCreateSubdomain(subdomain.trim())}
                        disabled={!subdomain.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </Space.Compact>
                  <div className="md:hidden block mt-2">
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      size="large"
                      onClick={() => handleCreateSubdomain(subdomain.trim())}
                      disabled={!subdomain.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </Form.Item>
                <div className="mt-2 mb-4 flex justify-end">
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setShowSubdomains(!showSubdomains)}
                  >
                    <span>
                      {showSubdomains ? "Hide" : "View all"} subdomains
                    </span>
                  </Button>
                </div>
                {showSubdomains && (
                  <div className="text-sm text-gray-500 mb-4 grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-2">
                    {listSubdomains.length > 0 ? (
                      listSubdomains.map((subdomain, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center justify-between gap-4 rounded-md bg-gray-100 p-2"
                        >
                          <p>
                            Subdomain {index + 1}:{" "}
                            {
                              <a
                                target="_blank"
                                href={`https://${subdomain}.${(
                                  form.getFieldValue("domain") || ""
                                ).replace("https://", "")}`}
                                style={{
                                  color: "#0000008a",
                                  textDecoration: "underline",
                                }}
                              >
                                {"https://"}
                                {subdomain}.
                                {(form.getFieldValue("domain") || "").replace(
                                  "https://",
                                  ""
                                )}
                              </a>
                            }
                          </p>
                          <Popconfirm
                            title="Are you sure you want to remove this subdomain?"
                            onConfirm={() => handleRemoveSubdomain(subdomain)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <IoCloseOutline
                              className="hover:text-red-500 transition-colors cursor-pointer"
                              size={20}
                              title="Remove"
                            />
                          </Popconfirm>
                        </div>
                      ))
                    ) : (
                      <div className="">No subdomains found</div>
                    )}
                  </div>
                )}

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Please enter email!" },
                        {
                          type: "email",
                          message: "Please enter a valid email!",
                        },
                      ]}
                    >
                      <Input placeholder="contact@yourdomain.com" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Phone" name="phone">
                      <Input placeholder="+1234567890" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Description" name="description">
                  <TextArea rows={3} placeholder="Enter website description" />
                </Form.Item>

                <Form.Item
                  label="Keywords"
                  name="keywords"
                  help="Separate keywords with commas ( , )"
                  style={{ marginBottom: 28 }}
                >
                  <Input placeholder="keyword1, keyword2, keyword3" />
                </Form.Item>

                <Form.Item label="Address" name="address">
                  <TextArea rows={2} placeholder="Enter business address" />
                </Form.Item>
              </Card>
            </Col>

            <Col span={24}>
              <Card title="Social Media Links" style={{ marginBottom: "24px" }}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Facebook" name="facebook">
                      <Input placeholder="https://facebook.com/yourpage" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Instagram" name="instagram">
                      <Input placeholder="https://instagram.com/yourpage" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Twitter" name="twitter">
                      <Input placeholder="https://twitter.com/yourpage" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="YouTube" name="youtube">
                      <Input placeholder="https://youtube.com/yourchannel" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card
                title="System Configuration"
                style={{ marginBottom: "24px" }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item label="Timezone" name="timezone">
                      <Select disabled placeholder="Select timezone">
                        <Option value="UTC">UTC</Option>
                        <Option value="Europe/London">London</Option>
                        <Option value="Asia/Ho_Chi_Minh">Vietnam</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Language" name="language">
                      <Select disabled placeholder="Select language">
                        <Option value="en">English</Option>
                        <Option value="vi">Vietnamese</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Currency" name="currency">
                      <Select disabled placeholder="Select currency">
                        <Option value="USD">USD ($)</Option>
                        <Option value="VND">VND (₫)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card title="SEO & Meta Tags" style={{ marginBottom: "24px" }}>
                <Form.Item label="Meta Title" name="metaTitle">
                  <Input placeholder="Enter meta title for SEO" />
                </Form.Item>

                <Form.Item label="Meta Description" name="metaDescription">
                  <TextArea
                    rows={3}
                    placeholder="Enter meta description for SEO"
                  />
                </Form.Item>

                <Form.Item label="OG Image">
                  <UploadImage
                    title="Upload Open Graph Image"
                    size="small"
                    file={
                      ogImageFileList
                        ? typeof ogImageFileList === "string"
                          ? ogImageFileList
                          : URL.createObjectURL(ogImageFileList)
                        : undefined
                    }
                    onDelete={() => setOgImageFileList(undefined)}
                    onChange={(e) => {
                      if (e.target.files) {
                        setOgImageFileList(e.target.files[0]);
                      }
                    }}
                    styles={{
                      margin: 0,
                    }}
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* <Col span={24}>
            <Card title="Analytics & Tracking" style={{ marginBottom: "24px" }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Google Analytics ID"
                    name="googleAnalyticsId"
                  >
                    <Input placeholder="GA-XXXXXXXXX-X" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Facebook Pixel ID" name="facebookPixelId">
                    <Input placeholder="123456789012345" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col> */}

            <Col span={24}>
              <Card
                title="Email Configuration (SMTP)"
                style={{ marginBottom: "24px" }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="SMTP Host" name="smtpHost">
                      <Input disabled placeholder="smtp.gmail.com" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="SMTP Port" name="smtpPort">
                      <Input disabled placeholder="587" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="SMTP Username" name="smtpUsername">
                      <Input
                        autoComplete="off"
                        placeholder="Your SMTP username"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="SMTP Password" name="smtpPassword">
                      <Input.Password
                        placeholder="Your app password"
                        autoComplete="new-password"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    size="large"
                  >
                    Save Settings
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    size="large"
                  >
                    Reset to Default
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
};

export default Setting;
