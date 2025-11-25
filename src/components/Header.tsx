import { useState, type KeyboardEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [searchParams] = useSearchParams();
  
  // ✅ URL에서 현재 검색어 가져오기
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || ""
  );

  const goSell = () => {
    if (user) {
      navigate("/sell");
    } else {
      navigate("/login", { state: { from: "/sell" } });
    }
  };

  // ✅ 검색 실행
  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    
    // 검색 페이지로 이동 (쿼리 파라미터 포함)
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  // ✅ Enter 키로 검색
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="top-0 z-10 bg-[#fcfcfc] border-b border-gray-200">
      <div className="flex items-center max-w-6xl gap-3 px-4 py-3 mx-auto">
        {/* 로고 */}
        <button
          onClick={() => navigate("/")}
          className="text-xl font-extrabold text-neutral-900"
        >
          <img src="/logo_black.png" className="h-16" alt="로고" />
        </button>

        {/* ✅ 검색창 */}
        <div className="flex flex-1 max-w-xl gap-2 ml-6">
          <input
            type="text"
            placeholder="검색어를 입력해주세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 text-sm rounded-md bg-[#efefef] placeholder-neutral-500 focus:ring-2 focus:ring-neutral-800 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm font-semibold text-white rounded-md bg-neutral-800 hover:opacity-90"
          >
            검색
          </button>
        </div>

        {/* 우측 메뉴 */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={goSell}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-neutral-900 hover:opacity-90"
            title={user ? "상품 등록하기" : "로그인하고 상품 등록하기"}
          >
            등록하기
          </button>

          {loading ? (
            <span className="text-sm text-gray-500">확인 중...</span>
          ) : user ? (
            <>
              <span className="text-sm text-gray-700">{user.userId} 님</span>
              <button
                onClick={logout}
                className="px-3 py-1 text-sm text-white rounded bg-neutral-900 hover:opacity-90"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                로그인
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-3 py-1 text-sm text-white rounded bg-neutral-900 hover:opacity-90"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>

      {/* 하단 카테고리 메뉴 */}
      <div className="flex max-w-6xl gap-6 px-4 py-1 mx-auto text-sm text-gray-600">
        {[
          { to: "/feed/recommend", label: "추천" },
          { to: "/categories", label: "카테고리" },
          { to: "/feed/hot", label: "인기" },
          { to: "/feed/new", label: "최신" },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `hover:text-neutral-900 ${
                isActive
                  ? "text-neutral-900 font-bold underline underline-offset-8 decoration-2"
                  : ""
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}