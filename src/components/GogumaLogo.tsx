// 🍠 고구마 로고 (인라인 SVG)
export function GogumaLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 고구마 몸통 */}
      <path
        d="M14 44C6 36 12 18 26 12c12-5 26-2 28 8 2 9-6 16-14 24-9 9-20 8-26 0z"
        fill="#7a3f6d"
      />
      {/* 속살 하이라이트 */}
      <path
        d="M20 42c-4-5 0-16 10-21 8-4 17-3 18 3-9-1-16 3-21 9-3 4-5 8-7 9z"
        fill="#f2a93b"
        opacity="0.85"
      />
      {/* 잎 */}
      <path
        d="M44 14c4-6 11-7 15-5-1 5-6 9-12 9-2 0-3-1-3-4z"
        fill="#6aa84f"
      />
      {/* 줄기 */}
      <path
        d="M44 14c2-3 5-5 8-6"
        stroke="#4e7d3a"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
