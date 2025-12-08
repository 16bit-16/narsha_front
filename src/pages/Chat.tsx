import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { io, Socket } from "socket.io-client";

interface Message {
    _id: string;
    text: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
}

export default function Chat() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { receiverId, productId } = useParams<{ receiverId: string; productId: string }>();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ Socket.io 연결
    useEffect(() => {
        if (!user) return;

        const newSocket = io(
            import.meta.env.VITE_API_BASE?.replace("/api", "") || "http://localhost:4000",
            {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
            }
        );

        // ✅ 연결 후 사용자 ID 전송
        newSocket.on("connect", () => {
            console.log("✅ WebSocket 연결됨");
            newSocket.emit("join", user.id);
        });

        // ✅ 메시지 수신
        newSocket.on("receive_message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        // ✅ 메시지 전송 확인
        newSocket.on("message_sent", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // ✅ 채팅 히스토리 로드
    useEffect(() => {
        if (!user || !receiverId || !productId) return;

        async function loadMessages() {
            try {
                const data = await api<{ ok: true; messages: Message[] }>(
                    `/messages/chat/${receiverId}/${productId}`
                );
                setMessages(data.messages);
            } catch (err) {
                console.error("메시지 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        }

        loadMessages();
    }, [user, receiverId, productId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputText.trim() || !socket || !receiverId || !productId) return;

        // ✅ 메시지 전송
        socket.emit("send_message", {
            receiverId,
            productId,
            text: inputText,
        });

        setInputText("");
    };

    if (!user || !receiverId || !productId) {
        return <div className="container py-10 text-center">로딩 중...</div>;
    }

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white">
            {/* 헤더 */}
            <div className="p-4 border-b">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-600 hover:text-gray-900"
                >
                    ← 뒤로가기
                </button>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {loading ? (
                    <p className="text-center text-gray-500">로딩 중...</p>
                ) : messages.length === 0 ? (
                    <p className="text-center text-gray-500">대화를 시작하세요</p>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-xs px-4 py-2 rounded-lg ${msg.senderId === user.id
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-900"
                                    }`}
                            >
                                <p>{msg.text}</p>
                                <p className="mt-1 text-xs opacity-70">
                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 입력 영역 */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        전송
                    </button>
                </div>
            </form>
        </div>
    );
}