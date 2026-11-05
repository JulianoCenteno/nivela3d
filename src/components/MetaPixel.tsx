"use client";

import Script from "next/script";
import { useEffect } from "react";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1446277194358187";

const VALUES: Record<string, number> = {
  A79133B6: 19.9, // Iniciante
  "3DC61E0F": 39.9, // Profissional
  "114379DF": 79.9, // Empresa
};

type Fbq = (...args: unknown[]) => void;

/**
 * Pixel da Meta nas páginas de venda (/ e /oferta).
 * PageView + ViewContent ao abrir; InitiateCheckout ao clicar num plano.
 * Os parâmetros da URL (utm_*, fbclid) seguem para o checkout para a atribuição.
 */
export function MetaPixel({ page }: { page: "landing" | "upsell" }) {
  useEffect(() => {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    fbq?.("track", "ViewContent", { content_name: page === "upsell" ? "Nivela 3D — Oferta" : "Nivela 3D", content_category: "assinatura" });

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.("a") as HTMLAnchorElement | null;
      if (!a || !a.href.includes("pay.nivela3d.com.br")) return;
      const code = a.href.split("/c/")[1]?.split(/[?#]/)[0] ?? "";
      (window as unknown as { fbq?: Fbq }).fbq?.("track", "InitiateCheckout", { value: VALUES[code] ?? 0, currency: "BRL", content_ids: [code] });
      const src = new URLSearchParams(window.location.search);
      if ([...src.keys()].length) {
        const u = new URL(a.href);
        src.forEach((v, k) => { if (k !== "volta" && !u.searchParams.has(k)) u.searchParams.set(k, v); });
        a.href = u.toString();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [page]);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');fbq('track','PageView');`}</Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  );
}
