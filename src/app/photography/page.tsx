import type { Metadata } from "next";
import { Gallery } from "@/components/ui/Gallery";
import { Section } from "@/components/ui/Section";
import { photos } from "@/data/photos";

export const metadata: Metadata = {
  title: "Photography",
  description: "A small set of frames worth keeping.",
};

export default function PhotographyPage() {
  return (
    <Section id="photography" index="—" title="Photography">
      <p className="mb-8 text-ash-2 leading-relaxed">
        A small set of frames worth keeping. Click any of them for the full-resolution original.
      </p>
      <Gallery photos={photos} />
    </Section>
  );
}
