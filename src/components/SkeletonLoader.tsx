"use client";

import React from "react";

export function CardSkeleton() {
  return (
    <div className="bg-[#0D111D] border border-[#252A38]/50 rounded-xl p-5 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-zinc-800 rounded w-1/3" />
        <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
      </div>
      <div className="h-8 bg-zinc-800 rounded w-1/2" />
      <div className="h-3 bg-zinc-800/60 rounded w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-[#0D111D] border border-[#252A38]/50 rounded-xl p-4 animate-pulse space-y-3">
      <div className="h-5 bg-zinc-800/80 rounded w-full mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-zinc-800/30">
          <div className="h-4 bg-zinc-800 rounded w-1/4" />
          <div className="h-4 bg-zinc-800/60 rounded w-1/3" />
          <div className="h-4 bg-zinc-800/40 rounded w-1/6" />
        </div>
      ))}
    </div>
  );
}

export default function SkeletonLoader({ type = "card", count = 3 }: { type?: "card" | "table"; count?: number }) {
  if (type === "table") {
    return <TableSkeleton rows={count} />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
