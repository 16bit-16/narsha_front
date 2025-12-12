import { useState } from "react";

interface Props {
  images: string[];
}

export default function ImageCarousel({ images }: Props) {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <div className="relative w-full overflow-hidden rounded-lg ">
      {/* 이미지 컨테이너 */}
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, idx) => (
          <div key={idx} className="flex-shrink-0 w-full bg-gray-100 aspect-square">
            <img
              src={src}
              alt={`image-${idx}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* 좌/우 버튼 */}
      <button
        onClick={prev}
        className="absolute p-2 -translate-y-1/2 rounded-full shadow left-2 top-1/2 bg-white/90 opacity-70 hover:opacity-100"
        aria-label="이전"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute p-2 -translate-y-1/2 rounded-full shadow right-2 top-1/2 bg-white/90 opacity-70 hover:opacity-100"
        aria-label="다음"
      >
        ›
      </button>

      {/* 인디케이터 */}
      <div className="absolute px-2 py-1 text-xs text-gray-700 -translate-x-1/2 rounded-full bottom-2 left-1/2 bg-white/90">
        {current + 1}/{total}
      </div>
    </div>
  );
}
