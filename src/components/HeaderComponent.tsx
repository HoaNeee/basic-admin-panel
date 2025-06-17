import { Avatar, Flex, Input, Space } from "antd";
import { Header } from "antd/es/layout/layout";
import { IoSearchOutline } from "react-icons/io5";
import { GoBell } from "react-icons/go";

const HeaderComponent = () => {
  return (
    <Header
      style={{
        backgroundColor: "white",
        position: "sticky",
        top: 0,
        zIndex: 10,
        width: "100%",
      }}
    >
      <Flex justify="space-between">
        <div className="w-1/3">
          <Input
            prefix={<IoSearchOutline />}
            placeholder="Search product, supplier, order"
            size="large"
          />
        </div>
        <Space size={"large"}>
          <GoBell size={20} />
          <Avatar src="https://mondialbrand.com/wp-content/uploads/2024/03/anh-anime-0258.jpg" />
        </Space>
      </Flex>
    </Header>
  );
};

export default HeaderComponent;
