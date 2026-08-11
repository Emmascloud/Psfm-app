import Link from "next/link";

export default function HomeLink() {
  return (
    <Link
      href="/"
      className="font-data text-sm text-sage hover:text-cream transition-colors"
      aria-label="Back to home"
    >
      ← Home
    </Link>
  );
}
