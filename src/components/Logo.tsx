/** Símbolo: camadas de impressão 3D empilhadas formando um nível. */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M24 5 43 14.5 24 24 5 14.5 24 5Z" fill="var(--sage)" />
      <path
        d="M6 22.5 24 31.5l18-9"
        stroke="var(--sage)"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".72"
      />
      <path
        d="M6 30.5 24 39.5l18-9"
        stroke="var(--sage)"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".45"
      />
    </svg>
  );
}

export function Logo({ size = 30, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="text-[1.35rem] font-extrabold leading-none tracking-tight" style={{ fontSize: size * 0.72 }}>
        <span className="text-ink">Nivela</span>
        <span className="text-sage"> 3D</span>
      </span>
    </span>
  );
}
