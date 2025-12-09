// src/pages/Signup.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ------------------------------ 공통 Input ------------------------------ */
// 매 렌더마다 새 함수형 컴포넌트가 만들어지지 않도록 파일 상단에 두고 memo 처리
type BaseInputProps = React.InputHTMLAttributes<HTMLInputElement>;
const BaseInput = React.memo(function BaseInput(props: BaseInputProps) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={[
        "w-full px-3 py-2 border border-gray-300",
        "placeholder:text-zinc-400 rounded-md",
        "focus:outline-none focus:scale-103 focus:ring-1 focus:ring-zinc-400",
        className || "",
      ].join(" ")}
    />
  );
});

/* ------------------------------ API 유틸 ------------------------------ */
const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

/* ------------------------------ Signup ------------------------------ */
type Step = 0 | 1 | 2 | 3;

export default function Signup() {
  const navigate = useNavigate();

  // 단계
  const [step, setStep] = useState<Step>(0);

  // 약관
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAds, setAgreeAds] = useState(false);

  const canGoStep1 = useMemo(
    () => agreeAge && agreePrivacy,
    [agreeAge, agreePrivacy]
  );

  useEffect(() => {
    if (agreeAll) {
      setAgreeAge(true);
      setAgreePrivacy(true);
      setAgreeAds(true);
    }
  }, [agreeAll]);

  useEffect(() => {
    if (agreeAll && (!agreeAge || !agreePrivacy || !agreeAds))
      setAgreeAll(false);
  }, [agreeAge, agreePrivacy, agreeAds]); // eslint-disable-line

  // 계정
  const [userId, setUserId] = useState("");
  const [pw, setPw] = useState("");
  const [pwCheck, setPwCheck] = useState("");

  const canGoStep2 = useMemo(
    () => userId.trim().length >= 3 && pw.length >= 4 && pw === pwCheck,
    [userId, pw, pwCheck]
  );

  // 이메일/코드
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  // 타이머
  const [timeLeft, setTimeLeft] = useState(180);
  useEffect(() => {
    if (step === 3 && timeLeft > 0) {
      const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [step, timeLeft]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(1, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 상태
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [userIdChecked, setUserIdChecked] = useState(false);
  const [userIdAvailable, setUserIdAvailable] = useState(false);
  const [checkingUserId, setCheckingUserId] = useState(false);
  const [userIdError, setUserIdError] = useState("");
  const [signing, setSigning] = useState(false);
  const [verified, setVerified] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // 액션
  const sendCode = useCallback(async () => {
    setErr(null);
    setMsg(null);
    if (!email || !email.includes("@")) {
      setErr("올바른 이메일을 입력하세요.");
      return;
    }
    try {
      setSending(true);
      await request<{ ok: true; messageId: string }>("/auth/send-code", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setTimeLeft(180);
      setVerified(false);
      setMsg("인증코드를 전송했습니다. 메일함을 확인해 주세요.");
      setStep(3);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSending(false);
    }
  }, [email]);

  const verifyCode = useCallback(async () => {
    setErr(null);
    setMsg(null);
    if (!code.trim()) {
      setErr("인증코드를 입력하세요.");
      return;
    }
    try {
      setVerifying(true);
      const r = await request<{ ok: true; verified: boolean }>(
        "/auth/verify-code",
        {
          method: "POST",
          body: JSON.stringify({ email, code }),
        }
      );
      if (r.verified) {
        setVerified(true);
        setMsg("이메일 인증이 완료되었습니다. 회원가입을 진행하세요.");
      }
    } catch (e: any) {
      setVerified(false);
      setErr(e.message);
    } finally {
      setVerifying(false);
    }
  }, [email, code]);

  const handleCheckUserId = async () => {
    if (!userId.trim() || userId.length < 3) {
      setUserIdError("아이디는 3자 이상이어야 합니다");
      alert("아이디는 3자 이상이어야 합니다.");
      return;
    }

    setCheckingUserId(true);
    setUserIdError("");

    try {
      const data = await request<{
        ok: true;
        available: boolean;
        message: string;
      }>("/auth/checkId", { 
        method: "POST",
        body: JSON.stringify({ userId: userId.trim() }),
      });

      if (data.available) {
        setUserIdAvailable(true);
        setUserIdChecked(true);
        setUserIdError("");
        alert("사용 가능한 아이디입니다.");
      } else {
        setUserIdAvailable(false);
        setUserIdChecked(false);
        setUserIdError(data.message || "이미 사용 중인 아이디입니다");
        alert("이미 사용 중인 아이디입니다.");
      }
    } catch (err: any) {
      setUserIdError(err.message || "확인 실패");
      alert("아이디 확인에 실패했습니다. 다시 시도해주세요.");
      setUserIdAvailable(false);
      setUserIdChecked(false);
    } finally {
      setCheckingUserId(false);
    }
  };

  const doSignup = useCallback(async () => {
    setErr(null);
    setMsg(null);
    if (!verified) {
      setErr("이메일 인증을 먼저 완료하세요.");
      return;
    }
    try {
      setSigning(true);
      await request<{ ok: true }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ userId, password: pw, email }),
      });
      alert("회원가입이 완료되었습니다! 로그인 화면으로 이동합니다.");
      navigate("/login");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSigning(false);
    }
  }, [verified, userId, pw, email, navigate]);

  return (
    <>
      <div className="flex justify-between h-screen md:bg-[#fcfcfc] bg-zinc-400">
        {/* 왼쪽 단계별 폼 */}
        <div className="flex flex-col justify-center items-center bg-[#fcfcfc] md:w-[30%] w-[100%] mx-[auto]">
          <a href="/" className="w-48">
            <img src="/logo_black.png" alt="" />
          </a>
          {/* Step 0: 약관 */}
          {step === 0 && (
            <form
              className="w-full max-w-sm mx-auto space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (canGoStep1) setStep(1);
              }}
            >
              <label className="flex items-center gap-2 my-5 text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-gray-800 "
                  checked={agreeAll}
                  onChange={(e) => setAgreeAll(e.target.checked)}
                />
                약관 전체 동의하기{" "}
                <span className="text-zinc-800">(선택 포함)</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-gray-800"
                  checked={agreeAge}
                  onChange={(e) => setAgreeAge(e.target.checked)}
                />
                만 14세 이상 입니다{" "}
                <span className="text-rose-800">(필수)</span>
                <button
                  type="button"
                  className="ml-auto text-xs underline underline-offset-2"
                >
                  자세히
                </button>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-gray-800"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                />
                개인정보 동의 <span className="text-rose-800">(필수)</span>
                <button
                  type="button"
                  className="ml-auto text-xs underline underline-offset-2"
                >
                  자세히
                </button>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-gray-800"
                  checked={agreeAds}
                  onChange={(e) => setAgreeAds(e.target.checked)}
                />
                광고성 정보 수신 동의{" "}
                <span className="text-zinc-800">(선택)</span>
                <button
                  type="button"
                  className="ml-auto text-xs underline underline-offset-2"
                >
                  자세히
                </button>
              </label>

              <button
                type="submit"
                disabled={!canGoStep1}
                className="w-full py-2 font-semibold text-white bg-gray-800 rounded-md disabled:opacity-50"
              >
                다음
              </button>
              <div className="h-6" />
            </form>
          )}

          {/* Step 1: 아이디/비밀번호 */}
          {step === 1 && (
            <form
              className="w-full max-w-sm mx-auto space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (canGoStep2) setStep(2);
              }}
            >
              <div className="relative">
                <BaseInput
                  placeholder="아이디"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoComplete="username"
                />
                <div className="absolute flex items-center gap-2 text-xs -translate-y-1/2 right-2 top-1/2">
                  <button
                    type="button"
                    onClick={handleCheckUserId}
                    disabled={checkingUserId || !userId.trim()}
                    className="px-2 py-1 text-white bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
                    title="아이디 중복 확인"
                  >
                    {verifying ? "확인중" : "중복 확인"}
                  </button>
                </div>
              </div>
              <BaseInput
                type="password"
                placeholder="비밀번호"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="new-password"
              />
              <BaseInput
                type="password"
                placeholder="비밀번호 확인"
                value={pwCheck}
                onChange={(e) => setPwCheck(e.target.value)}
                autoComplete="new-password"
              />

              <button
                type="submit"
                disabled={!canGoStep2}
                className="w-full py-2 font-semibold text-white bg-gray-800 rounded-md disabled:opacity-50"
              >
                다음
              </button>
              <p className="text-xs text-center text-zinc-800">
                이미 아이디가 있나요?{" "}
                <Link to="/login" className="underline underline-offset-2">
                  로그인
                </Link>
              </p>
            </form>
          )}

          {/* Step 2: 이메일 입력 & 전송 */}
          {step === 2 && (
            <form
              className="w-full max-w-sm mx-auto space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                sendCode();
              }}
            >
              <BaseInput
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                // caret이 보이지 않는 브라우저 이슈 방지용 (선택)
                style={{ caretColor: "white" }}
              />

              <button
                type="submit"
                disabled={sending || !email.includes("@")}
                className="w-full py-2 font-semibold text-white bg-gray-800 rounded-md disabled:opacity-50"
              >
                {sending ? "전송 중..." : "이메일 인증"}
              </button>

              {msg && (
                <p className="text-xs text-center text-emerald-900">
                  {msg}
                </p>
              )}
              {err && (
                <p className="text-xs text-center text-rose-900">{err}</p>
              )}

              <div className="h-6" />
            </form>
          )}

          {/* Step 3: 코드 입력 & 확인 & 회원가입 */}
          {step === 3 && (
            <form
              className="w-full max-w-sm mx-auto space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                doSignup();
              }}
            >
              <BaseInput
                type="email"
                value={email}
                readOnly
                aria-readonly
                autoComplete="email"
              />

              <div className="relative">
                <BaseInput
                  placeholder="인증코드"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pr-28"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  style={{ caretColor: "white" }}
                />
                <div className="absolute flex items-center gap-2 text-xs -translate-y-1/2 right-2 top-1/2">
                  <span className="text-zinc-800">{formatTime(timeLeft)}</span>
                  <button
                    type="button"
                    onClick={verifyCode}
                    disabled={verifying || !code.trim()}
                    className="px-2 py-1 text-white bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
                    title="인증코드 확인"
                  >
                    {verifying ? "확인중" : "확인"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={sending}
                  className="text-xs underline underline-offset-2 text-zinc-800 disabled:opacity-50"
                  title="인증코드 재전송 및 타이머 초기화"
                >
                  재전송
                </button>
              </div>

              <button
                type="submit"
                disabled={!verified || signing}
                className="w-full py-2 font-semibold text-white bg-gray-800 rounded-md disabled:opacity-50"
              >
                {signing ? "가입 중..." : "회원가입"}
              </button>

              {verified && (
                <p className="text-xs text-center text-emerald-800">
                  이메일 인증 완료
                </p>
              )}
              {msg && (
                <p className="text-xs text-center text-emerald-800">
                  {msg}
                </p>
              )}
              {err && (
                <p className="text-xs text-center text-rose-800">{err}</p>
              )}

              <p className="text-xs text-center text-zinc-800">
                이미 아이디가 있나요?{" "}
                <Link to="/login" className="underline underline-offset-2">
                  로그인
                </Link>
              </p>
            </form>
          )}
        </div>
        {/* 오른쪽 */}
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