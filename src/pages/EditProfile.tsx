import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EditProfile() {
    const navigate = useNavigate();
    const { user, loading: authLoading, refresh } = useAuth();

    const [newUserId, setNewUserId] = useState(user?.userId || "");
    const [profileImage, setProfileImage] = useState<string>(user?.profileImage || "");
    const [previewUrl, setPreviewUrl] = useState<string>(user?.profileImage || "");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (authLoading) {
        return <div className="container py-10 text-center"><p>확인 중...</p></div>;
    }

    if (!user) {
        navigate("/login");
        return null;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                setProfileImage(base64);
                setPreviewUrl(base64);
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
            const token = sessionStorage.getItem("token");

            const response = await fetch("/api/users/profile", {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: newUserId !== user.userId ? newUserId : undefined,
                    profileImage: profileImage !== user?.profileImage ? profileImage : undefined,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "프로필 수정 실패");
            }

            await refresh();
            setSuccess(true);
            setTimeout(() => {
                navigate("/user");
            }, 1500);
        } catch (err: any) {
            setError(err.message || "프로필 수정에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const avatarLetter = newUserId.charAt(0).toUpperCase();

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
                                <span className="text-2xl font-bold text-white">{avatarLetter}</span>
                            </div>
                        )}

                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* 아이디 */}
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        아이디
                    </label>
                    <input
                        type="text"
                        value={newUserId}
                        onChange={(e) => setNewUserId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                {error && (
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                        <p className="text-sm text-green-600">프로필이 수정되었습니다!</p>
                    </div>
                )}

                <div className="flex gap-3 pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 text-sm font-semibold text-white bg-gray-800 rounded-lg disabled:opacity-50"
                    >
                        {loading ? "저장 중..." : "저장하기"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/user")}
                        className="flex-1 py-3 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}