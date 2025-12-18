import { useEffect, useState, type KeyboardEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import type { Product } from "../data/mockProducts";
import { api } from "../utils/api";

export default function Search() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(
        searchParams.get("q") || ""
    );

    const handleSearch = () => {
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        // 검색 페이지로 이동 (쿼리 파라미터 포함)
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    useEffect(() => {
        if (!query) return;

        async function search() {
            setLoading(true);
            try {
                // api 함수 사용
                const data = await api<{ ok: true; products: Product[] }>(
                    `/products/search?q=${encodeURIComponent(query)}`
                );
                setProducts(data.products || []);
            } catch (err) {
                console.error("검색 실패:", err);
            } finally {
                setLoading(false);
            }
        }

        search();
    }, [query]);

    return (
        <div className="md:py-10">
            <div className="flex items-center justify-center px-3 rounded mb-4 bg-[#efefef] w-full md:hidden">
                <img src="/search.svg" alt="" className="w-3 h-3 opacity-40" />
                <input
                type="text"
                placeholder="검색어를 입력해주세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex p-2 text-sm bg-[#efefef] w-full placeholder-neutral-500 focus:outline-none"
            />
            </div>
            <h1 className="mb-6 text-2xl font-bold">
                '{query}' 검색 결과 ({products.length}개)
            </h1>

            {loading ? (
                <p className="text-gray-500">검색 중...</p>
            ) : products.length === 0 ? (
                <p className="text-gray-500">검색 결과가 없습니다.</p>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {products.map((p) => (
                        <ProductCard key={p._id} item={p} />
                    ))}
                </div>
            )}
        </div>
    );
}