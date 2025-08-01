/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table } from "antd";
import { appColor } from "../constants/appColor";
import type {
  TablePaginationConfig,
  TableRowSelection,
} from "antd/es/table/interface";
import { useEffect, useState } from "react";

interface Props {
  loading?: boolean;
  columns: any[];
  data: any[];
  rowKey: string;
  onShowSizeChange?: (current: number, size: number) => void;
  total?: number;
  onChange?: (page: number, limit: number) => void;
  bordered?: boolean;
  titleHeaderColor?: string;
  isSelectionRow?: boolean;
  onSelectChange?: (newSelect: React.Key[]) => void;
  selectedRowKeys?: React.Key[];
  pagination?: false | TablePaginationConfig | undefined;
  style?: React.CSSProperties;
  className?: string;
}

const MyTable = (props: Props) => {
  const {
    loading,
    columns,
    data,
    rowKey,
    onChange,
    onShowSizeChange,
    total,
    bordered,
    titleHeaderColor,
    isSelectionRow,
    onSelectChange,
    selectedRowKeys,
    pagination,
    style,
    className,
  } = props;

  const [totalRecord, setTotalRecord] = useState(0);

  useEffect(() => {
    setTotalRecord(total || 0);
  }, [total]);

  const renderHeader = (children: any, props: any) => {
    return (
      <th
        {...props}
        style={{
          color: titleHeaderColor || appColor.gray300,
        }}
      >
        {children.children[1]}
      </th>
    );
  };

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <Table
      style={style}
      className={className}
      bordered={bordered || false}
      loading={loading}
      columns={columns}
      dataSource={data}
      rowKey={rowKey}
      pagination={
        pagination
          ? pagination
          : {
              onShowSizeChange,
              total: totalRecord,
              onChange,
              showQuickJumper: true,
            }
      }
      rowSelection={isSelectionRow ? rowSelection : undefined}
      scroll={{
        y: 470,
        x: "auto",
      }}
      components={{
        header: {
          cell: renderHeader,
        },
        body: {},
      }}
    />
  );
};

export default MyTable;
