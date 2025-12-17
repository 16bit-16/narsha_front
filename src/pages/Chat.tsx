// src/pages/Chat.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";
import { useState } from "react";

export default function Chat() {
    const { userId, productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { messages, loading, sending, sendMessage } = useChat(userId, productId);
    const [input, setInput] = useState("");

    const handleSend = async () => {
        if (!input.trim()) return;
        await sendMessage(input);
        setInput("");
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">로딩 중...</div>;
    }

    return (
        <div className="flex flex-col h-screen pb-20 bg-white md:pb-0">
            {/* 헤더 */}
            <div className="sticky top-0 z-10 p-4 bg-white border-b">
                <button onClick={() => navigate("/chats")} className="text-2xl">
                    ←
                </button>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500">메시지를 시작하세요</p>
                ) : (
                    messages.map((msg) => {
                        // sender/receiver 체크
                        if (!msg.sender || !msg.receiver) return null;

                        return (
                            <div
                                key={msg._id}
                                className={`flex ${
                                    msg.sender._id === user?._id ? "justify-end" : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-lg ${
                                        msg.sender._id === user?._id
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200"
                                    }`}
                                >
                                    <p>{msg.message}</p>
                                    <p className="mt-1 text-xs opacity-70">
                                        {new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 입력 영역 */}
            <div className="sticky bottom-0 p-4 bg-white border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        placeholder="메시지를 입력하세요"
                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="px-6 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 disabled:opacity-50"
                    >
                        {sending ? "전송 중..." : "전송"}
                    </button>
                </div>
            </div>
        </div>
    );
}