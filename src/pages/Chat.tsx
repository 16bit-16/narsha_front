// src/pages/Chat.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";
import { useEffect, useRef, useState } from "react";
import { api } from "../utils/api";
import type { Product } from "../data/mockProducts";


export default function Chat() {
    const { userId, productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { messages, loading, sending, sendMessage } = useChat(userId, productId);
    const [input, setInput] = useState("");
    const [product, setProduct] = useState<Product | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (productId) {
            loadProduct();
        }
    }, [productId]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);


    const loadProduct = async () => {
        try {
            const data = await api<{ ok: true; product: Product }>(
                `/products/${productId}`
            );
            if (data.ok) {
                setProduct(data.product);
            }
        } catch (err) {
            console.error("상품 로드 실패:", err);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const token = sessionStorage.getItem("token");
            const fd = new FormData();
            fd.append("files", file);

            const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";
            const res = await fetch(`${API_BASE}/uploads/images`, {
                method: "POST",
                credentials: "include",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: fd,
            });

            const data = await res.json();
            if (data.urls && data.urls[0]) {
                await sendMessage("", data.urls[0]);
            }
        } catch (err) {
            console.error("이미지 업로드 실패:", err);
            alert("이미지 업로드 실패");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const uploadImage = async (file: File) => {
        setUploading(true);
        try {
            const token = sessionStorage.getItem("token");
            const fd = new FormData();
            fd.append("files", file);

            const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";
            const res = await fetch(`${API_BASE}/uploads/images`, {
                method: "POST",
                credentials: "include",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: fd,
            });

            const data = await res.json();
            if (data.urls && data.urls[0]) {
                await sendMessage("", data.urls[0]);
            }
        } catch (err) {
            console.error("이미지 업로드 실패:", err);
            alert("이미지 업로드 실패");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === "file" && items[i].type.startsWith("image/")) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) {
                    await uploadImage(file);
                }
                break;
            }
        }
    };

    if (!user) {
        return
    }


    const handleSend = async () => {
        if (!input.trim()) return;
        await sendMessage(input);
        setInput("");
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">로딩 중...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-white md:pb-0">
            {/* 헤더 */}
            <div className="sticky top-0 flex gap-4 p-4 bg-white border-b">
                <button onClick={() => navigate("/chats")} className="text-2xl">
                    ←
                </button>
                {product && (
                    <>
                        <img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.title}
                            onClick={() => navigate(`/listing/${product._id}`)}
                            className="flex-shrink-0 object-cover w-12 h-12 bg-gray-200 rounded-lg cursor-pointer"
                        />
                        <div className="flex flex-col justify-between min-w-0">
                            <p className="text-xl font-semibold text-gray-900">
                                {Number(product.price).toLocaleString()}원
                            </p>
                            <p className="text-xs font-semibold truncate cursor-pointer text-zinc-500" onClick={() => navigate(`/listing/${product._id}`)}>{product.title}</p>
                        </div>
                    </>
                )}
            </div>

            {/* 메시지 영역 */}
            <div ref={messagesContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500">메시지를 시작하세요</p>
                ) : (
                    messages.map((msg) => {
                        // sender/receiver 체크
                        if (!msg.sender || !msg.receiver) return null;

                        return (
                            <div
                                key={msg._id}
                                className={`flex ${msg.sender._id === user?._id ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-xs px-3 py-3 rounded-lg ${msg.sender._id === user?._id
                                        ? "bg-gray-700 text-white"
                                        : "bg-gray-200"
                                        }`}
                                >
                                    {msg.image && (
                                        <img
                                            src={msg.image}
                                            alt="이미지"
                                            className="rounded-lg max-h-xs"
                                        />
                                    )}
                                    {msg.message && (
                                        <p>{msg.message}</p>
                                    )}
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
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-4 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                        <img className="size-4" src="https://cdn-icons-png.flaticon.com/512/748/748113.png" alt="" />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onPaste={handlePaste}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        placeholder="메시지를 입력하세요"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        disabled={sending}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="px-6 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                    >
                        {sending ? "전송 중..." : "전송"}
                    </button>
                </div>
            </div>
        </div>
    );
}