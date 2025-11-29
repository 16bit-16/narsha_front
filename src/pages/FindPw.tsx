import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function FindPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState<"info" | "verify" | "reset" | "complete">("info");
    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isHover, setIsHover] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(0);
    const { authBusy } = useAuth();

    const canSubmit = userId.trim().length > 0 && email.length > 0 && !authBusy;

    const hovered = () => {
        setIsHover(!isHover);
    }

    // 인증코드 발송
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api("/auth/send-reset-code", {
                method: "POST",
                body: JSON.stringify({ userId, email }),
            });

            setStep("verify");
            setTimer(180); // 3분
            startTimer();
            alert("인증코드가 발송되었습니다!");
        } catch (err: any) {
            setError(err.message || "발송에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

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
            await api("/auth/verify-reset-code", {
                method: "POST",
                body: JSON.stringify({ userId, email, code }),
            });

            setStep("reset");
        } catch (err: any) {
            setError(err.message || "인증에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 비밀번호 재설정
    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (newPassword.length < 4) {
            setError("비밀번호는 4자 이상이어야 합니다.");
            return;
        }

        setLoading(true);

        try {
            await api("/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({ userId, email, code, newPassword }),
            });

            setStep("complete");
        } catch (err: any) {
            setError(err.message || "비밀번호 재설정에 실패했습니다.");
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
        <div className="flex items-center justify-center h-screen bg-gray-800 md:bg-gradient-to-b from-black to-gray-800">
            <div className="flex flex-col justify-center items-center bg-[#fcfcfc] md:w-[30%] rounded-2xl  w-[100%] h-[98vh] space-y-4 p-4">
                <a href="/" className="w-48">
                    <img src="/logo_black.png" alt="" />
                </a>
                <div className="grid w-full max-w-sm grid-cols-[1fr,1fr] justify--center pb-2">
                    <div className="space-y-2 text-lg font-semibold text-center cursor-pointer">
                        <p>비밀번호 찾기</p>
                        <div className="w-full bg-gray-800 h-[3px]"></div>
                    </div>
                    <a href="/find/id" className="space-y-2 text-lg text-center text-gray-400 transition-all duration-100 hover:text-gray-500 hover:font-semibold"
                        onMouseEnter={() => hovered()}
                        onMouseLeave={() => hovered()}>
                        <p>아이디 찾기</p>
                        <div className="w-full bg-gray-300 h-[2px]"style={{ backgroundColor: isHover? "#6b7280" : "#d1d5db", height: isHover? "3px" : "1px" }}></div>
                    </a>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-600 rounded-lg bg-red-50">
                        {error}
                    </div>
                )}

                {/* Step 1: 아이디 + 이메일 입력 */}
                {step === "info" && (
                    <form onSubmit={handleSendCode} className="w-full max-w-sm mx-auto space-y-4">
                        <div>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="아이디"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-zinc-400 focus:outline-none focus:scale-103 focus:ring-1 focus:ring-zinc-400"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-zinc-400 focus:outline-none focus:scale-103 focus:ring-1 focus:ring-zinc-400"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !canSubmit}
                            className="w-full py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? "발송 중..." : "인증코드 발송"}
                        </button>
                    </form>
                )}

                {/* Step 2: 인증코드 입력 */}
                {step === "verify" && (
                    <form onSubmit={handleVerify} className="w-full max-w-sm mx-auto space-y-4">
                        <div>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="6자리 인증코드"
                                maxLength={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-zinc-400 focus:outline-none focus:scale-103 focus:ring-1 focus:ring-zinc-400"
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
                            disabled={loading || timer === 0 || code.trim().length !== 6}
                            className="w-full py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? "확인 중..." : "확인"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep("info")}
                            className="w-full py-2 font-semibold border border-gray-300 rounded-md hover:opacity-90"
                        >
                            다시 시도
                        </button>
                    </form>
                )}

                {/* Step 3: 새 비밀번호 입력 */}
                {step === "reset" && (
                    <form onSubmit={handleReset} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                새 비밀번호
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="새 비밀번호 (4자 이상)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                비밀번호 확인
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="비밀번호 확인"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 text-white bg-gray-900 rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? "변경 중..." : "비밀번호 변경"}
                        </button>
                    </form>
                )}

                {/* Step 4: 완료 */}
                {step === "complete" && (
                    <div className="space-y-4 text-center">
                        <div className="p-6 rounded-lg bg-green-50">
                            <p className="text-lg font-semibold text-green-700">
                                ✓ 비밀번호가 변경되었습니다
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/login")}
                            className="w-full py-3 text-white bg-gray-900 rounded-lg hover:opacity-90"
                        >
                            로그인하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}