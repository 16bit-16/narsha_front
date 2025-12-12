// src/pages/Chat.tsx

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import io, { Socket } from "socket.io-client";

interface Message {
    _id: string;
    roomId: string;
    senderId: {
        _id: string;
        nickname: string;
        profileImage?: string;
    };
    receiverId: {
        _id: string;
        nickname: string;
        profileImage?: string;
    };
    productId: string;
    text: string;
    read: boolean;
    createdAt: string;
}

interface Product {
    _id: string;
    title: string;
    price: number;
    images: string[];
}

export default function Chat() {
    const { receiverId, productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [product, setProduct] = useState<Product | null>(null);
    const [otherUser, setOtherUser] = useState<any>(null);
    const [messageText, setMessageText] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (user && receiverId && productId) {
            loadChatData();
            initializeSocket();
        }
    }, [user, receiverId, productId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadChatData = async () => {
        setLoading(true);
        try {
            const [messagesData, productData] = await Promise.all([
                api<{ ok: true; messages: Message[] }>(
                    `/messages/chat/${receiverId}/${productId}`
                ),
                api<{ ok: true; product: Product }>(`/products/${productId}`),
            ]);

            if (messagesData.ok) {
                setMessages(messagesData.messages);
                if (messagesData.messages.length > 0) {
                    const firstMessage = messagesData.messages[0];
                    const other =
                        firstMessage.senderId._id === user?._id
                            ? firstMessage.receiverId
                            : firstMessage.senderId;
                    setOtherUser(other);
                }
            }

            if (productData.ok) {
                setProduct(productData.product);
            }
        } catch (err) {
            console.error("채팅 데이터 조회 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    const initializeSocket = () => {
        const socketURL =
            import.meta.env.VITE_SOCKET_URL ||
            "https://api.palpalshop.shop";

        socketRef.current = io(socketURL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        socketRef.current.on("connect", () => {
            console.log("WebSocket 연결됨");
            if (user?._id) {
                socketRef.current?.emit("join", user._id);
            }
        });

        socketRef.current.on("receive_message", (data: Message) => {
            if (
                data.productId === productId &&
                ((data.senderId._id === receiverId && data.receiverId._id === user?._id) ||
                    (data.senderId._id === user?._id && data.receiverId._id === receiverId))
            ) {
                setMessages((prev) => [...prev, data]);
            }
        });

        socketRef.current.on("disconnect", () => {
            console.log("WebSocket 연결 해제됨");
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageText.trim()) return;

        setSending(true);
        try {
            await api("/messages/send", {
                method: "POST",
                body: JSON.stringify({
                    receiverId,
                    productId,
                    text: messageText,
                }),
            });

            socketRef.current?.emit("send_message", {
                receiverId,
                productId,
                text: messageText,
            });

            setMessageText("");
        } catch (err) {
            console.error("메시지 전송 실패:", err);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen pb-20 bg-white md:pb-0">
            {/* 헤더 */}
            <div className="sticky top-0 z-10 bg-white border-b">
                <div className="flex items-center max-w-2xl gap-3 px-4 py-4 mx-auto">
                    <button
                        onClick={() => navigate("/chats")}
                        className="p-2 text-2xl rounded-lg hover:bg-gray-100"
                    >
                        ←
                    </button>

                    {product && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600 truncate">
                                {product.title}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                                {otherUser?.nickname || "사용자"}
                            </p>
                            <p className="text-sm font-semibold text-blue-600">
                                ₩{product.price?.toLocaleString()}
                            </p>
                        </div>
                    )}

                    <img
                        src={product?.images[0] || "/placeholder.png"}
                        alt="상품"
                        className="object-cover w-12 h-12 bg-gray-200 rounded-lg"
                    />
                </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
                {messages.length > 0 ? (
                    messages.map((message) => {
                        const isMyMessage = message.senderId._id === user?._id;

                        return (
                            <div
                                key={message._id}
                                className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-lg ${isMyMessage
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : "bg-gray-100 text-gray-900 rounded-bl-none"
                                        }`}
                                >
                                    <p className="text-sm break-words">{message.text}</p>
                                    <p
                                        className={`text-xs mt-1 ${isMyMessage ? "text-blue-100" : "text-gray-500"
                                            }`}
                                    >
                                        {new Date(message.createdAt).toLocaleTimeString("ko-KR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">채팅을 시작하세요</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
            <div className="sticky bottom-0 px-4 py-3 bg-white border-t">
                <form onSubmit={handleSendMessage} className="flex max-w-2xl gap-2 mx-auto">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="메시지를 입력하세요"
                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!messageText.trim() || sending}
                        className="px-6 py-2 font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 disabled:opacity-50"
                    >
                        {sending ? "전송 중..." : "전송"}
                    </button>
                </form>
            </div>
        </div>
    );
}