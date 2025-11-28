// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type LocationState = { from?: string } | null;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authBusy } = useAuth();

  const [userId, setUserId] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = userId.trim().length > 0 && pw.length > 0 && !authBusy;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setErr(null);
      await login(userId, pw); // 컨텍스트 갱신

      // 리다이렉트 대상이 있으면 거기로, 없으면 홈
      const state = location.state as LocationState;
      const from =
        state?.from && typeof state.from === "string" ? state.from : "/";
      navigate(from, { replace: true });
    } catch (e: any) {
      setErr(e.message || "로그인 실패");
    }
  };

  return (
    <>
      <div className="flex justify-between h-screen md:bg-[#fcfcfc] bg-zinc-400">
        {/* 왼쪽 폼 영역 */}
        <div className="flex flex-col justify-center items-center bg-[#fcfcfc] md:w-[30%] w-[100%] mx-[auto]">
          <a href="/" className="w-48">
            <img src="/logo_black.png" alt="" />
          </a>
          <form
            className="w-full max-w-sm mx-auto space-y-4"
            onSubmit={onSubmit}
          >
            {/* 아이디 */}
            <div>
              <label className="sr-only">아이디</label>
              <input
                type="text"
                placeholder="아이디"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoComplete="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-zinc-400 focus:outline-none focus:scale-103 focus:ring-1 focus:ring-zinc-400"/>
            </div>

            {/* 비밀번호 */}
            <div className="relative">
              <label className="sr-only">비밀번호</label>
              <input
                type={showPw ? "text" : "password"}
                placeholder="비밀번호"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-zinc-400 focus:outline-none focus:scale-103 focus:ring-1 focus:ring-zinc-400"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute -translate-y-1/2 right-4 top-1/2 text-zinc-300 hover:text-white"
                title={showPw ? "숨기기" : "보기"}
              >
                {showPw ? <img src="https://cdn-icons-png.flaticon.com/512/2767/2767146.png" className="w-6"/> : <img src="https://cdn-icons-png.flaticon.com/512/709/709612.png" className="w-6"/>}
              </button>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {authBusy ? "로그인 중..." : "로그인"}
            </button>

            {/* 에러 메시지 */}
            {err && (
              <p className="text-xs text-center text-rose-800">{err}</p>
            )}

            {/* 하단 링크 */}
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <div className="space-x-2">
                <Link to="/find/pw" className="underline underline-offset-2">
                  비밀번호 찾기
                </Link>
                <span className="opacity-60">|</span>
                <Link to="/find/id" className="underline underline-offset-2">
                  아이디 찾기
                </Link>
              </div>
              <Link to="/signup" className="underline underline-offset-2">
                회원가입
              </Link>
            </div>
          </form>
        </div>
        
        <div className="bg-gradient-to-b from-black rounded-xl m-1 to-gray-800 w-[70%] items-center justify-center flex p-20 flex-row gap-5 hidden md:flex">
          <div className="text-left">
            <p className="text-zinc-300 leading-tight text-[35px] md:text-[30px]">
              빠르고
              <br />
              간편한
              <br />
              중고거래
            </p>
            <img src="/logo_white.png" className="h-24" />
          </div>
          <img src="/palpal_mockup.png" className="h-[30rem]" />
        </div>
      </div>
    </>
  );
}
