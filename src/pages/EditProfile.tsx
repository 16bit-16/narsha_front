import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function EditProfile() {
    const navigate = useNavigate();
    const { user, loading: authLoading, refresh } = useAuth();

    const [newNickname, setNewNickname] = useState("");
    const [profileImage, setProfileImage] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // user가 로드되면 상태 초기화
    useEffect(() => {
        if (user) {
            setNewNickname(user.nickname || "");
            setProfileImage(user.profileImage || "");
            setPreviewUrl(user.profileImage || "");
        }
    }, [user]);

    if (authLoading) {
        return <div className="container py-10 text-center"><p>확인 중...</p></div>;
    }

    if (!user) {
        navigate("/login");
        return null;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target?.result as string;
                setProfileImage(base64String);
                setPreviewUrl(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const body: any = {};
            
            if (newNickname !== user.nickname) {
                body.nickname = newNickname;
            }
            
            if (profileImage !== user.profileImage) {
                body.profileImage = profileImage;
            }

            // 변경사항이 없으면 조기 반환
            if (Object.keys(body).length === 0) {
                setError("변경할 내용이 없습니다");
                setLoading(false);
                return;
            }

            // data 사용
            const data = await api<{ ok: true; user: any }>("/users/profile", {
                method: "PATCH",
                body: JSON.stringify(body),
            });

            // 성공하면 사용자 정보 갱신
            if (data.ok) {
                await refresh();
                setSuccess(true);
                setTimeout(() => {
                    navigate("/user");
                }, 1500);
            }
        } catch (err: any) {
            setError(err.message || "프로필 수정에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 안전한 아바타 문자 추출
    const getAvatarLetter = () => {
        const nick = newNickname || user?.nickname || "";
        return nick.charAt(0).toUpperCase() || "U";
    };

    return (
        <div className="max-w-2xl px-4 py-12 mx-auto">
            <h1 className="mb-8 text-3xl font-bold">프로필 수정</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 프로필 사진 */}
                <div>
                    <label className="block mb-4 text-sm font-semibold text-gray-700">
                        프로필 사진
                    </label>

                    <div className="flex items-end gap-6">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Profile"
                                className="object-cover w-24 h-24 border-4 border-gray-300 rounded-full"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600">
                                <span className="text-2xl font-bold text-white">{getAvatarLetter()}</span>
                            </div>
                        )}

                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                            />
                            <p className="mt-2 text-xs text-gray-500">JPG, PNG 형식</p>
                        </div>
                    </div>
                </div>

                {/* 아이디 (읽기 전용) */}
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        아이디 (변경 불가)
                    </label>
                    <input
                        type="text"
                        value={user.userId}
                        disabled
                        className="w-full px-4 py-2 text-gray-500 border border-gray-300 rounded-lg cursor-not-allowed bg-gray-50"
                    />
                    <p className="mt-1 text-xs text-gray-500">아이디는 변경할 수 없습니다</p>
                </div>

                {/* 닉네임 */}
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        닉네임
                    </label>
                    <input
                        type="text"
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        placeholder="닉네임을 입력하세요"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        {newNickname === user.nickname ? "변경 없음" : "새로운 닉네임으로 변경됩니다"}
                    </p>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* 성공 메시지 */}
                {success && (
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                        <p className="text-sm text-green-600">프로필이 수정되었습니다!</p>
                    </div>
                )}

                {/* 버튼 */}
                <div className="flex gap-3 pt-6">
                    <button
                        type="submit"
                        disabled={loading || (newNickname === user.nickname && profileImage === user.profileImage)}
                        className="flex-1 py-3 text-sm font-semibold text-white transition-all bg-gray-800 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "저장 중..." : "저장하기"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/user")}
                        className="flex-1 py-3 text-sm font-semibold transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}