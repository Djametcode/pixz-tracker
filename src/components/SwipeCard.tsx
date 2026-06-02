"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

interface SwipeCardProps {
  children: ReactNode;
  onDelete: () => void;
  projectName: string;
}

export default function SwipeCard({ children, onDelete, projectName }: SwipeCardProps) {
  const [offset, setOffset] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = -80;
  const MAX_OFFSET = -140;

  const handleStart = useCallback((clientX: number) => {
    startX.current = clientX;
    isDragging.current = true;
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    const diff = clientX - startX.current;
    if (diff > 0) {
      setOffset(0);
    } else {
      setOffset(Math.max(diff, MAX_OFFSET));
    }
  }, []);

  const handleEnd = useCallback(() => {
    isDragging.current = false;
    if (offset < THRESHOLD) {
      setOffset(-100);
    } else {
      setOffset(0);
    }
  }, [offset]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/projects/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectName }),
      });
      if (res.ok) {
        onDelete();
      }
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete button behind card */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-600 text-white font-semibold text-sm px-6 transition-all duration-200"
        style={{ width: 100, opacity: offset < -20 ? 1 : 0 }}
      >
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex flex-col items-center gap-1 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-[10px]">{deleting ? '...' : 'Delete'}</span>
        </button>
      </div>

      {/* Card content */}
      <div
        ref={cardRef}
        className="transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(${offset}px)` }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {children}
      </div>
    </div>
  );
}
