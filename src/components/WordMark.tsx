"use client";

import Image from "next/image";

export default function WordMark({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <Image src="/icon.png" alt="VeriText AI" width={size} height={size} />
      <span className="text-lg font-semibold tracking-tight text-slate-900">
        VeriText <span className="text-blue-600">AI</span>
      </span>
    </div>
  );
}
