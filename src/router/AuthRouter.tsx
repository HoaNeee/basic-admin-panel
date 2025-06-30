import { BrowserRouter, Route, Routes } from "react-router";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// const authRouter = createBrowserRouter([
//   {
//     path: "/",
//     element: <AuthLayout />,
//     children: [
//       {
//         index: true,
//         element: <Login />,
//       },
//       {
//         path: "login",
//         element: <Login />,
//       },
//       {
//         path: "register",
//         element: <Register />,
//       },
//     ],
//   },
// ]);

const AuthRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route element={<Login />} index />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<>Not found</>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AuthRouter;
