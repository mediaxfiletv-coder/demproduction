import Image from "next/image";

export type FrameStyle = "normal_frame" | "acrylic_with_glass" | "acrylic_without_glass";

const RATIOS: Record<string, { w: number; h: number }> = {
  "16 × 20 in": { w: 4, h: 5 },
  "24 × 30 in": { w: 4, h: 5 },
  "30 × 60 in": { w: 1, h: 2 },
  "36 × 72 in": { w: 1, h: 2 },
};

/**
 * Renders a photographic enlargement inside a realistic frame preview.
 * `sizeLabel` drives the aspect ratio, `frameStyle` the finishing.
 */
export function EnlargementFrame({
  src,
  alt,
  sizeLabel,
  frameStyle,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  sizeLabel?: string;
  frameStyle: FrameStyle;
  className?: string;
  priority?: boolean;
}) {
  const ratio = (sizeLabel && RATIOS[sizeLabel]) || { w: 3, h: 4 };
  const aspect = `${ratio.w} / ${ratio.h}`;

  const shellClass =
    frameStyle === "normal_frame"
      ? "frame-normal"
      : frameStyle === "acrylic_with_glass"
        ? "frame-acrylic"
        : "frame-acrylic";

  return (
    <div className={`frame-shell ${shellClass} ${className}`}>
      <div className="frame-mat" style={{ aspectRatio: aspect }}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 90vw, 40vw"
          priority={priority}
          className="object-cover"
        />
        {frameStyle === "acrylic_with_glass" ? <span className="glass-sheen" /> : null}
        {frameStyle === "normal_frame" ? (
          <span className="glass-sheen opacity-40" />
        ) : null}
      </div>
    </div>
  );
}
