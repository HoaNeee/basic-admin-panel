/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table } from "antd";
import { appColor } from "../constants/appColor";

interface Props {
  loading?: boolean;
  columns: any[];
  data: any[];
  rowKey: string;
  onShowSizeChange: (current: number, size: number) => void;
  total?: number;
  onChange: (page: number, limit: number) => void;
}

const MyTable = (props: Props) => {
  const { loading, columns, data, rowKey, onChange, onShowSizeChange, total } =
    props;

  const renderHeader = (children: any, props: any) => {
    return (
      <th
        {...props}
        style={{
          color: appColor.gray300,
        }}
      >
        {children.children[1]}
      </th>
    );
  };

  return (
    <Table
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
