import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

interface ChatRoom {
    _id: string;
    participantIds: string[];
    productId: string;
    productTitle: string;
    productImage: string;
    lastMessage: string;
    lastMessageTime: string;
    otherUser: {
        _id: string;
        nickname: string;
        profileImage?: string;
    };
    unreadCount: number;
}

export default function ChatList() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadChatRooms();
        }
    }, [user]);

    const loadChatRooms = async () => {
        setLoading(true);
        try {
            const data = await api<{ ok: true; chatRooms: ChatRoom[] }>(
                "/messages/rooms"
            );
            if (data.ok) {
                setChatRooms(data.chatRooms);
            }
        } catch (err) {
            console.error("채팅 목록 조회 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChatClick = (chatRoom: ChatRoom) => {
        navigate(
            `/chat/${chatRoom.otherUser._id}/${chatRoom.productId}`,
            { state: { chatRoom } }
        );
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "방금 전";
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;

        return date.toLocaleDateString("ko-KR");
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">로그인이 필요합니다</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 bg-white md:pb-0">
            {/* 헤더 */}
            <div className="sticky top-0 z-10 bg-white border-b">
                <div className="max-w-2xl px-4 py-4 mx-auto">
                    <h1 className="text-2xl font-bold">채팅</h1>
                    <p className="mt-1 text-xs text-gray-500">
                        {chatRooms.length}개의 채팅
                    </p>
                </div>
            </div>

            {/* 채팅 목록 */}
            <div className="max-w-2xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-gray-500">로딩 중...</p>
                    </div>
                ) : chatRooms.length > 0 ? (
                    <div className="divide-y">
                        {chatRooms.map((chatRoom) => (
                            <button
                                key={chatRoom._id}
                                onClick={() => handleChatClick(chatRoom)}
                                className="w-full px-4 py-3 text-left transition-colors hover:bg-gray-50"
                            >
                                <div className="flex gap-3">
                                    {/* 상품 이미지 */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={chatRoom.productImage || "/placeholder.png"}
                                            alt={chatRoom.productTitle}
                                            className="object-cover w-16 h-16 bg-gray-200 rounded-lg"
                                        />
                                        {/* 읽지 않은 메시지 표시 */}
                                        {chatRoom.unreadCount > 0 && (
                                            <div className="absolute flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full -top-2 -right-2">
                                                {chatRoom.unreadCount}
                                            </div>
                                        )}
                                    </div>

                                    {/* 채팅 정보 */}
                                    <div className="flex-1 min-w-0">
                                        {/* 상품명 */}
                                        <p className="text-sm text-gray-600 truncate">
                                            {chatRoom.productTitle}
                                        </p>

                                        {/* 사용자명 */}
                                        <div className="flex items-center gap-2 mt-1">
                                            {chatRoom.otherUser.profileImage ? (
                                                <img
                                                    src={chatRoom.otherUser.profileImage}
                                                    alt={chatRoom.otherUser.nickname}
                                                    className="object-cover w-5 h-5 rounded-full"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-500 rounded-full">
                                                    {chatRoom.otherUser.nickname?.charAt(0)}
                                                </div>
                                            )}
                                            <p className="text-sm font-semibold text-gray-900">
                                                {chatRoom.otherUser.nickname}
                                            </p>
                                        </div>

                                        {/* 마지막 메시지 */}
                                        <p className="mt-2 text-sm text-gray-600 truncate">
                                            {chatRoom.lastMessage || "메시지를 보내세요"}
                                        </p>
                                    </div>

                                    {/* 시간 */}
                                    <div className="flex-shrink-0 text-right">
                                        <p className="text-xs text-gray-500">
                                            {formatTime(chatRoom.lastMessageTime)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="mb-2 text-lg text-gray-500">채팅이 없습니다</p>
                        <p className="text-sm text-gray-400">상품을 보고 채팅을 시작해보세요</p>
                    </div>
                )}
            </div>
        </div>
    );
}