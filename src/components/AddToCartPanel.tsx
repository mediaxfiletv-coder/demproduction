"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { EnlargementFrame, type FrameStyle } from "@/components/EnlargementFrame";
import { UploadField } from "@/components/UploadField";
import { useCart } from "@/components/CartProvider";
import { useToast } from "@/components/Toast";
import { formatNaira } from "@/lib/utils";

export type ShopVariant = {
  id: number;
  sizeLabel: string;
  frameType: string;
  frameLabel: string;
  price: number;
};

export type ShopProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  variants: ShopVariant[];
};

export function AddToCartPanel({
  product,
  sampleImage,
}: {
  product: ShopProduct;
  sampleImage: string;
}) {
  const { add } = useCart();
  const { push } = useToast();

  const sizes = useMemo(
    () => [...new Set(product.variants.map((variant) => variant.sizeLabel))],
    [product.variants],
  );
  const [size, setSize] = useState(sizes[0] ?? "");
  const [frameType, setFrameType] = useState<string>(
    product.variants.find((variant) => variant.sizeLabel === sizes[0])?.frameType ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [uploaded, setUploaded] = useState("");

  const frames = product.variants.filter((variant) => variant.sizeLabel === size);
  const selected =
    product.variants.find(
      (variant) => variant.sizeLabel === size && variant.frameType === frameType,
    ) ?? frames[0];

  const previewSrc = uploaded || sampleImage || product.imageUrl || "/images/shop-portrait.jpg";

  function handleAdd() {
    if (!selected) return;
    add(
      {
        productId: product.id,
        variantId: selected.id,
        productName: product.name,
        sizeLabel: selected.sizeLabel,
        frameLabel: selected.frameLabel,
        frameType: selected.frameType,
        unitPrice: selected.price,
        quantity,
        imageUrl: previewSrc,
        uploadedImageUrl: uploaded,
      },
      quantity,
    );
    push(`Added ${quantity} × ${selected.sizeLabel} (${selected.frameLabel}) to cart.`);
  }

  return (
    <div className="luxe-card overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-2">
        {/* Live framed preview */}
        <div className="relative bg-gradient-to-br from-white/[0.04] to-transparent p-8 sm:p-10">
          <div className="mx-auto max-w-sm">
            <EnlargementFrame
              src={previewSrc}
              alt={`${product.name} preview in ${selected?.sizeLabel ?? ""}`}
              sizeLabel={size}
              frameStyle={(selected?.frameType ?? "normal_frame") as FrameStyle}
              priority
            />
            <p className="mt-6 text-center text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-champagne/50">
              {size} · {selected?.frameLabel}
            </p>
          </div>
        </div>

        {/* Configurator */}
        <div className="border-t border-white/10 p-8 sm:p-10 lg:border-l lg:border-t-0">
          <span className="eyebrow">Configure your print</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white">{product.name}</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/55">{product.description}</p>

          <div className="mt-8">
            <span className="label">1 · Select dimension</span>
            <div className="flex flex-wrap gap-2">
              {sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  data-testid={`size-${option.replace(/\s/g, "")}`}
                  onClick={() => {
                    setSize(option);
                    const first = product.variants.find((variant) => variant.sizeLabel === option);
                    if (first) setFrameType(first.frameType);
                  }}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition ${
                    option === size
                      ? "border-gold bg-gold/15 text-gold-light"
                      : "border-white/15 text-white/60 hover:border-white/35"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <span className="label">2 · Choose frame finishing</span>
            <div className="space-y-2">
              {frames.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  data-testid={`frame-${variant.frameType}`}
                  onClick={() => setFrameType(variant.frameType)}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition ${
                    variant.frameType === (selected?.frameType ?? frameType)
                      ? "border-gold bg-gold/10"
                      : "border-white/12 hover:border-white/30"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      {variant.frameLabel}
                    </span>
                    <span className="mt-0.5 block text-[0.68rem] uppercase tracking-[0.16em] text-white/40">
                      {variant.frameType === "normal_frame"
                        ? "Classic wooden frame"
                        : variant.frameType === "acrylic_with_glass"
                          ? "Frameless acrylic + glass"
                          : "Frameless acrylic"}
                    </span>
                  </span>
                  <span className="font-display text-lg font-bold gold-text">
                    {formatNaira(variant.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <UploadField
              value={uploaded}
              onChange={setUploaded}
              testId="shop-upload"
              label="3 · Upload your photograph (optional)"
              hint="Leave empty to use the sample image · JPG, PNG or WEBP · up to 12MB"
            />
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-white/10 pt-7">
            <div>
              <span className="label">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition hover:border-gold/60 hover:text-gold"
                >
                  −
                </button>
                <span
                  data-testid="quantity"
                  className="w-10 text-center font-display text-xl font-bold text-white"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((value) => Math.min(50, value + 1))}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition hover:border-gold/60 hover:text-gold"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-white/40">
                Line total
              </p>
              <p data-testid="line-total" className="font-display text-3xl font-black gold-text">
                {formatNaira((selected?.price ?? 0) * quantity)}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="add-to-cart"
            onClick={handleAdd}
            className="btn btn-gold mt-7 w-full"
          >
            Add to Cart
          </button>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
            <Image
              src="/images/shop-portrait.jpg"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-lg object-cover"
            />
            <p className="text-xs leading-relaxed text-white/50">
              Archival pigment inks, hand-mounted in our Aba workshop. Delivered nationwide in
              5–10 working days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
