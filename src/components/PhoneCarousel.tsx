"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface Slide {
  src: string;
  title: string;
  text: string;
}

export function PhoneCarousel({ slides, prevLabel = "Tela anterior", nextLabel = "Próxima tela" }: { slides: Slide[]; prevLabel?: string; nextLabel?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const item = el.firstElementChild as HTMLElement | null;
      if (!item) return;
      const step = item.offsetWidth + 20;
      setActive(Math.min(slides.length - 1, Math.round(el.scrollLeft / step)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  const go = (i: number) => {
    const el = track.current;
    const item = el?.children[Math.max(0, Math.min(slides.length - 1, i))] as HTMLElement | undefined;
    if (el && item) {
      const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
      el.scrollTo({ left: item.offsetLeft - el.offsetLeft - pad, behavior: "smooth" });
    }
  };

  return (
    <div className="min-w-0">
      <div
        ref={track}
        className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto scroll-smooth px-5 pb-4 lg:scroll-px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:px-0"
      >
        {slides.map((s, i) => (
          <figure key={s.src} className="w-[68%] max-w-[260px] shrink-0 snap-start sm:w-[230px]">
            <div className="overflow-hidden rounded-[2rem] border-[6px] border-[#182B30] bg-[#182B30] shadow-[0_24px_50px_-24px_rgba(24,43,48,0.55)]">
              <Image src={s.src} alt={s.title} width={780} height={1688} className="h-auto w-full rounded-[1.6rem]" sizes="260px" loading={i < 3 ? "eager" : "lazy"} />
            </div>
            <figcaption className="mt-4 px-1">
              <p className="font-bold">{s.title}</p>
              <p className="mt-0.5 text-[15px] leading-snug text-muted">{s.text}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5" aria-hidden="true">
          {slides.map((_, i) => (
            <span key={i} className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-primary" : "w-2 bg-line"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(active - 1)} disabled={active === 0} className="btn-ghost h-11 w-11 p-0" aria-label={prevLabel}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => go(active + 1)} disabled={active === slides.length - 1} className="btn-ghost h-11 w-11 p-0" aria-label={nextLabel}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
