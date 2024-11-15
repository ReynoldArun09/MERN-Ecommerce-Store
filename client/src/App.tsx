import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/shop/home-page";
import ShopLayout from "./layouts/shop-layout";
import { useVerifyAuthApi } from "./services/auth/auth-queries";
import AuthLayout from "./layouts/auth-layout";
import SignUpPage from "./pages/auth/sign-up-page";
import SignInPage from "./pages/auth/sign-in-page";
import LoadingSpinner from "./components/common/loading-spinner";

export default function App() {
  const { data: isAuthenticated, isLoading } = useVerifyAuthApi();

  if (isLoading) {
    return <LoadingSpinner />;
  }
  return (
    <Routes>
      <Route path="/" element={<ShopLayout />}>
        <Route index element={<HomePage />} />
      </Route>
      <Route
        path="/auth"
        element={!isAuthenticated ? <AuthLayout /> : <Navigate to="/" />}
      >
        <Route path="sign-up" element={<SignUpPage />} />
        <Route path="sign-in" element={<SignInPage />} />
      </Route>
    </Routes>
  );
}
