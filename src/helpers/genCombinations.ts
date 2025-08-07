/* eslint-disable @typescript-eslint/no-explicit-any */
export const genCombinations = (data: any[] = []) => {
  const arr = [...data];

  const combinations: any = [];

  /*
    option -> 
    {
      label: string,
      value: string
    }
  */

  const Try = (arr: any[] = [], idx: number, option: any) => {
    for (let i = idx; i < arr.length; i++) {
      const options = [...arr[i].options];
      const ans = [...option];
      for (let j = 0; j < options.length; j++) {
        const item = { ...options[j] };
        ans.push(item);

        if (idx === arr.length - 1 && ans.length === arr.length) {
          combinations.push([...ans]);
        }
        Try(arr, i + 1, ans);
        ans.pop();
      }
    }
  };

  Try(arr, 0, []);

  return combinations;
};
