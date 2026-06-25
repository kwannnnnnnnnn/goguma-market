"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ProductFormState } from "@/app/products/actions";
import {
  MAX_IMAGES,
  PRODUCT_STATUS,
  productImageUrl,
  type Product,
} from "@/lib/products";

type ProductAction = (
  prevState: ProductFormState,
  formData: FormData,
) => Promise<ProductFormState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-xl bg-skin px-4 py-3 font-semibold text-white transition hover:bg-skin-dark disabled:opacity-60"
    >
      {pending ? "잠시만요…" : label}
    </button>
  );
}

export function ProductForm({
  action,
  product,
  submitLabel,
  cancelHref,
}: {
  action: ProductAction;
  product?: Product;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState<ProductFormState, FormData>(
    action,
    {},
  );

  // 기존 사진 중 "삭제"로 표시한 경로들
  const existing = product?.image_paths ?? [];
  const [removed, setRemoved] = useState<string[]>([]);
  // 새로 고른 사진들의 미리보기
  const [newPreviews, setNewPreviews] = useState<
    { name: string; url: string }[]
  >([]);

  const keptCount = existing.length - removed.length;
  const remaining = MAX_IMAGES - keptCount;

  function toggleRemove(path: string) {
    setRemoved((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    const files = Array.from(e.target.files ?? []);
    setNewPreviews(
      files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* 수정일 때 어떤 글인지 알려주는 숨은 값 */}
      {product && <input type="hidden" name="id" value={product.id} />}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground/80">제목</span>
        <input
          name="title"
          type="text"
          required
          maxLength={100}
          defaultValue={product?.title ?? ""}
          placeholder="예) 거의 새것인 고구마 화분 팔아요"
          className="rounded-xl border border-skin/15 bg-cream px-4 py-3 text-foreground outline-none transition focus:border-flesh focus:ring-2 focus:ring-flesh/30"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground/80">가격 (원)</span>
        <input
          name="price"
          type="number"
          required
          min={0}
          step={100}
          defaultValue={product?.price ?? ""}
          placeholder="예) 15000"
          className="rounded-xl border border-skin/15 bg-cream px-4 py-3 text-foreground outline-none transition focus:border-flesh focus:ring-2 focus:ring-flesh/30"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground/80">설명</span>
        <textarea
          name="description"
          rows={6}
          defaultValue={product?.description ?? ""}
          placeholder="상품 상태, 거래 방법 등을 자유롭게 적어주세요."
          className="resize-y rounded-xl border border-skin/15 bg-cream px-4 py-3 text-foreground outline-none transition focus:border-flesh focus:ring-2 focus:ring-flesh/30"
        />
      </label>

      {/* 사진 영역 */}
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-foreground/80">
          사진 <span className="text-foreground/40">(최대 {MAX_IMAGES}장)</span>
        </span>

        {/* 수정 화면: 기존 사진 목록 */}
        {existing.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {existing.map((path) => {
              const isRemoved = removed.includes(path);
              return (
                <div key={path} className="relative aspect-square">
                  <Image
                    src={productImageUrl(path)}
                    alt="기존 사진"
                    fill
                    sizes="120px"
                    className={`rounded-xl object-cover transition ${
                      isRemoved ? "opacity-30 grayscale" : ""
                    }`}
                  />
                  {/* 삭제로 표시된 사진만 서버에 알려줍니다. */}
                  <input type="hidden" name="existing_images" value={path} />
                  {isRemoved && (
                    <input type="hidden" name="remove_images" value={path} />
                  )}
                  <button
                    type="button"
                    onClick={() => toggleRemove(path)}
                    className="absolute right-1 top-1 rounded-md bg-black/55 px-1.5 py-0.5 text-xs font-medium text-white"
                  >
                    {isRemoved ? "되돌리기" : "삭제"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={onFilesChange}
          className="rounded-xl border border-dashed border-skin/30 bg-cream px-4 py-3 text-foreground/70 file:mr-3 file:rounded-lg file:border-0 file:bg-skin file:px-3 file:py-1.5 file:font-semibold file:text-white hover:file:bg-skin-dark"
        />
        <p className="text-xs text-foreground/50">
          {product
            ? `남은 자리 ${Math.max(remaining, 0)}장 · 새로 ${newPreviews.length}장 선택됨`
            : `${newPreviews.length}/${MAX_IMAGES}장 선택됨`}
        </p>

        {/* 새로 고른 사진 미리보기 */}
        {newPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {newPreviews.map((p) => (
              <div key={p.url} className="relative aspect-square">
                {/* 미리보기는 임시 주소라 일반 img 태그를 씁니다. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.name}
                  className="h-full w-full rounded-xl object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground/80">판매 상태</span>
        <select
          name="status"
          defaultValue={product?.status ?? "selling"}
          className="rounded-xl border border-skin/15 bg-cream px-4 py-3 text-foreground outline-none transition focus:border-flesh focus:ring-2 focus:ring-flesh/30"
        >
          {Object.entries(PRODUCT_STATUS).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Link
          href={cancelHref}
          className="flex-1 rounded-xl border border-skin/20 px-4 py-3 text-center font-semibold text-skin-dark transition hover:bg-skin/5"
        >
          취소
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
