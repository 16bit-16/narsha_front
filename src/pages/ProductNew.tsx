// src/pages/ProductNew.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Map from "../components/Map";

import { api } from "../utils/api";

type SelFile = { file: File; preview: string; id: string };

const CATEGORIES = [
  "디지털/가전",
  "가구/인테리어",
  "생활/주방",
  "유아동",
  "패션/잡화",
  "도서/음반/문구",
  "스포츠/레저",
  "반려동물용품",
  "티켓/서비스",
  "기타",
];

const QC = [
  { label: "미개봉", value: "미개봉" },
  { label: "최상", value: "최상" },
  { label: "상", value: "상" },
  { label: "중상", value: "중상" },
  { label: "중", value: "중" },
  { label: "중하", value: "중하" },
  { label: "하", value: "하" },
];

export default function ProductNew() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAbortController, setAiAbortController] = useState<AbortController | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceRaw, setPriceRaw] = useState<string>("");
  const price = useMemo(
    () => Number(priceRaw.replace(/[^\d]/g, "") || 0),
    [priceRaw]
  );
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);

  const [category, setCategory] = useState("기타");
  const [location, setLocation] = useState("");
  const [selFiles, setSelFiles] = useState<SelFile[]>([]);

  const [Brand, setBrand] = useState("");
  const [Quality, setQuality] = useState("");
  const [BuyDate, setBuyDate] = useState<string>("");
  const [Trade, setTrade] = useState<string>("");
  const [DeliveryFee, setDeliveryFee] = useState("배송비 미포함");
  const [IsSailed, setIsSailed] = useState(false);

  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => selFiles.forEach((s) => URL.revokeObjectURL(s.preview)),
    [selFiles]
  );

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        addFiles(files);
      }
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [selFiles.length]);

  const onPriceChange = (val: string) => {
    const digits = val.replace(/[^\d]/g, "");
    if (!digits) return setPriceRaw("");
    setPriceRaw(digits.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  };

  const addFiles = (files: File[]) => {
    const remain = 5 - selFiles.length;
    if (remain <= 0) return;
    const valid = files
      .slice(0, remain)
      .filter((f) => /^image\/(png|jpe?g|gif|webp|bmp)$/i.test(f.type))
      .filter((f) => f.size <= 5 * 1024 * 1024);
    const mapped: SelFile[] = valid.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }));
    setSelFiles((prev) => [...prev, ...mapped]);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    e.currentTarget.value = "";
  };

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      el.classList.add("ring-2", "ring-neutral-900");
    };
    const onDragLeave = () => el.classList.remove("ring-2", "ring-neutral-900");
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      onDragLeave();
      addFiles(Array.from(e.dataTransfer?.files || []));
    };
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, [selFiles.length]);

  async function uploadImages(files: File[]): Promise<string[]> {
    if (!files.length) return [];

    const token = sessionStorage.getItem("token");
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";
    const res = await fetch(`${API_BASE}/uploads/images`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd,
    });

    const data = await res.json();
    if (!res.ok || data.ok === false)
      throw new Error(data.error || "이미지 업로드 실패");
    return data.urls as string[];
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, price: true });
    setErrMsg(null);
    if (!title.trim() || price <= 0) {
      setErrMsg("필수 항목을 확인해 주세요.");
      return;
    }

    setBusy(true);
    try {
      const urls = await uploadImages(selFiles.map((s) => s.file));

      await api<{ ok: true; product: any }>("/products", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price,
          category,
          location: location.trim() || "미정",
          images: urls,
          lat: selectedLat ?? undefined,
          lng: selectedLng ?? undefined,
          brand: Brand,
          quality: Quality || "중",
          buydate: BuyDate || "",
          trade: Trade,
          deliveryfee: DeliveryFee,
          isSailed: IsSailed,
        }),
      });

      alert("상품이 등록되었습니다!");
      navigate("/");
      setTitle("");
      setDescription("");
      setPriceRaw("");
      setCategory("기타");
      setLocation("");
      setSelFiles([]);
      setTouched({});
      setBrand("");
      setQuality("");
      setBuyDate("");
      setTrade("");
      setDeliveryFee("배송비 미포함");
      setIsSailed(false);
    } catch (e: any) {
      setErrMsg(e.message || "문제가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const titleError = touched.title && !title.trim();
  const priceError = touched.price && price <= 0;

  const analyzeImageWithAI = async (selFile: SelFile, signal?: AbortSignal) => {
    setAiLoading(true);
    setErrMsg(null);

    try {
      const fd = new FormData();
      fd.append("files", selFile.file);

      const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";
      const token = sessionStorage.getItem("token");

      const uploadRes = await fetch(`${API_BASE}/uploads/images`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
        signal,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || uploadData.ok === false) {
        throw new Error(uploadData.error || "이미지 업로드 실패");
      }

      const imageUrl = uploadData.urls?.[0];
      if (!imageUrl) throw new Error("이미지 URL을 받지 못했습니다");

      const aiRes = await api<{
        ok: true;
        data: {
          title: string;
          quality: string;
          brand: string;
          description: string;
        };
      }>("/ai/generate-description", {
        method: "POST",
        body: JSON.stringify({ imageUrl }),
        signal,
      });

      if (aiRes.ok && aiRes.data) {
        setTitle(aiRes.data.title || "");
        setQuality(aiRes.data.quality || "상");
        setBrand(aiRes.data.brand || "");
        setDescription(aiRes.data.description || "");

        setErrMsg(null);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
      } else {
        setErrMsg(err.message || "AI 설명문 생성 실패");
      }
    } finally {
      setAiLoading(false);
      setAiAbortController(null);
    }
  };

  const handleAIAnalyze = async () => {
    if (selFiles.length === 0) {
      setErrMsg("먼저 이미지를 업로드하세요");
      return;
    }

    const controller = new AbortController();
    setAiAbortController(controller);
    await analyzeImageWithAI(selFiles[0], controller.signal);
  };

  const handleCancelAI = () => {
    if (aiAbortController) {
      aiAbortController.abort();
      setAiLoading(false);
      setAiAbortController(null);
    }
  };

  return (
    <div className="py-10">
      {aiLoading && (
        <div className="p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50">
          <p className="text-sm text-blue-700">AI가 상품 정보를 분석 중입니다...</p>
        </div>
      )}
      <div className="w-full mx-auto">
        <h1 className="mb-8 text-3xl font-extrabold">상품 등록</h1>

        {errMsg && <div className="alert-err">{errMsg}</div>}

        <form onSubmit={onSubmit} className="grid gap-6 p-6 card">
          {/* 이미지 */}
          <div>
            <label className="form-label">
              이미지{" "}
              <span className="text-gray-400">(최대 5장, 파일당 5MB)</span>
            </label>
            <div
              ref={dropRef}
              className="dropzone"
              onClick={() => fileInputRef.current?.click()}
              title="클릭 또는 파일을 드래그해 업로드"
            >
              <div className="text-sm text-gray-700">
                이미지를 드래그하거나 클릭해서 선택하세요
              </div>
              <div className="mt-1 text-xs text-gray-500">
                JPG, PNG, GIF, WEBP, BMP 지원 • 현재 {selFiles.length}/5
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Ctrl+V (또는 Cmd+V)로 이미지를 붙여넣을수 있습니다
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            {selFiles.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-3 mt-3 sm:grid-cols-4 md:grid-cols-5">
                  {selFiles.map((s) => (
                    <div key={s.id} className="thumb">
                      <img src={s.preview} className="thumb-img" />
                      <button
                        type="button"
                        className="thumb-del"
                        onClick={() =>
                          setSelFiles((prev) => prev.filter((x) => x.id !== s.id))
                        }
                        aria-label="이미지 제거"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleAIAnalyze}
                    disabled={aiLoading}
                    className="px-4 py-2 font-semibold text-white bg-gray-500 rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    {aiLoading ? "분석 중..." : "AI 자동 분석"}
                  </button>

                  {aiLoading && (
                    <button
                      type="button"
                      onClick={handleCancelAI}
                      className="px-4 py-2 font-semibold text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      취소
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 제목 */}
          <div>
            <label className="form-label form-required">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched((s) => ({ ...s, title: true }))}
              className={titleError ? "input-error" : "input"}
              placeholder="예) 중고 책 · 상급 · 포장만 뜯은 상태"
              maxLength={60}
              disabled={aiLoading}
            />
            <p className="form-hint">
              최대 60자. 상품 핵심이 드러나게 적어주세요.
            </p>
          </div>

          {/* 설명 */}
          <div>
            <label className="form-label">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
              rows={6}
              placeholder={`상세 상태(사용감/하자), 구성품, 교환/환불 안내 등\n예) 거의 새것, 책갈피 사은품 포함`}
              disabled={aiLoading}
            />
            <div className="form-counter">{description.length}/1000</div>
          </div>

          {/* 디테일 사이드바 */}
          <div>
            <label className="form-label">상품 정보</label>
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 space-y-2 border rounded-lg">
                <p>브랜드</p>
                <hr />
                <input
                  value={Brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="input"
                  placeholder="예) 삼성전자"
                  disabled={aiLoading}
                />
              </div>

              <div className="p-4 space-y-2 border rounded-lg">
                <p>제품 상태</p>
                <hr />
                <select
                  value={Quality}
                  onChange={e => setQuality(e.target.value)}
                  className="input"
                  disabled={aiLoading}
                >
                  <option value="">제품상태 선택</option>
                  {QC.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div className="flex flex-col p-4 space-y-2 border rounded-lg">
                <p>구매일자</p>
                <hr />
                <input
                  type="date"
                  className="justify-center h-12 p-4 border rounded-lg"
                  value={BuyDate}
                  onChange={(e) => setBuyDate(e.target.value)}
                  disabled={aiLoading}
                />
              </div>

              <div className="p-4 space-y-2 border rounded-lg">
                <p>거래방식</p>
                <hr />
                <input
                  value={Trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="input"
                  placeholder="예) 직거래"
                  disabled={aiLoading}
                />
              </div>

              <div className="p-4 space-y-2 border rounded-lg">
                <p>배송비</p>
                <hr />
                <input
                  value={DeliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="input"
                  placeholder="예) 배송비 별도"
                  disabled={aiLoading}
                />
              </div>
            </div>
          </div>

          {/* 가격 + 카테고리 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label form-required">가격(원)</label>
              <input
                inputMode="numeric"
                value={priceRaw}
                onChange={(e) => onPriceChange(e.target.value)}
                onBlur={() => setTouched((s) => ({ ...s, price: true }))}
                className={priceError ? "input-error" : "input"}
                placeholder="예) 12,000"
                disabled={aiLoading}
              />
              <p className="form-hint">
                숫자만 입력하면 자동으로 3자리 콤마가 적용돼요.
              </p>
            </div>

            <div>
              <label className="form-label">카테고리</label>
              <select
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={aiLoading}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="form-hint">
                적절한 분류를 선택하면 검색에 더 잘 노출돼요.
              </p>
            </div>
          </div>

          {/* 위치 */}
          <div className="h-96">
            <Map
              onSelect={(info) => {
                setLocation(info.address);
                setSelectedLat(info.lat);
                setSelectedLng(info.lng);
              }}
            />
          </div>

          <div>
            <label className="form-label">거래 지역</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
              placeholder="예) 대구 수성구"
              disabled={aiLoading}
            />
            <p className="form-hint">
              직거래를 원하시면 동/구 단위로 적어주세요. (선택)
            </p>
          </div>

          {/* 제출 */}
          <button
            className="btn-primary"
            disabled={busy || !title.trim() || price <= 0 || aiLoading}
          >
            {busy ? "등록 중..." : aiLoading ? "AI 분석 중..." : "등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}