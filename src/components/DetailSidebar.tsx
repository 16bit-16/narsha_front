import type { Product } from "../data/mockProducts";

interface Props {
  product: Product;
}

export default function DetailSidebar({ product }: Props) {
  return (
    <aside className="p-4 px-5 text-sm text-gray-700 card">
      <div className="grid w-full space-y-3 grid-rows md:grid-cols">
        <div className="flex flex-col items-center justify-between">
          <span className="text-gray-500">브랜드</span>
          <span className="font-medium">{product.brand}</span>
        </div>
        <hr />
        <div className="flex flex-col items-center justify-between">
          <span className="text-gray-500">제품상태</span>
          <span className="font-medium">{product.quality}</span>
        </div>
        <hr />
        <div className="flex flex-col items-center justify-between">
          <span className="text-gray-500">구매일자</span>
          <span className="font-medium">{product.buydate}</span>
        </div>
        <hr />
        <div className="flex flex-col items-center justify-between">
          <span className="text-gray-500">거래방식</span>
          <span className="font-medium">{product.trade}</span>
        </div>
        <hr />
        <div className="flex flex-col items-center justify-between">
          <span className="text-gray-500">배송비</span>
          <span className="font-medium">{product.deliveryfee}</span>
        </div>
      </div>
    </aside>
  );
}
