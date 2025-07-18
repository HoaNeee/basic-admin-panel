import { useEffect } from "react";
import MainRouter from "./MainRouter";
import AuthRouter from "./AuthRouter";
import { useDispatch, useSelector } from "react-redux";
import { addAuth, type AuthState } from "../redux/reducers/authReducer";
import type { RootState } from "../redux/store";
import { appName } from "../constants/appName";

const Routes = () => {
  const auth: AuthState = useSelector((state: RootState) => state.auth.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!auth.accessToken) {
      const auth = localStorage.getItem(appName.auth);
      const authData = localStorage.getItem(appName.authData);
      if (auth && authData) {
        const authParse = JSON.parse(auth);
        const authDataParse = JSON.parse(authData);
        const data = {
          ...authDataParse,
          ...authParse,
        };
        dispatch(addAuth(data));
      }
    }
  }, [auth.accessToken]);

  if (auth.accessToken) {
    return <MainRouter />;
  }

  return <AuthRouter />;
};

export default Routes;
