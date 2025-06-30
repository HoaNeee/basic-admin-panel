/* eslint-disable @typescript-eslint/no-explicit-any */
export const createTree = (
  data: any[],
  parent_id: string = "",
  key: string = ""
) => {
  const arr: any = [];
  for (const item of data) {
    if (item.parent_id === parent_id) {
      let children = [];
      if (item[key] !== undefined || item[key] === "") {
        children = createTree(data, item[key], key);
      }
      item.children = children && children.length > 0 ? [...children] : null;
      arr.push(item);
    }
  }
  return arr;
};
