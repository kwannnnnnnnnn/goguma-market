"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ProductFormState } from "@/app/products/actions";
import { PRODUCT_STATUS, type Product } from "@/lib/products";

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
