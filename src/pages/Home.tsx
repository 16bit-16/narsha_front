// client/src/pages/Home.tsx
import { useEffect, useState } from "react";
import Banner from "../components/Banner";
import ProductSection from "../components/ProductSection";
import type { Product } from "../data/mockProducts";

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";

// 스켈레톤 데이터 생성
const createSkeletonProducts = (count: number): Product[] =>
  [...Array(count)].map((_, i) => ({
    _id: `skeleton-${i}`,
    title: "",
    description: "",
    price: 0,
    category: "",
    location: "",
    images: [""],
    status: "selling" as const,
    createdAt: "",
    seller: { _id: "", userId: "", nickname: "" },
    brand: "",
    quality: "중" as const,
    buydate: "",
    trade: "",
    deliveryfee: "",
    isSailed: false,
  }));

export default function Home() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_BASE}/products`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || data.ok === false)
          throw new Error(data.error || "불러오기 실패");
        if (!alive) return;
        setItems(data.products as Product[]);
      } catch (e: any) {
        if (!alive) return;
        setErr(e.message || "에러가 발생했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const recommended = loading ? createSkeletonProducts(12) : items.slice(0, 12);
  const popular = loading ? createSkeletonProducts(12) : items.slice(12, 24);

  if (err) {
    return (
      <>
        <Banner />
        <div className="container py-10 text-center text-red-600">
          오류: {err}
        </div>
      </>
    );
  }

  return (
    <>
      <Banner />
      <ProductSection title="오늘의 상품 추천" products={recommended} />
      <ProductSection
        title="인기 많은 상품"
        products={popular.length ? popular : recommended}
      />
    </>
  );
}