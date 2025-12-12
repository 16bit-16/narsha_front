// src/components/MobileBottomNav.tsx

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function MobileBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // 스크롤 감지
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;

                    // 위로 스크롤 → 메뉴바 표시
                    if (currentScrollY < lastScrollY) {
                        setIsVisible(true);
                    }
                    // 아래로 스크롤 → 메뉴바 숨김
                    else if (currentScrollY > lastScrollY + 1) {
                        setIsVisible(false);
                    }

                    setLastScrollY(currentScrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <nav
                className={`fixed z-50 bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                <div className="flex items-center justify-around h-16">
                    {/* 홈 */}
                    <button
                        onClick={() => navigate("/")}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive("/") ? "text-black" : "text-gray-600"
                            }`}
                    >
                        <img src="https://cdn-icons-png.flaticon.com/512/1946/1946488.png" alt="" className="size-4"/>
                        <span className="text-xs font-semibold">홈</span>
                    </button>

                    {/* 검색 */}
                    <button
                        onClick={() => navigate("/search")}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive("/search") ? "text-black" : "text-gray-600"
                            }`}
                    >
                        <img src="https://cdn-icons.flaticon.com/svg/19026/19026023.svg?token=exp=1765263630~hmac=b786739986359cafd9092920e2005904" alt="" className="size-4"/>
                        <span className="text-xs font-semibold">검색</span>
                    </button>

                    {/* 판매하기 (중앙) */}
                    <button
                        onClick={() => navigate("/sell")}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive("/sell") ? "text-black" : "text-gray-600"
                            }`}
                    >
                        <img src="https://cdn-icons-png.flaticon.com/512/3737/3737822.png" alt="" className="size-4" />
                        <span className="text-xs font-semibold">판매</span>
                    </button>

                    {/* 채팅 */}
                    <button
                        onClick={() => {
                            if (user) {
                                navigate("/chats");
                            } else {
                                navigate("/login");
                            }
                        }}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive("/chats") ? "text-black" : "text-gray-600"
                            }`}
                    >
                        <img src="https://cdn-icons.flaticon.com/svg/18561/18561368.svg?token=exp=1765263767~hmac=3a717f432cc60cef66d876aef9188b4f" alt="" className="size-4"/>
                        <span className="text-xs font-semibold">채팅</span>
                    </button>

                    {/* 마이페이지 */}
                    <button
                        onClick={() => {
                            if (user) {
                                navigate("/user");
                            } else {
                                navigate("/login");
                            }
                        }}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive("/mypage") ? "text-black" : "text-gray-600"
                            }`}
                    >
                        <img src="https://cdn-icons-png.flaticon.com/512/456/456283.png" alt="" className="size-4" />
                        <span className="text-xs font-semibold">마이</span>
                    </button>
                </div>
            </nav>
        </>
    );
}