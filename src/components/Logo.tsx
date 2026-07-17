export function BenduMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="32" cy="32" r="30" fill="var(--teal)" />
      <circle cx="32" cy="32" r="20" fill="var(--ink)" />
    </svg>
  );
}

export function RefractionIllustration({ width = 220 }: { width?: number }) {
  return (
    <svg
      width={width}
      viewBox="0 0 220 110"
      role="img"
      aria-label="A beam of light passing through a lens, splitting into a clarified beam and a shadow"
      style={{ display: 'block' }}
    >
      <path d="M 18 55 L 92 41 L 92 69 Z" fill="var(--teal)" opacity="0.28" />
      <circle
        cx="110"
        cy="55"
        r="20"
        fill="none"
        stroke="var(--teal)"
        strokeWidth="5"
      />
      <path d="M 128 46 L 202 32 L 202 50 L 131 58 Z" fill="var(--teal)" opacity="0.55" />
      <path d="M 128 64 L 192 82 L 164 89 L 128 70 Z" fill="var(--ink)" opacity="0.82" />
    </svg>
  );
}
