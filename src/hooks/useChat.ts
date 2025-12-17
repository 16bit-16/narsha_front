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
    createdAt: string;
}

export function useChat(userId: string | undefined, productId: string | undefined) {
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // 메시지 로드
    const loadMessages = async () => {
        if (!userId || !productId) return;

        setLoading(true);
        try {
            const data = await api<{ ok: true; messages: Message[] }>(
                `/chat/${userId}/${productId}`
            );
            if (data.ok) {
                console.log("📥 메시지 로드 완료:", data.messages);
                setMessages(data.messages);
            }
        } catch (err) {
            console.error("메시지 로드 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    // Socket 초기화
    const initSocket = () => {
        const socketURL = "https://api.palpalshop.shop";
        console.log("🔌 Socket 연결 시도:", socketURL);

        socketRef.current = io(socketURL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        socketRef.current.on("connect", () => {
            console.log("✅ Socket 연결 성공:", socketRef.current?.id);
            if (user?._id) {
                console.log("👤 user_login 발송:", user._id);
                socketRef.current?.emit("user_login", user._id);
            }
        });

        socketRef.current.on("receive_message", (data: Message) => {
            console.log("📨 receive_message 수신:", data);
            setMessages((prev) => [...prev, data]);
        });

        socketRef.current.on("message_sent", (data: Message) => {
            console.log("✉️ message_sent 수신:", data);
            setMessages((prev) => [...prev, data]);
        });

        socketRef.current.on("error", (error: any) => {
            console.error("❌ Socket 에러:", error);
        });

        socketRef.current.on("disconnect", () => {
            console.log("🔌 Socket 연결 해제");
        });
    };

    // 메시지 전송
    const sendMessage = async (message: string) => {
        if (!message.trim() || !userId || !productId || !user?._id) {
            console.warn("⚠️ 메시지 전송 불가");
            return;
        }
    
        setSending(true);
        try {
            console.log("📤 send_message 발송:", {
                senderId: user._id,
                receiverId: userId,
                productId,
                message,
            });
            socketRef.current?.emit("send_message", {
                senderId: user._id,
                receiverId: userId,
                productId,
                message,
            });
        } catch (err) {
            console.error("메시지 전송 실패:", err);
        } finally {
            setSending(false);
        }
    };

    // 정리
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