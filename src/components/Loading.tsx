/* eslint-disable @typescript-eslint/no-explicit-any */
import { Spin } from "antd";

const Loading = ({ type }: { type: "default" | "screen" | "superScreen" }) => {
  if (type === "superScreen") {
    return (
      <div className="h-full w-full flex items-center justify-center fixed top-0 left-0 bg-white/40 z-99">
        <Spin size="default" />
      </div>
    );
  }

  return type === "screen" ? (
    <div className="h-full w-full flex items-center justify-center absolute top-0 bg-white/40 z-99">
      <Spin size="default" />
    </div>
  ) : (
    <></>
  );
};

export default Loading;
