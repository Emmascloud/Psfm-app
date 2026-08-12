export default function Avatar({
  url,
  name,
  size = 40,
  online,
}: {
  url: string | null | undefined;
  name: string;
  size?: number;
  online?: boolean;
}) {
  const dot = online !== undefined && (
    <span
      className={`absolute rounded-full border-2 border-ink ${online ? "bg-emerald-400" : "bg-sage/40"}`}
      style={{ width: size * 0.28, height: size * 0.28, bottom: -1, right: -1 }}
      aria-label={online ? "Online" : "Offline"}
    />
  );

  if (url) {
    return (
      <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          width={size}
          height={size}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
        {dot}
      </span>
    );
  }
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <div
        className="rounded-full bg-marigold text-ink-on-paper font-display flex items-center justify-center"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      {dot}
    </span>
  );
}
