'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LotPhotoGalleryProps {
  photoUrls: string[];
  alt: string;
}

export function LotPhotoGallery({ photoUrls, alt }: LotPhotoGalleryProps) {
  const [current, setCurrent] = useState(0);

  if (photoUrls.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
        <Car className="h-24 w-24 text-muted-foreground/30" />
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : photoUrls.length - 1));
  const next = () => setCurrent((c) => (c < photoUrls.length - 1 ? c + 1 : 0));

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
        <Image
          src={photoUrls[current]}
          alt={`${alt} ${current + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
          priority={current === 0}
        />
        {photoUrls.length > 1 && (
          <>
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {current + 1} / {photoUrls.length}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white h-9 w-9"
              onClick={prev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white h-9 w-9"
              onClick={next}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {photoUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photoUrls.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative h-16 w-24 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                i === current ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-80'
              }`}
            >
              <Image src={url} alt={`${alt} thumbnail ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
