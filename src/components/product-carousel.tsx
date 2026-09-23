"use client";

import Carousel from "@/components/ui/carousel";

const VIEW_LABELS = ["Verso", "Frente", "Outro ângulo"];

export function ProductCarousel({ name, images }: { name: string; images: string[] }) {
  const slideData = images.map((src, index) => ({
    title: VIEW_LABELS[index] ?? `Vista ${index + 1}`,
    button: name,
    src,
  }));
  return (
    <div className="relative w-full py-10">
      <Carousel slides={slideData} />
    </div>
  );
}
