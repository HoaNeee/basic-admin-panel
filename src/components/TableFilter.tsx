import { Button, Divider, Dropdown, Flex, Input, Space } from "antd";
import type { ReactNode } from "react";
import { IoFilterOutline } from "react-icons/io5";

interface Props {
  filter?: ReactNode;
  onFilter?: () => void;
  children?: ReactNode;
  onClearFilter?: () => void;
  onSearch?: (val: string) => void;
  extra?: ReactNode;
  title?: string;
  placementPopupFilter?:
    | "bottom"
    | "topLeft"
    | "topCenter"
    | "topRight"
    | "bottomLeft"
    | "bottomCenter"
    | "bottomRight"
    | "top";
  placeholderInputSearch?: string;
}

const TableFilter = (props: Props) => {
  const {
    filter,
    onClearFilter,
    onFilter,
    onSearch,
    extra,
    children,
    title,
    placementPopupFilter,
    placeholderInputSearch,
  } = props;

  return (
    <>
      <div className="bg-white w-full h-full p-5 rounded-sm">
        <Flex justify="space-between" align="center" wrap>
          <div className="flex gap-4 items-center">
            <p className="text-lg font-medium">{title}</p>
          </div>
          <Space size={5} wrap>
            <Input.Search
              placeholder={placeholderInputSearch || "Enter keyword..."}
              onSearch={onSearch}
              allowClear
            />
            <Dropdown
              trigger={["click"]}
              arrow
              placement={placementPopupFilter || "bottom"}
              popupRender={() => {
                return (
                  <div className="min-w-xs bg-white shadow-xl rounded-sm p-4">
                    {filter}
                    <div className="flex justify-end items-center gap-2 mt-5">
                      <Button onClick={onClearFilter}>Clear</Button>
                      <Button type="primary" onClick={onFilter}>
                        Done
                      </Button>
                    </div>
                  </div>
                );
              }}
            >
              <Button icon={<IoFilterOutline size={16} />}>Filters</Button>
            </Dropdown>
            {extra && (
              <>
                <Divider type="vertical" />
                {extra}
              </>
            )}
          </Space>
        </Flex>
        <div className="mt-4">{children}</div>
      </div>
    </>
  );
};

export default TableFilter;
