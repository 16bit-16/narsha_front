import ProductCard from "./ProductCard";
import type { Product } from "../data/mockProducts";

interface Props {
  title: string;
  products: Product[];
}

export default function ProductSection({ title, products }: Props) {
  if (!products?.length) return null;

  return (
    <section className="container p-0 my-4 md:my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl section-title">{title}</h2>
        <button className="text-gray-500 text-md hover:text-black">
          › 전체 보기
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
        {products.map((p) => (
          <ProductCard key={p._id} item={p} />
        ))}
      </div>
    </section>
  );
}
