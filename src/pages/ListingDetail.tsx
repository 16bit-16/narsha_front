import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ImageCarousel from "../components/ImageCarousel";
import DetailSidebar from "../components/DetailSidebar";
import ProductSection from "../components/ProductSection";
import Map from "../components/Map";
import type { Product } from "../data/mockProducts";
import { api } from "../utils/api";

export default function ListingDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  // ✅ 좋아요 상태 관리
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!id) return;
      setLoading(true);
      setErr(null);
      try {
        // ✅ api 함수 사용
        const pJson = await api<{ ok: true; product: Product; isLiked: boolean }>(
          `/products/${id}`
        );
        const item: Product = pJson.product;

        // ✅ 좋아요 정보 초기화
        setIsLiked(pJson.isLiked || false);
        setLikeCount(item.likeCount || 0);

        // ✅ api 함수 사용
        const lJson = await api<{ ok: true; products: Product[] }>("/products");
        const list: Product[] = lJson.products || [];

        if (!alive) return;
        setProduct(item);
        setSimilar(list.filter((p) => p._id !== item._id).slice(0, 6));
      } catch (e: any) {
        if (!alive) return;
        setErr(e.message || "에러가 발생했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [id]);

  // ✅ 좋아요 토글 함수
  const handleLike = async () => {
    if (!id || likeBusy) return;

    setLikeBusy(true);

    // 낙관적 업데이트 (즉시 UI 반영)
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      // ✅ api 함수 사용
      const data = await api<{
        ok: true;
        isLiked: boolean;
        likeCount: number
      }>(`/products/${id}/like`, {
        method: "POST",
      });

      // 서버 응답으로 최종 확정
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (e: any) {
      // 실패 시 이전 상태로 롤백
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      alert(e.message || "로그인이 필요합니다.");
    } finally {
      setLikeBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10 text-center text-gray-600">
        불러오는 중...
      </div>
    );
  }

  if (err || !product) {
    return (
      <div className="container py-10 text-center text-gray-600">
        {err ? `오류: ${err}` : "존재하지 않는 상품입니다."}
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["/placeholder.png"];

  return (
    <>
      <div className="py-6">
        {showMap && product.lat && product.lng && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-1/2 p-10 bg-white rounded-lg h-100">
              <button
                className="absolute text-xl text-zinc-500 top-2 right-4"
                onClick={() => setShowMap(false)}
              >
                ✕
              </button>

              <Map
                onSelect={() => { }}
                center={{ lat: product.lat, lng: product.lng }}
                marker={{ lat: product.lat, lng: product.lng }}
              />
              <div className="text-center text-zinc-500">
                {product.location || "지역 정보 없음"}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr_0.5fr]">
          {/* 판매완료 오버레이 */}
          {product.status === "sold" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold text-white">판매완료된 상품입니다.</h2>
                <p className="pb-2 text-gray-300">더 이상 구매할 수 없습니다.</p>
                <button onClick={() => {navigate("/")}} className="px-4 py-1 text-white bg-gray-800 rounded-lg">돌아가기</button>
              </div>
            </div>
          )}
          <ImageCarousel images={images} />
          <section className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 rounded-full size-10" />
                <div>
                  <div className="text-sm font-semibold">
                    {product.seller?.nickname || "알수없음"}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {product.location || "지역 정보 없음"}
                  </div>
                </div>
              </div>

              <div>
                <h1 className="text-xl font-semibold">{product.title}</h1>
                <div className="mt-1 text-3xl font-bold">
                  {Number(product.price).toLocaleString()}원
                </div>
                <div
                  className="mt-1 text-xs cursor-pointer text-zinc-500 hover:underline"
                  onClick={() => setShowMap(true)}
                >
                  {product.location || "지역 정보 없음"} ·{" "}
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : ""}
                </div>
              </div>

              <div className="leading-6 whitespace-pre-line text-zinc-700">
                {product.description?.trim()
                  ? product.description
                  : "판매자가 설명을 입력하지 않았습니다."}
              </div>
            </div>

            {/* ✅ 좋아요 버튼 업데이트 */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                disabled={likeBusy}
                className={`px-3 py-2 text-lg transition-colors ${isLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-600 hover:text-red-500"
                  } ${likeBusy ? "opacity-50 cursor-not-allowed" : ""}`}
                title={`좋아요 ${likeCount}개`}
              >
                {isLiked ? "♥" : "♡"}
              </button>

              <button className="px-3 py-2 text-lg text-gray-600 hover:bg-zinc-50">
                ↗
              </button>

              <button className="h-10 px-16 ml-auto text-sm font-semibold border border-gray-800 rounded hover:bg-zinc-50">
                채팅하기
              </button>

              <button className="h-10 px-16 text-sm font-semibold text-white bg-gray-800 rounded hover:opacity-90">
                구매하기
              </button>
            </div>
          </section>

          <DetailSidebar product={product} />
        </div>

        <div className="mt-10">
          <ProductSection title="비슷한 상품" products={similar} />
        </div>
      </div>
    </>
  );
}