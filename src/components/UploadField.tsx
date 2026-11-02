"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toast";

/** Uploads a customer photograph to the server and returns its public URL. */
export function UploadField({
  value,
  onChange,
  label = "Upload your photograph",
  hint = "JPG, PNG or WEBP · up to 12MB",
  testId,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  testId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const { push } = useToast();

  useEffect(() => {
    if (!uploading) return;
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(92, current + Math.random() * 18));
    }, 180);
    return () => window.clearInterval(timer);
  }, [uploading]);

  async function handleFile(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Image must be smaller than 12MB.");
      return;
    }
    setUploading(true);
    setProgress(6);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const payload = (await response.json()) as { ok?: boolean; url?: string; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Upload failed.");
      }
      setProgress(100);
      onChange(payload.url ?? "");
      push("Photograph uploaded successfully.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      window.setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 350);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        data-testid={testId}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] px-5 py-8 text-center transition hover:border-gold/50 hover:bg-gold/5"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Uploaded photograph preview"
            className="max-h-40 rounded-lg object-contain"
          />
        ) : (
          <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-gold">
            ↑
          </span>
        )}
        <span className="text-sm font-semibold text-white">
          {value ? "Change photograph" : uploading ? "Uploading…" : "Choose a photograph"}
        </span>
        <span className="text-xs text-white/40">{hint}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
      </div>

      {uploading ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-light to-gold transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}

      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/45 hover:text-red-300"
        >
          Remove photograph
        </button>
      ) : null}
    </div>
  );
}
