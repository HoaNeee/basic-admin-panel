/* eslint-disable @typescript-eslint/no-explicit-any */
export const createTree = (data: any[], parent_id: string = "") => {
  const arr: any = [];
  for (const item of data) {
    if (item.parent_id === parent_id) {
      const children = createTree(data, item.value);
      item.children = [...children];
      arr.push(item);
    }
  }
  return arr;
};
