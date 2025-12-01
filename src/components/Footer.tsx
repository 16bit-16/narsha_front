import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="mt-12 border-t bg-gray-50">
      <div className="container flex flex-col gap-2 py-6 text-sm text-gray-600">
        <div className="flex flex-wrap gap-4 text-sm">
          <button onClick={() => {navigate("/")}} className="duration-150 hover:font-bold hover:text-black">회사소개</button>
          <button onClick={() => {navigate("/tos")}} className="duration-150 hover:font-bold hover:text-black">이용약관</button>
          <button onClick={() => {navigate("/privacy")}} className="duration-150 hover:font-bold hover:text-black">개인정보처리방침</button>
        </div>

        <div className="pt-4 text-xs">
          <div className="flex pb-2">
            <p className="font-bold">(주)</p>
            <p>PALPAL</p>
          </div>
          <div className="flex">
            <p className="font-bold">주소</p>
            <p className="px-1">|</p>
            <p>대구 달성군 구지면 창리로11길 93</p>
          </div>
          <div className="flex">
            <p className="font-bold">대표자</p>
            <p className="px-1">|</p>
            <p>이도건</p>
          </div>
          <div className="flex">
            <p className="font-bold">대표번호</p>
            <p className="px-1">|</p>
            <a href="tel:010-2681-2481">010-2681-2481</a>
          </div>
          <div className="flex">
            <p className="font-bold">이메일</p>
            <p className="px-1">|</p>
            <a href="mailto:help@palpalshop.shop">help@palpalshop.shop</a>
          </div>
          <div className="flex">
            <p className="font-bold">호스팅제공자</p>
            <p className="px-1">|</p>
            <p>AWS</p>
          </div>
        </div>

        <div className="flex justify-between pt-2 text-xs">
          <p className="leading-6">
            (주)PALPAL은 통신판매중개자로서 거래 당사자가 아니며 판매 회원과 구매 회원 간의 상품거래 정보 및 거래에 관여하지 않고, 어떠한 의무와 책임도 부담하지 않습니다.
          </p>
          <p className="text-gray-400">© {new Date().getFullYear()} PALPAL</p>
        </div>
      </div>
    </footer>
  );
}
