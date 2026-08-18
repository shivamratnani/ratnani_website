import Link from "next/link";
import { Section } from "@/components/ui/Section";

export default function NotFound() {
  return (
    <Section id="not-found">
      <p className="font-mono text-red text-sm">404</p>
      <h1 className="mt-2 font-medium text-2xl text-ash-3 tracking-tight">Nothing here.</h1>
      <Link href="/" className="link-sweep mt-6 inline-block text-ash-2 text-sm">
        Back home
      </Link>
    </Section>
  );
}
