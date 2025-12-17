// src/pages/ChatList.tsx

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChatList } from "../hooks/useChatList";

export default function ChatList() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { chatRooms, loading } = useChatList();

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">로그인이 필요합니다</p>
            </div>
        );
    }

    const formatTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();

        if (diff < 60000) return "방금 전";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
        return d.toLocaleDateString("ko-KR");
    };

    // 중복 제거 (같은 상대방과의 최신 채팅만)
    const uniqueChats = chatRooms.reduce((acc: any, chat) => {
        const otherUser =
            chat.sender._id === user._id ? chat.receiver : chat.sender;
        const key = `${otherUser._id}-${chat.product._id}`;

        if (!acc[key] || new Date(chat.createdAt) > new Date(acc[key].createdAt)) {
            acc[key] = { ...chat, otherUser };
        }
        return acc;
    }, {});

    const uniqueChatArray = Object.values(uniqueChats) as any[];

    return (
        <div className="min-h-screen pb-20 bg-white md:pb-0">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white border-b">
                <div className="w-full py-4 ">
                    <h1 className="text-2xl font-bold">채팅</h1>
                    <p className="mt-1 text-xs text-gray-500">
                        {uniqueChatArray.length}개의 채팅
                    </p>
                </div>
            </div>

            {/* 채팅 목록 */}
            <div className="w-full">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-gray-500">로딩 중...</p>
                    </div>
                ) : uniqueChatArray.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="mb-2 text-lg text-gray-500">채팅이 없습니다</p>
                        <p className="text-sm text-gray-400">상품을 보고 채팅을 시작해보세요</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {uniqueChatArray.map((chat) => (
                            <button
                                key={`${chat.otherUser._id}-${chat.product._id}`}
                                onClick={() =>
                                    navigate(
                                        `/chat/${chat.otherUser._id}/${chat.product._id}`
                                    )
                                }
                                className="w-full px-4 py-3 text-left transition-colors hover:bg-gray-50"
                            >
                                <div className="flex gap-3">
                                    {/* 상품 이미지 */}
                                    <img
                                        src={chat.product.images?.[0] || "/placeholder.png"}
                                        alt={chat.product.title}
                                        className="flex-shrink-0 object-cover w-16 h-16 bg-gray-200 rounded-lg"
                                    />

                                    {/* 정보 */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-600 truncate">
                                            {chat.product.title}
                                        </p>

                                        <div className="flex items-center gap-2 mt-1">
                                            {chat.otherUser.profileImage ? (
                                                <img
                                                    src={chat.otherUser.profileImage}
                                                    alt={chat.otherUser.nickname}
                                                    className="object-cover w-5 h-5 rounded-full"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-500 rounded-full">
                                                    {chat.otherUser.nickname?.charAt(0)}
                                                </div>
                                            )}
                                            <p className="text-sm font-semibold text-gray-900">
                                                {chat.otherUser.nickname}
                                            </p>
                                        </div>

                                        <p className="mt-2 text-sm text-gray-600 truncate">
                                            {chat.message}
                                        </p>
                                    </div>

                                    {/* 시간 */}
                                    <div className="flex-shrink-0 text-right">
                                        <p className="text-xs text-gray-500">
                                            {formatTime(chat.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}