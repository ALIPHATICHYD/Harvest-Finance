'use client';

import { motion } from 'framer-motion';
import { cn } from '@/components/ui/types';

const shimmer = {
  animate: { opacity: [0.4, 1, 0.4] },
  transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
};

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('bg-slate-200 rounded-md', className)}
      {...shimmer}
    />
  );
}

export function VaultCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg flex flex-col gap-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="p-3 bg-gray-50 rounded-lg flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-40" />
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

export function VaultTableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </td>
      <td className="py-4 px-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-4 px-4"><Skeleton className="h-6 w-14 rounded-full" /></td>
      <td className="py-4 px-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
      <td className="py-4 px-4">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

export function TransactionRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
      <td className="py-4 px-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-4 px-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
      <td className="py-4 px-4"><Skeleton className="h-8 w-16 rounded-lg ml-auto" /></td>
    </tr>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 flex flex-col gap-3">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}
