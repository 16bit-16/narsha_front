import { Link, useLocation } from "react-router-dom";
import type { Product } from "../data/mockProducts";

interface Props {
  item: Product;
}

export default function ProductCard({ item }: Props) {
  const location = useLocation();
  const imageSrc = item.images?.[0] || "/placeholder.png";
  const dateText = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : "";

  const isUserPage = location.pathname.startsWith("/user");
  const truncatedTitle = isUserPage && item.title.length > 14
    ? item.title.slice(0, 12) + "..."
    : item.title;

  return (
    <Link
      to={`/listing/${item._id}`}
      className="block transition "
    >
      <div className="bg-[#fcfcfc] aspect-square overflow-hidden rounded-xl">
        {item.status == "sold" && (
          <div className="relative w-full h-full overflow-hidden rounded-xl">
            <img
              src={imageSrc}
              alt={item.title}
              className="object-cover w-full h-full transition hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
              <span className="px-6 py-3 text-2xl font-bold text-white rounded-lg">
                판매완료
              </span>
            </div>
          </div>
        )}
        <img
          src={imageSrc}
          alt={item.title}
          className="object-cover w-full h-full transition hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="py-3">
        <h3 className="text-sm line-clamp-1">{truncatedTitle}</h3>
        <p className="mt-1 font-semibold">
          {Number(item.price).toLocaleString()}원
        </p>
        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
          <span>
            {item.location
              ? item.location.split(" ").slice(0, 3).join(" ")
              : "지역 정보 없음"}
          </span>
          <span>{dateText}</span>
        </div>
      </div>
    </Link>
  );
}