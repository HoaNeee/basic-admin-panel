/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  message,
  InputNumber,
  Row,
  Col,
  Space,
  Divider,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { handleAPI, uploadImage } from "../../apis/request";
import UploadImagePreview from "../../components/UploadImagePreview";
import { useLocation, useNavigate } from "react-router";
import { Editor } from "@tinymce/tinymce-react";
import Loading from "../../components/Loading";
import { RiRobot2Line } from "react-icons/ri";
import type { BlogModel } from "../../models/blogModel";
import ModalInput from "../../components/modals/ModalInput";

const WriteBlog: React.FC = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState<string[]>();
  const [imageFile, setImageFile] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [contentInit, setContentInit] = useState<string>("");
  const [dataTagSelect, setDataTagSelect] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openModalInput, setOpenModalInput] = useState(false);

  const params = new URLSearchParams(useLocation().search);
  const blogId = params.get("id");
  const editorRef = useRef<any>(null);

  const fetchBlogData = useCallback(async () => {
    if (!blogId) return;

    const response = await handleAPI(`/blogs/${blogId}`);
    if (response.data) {
      const blogData = response.data;
      form.setFieldsValue({
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        readTime: blogData.readTime,
        status: blogData.status,
      });
      setTags(blogData.tags || []);
      setImageUrl(blogData.image || "");
      setIsDraft(blogData.status === "draft");
      setContentInit(blogData.content || "");
    }
  }, [blogId, form]);

  const fetchTags = useCallback(async () => {
    const response = await handleAPI("/blogs/tags");
    if (response.data) {
      const tagsData = response.data.map((tag: string) => ({
        label: tag,
        value: tag,
      }));
      setDataTagSelect(tagsData);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (blogId) {
          await fetchBlogData();
        }
        await fetchTags();
      } catch (error: any) {
        messageApi.error("Error : " + error.message);
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [blogId, messageApi, fetchBlogData, fetchTags]);

  const handleImageChange = (file: any) => {
    setImageFile(file);
    if (file) {
      const preview = URL.createObjectURL(file);
      setImageUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl("");
  };

  const handleAddTag = () => {
    if (inputTag) {
      setInputTag(undefined);
      let inputConfig = inputTag.map((tag) => tag.trim()).filter((tag) => tag);

      inputConfig = inputConfig.filter((tag) => !tags.includes(tag));

      if (inputConfig.length === 0) return;
      setTags([...inputConfig, ...tags]);
    }
  };

  const handleRemoveTag = (removedTag: string) => {
    setTags(tags.filter((tag) => tag !== removedTag));
  };

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const onFinish = async (values: any) => {
    try {
      setIsUpdating(true);

      const content = editorRef.current.getContent();
      if (!content) {
        messageApi.error("Content is required");
        return;
      }

      if (content.length < 100) {
        messageApi.error("Content must be at least 100 characters");
        return;
      }

      const blogData: BlogModel = {
        title: values.title,
        excerpt: values.excerpt,
        content: content,
        tags: tags,
        readTime: values.readTime || calculateReadTime(content),
        status: isDraft ? "draft" : "published",
      };

      if (imageFile) {
        const uploadResponse = await uploadImage("thumbnail", imageFile);
        blogData.image = uploadResponse.data;
      } else if (imageUrl && !blogId) {
        blogData.image = imageUrl;
      } else {
        blogData.image = "";
      }

      let response: any;
      if (blogId) {
        response = await handleAPI(`/blogs/edit/${blogId}`, blogData, "patch");
      } else {
        response = await handleAPI("/blogs", blogData, "post");
      }

      if (response.data) {
        messageApi.success(response.message || "Blog saved successfully");
      } else {
        throw Error("Something went wrong");
      }

      if (!blogId) {
        navigate("/blogs");
      }

      if (!blogId) {
        form.resetFields();
        setTags([]);
        setImageFile(null);
        setImageUrl("");
        setIsDraft(true);
        message.success(response.message || "Blog created successfully");
        editorRef.current.setContent("");
      }
    } catch (error: any) {
      messageApi.error("Error saving blog: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreview = () => {
    // You can implement preview functionality here
    messageApi.info("Preview functionality can be implemented here");
  };

  const handleRemoveTagAsync = async (tag: string) => {
    try {
      setIsUpdating(true);
      const api = `/blogs/tags/${tag}`;
      const response: any = await handleAPI(api, { tag }, "delete");
      messageApi.success(response.message || "Tag removed successfully");
      setDataTagSelect(dataTagSelect.filter((item) => item.value !== tag));
      setTags(tags.filter((t) => t !== tag));
    } catch (error: any) {
      messageApi.error("Error removing tag: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitAI = async (input: string) => {
    if (!input || input.trim() === "") {
      messageApi.error("Input cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      setOpenModalInput(false);
      const response = await handleAPI("/ai-assistant/blog", { input }, "post");
      const data = response.data;
      if (data) {
        form.setFieldsValue({
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          readTime: data.readTime,
          status: "draft",
        });
        setImageUrl(data.image);
        setTags(data.tags || []);
        editorRef.current.setContent(data.content);
        messageApi.success("AI Assistant generated content successfully");
      }
      console.log(response);
    } catch (error: any) {
      messageApi.error("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/blogs")}
              type="text"
            >
              Back to Blogs
            </Button>
            <Divider type="vertical" />
            <span>{blogId ? "Edit Blog" : "Write New Blog"}</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<RiRobot2Line />}
              onClick={() => setOpenModalInput(true)}
            >
              {" "}
              Assistant with AI{" "}
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={handlePreview}
              disabled={isUpdating}
            >
              Preview
            </Button>
            <Switch
              checkedChildren="Draft"
              unCheckedChildren="Publish"
              checked={isDraft}
              onChange={setIsDraft}
            />
          </Space>
        }
        className="relative"
      >
        {isLoading && <Loading type="screen" />}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: "draft",
            readTime: 1,
          }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Card title="Content" className="mb-4">
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[
                    { required: true, message: "Please enter blog title" },
                    { min: 5, message: "Title must be at least 5 characters" },
                    {
                      max: 100,
                      message: "Title must not exceed 100 characters",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter an engaging title for your blog"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="excerpt"
                  label="Excerpt"
                  rules={[
                    { required: true, message: "Please enter blog excerpt" },
                    {
                      min: 20,
                      message: "Excerpt must be at least 20 characters",
                    },
                    {
                      max: 300,
                      message: "Excerpt must not exceed 300 characters",
                    },
                  ]}
                >
                  <TextArea
                    placeholder="Write a brief summary of your blog (150-300 characters)"
                    rows={3}
                    showCount
                    maxLength={300}
                  />
                </Form.Item>

                <Form.Item label="Content" className="">
                  <Editor
                    apiKey={import.meta.env.VITE_API_KEY_EDITOR}
                    onInit={(_evt: any, editor: any) =>
                      (editorRef.current = editor)
                    }
                    initialValue={contentInit}
                    init={{
                      height: 350,
                      menubar: true,
                      plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "code",
                        "fullscreen",
                        "insertdatetime",
                        "media",
                        "table",
                        "code",
                        "help",
                        "wordcount",
                      ],
                      toolbar:
                        "undo redo | blocks | " +
                        "bold italic forecolor | alignleft aligncenter " +
                        "alignright alignjustify | bullist numlist outdent indent | " +
                        "removeformat | help",
                      content_style:
                        "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      placeholder: "Write your blog content here...",
                    }}
                  />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Featured Image" className="mb-4">
                <UploadImagePreview
                  file={imageUrl}
                  onDelete={handleRemoveImage}
                  onChange={(e: any) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImageChange(file);
                    }
                  }}
                  title="Upload Image"
                />
              </Card>

              <Card title="Blog Settings" className="mb-4">
                <Form.Item
                  name="readTime"
                  label="Read Time (minutes)"
                  tooltip="Estimated reading time in minutes"
                >
                  <InputNumber
                    min={1}
                    max={60}
                    placeholder="Auto-calculated"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item label="Status" name="status">
                  <Select disabled>
                    <Select.Option value="draft">Draft</Select.Option>
                    <Select.Option value="published">Published</Select.Option>
                  </Select>
                </Form.Item>
              </Card>

              <Card title="Tags" className="mb-4">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Space.Compact style={{ width: "100%" }}>
                    <Select
                      mode="tags"
                      placeholder="Add a tag"
                      onChange={(value) => {
                        setInputTag(value);
                      }}
                      optionRender={(option) => {
                        const value = option.value || option.label;

                        return (
                          <div className="flex items-center justify-between">
                            <p>{option.label}</p>
                            {!inputTag?.includes(value as string) && (
                              <Popconfirm
                                title="Are you sure to delete this tag?"
                                onConfirm={(e) => {
                                  e?.stopPropagation();
                                  handleRemoveTagAsync(value as string);
                                }}
                                onCancel={(e) => {
                                  e?.stopPropagation();
                                  e?.preventDefault();
                                }}
                                okButtonProps={{
                                  loading: isUpdating,
                                }}
                              >
                                <DeleteOutlined
                                  className="text-red-500"
                                  color="red"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }}
                                  style={{
                                    color: "red",
                                  }}
                                />
                              </Popconfirm>
                            )}
                          </div>
                        );
                      }}
                      value={inputTag}
                      options={dataTagSelect}
                      tagRender={(e) => {
                        return (
                          <Tag
                            closable
                            onClose={() =>
                              setInputTag(
                                inputTag?.filter((tag) => tag !== e.value)
                              )
                            }
                          >
                            {e.value}
                          </Tag>
                        );
                      }}
                      className="w-full"
                    />
                    <Button
                      type="primary"
                      onClick={handleAddTag}
                      style={{ width: "80px" }}
                    >
                      Add
                    </Button>
                  </Space.Compact>

                  <div>
                    {tags.map((tag, index) => (
                      <Tag
                        key={`${index}-${tag}`}
                        closable
                        style={{ marginBottom: 8 }}
                        onClose={() => handleRemoveTag(tag)}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </Space>
              </Card>

              <Card>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={isUpdating}
                    size="large"
                    block
                  >
                    {isDraft ? "Save as Draft" : "Publish Blog"}
                  </Button>

                  <Button
                    type="default"
                    onClick={() => navigate("/blogs")}
                    disabled={isUpdating}
                    block
                  >
                    Cancel
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Form>
        <ModalInput
          open={openModalInput}
          onOk={(value) => handleSubmitAI(value)}
          onCancel={() => {
            setOpenModalInput(false);
          }}
          messageApi={messageApi}
          title="Ask the AI assistant to help you with writing or editing your blog content."
        />
      </Card>
    </>
  );
};

export default WriteBlog;
