// src/hooks/useChatList.ts

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

interface ChatRoom {
    _id: string;
    sender: { _id: string; nickname: string; profileImage?: string };
    receiver: { _id: string; nickname: string; profileImage?: string };
    product: { _id: string; title: string; images: string[]; price: number };
    message: string;
    createdAt: string;
}

export function useChatList() {
    const { user } = useAuth();
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(false);

    const loadChatRooms = async () => {
        if (!user?._id) return;

        setLoading(true);
        try {
            const data = await api<{ ok: true; chats: ChatRoom[] }>("/chat/list");
            if (data.ok) {
                const validChats = data.chats.filter((chat) => {
                    return chat.product && chat.product._id;
                });
                console.log("📥 채팅 목록 로드 완료:", validChats);
                setChatRooms(validChats);
            }
        } catch (err) {
            console.error("채팅 목록 조회 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChatRooms();
    }, [user?._id]);

    return { chatRooms, loading, refetch: loadChatRooms };
}