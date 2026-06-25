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

// 판매글 하나에 올릴 수 있는 사진 최대 장수
export const MAX_IMAGES = 5;

// 사진을 보관하는 Storage 창고(bucket) 이름
export const PRODUCT_IMAGES_BUCKET = "product-images";

// 창고 안 경로(예: "유저id/사진id.jpg") -> 브라우저에서 볼 수 있는 공개 주소
export function productImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path}`;
}
