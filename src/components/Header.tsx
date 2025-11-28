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

  const [isVisible, setIsVisible] = useState(false);

  const mydetail = () => {
    setIsVisible(!isVisible);
  }

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
        <div className="flex flex-1 max-w-xl ml-6 rounded-md bg-[#efefef] px-4">
          <div className="flex items-center justify-center">
            <img src="/search.svg" alt="" className="w-3 h-3 opacity-40" />
          </div>
          <input
            type="text"
            placeholder="검색어를 입력해주세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 pl-2 pr-4 py-2 text-sm bg-[#efefef] placeholder-neutral-500 focus:ring-2 focus:ring-neutral-800 focus:outline-none"
          />
        </div>

        {/* 우측 메뉴 */}
        <div className="flex items-center gap-2 ml-auto">

          <button
            onClick={goSell}
            className="flex items-center justify-center pr-2 text-md"
            title={user ? "상품 판매하기" : "로그인하고 상품 판매하기"}
          >
            <div className="relative">
              <img src="https://cdn-icons-png.flaticon.com/512/3737/3737822.png" alt="" className="w-4 h-4" />
            </div>
            <p className="pl-1">판매하기</p>
          </button>
          <div className="w-[1px] h-4 bg-gray-800"></div>
          {loading ? (
            <span className="text-sm text-gray-500">확인 중...</span>
          ) : user ? (
            <>
              <div
                onClick={() => mydetail()} //
                className="flex items-center justify-center px-2 hover:cursor-pointer text-md"
              >
                <div className="relative">
                  <img src="https://cdn-icons-png.flaticon.com/512/456/456283.png" alt="" className="w-4 h-4" />
                </div>
                <p className="pl-1">마이</p>
                <div id="mybtn_detail" className="absolute flex-col hidden gap-2 p-4 text-sm bg-white border rounded-lg top-16" style={{ display: isVisible ? "flex" : "none" }}>
                  <button onClick={() => navigate("/user")}>마이페이지</button>
                  <hr />
                  <button 
                    onClick={logout}
                    className="text-red-500"
                  >로그아웃</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center px-2 text-md"
              >
                <div className="relative">
                  <img src="https://cdn-icons-png.flaticon.com/512/456/456283.png" alt="" className="w-4 h-4" />
                </div>
                <p className="pl-1">마이</p>
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
              `hover:text-neutral-900 ${isActive
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