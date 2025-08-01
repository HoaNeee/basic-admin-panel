import type { ReactNode } from "react";
import { LiaCoinsSolid } from "react-icons/lia";

interface Props {
  styles?: React.CSSProperties;
  className?: string;
  icon?: ReactNode;
  cnIcon?: string;
  value?: string;
  label?: string;
  type?: "vertical" | "horizontal";
  cnLabel?: string;
}

const StatisticComponent = (props: Props) => {
  const { styles, className, icon, cnIcon, value, label, type, cnLabel } =
    props;

  return (
    <div
      className={`flex flex-col gap-4 items-center justify-center px-4 ${className}`}
      style={styles}
    >
      {icon && (
        <div className={`inline-block p-1 bg-blue-100/50 rounded-md ${cnIcon}`}>
          {icon || <LiaCoinsSolid size={33} className="text-blue-500" />}
        </div>
      )}
      <div
        className={`flex  w-full text-base text-gray-600/80 ${
          type === "vertical"
            ? "flex-col items-center justify-between"
            : "flex-row md:justify-between justify-center md:gap-0 gap-3"
        }`}
      >
        <p className="font-semibold md:text-base text-sm">{value ?? 0}</p>
        <p className={`font-medium text-xs md:text-sm ${cnLabel}`}>
          {label || ""}
        </p>
      </div>
    </div>
  );
};

export default StatisticComponent;
