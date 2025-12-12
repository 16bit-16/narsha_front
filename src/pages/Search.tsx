import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import type { Product } from "../data/mockProducts";
import { api } from "../utils/api";

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

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
        <div className="py-10">
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