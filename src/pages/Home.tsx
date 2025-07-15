/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "antd";

import { useDispatch } from "react-redux";
import { removeAuth } from "../redux/reducers/authReducer";
import { appName } from "../constants/appName";
import { useEffect, useState } from "react";
import { handleAPI } from "../apis/request";
import { replaceName } from "../helpers/replaceName";
import Loading from "../components/Loading";
import { genCombinations } from "../helpers/genCombinations";

const Home = () => {
  // const auth: AuthState = useSelector((state: RootState) => state.auth.auth);

  const [data, setData] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     setIsLoading(true);
    //     const res = [];
    //     const res1: any = await handleAPI(
    //       "https://dummyjson.com/products/category/mens-shoes"
    //     );
    //     const res2: any = await handleAPI(
    //       "https://dummyjson.com/products/category/mens-shirts"
    //     );
    //     const res3: any = await handleAPI(
    //       "https://dummyjson.com/products/category/womens-bags"
    //     );
    //     const res6: any = await handleAPI(
    //       "https://dummyjson.com/products/category/womens-dresses"
    //     );
    //     const res4: any = await handleAPI(
    //       "https://dummyjson.com/products/category/womens-jewellery"
    //     );
    //     const res5: any = await handleAPI(
    //       "https://dummyjson.com/products/category/womens-shoes"
    //     );
    //     res.push(res1.products);
    //     res.push(res2.products);
    //     res.push(res3.products);
    //     res.push(res4.products);
    //     res.push(res5.products);
    //     res.push(res6.products);
    //     setData(
    //       res.flat(1).map((item) => {
    //         return {
    //           content: item.description,
    //           title: item.title,
    //           sku: item.sku,
    //           stock: item.stock,
    //           thumbnail: item.thumbnail,
    //           images: item.images,
    //           shortDescription:
    //             item.title + ` - ${item.brand} - ${item.category}`,
    //         };
    //       })
    //     );
    //   } catch (error) {
    //     console.log(error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchData();
  }, []);

  const cats = [
    "686161a28c2a83dfa9ce3154",
    "686161a38c2a83dfa9ce3157",
    "686161a38c2a83dfa9ce315a",
    "686161a38c2a83dfa9ce315d",
    "686161a38c2a83dfa9ce3160",
    "686161a38c2a83dfa9ce3163",
    "686161a48c2a83dfa9ce3166",
    "686161a48c2a83dfa9ce3169",
    "686161a48c2a83dfa9ce316c",
    "686161a48c2a83dfa9ce316f",
    "686161a48c2a83dfa9ce3172",
    "686161a58c2a83dfa9ce3175",
    "686161a58c2a83dfa9ce3178",
    "686161a58c2a83dfa9ce317b",
    "686161a58c2a83dfa9ce317e",
    "686161a58c2a83dfa9ce3181",
    "686161a68c2a83dfa9ce3184",
    "686161a68c2a83dfa9ce3187",
    "686161a68c2a83dfa9ce318a",
    "686161a68c2a83dfa9ce318d",
    "686161a68c2a83dfa9ce3190",
    "686161a78c2a83dfa9ce3193",
    "686161a78c2a83dfa9ce3196",
    "686161a78c2a83dfa9ce3199",
    "686161a78c2a83dfa9ce319c",
    "686161a78c2a83dfa9ce319f",
    "686161a88c2a83dfa9ce31a2",
    "686161a88c2a83dfa9ce31a5",
    "686161a88c2a83dfa9ce31a8",
    "686161a88c2a83dfa9ce31ab",
    "686161a88c2a83dfa9ce31ae",
    "686161a98c2a83dfa9ce31b1",
    "686161a98c2a83dfa9ce31b4",
    "686161a98c2a83dfa9ce31b7",
    "686161a98c2a83dfa9ce31ba",
    "686161a98c2a83dfa9ce31bd",
  ];

  const thumbnail = [
    "https://images.pexels.com/photos/2584269/pexels-photo-2584269.jpeg",
    "https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg",
    "https://images.pexels.com/photos/2752045/pexels-photo-2752045.jpeg",
    "https://images.pexels.com/photos/1485031/pexels-photo-1485031.jpeg",
    "https://images.pexels.com/photos/1631181/pexels-photo-1631181.jpeg",
    "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
    "https://images.pexels.com/photos/2010812/pexels-photo-2010812.jpeg",
    "https://images.pexels.com/photos/2233703/pexels-photo-2233703.jpeg",
    "https://images.pexels.com/photos/2065195/pexels-photo-2065195.jpeg",
    "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
    "https://images.pexels.com/photos/3363204/pexels-photo-3363204.jpeg",
    "https://images.pexels.com/photos/983497/pexels-photo-983497.jpeg",
    "https://images.pexels.com/photos/3672825/pexels-photo-3672825.jpeg",
    "https://images.pexels.com/photos/36029/aroni-arsa-children-little.jpg",
    "https://images.pexels.com/photos/2738792/pexels-photo-2738792.jpeg",
    "https://images.pexels.com/photos/2866077/pexels-photo-2866077.jpeg",
    "https://images.pexels.com/photos/2010925/pexels-photo-2010925.jpeg",
    "https://images.pexels.com/photos/3054973/pexels-photo-3054973.jpeg",
    "https://images.pexels.com/photos/2693849/pexels-photo-2693849.jpeg",
    "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg",
    "https://images.pexels.com/photos/28570315/pexels-photo-28570315.jpeg",
    "https://images.pexels.com/photos/12915247/pexels-photo-12915247.jpeg",
    "https://images.pexels.com/photos/1619709/pexels-photo-1619709.jpeg",
    "https://images.pexels.com/photos/6311314/pexels-photo-6311314.jpeg",
    "https://images.pexels.com/photos/2671517/pexels-photo-2671517.jpeg",
    "https://images.pexels.com/photos/1375849/pexels-photo-1375849.jpeg",
    "https://images.pexels.com/photos/2825577/pexels-photo-2825577.jpeg",
    "https://images.pexels.com/photos/7100302/pexels-photo-7100302.jpeg",
    "https://images.pexels.com/photos/27987914/pexels-photo-27987914.jpeg",
    "https://images.pexels.com/photos/19248045/pexels-photo-19248045.jpeg",
  ];

  const variation = [
    {
      id: "6853eddb6d61e1163bcc3c81",
      options: [
        "68540c1eb07fc006ccce3845",
        "68540cd5704e59472a5695e2",
        "6858193f9ae95b9974aeb73a",
        "68581a079ae95b9974aeb74a",
      ],
    },
    {
      id: "6853ee94bc7879fe34dc193c",
      options: [
        "6861f5e80c5474e5dca42bdc",
        "6861f5eb0c5474e5dca42bdf",
        "6861f5f10c5474e5dca42be2",
        "6861f5f80c5474e5dca42be5",
        "6861f5fb0c5474e5dca42be8",
        "6861f5ff0c5474e5dca42beb",
      ],
    },
  ]; // color,size

  const suppliers = [
    "68621660f0f0289df7c06989",
    "6862167df0f0289df7c0698c",
    "686216a2f0f0289df7c0698f",
    "686216b1f0f0289df7c06992",
    "686216c8f0f0289df7c06995",
    "686216d6f0f0289df7c06998",
    "686216ecf0f0289df7c0699b",
    "686216f8f0f0289df7c0699e",
  ];

  const handleAdd = async () => {
    try {
      for (let i = 0; i < 100; i++) {
        const index = random(0, data.length);

        const productType = random(0, 2);

        const item = { ...data[index] };

        const lenCat = random(1, 4);
        const cat = [];
        const setCat = new Set();
        for (let i = 0; i < lenCat; i++) {
          let idx = random(0, cats.length);
          if (setCat.has(idx)) {
            while (setCat.has(idx)) {
              idx = random(0, cats.length);
            }
          }
          cat.push(cats[idx]);
          setCat.add(idx);
        }

        const subProductsPayload = [];

        if (productType === 1) {
          /*
            options: item?.key_combi?.split("-"),
            price: item?.price || 0,
            stock: item?.stock || 0,
            thumbnail: item?.thumbnail || "",
            discountedPrice: item?.discountedPrice,
            SKU: item?.SKU,
        */

          const lenVariation = random(1, 3);

          if (lenVariation === 1) {
            const idxVari = random(0, variation.length);
            const lenOption = random(1, variation[idxVari].options.length + 1);
            const options = [];
            const optSet = new Set();
            for (let i = 0; i < lenOption; i++) {
              let idxOption = random(0, variation[idxVari].options.length);
              while (optSet.has(idxOption)) {
                idxOption = random(0, variation[idxVari].options.length);
              }
              options.push(variation[idxVari].options[idxOption]);
              optSet.add(idxOption);
            }

            const subProducts = [];

            for (const item of options) {
              subProducts.push({
                options: [item],
                price: random(10, 1000),
                thumbnail: thumbnail[random(0, thumbnail.length)],
                stock: random(0, 100),
              });
            }

            subProductsPayload.push(subProducts);
          } else {
            //
            const lenOp1 = random(1, variation[0].options.length);
            const lenOp2 = random(1, variation[1].options.length);
            const op1 = [],
              op2 = [];
            const setOp1 = new Set(),
              setOp2 = new Set();
            for (let i = 0; i < lenOp1; i++) {
              let idx = random(0, variation[0].options.length);
              while (setOp1.has(idx)) {
                idx = random(0, variation[0].options.length);
              }
              op1.push(variation[0].options[idx]);
              setOp1.add(idx);
            }

            for (let i = 0; i < lenOp2; i++) {
              let idx = random(0, variation[1].options.length);
              while (setOp2.has(idx)) {
                idx = random(0, variation[1].options.length);
              }
              op2.push(variation[1].options[idx]);
              setOp2.add(idx);
            }
            const subProducts = [];
            console.log(op1.length, op2.length);
            for (let i = 0; i < op1.length; i++) {
              for (let j = 0; j < op2.length; j++) {
                subProducts.push({
                  options: [op1[i], op2[j]],
                  price: random(10, 1000),
                  thumbnail: thumbnail[random(0, thumbnail.length)],
                  stock: random(0, 100),
                });
              }
            }
            subProductsPayload.push(subProducts);
          }
        }

        const discount = random(0, 2);
        const price = random(10, 1000);
        let discountedPrice;
        if (discount) {
          const percent = random(1, 101);
          discountedPrice = Number((price * (percent / 100)).toFixed(0));
        }

        const product = {
          ...item,
          categories: cat,
          productType: productType === 0 ? "simple" : "variations",
          SKU: item.sku,
          price: price,
          discountedPrice: discount ? discountedPrice : null,
          supplier_id: suppliers[random(0, suppliers.length)],
        };
        if (productType === 1) {
          delete product.price;
          delete product.discountedPrice;
        }

        const payload = {
          data: product,
          subProducts: subProductsPayload[0],
        };

        const response = await handleAPI("/products/create", payload, "post");

        console.log(response);
      }

      // console.log(payload);
      console.log("done");
    } catch (error) {
      console.log(error);
    }
  };

  function random(min: number, max: number) {
    return min + Math.floor(Math.random() * (max - min));
  }

  const handleLogout = () => {
    localStorage.removeItem(appName.authData);
    localStorage.removeItem(appName.auth);
    dispatch(removeAuth());
  };

  const handleUpdate = async () => {
    try {
      const response = await handleAPI(
        "/products/update-1",
        undefined,
        "patch"
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {isLoading && <Loading type="screen" />}
      <Button onClick={handleLogout} type="primary">
        Logout
      </Button>
      <br />
      <Button onClick={handleAdd}>Add data demo</Button>
      <Button onClick={handleUpdate}>Update</Button>
    </div>
  );
};

export default Home;
