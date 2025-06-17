import { Button } from "antd";

import { useDispatch } from "react-redux";
import { removeAuth } from "../redux/reducers/authReducer";
import { appName } from "../constants/appName";

const Home = () => {
  // const auth: AuthState = useSelector((state: RootState) => state.auth.auth);

  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.removeItem(appName.authData);
    localStorage.removeItem(appName.auth);
    dispatch(removeAuth());
  };
  return (
    <Button onClick={handleLogout} type="primary">
      Logout
    </Button>
  );
};

export default Home;
