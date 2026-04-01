'use client';
import { useToastStore } from '@/store/useToastStore';

export function Toaster() {
  const { isVisible, message, type, hideToast } = useToastStore();

  if (!isVisible) return null;

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center shadow-lg rounded-lg transition-all duration-300">
      <div className={`px-4 py-3 rounded-lg text-white font-medium flex justify-between items-center min-w-[300px] ${bgColors[type]}`}>
        <span>{message}</span>
        <button onClick={hideToast} className="ml-4 opacity-80 hover:opacity-100 font-bold focus:outline-none">
          ✕
        </button>
      </div>
    </div>
  );
}
