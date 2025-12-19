// src/pages/Chat.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";
import { useEffect, useRef, useState } from "react";
import { api } from "../utils/api";
import type { Product } from "../data/mockProducts";

interface ContextMenu {
    visible: boolean;
    x: number;
    y: number;
    messageId: string | null;
}

export default function Chat() {
    const { userId, productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { messages, loading, sending, sendMessage, deleteMessage } = useChat(userId, productId);
    const [input, setInput] = useState("");
    const [product, setProduct] = useState<Product | null>(null);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenu>({
        visible: false,
        x: 0,
        y: 0,
        messageId: null,
    });
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

    const createPreview = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target?.result as string);
            setSelectedFile(file);
        };
        reader.readAsDataURL(file);
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
                setPreviewImage(null);
                setSelectedFile(null);
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        createPreview(file);
    };

    const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === "file" && items[i].type.startsWith("image/")) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) {
                    createPreview(file);
                }
                break;
            }
        }
    };

    const handleContextMenu = (e: React.MouseEvent, messageId: string, senderId: string) => {
        e.preventDefault();
        
        if (senderId !== user?._id) {
            return;
        }

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            messageId,
        });
    };

    const handleDeleteMessage = async () => {
        if (contextMenu.messageId) {
            if (window.confirm("메시지를 삭제하시겠습니까?")) {
                await deleteMessage(contextMenu.messageId);
            }
        }
        setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    };

    const closeContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    };

    if (!user) {
        return null;
    }

    const handleSend = async () => {
        if (selectedFile) {
            await uploadImage(selectedFile);
            return;
        }
        if (!input.trim()) return;
        await sendMessage(input);
        setInput("");
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">로딩 중...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-white md:pb-0" onClick={closeContextMenu}>
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
                        if (!msg.sender || !msg.receiver) return null;

                        return (
                            <div
                                key={msg._id}
                                className={`flex ${msg.sender._id === user?._id ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    onContextMenu={(e) => handleContextMenu(e, msg._id, msg.sender._id)}
                                    className={`max-w-xs px-3 py-3 rounded-lg cursor-pointer ${msg.sender._id === user?._id
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

            {/* 컨텍스트 메뉴 */}
            {contextMenu.visible && (
                <div
                    className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg"
                    style={{
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                    }}
                >
                    <button
                        onClick={handleDeleteMessage}
                        className="w-full px-4 py-2 text-left text-red-600 rounded-lg hover:bg-red-50"
                    >
                        삭제
                    </button>
                </div>
            )}

            {/* 이미지 미리보기 */}
            {previewImage && (
                <div className="px-4 py-2 border-t bg-gray-50">
                    <div className="flex items-center justify-between">
                        <img
                            src={previewImage}
                            alt="미리보기"
                            className="object-cover h-16 rounded-lg"
                        />
                        <button
                            onClick={() => {
                                setPreviewImage(null);
                                setSelectedFile(null);
                            }}
                            className="text-xl text-gray-500 hover:text-red-500"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* 입력 영역 */}
            <div className="sticky bottom-0 p-4 bg-white border-t">
                <div className="flex items-center justify-between gap-2 p-2 border rounded-lg">
                    <div className="flex w-full">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || previewImage !== null}
                            className="px-2 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            <img className="size-4" src="https://cdn-icons-png.flaticon.com/512/748/748113.png" alt="" />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            onPaste={handlePaste}
                            placeholder={previewImage ? "사진을 전송하려면 전송 버튼을 클릭하세요" : "메시지를 입력하세요"}
                            className="flex w-full pl-2 rounded-lg"
                            disabled={sending || uploading || previewImage !== null}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={(!input.trim() && !selectedFile) || sending || uploading}
                        className="px-2 disabled:opacity-50"
                    >
                        <img className="size-4" src="https://cdn-icons-png.flaticon.com/512/786/786205.png" alt="" />
                    </button>
                </div>
            </div>
        </div>
    );
}