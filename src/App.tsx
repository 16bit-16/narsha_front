// src/App.tsx
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ListingDetail from "./pages/ListingDetail";
import ProductNew from "./pages/ProductNew";
import User from "./pages/User";
import Search from "./pages/Search";

const HIDE_LAYOUT_PATHS = ["/login", "/signup"] as const;
console.log(import.meta.env.VITE_KAKAOMAP_KEY);

// 특정 경로에서는 Header/Footer 숨기기
const shouldHideLayout = (pathname: string) =>
  HIDE_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  
export default function App() {
  const { pathname } = useLocation();
  const hideLayout = shouldHideLayout(pathname);
  const mainClass = hideLayout ? "flex-1" : "container flex-1";

  return (
    <div className="flex flex-col min-h-screen">
      <AuthProvider>
        {/* 로그인/회원가입 페이지에서는 Header 숨김 */}
        {!hideLayout && <Header />}

        <main className={mainClass}>
          <Routes>
            {/* 공개 페이지 */}
            <Route path="/" element={<Home />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/sell" element={<ProductNew />} />
            <Route path="/mypage/:userId" element={<User />} />
            <Route path="/search" element={<Search />} />


            {/* 인증 필요한 페이지 (예시) */}
            {/*
            <Route element={<ProtectedRoute />}>
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/sell" element={<Sell />} />
            </Route>
            */}
          </Routes>
        </main>

        {/* 로그인/회원가입 페이지에서는 Footer 숨김 */}
        {!hideLayout && <Footer />}
      </AuthProvider>
    </div>
  );
}