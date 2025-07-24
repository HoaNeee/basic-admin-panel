import { Outlet } from "react-router";
import LogoApp from "../assets/logo.png";
import { appName } from "../constants/appName";
const AuthLayout = () => {
  return (
    <div className="h-screen w-full grid md:grid-cols-2">
      <div className="h-full md:flex items-center hidden justify-center flex-col">
        <div className="h-[270px] w-[270px]">
          <img src={LogoApp} alt="" className="h-full w-full object-cover" />
        </div>
        <h2 className="text-4xl font-bold text-primary">
          {appName.appConstantname}
        </h2>
      </div>
      <div className="h-full w-full md:p-0 p-5">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
