// src/pages/Category.tsx

import { useState, useEffect } from "react";
import type { Product } from "../data/mockProducts";
import ProductSection from "../components/ProductSection";
import { api } from "../utils/api";

const CATEGORIES = [
    "디지털/가전",
    "가구/인테리어",
    "생활/주방",
    "유아동",
    "패션/잡화",
    "도서/음반/문구",
    "스포츠/레저",
    "반려동물용품",
    "티켓/서비스",
    "기타",
];

export default function Category() {
    const [selectedCategory, setSelectedCategory] = useState("디지털/가전");
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    // 처음 한 번만 모든 상품 로드
    useEffect(() => {
        loadAllProducts();
    }, []);

    const loadAllProducts = async () => {
        setLoading(true);
        try {
            const data = await api<{ ok: true; products: Product[] }>("/products");
            if (data.ok) {
                setAllProducts(data.products);
            }
        } catch (err) {
            console.error("상품 조회 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    // 선택된 카테고리의 상품만 필터링
    const filteredProducts = allProducts.filter(
        (p) => p.category === selectedCategory && p.status === "selling"
    );

    return (
        <div className="pb-20 md:pb-0">
            {/* 카테고리 탭 */}
            <div className="sticky top-0 z-10 bg-white border-b">
                <div className="flex w-full gap-2 px-4 py-4 overflow-x-auto text-sm snap-x">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 border rounded-full min-w-fit snap-start transition-colors whitespace-nowrap ${
                                selectedCategory === category
                                    ? "bg-black text-white border-black"
                                    : "border-gray-300 text-gray-700 hover:border-black"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* 상품 섹션 */}
            <div className="px-4 py-6">
                <h2 className="mb-4 text-lg font-bold">{selectedCategory}</h2>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-gray-500">로딩 중...</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <ProductSection title="" products={filteredProducts} />
                ) : (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-gray-500">상품이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}