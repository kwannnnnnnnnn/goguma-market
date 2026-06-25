import type { Tables } from "./supabase/database.types";

// 판매글 한 줄(레코드) 타입
export type Product = Tables<"products">;

// 판매 상태 값과 화면에 보여줄 한글 라벨
export const PRODUCT_STATUS = {
  selling: { label: "판매중", className: "bg-leaf/10 text-leaf" },
  reserved: { label: "예약중", className: "bg-flesh/15 text-flesh-dark" },
  sold: { label: "판매완료", className: "bg-skin/10 text-foreground/50" },
} as const;

export type ProductStatus = keyof typeof PRODUCT_STATUS;

export function isProductStatus(value: string): value is ProductStatus {
  return value in PRODUCT_STATUS;
}

// 1500000 -> "1,500,000원"
export function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}
