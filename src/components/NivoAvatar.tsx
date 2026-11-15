/** Rosto do Nivo (mascote do assistente) num círculo claro. */
export function NivoAvatar({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E4EAE6] ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/nivo-avatar.svg" alt="" width={size} height={size} className="h-[86%] w-[86%] object-contain" />
    </span>
  );
}
