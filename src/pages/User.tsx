// client/src/pages/MyPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import ProductCard from "../components/ProductCard";
import type { Product } from "../data/mockProducts";

export default function MyPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [activeTab, setActiveTab] = useState<"selling" | "sold" | "likes">("selling");
    const [myProducts, setMyProducts] = useState<Product[]>([]);
    const [likedProducts, setLikedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ 설정 메뉴 상태
    const [showMenu, setShowMenu] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login");
            return;
        }

        if (user) {
            loadData();
        }
    }, [user, authLoading, navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const myProductsRes = await api<{ ok: true; products: Product[] }>(
                "/products/my"
            );
            setMyProducts(myProductsRes.products || []);

            const likedRes = await api<{ ok: true; products: Product[] }>(
                "/products/liked"
            );
            setLikedProducts(likedRes.products || []);
        } catch (err) {
            console.error("데이터 로드 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="container py-10 text-center">
                <p>로딩 중...</p>
            </div>
        );
    }

    const handleStatusChange = async (status: "selling" | "sold") => {
        if (!selectedProduct) return;

        try {
            await api(`/products/${selectedProduct._id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });

            // 상품 목록 갱신
            await loadData();
            setShowMenu(false);
            setSelectedProduct(null);
            alert(status === "sold" ? "판매완료 처리되었습니다" : "판매중으로 변경되었습니다");
        } catch (err) {
            alert("상태 변경에 실패했습니다");
        }
    };

    // ✅ 상품 삭제
    const handleDelete = async () => {
        if (!selectedProduct) return;
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            await api(`/products/${selectedProduct._id}`, {
                method: "DELETE",
            });

            await loadData();
            setShowMenu(false);
            setSelectedProduct(null);
            alert("삭제되었습니다");
        } catch (err) {
            alert("삭제에 실패했습니다");
        }
    };

    const sellingProducts = myProducts.filter(p => p.status === "selling");
    const soldProducts = myProducts.filter(p => p.status === "sold");

    return (
        <div className="w-full ">
            {/* 설정 모달 */}
            {showMenu && selectedProduct && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setShowMenu(false)}
                >
                    <div
                        className="overflow-hidden bg-white shadow-xl rounded-2xl w-80"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b">
                            <h3 className="font-semibold text-gray-900">{selectedProduct.title}</h3>
                        </div>

                        <div className="p-2">
                            <button
                                onClick={() => navigate(`/listing/${selectedProduct._id}`)}
                                className="w-full px-4 py-3 text-left transition-colors rounded-lg hover:bg-gray-50"
                            >
                                상품 보기
                            </button>

                            <button
                                onClick={() => navigate(`/edit/${selectedProduct._id}`)}
                                className="w-full px-4 py-3 text-left transition-colors rounded-lg hover:bg-gray-50"
                            >
                                수정하기
                            </button>

                            {selectedProduct.status === "selling" ? (
                                <button
                                    onClick={() => handleStatusChange("sold")}
                                    className="w-full px-4 py-3 text-left transition-colors rounded-lg hover:bg-gray-50"
                                >
                                    판매완료 처리
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleStatusChange("selling")}
                                    className="w-full px-4 py-3 text-left transition-colors rounded-lg hover:bg-gray-50"
                                >
                                    판매중으로 변경
                                </button>
                            )}

                            <button
                                onClick={handleDelete}
                                className="w-full px-4 py-3 text-left text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            >
                                삭제하기
                            </button>
                        </div>

                        <div className="p-3 border-t">
                            <button
                                onClick={() => setShowMenu(false)}
                                className="w-full py-2 text-gray-600 hover:text-gray-900"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="py-4 space-y-4">
                {/* 프로필 카드 */}
                <div className="p-8 bg-white border shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-6">
                            {/* 프로필 이미지 */}
                            <div className="flex items-center justify-center rounded-full shadow-md bg-gradient-to-br from-green-400 to-green-600 size-24">
                                <img src={user.profileImage} alt="" />
                            </div>

                            {/* 사용자 정보 */}
                            <div>
                                <h1 className="mb-2 text-2xl font-bold text-gray-900">{user.nickname}</h1>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                        </div>

                        {/* 버튼 */}
                        <div className="flex">
                            <button
                                onClick={() => {navigate("/editprofile")}}
                                className="px-6 py-2.5 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                프로필 수정
                            </button>
                        </div>
                    </div>

                    {/* 통계 */}
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                        <div className="text-center">
                            <p className="mb-1 text-sm text-gray-600">판매중</p>
                            <p className="text-2xl font-bold text-gray-900">{sellingProducts.length}</p>
                        </div>
                        <div className="text-center">
                            <p className="mb-1 text-sm text-gray-600">판매완료</p>
                            <p className="text-2xl font-bold text-gray-900">{soldProducts.length}</p>
                        </div>
                        <div className="text-center">
                            <p className="mb-1 text-sm text-gray-600">찜</p>
                            <p className="text-2xl font-bold text-gray-900">{likedProducts.length}</p>
                        </div>
                    </div>
                </div>

                {/* 탭 메뉴 */}
                <div className="mb-4">
                    <div className="flex gap-1 p-1 bg-white rounded-lg shadow-sm">
                        <button
                            onClick={() => setActiveTab("selling")}
                            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-md transition-all ${activeTab === "selling"
                                ? "bg-gray-800 text-white"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            판매중 ({sellingProducts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("sold")}
                            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-md transition-all ${activeTab === "sold"
                                ? "bg-gray-800 text-white"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            판매완료 ({soldProducts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("likes")}
                            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-md transition-all ${activeTab === "likes"
                                ? "bg-gray-800 text-white"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            찜한상품 ({likedProducts.length})
                        </button>
                    </div>
                </div>

                {/* 컨텐츠 */}
                <div className="px-6 py-10 border rounded-2xl">
                    {loading ? (
                        <div className="py-20 text-center text-gray-500 bg-white rounded-lg shadow-sm">
                            <p>불러오는 중...</p>
                        </div>
                    ) : (
                        <>
                            {/* 판매중 */}
                            {activeTab === "selling" && (
                                <div>
                                    {sellingProducts.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <p className="mb-4 text-gray-500">판매중인 상품이 없습니다</p>
                                            <button
                                                onClick={() => navigate("/sell")}
                                                className="px-6 py-3 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:opacity-90"
                                            >
                                                상품 등록하기
                                            </button>
                                        </div>
                                    ) : 
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                                            {sellingProducts.map((product) => (
                                                <div key={product._id} className="relative group">
                                                    <ProductCard item={product} />

                                                    {/* 설정 버튼 */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedProduct(product);
                                                            setShowMenu(true);
                                                        }}
                                                        className="absolute right-0 p-2 bottom-12"
                                                    >
                                                        <svg className="w-5 h-5 text-gray-800 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 판매완료 */}
                            {activeTab === "sold" && (
                                <div>
                                    {soldProducts.length === 0 ? (
                                        <div className="py-20 text-center bg-white rounded-lg shadow-sm">
                                            <p className="text-gray-500">판매완료된 상품이 없습니다</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                            {soldProducts.map((product) => (
                                                <div key={product._id} className="relative">
                                                    <ProductCard item={product} />
                                                    <div className="absolute inset-0 flex items-center justify-center h-64 bg-black/30 rounded-xl">
                                                        <span className="px-4 py-2 text-2xl font-semibold text-white rounded-lg">
                                                            판매완료
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 찜한 상품 */}
                            {activeTab === "likes" && (
                                <div>
                                    {likedProducts.length === 0 ? (
                                        <div className="py-20 text-center bg-white rounded-lg shadow-sm">
                                            <p className="text-gray-500">찜한 상품이 없습니다</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                            {likedProducts.map((product) => (
                                                <ProductCard key={product._id} item={product} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}