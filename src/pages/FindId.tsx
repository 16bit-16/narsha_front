import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export default function FindId() {
    const navigate = useNavigate();

    const [step, setStep] = useState<"email" | "verify" | "result">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [foundUserId, setFoundUserId] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(0);

    // 인증코드 발송
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api("/auth/send-code", {
                method: "POST",
                body: JSON.stringify({ email }),
            });

            setStep("verify");
            setTimer(180); // 3분
            startTimer();
            alert("인증코드가 발송되었습니다!");
        } catch (err: any) {
            setError(err.message || "이메일 발송에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 타이머
    const startTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // 인증코드 확인
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api<{ ok: true; userId: string }>("/auth/find/id", {
                method: "POST",
                body: JSON.stringify({ email, code }),
            });

            setFoundUserId(res.userId);
            setStep("result");
        } catch (err: any) {
            setError(err.message || "인증에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
                <h1 className="mb-6 text-2xl font-bold text-center">아이디 찾기</h1>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-600 rounded-lg bg-red-50">
                        {error}
                    </div>
                )}

                {/* Step 1: 이메일 입력 */}
                {step === "email" && (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                이메일
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="가입 시 사용한 이메일"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 text-white bg-gray-900 rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? "발송 중..." : "인증코드 발송"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="w-full py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            로그인으로 돌아가기
                        </button>
                    </form>
                )}

                {/* Step 2: 인증코드 입력 */}
                {step === "verify" && (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                인증코드
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="6자리 인증코드"
                                maxLength={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
                                required
                            />
                            {timer > 0 && (
                                <p className="mt-2 text-sm text-gray-600">
                                    남은 시간: {formatTime(timer)}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || timer === 0}
                            className="w-full py-3 text-white bg-gray-900 rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? "확인 중..." : "확인"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="w-full py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            다시 시도
                        </button>
                    </form>
                )}

                {/* Step 3: 결과 */}
                {step === "result" && (
                    <div className="space-y-4 text-center">
                        <div className="p-6 rounded-lg bg-gray-50">
                            <p className="mb-2 text-sm text-gray-600">회원님의 아이디는</p>
                            <p className="text-2xl font-bold text-gray-900">{foundUserId}</p>
                        </div>

                        <button
                            onClick={() => navigate("/login")}
                            className="w-full py-3 text-white bg-gray-900 rounded-lg hover:opacity-90"
                        >
                            로그인하기
                        </button>

                        <button
                            onClick={() => navigate("/find/pw")}
                            className="w-full py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            비밀번호 찾기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}