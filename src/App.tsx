// src/App.tsx
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MobileMenu from "./components/MobileMenu";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ListingDetail from "./pages/ListingDetail";
import ProductNew from "./pages/ProductNew";
import User from "./pages/User";
import Search from "./pages/Search";
import FindId from "./pages/FindId";
import FindPw from "./pages/FindPw";
import Tos from "./pages/TOS";
import Privacy from "./pages/PrivacyPolicy"
import EditProfile from "./pages/EditProfile";
import Category from "./pages/Category";
import ChatList from "./pages/ChatList";
import Chat from "./pages/Chat";

const HIDE_LAYOUT_PATHS = ["/login", "/signup", "/find"] as const;
console.log(import.meta.env.VITE_KAKAOMAP_KEY);

// 특정 경로에서는 Header/Footer 숨기기
const shouldHideLayout = (pathname: string) =>
  HIDE_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

export default function App() {
  const { pathname } = useLocation();
  const hideLayout = shouldHideLayout(pathname);
  const mainClass = hideLayout ? "flex-1" : "p-2 md:container flex-1";

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
            <Route path="/user" element={<User />} />
            <Route path="/search" element={<Search />} />
            <Route path="/find/id" element={<FindId />} />
            <Route path="/find/pw" element={<FindPw />} />
            <Route path="/tos" element={<Tos />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/editprofile" element={<EditProfile />} />
            <Route path="/chats" element={<ChatList />} />
            <Route path="/chat/:receiverId/:productId" element={<Chat />} />


            {/* 헤더 선택자 */}
            <Route path="/category" element={<Category />} />

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
        {!hideLayout && <MobileMenu />}
      </AuthProvider>
    </div>
  );
}