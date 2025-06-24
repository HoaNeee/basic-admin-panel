/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table } from "antd";
import { appColor } from "../constants/appColor";
import type { TableRowSelection } from "antd/es/table/interface";

interface Props {
  loading?: boolean;
  columns: any[];
  data: any[];
  rowKey: string;
  onShowSizeChange: (current: number, size: number) => void;
  total?: number;
  onChange: (page: number, limit: number) => void;
  bordered?: boolean;
  titleHeaderColor?: string;
  isSelectionRow?: boolean;
  onSelectChange?: (newSelect: React.Key[]) => void;
  selectedRowKeys?: React.Key[];
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
  } = props;

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
      bordered={bordered || false}
      loading={loading}
      columns={columns}
      dataSource={data}
      rowKey={rowKey}
      pagination={{
        onShowSizeChange,
        total: total,
        onChange,
        showQuickJumper: true,
      }}
      rowSelection={isSelectionRow ? rowSelection : undefined}
      scroll={{
        y: 470,
      }}
      components={{
        header: {
          cell: renderHeader,
        },
      }}
    />
  );
};

export default MyTable;
