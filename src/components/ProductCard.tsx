import { Link } from "react-router-dom";
import type { Product } from "../data/mockProducts";

interface Props {
  item: Product;
}

export default function ProductCard({ item }: Props) {
  const imageSrc = item.images?.[0] || "/placeholder.png";
  const dateText = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : "";

  return (
    <Link
      to={`/listing/${item._id}`}
      className="block transition "
    >
      <div className="bg-[#fcfcfc] aspect-square overflow-hidden rounded-xl">
        <img
          src={imageSrc}
          alt={item.title}
          className="object-cover w-full h-full transition hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="py-3">
        <h3 className="text-sm line-clamp-1">{item.title}</h3>
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
