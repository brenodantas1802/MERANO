import Image from "next/image";
import { Lens } from "@/components/ui/lens";
import { ProductCarousel } from "@/components/product-carousel";

export function ProductGallery3D({ name, images }: { name: string; images: string[] }) {
  return (
    <div>
      <Lens zoomFactor={1.8} lensSize={170}>
        <div className="relative aspect-[.86] w-full bg-[var(--cream)]">
          <Image src={images[0]} alt={name} fill priority className="object-cover" />
        </div>
      </Lens>
      <p className="sans mt-4 text-[10px] uppercase tracking-[.15em] text-[var(--muted)]">Passe o mouse para ampliar o tecido</p>
      <ProductCarousel name={name} images={images} />
    </div>
  );
}
