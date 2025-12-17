// src/hooks/useChat.ts

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import io, { Socket } from "socket.io-client";

interface Message {
    _id: string;
    sender: { _id: string; nickname: string; profileImage?: string };
    receiver: { _id: string; nickname: string; profileImage?: string };
    message: string;
    image?: string;
    product: string;
    createdAt: string;
}

export function useChat(userId: string | undefined, productId: string | undefined) {
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const loadMessages = async () => {
        if (!userId || !productId) return;

        setLoading(true);
        try {
            const data = await api<{ ok: true; messages: Message[] }>(
                `/chat/${userId}/${productId}`
            );
            if (data.ok) {
                setMessages(data.messages);
            }
        } catch (err) {
            console.error("메시지 로드 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    const initSocket = () => {
        const socketURL = "https://api.palpalshop.shop";

        socketRef.current = io(socketURL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        socketRef.current.on("connect", () => {
            if (user?._id) {
                socketRef.current?.emit("user_login", user._id);
            }
        });

        socketRef.current.on("receive_message", (data: Message) => {
            if (data.product === productId) {
                setMessages((prev) => [...prev, data]);
            }
        });

        socketRef.current.on("message_sent", (data: Message) => {
            if (data.product === productId) {
                setMessages((prev) => [...prev, data]);
            }
        });

        socketRef.current.on("error", (error: any) => {
            console.error("소켓 에러:", error);
        });
    };

    const sendMessage = async (message: string, imageUrl?: string) => {
        if ((!message.trim() && !imageUrl) || !userId || !productId || !user?._id) {
            console.warn("메시지 전송 불가");
            return;
        }

        setSending(true);
        try {
            socketRef.current?.emit("send_message", {
                senderId: user._id,
                receiverId: userId,
                productId,
                message: message || "",
                image: imageUrl,
            });
        } catch (err) {
            console.error("메시지 전송 실패:", err);
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        loadMessages();
        initSocket();

        return () => {
            socketRef.current?.disconnect();
        };
    }, [userId, productId, user?._id]);

    return {
        messages,
        loading,
        sending,
        sendMessage,
    };
}