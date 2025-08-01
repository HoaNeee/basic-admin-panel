import { Provider } from "react-redux";
import "./App.css";
import Routes from "./router/Routes";
import store from "./redux/store";
import { ConfigProvider, message } from "antd";
import { appColor } from "./constants/appColor";

function App() {
  message.config({
    top: 100,
    duration: 2,
    maxCount: 3,
    rtl: true,
    prefixCls: "my-message",
  });

  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemActiveBg: appColor.primary200,
              itemSelectedBg: appColor.primary200,
              itemSelectedColor: appColor.primary500,
              itemColor: appColor.gray600,
              colorPrimaryTextActive: appColor.primary500,
              colorPrimary: appColor.primary500,
            },

            Button: {
              defaultHoverBorderColor: appColor.primary400,
              defaultHoverColor: appColor.primary400,
              colorPrimary: appColor.primary500,
              colorPrimaryHover: appColor.primary400,
              colorPrimaryActive: appColor.primary400,
            },
            Table: {
              headerBg: "#fff",
            },
          },
        }}
      >
        <Routes />
      </ConfigProvider>
    </Provider>
  );
}

export default App;
