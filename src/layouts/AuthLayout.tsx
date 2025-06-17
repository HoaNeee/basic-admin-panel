import { Outlet } from "react-router";
import LogoApp from "../assets/logo.png";
const AuthLayout = () => {
  return (
    <div className="h-screen w-full grid grid-cols-2">
      <div className="h-full flex items-center justify-center flex-col">
        <div className="h-[270px] w-[270px]">
          <img src={LogoApp} alt="" className="h-full w-full object-cover" />
        </div>
        <h2 className="text-4xl font-bold text-primary">SHOESSHOP</h2>
      </div>
      <div className="h-full w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
