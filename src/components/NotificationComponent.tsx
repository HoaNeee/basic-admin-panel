import { useNavigate } from "react-router";
import { handleAPI } from "../apis/request";
import type { NotificationModel } from "../models/notificationModel";
import { formatDistanceStrict } from "date-fns";

interface Props {
  notifications: NotificationModel[];
  onRead?: (notify_id: string) => void;
}

const NotificationComponent = (props: Props) => {
  const { notifications, onRead } = props;

  const navigate = useNavigate();

  const handleRead = async (id: string) => {
    try {
      const api = `/notifications/read/${id}`;
      await handleAPI(api, undefined, "patch");
      if (onRead) {
        onRead(id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="overflow-y-auto h-full">
        {notifications.map((item, index) => (
          <div
            key={index}
            className={`border-b-2 transition-all duration-300 border-gray-100 py-3 pl-3 relative cursor-pointer hover:bg-gray-100 rounded-md ${
              item.isRead ? "" : "bg-gray-200/70"
            }`}
            onClick={async () => {
              if (!item.isRead) {
                await handleRead(item._id);
              }
              navigate(`${item.ref_link}`);
            }}
          >
            <div className="flex items-center justify-between ">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 p-2 rounded-full ${
                    item.isRead ? "bg-gray-200" : "bg-gray-300"
                  }`}
                >
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 flex md:items-center justify-between md:flex-row flex-col">
                  <div className="text-sm space-y-0.5">
                    <p className="font-bold">{item.title}</p>
                    <p
                      className={`${
                        item.isRead ? "text-gray-400" : "text-gray-600"
                      } max-w-50`}
                    >
                      {item.body}
                    </p>
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      item.isRead ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {formatDistanceStrict(
                      new Date(item.createdAt),
                      new Date(),
                      {
                        addSuffix: true,
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
            {!item.isRead && (
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full top-1.5 left-1.5 absolute" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationComponent;
