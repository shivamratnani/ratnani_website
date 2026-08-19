import type { Metadata } from "next";
import { MEASURE } from "@/components/ui/layout";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

const FILE = "/resume.pdf";

export const metadata: Metadata = {
  title: "Resume",
  description: `The current resume for ${site.name}.`,
};

export default function ResumePage() {
  return (
    <Section id="resume" index="—" title="Resume">
      <div className={cn(MEASURE, "mb-8 space-y-5")}>
        <p className="text-ash-2 leading-relaxed">{site.summary}</p>
        <div className="flex flex-wrap gap-5 font-mono text-[11px] uppercase tracking-widest">
          {/* `download` names the saved file; without it browsers keep "resume.pdf". */}
          <a
            href={FILE}
            download="Shivam-Ratnani-Resume.pdf"
            className="link-sweep text-ash-3 transition-colors hover:text-red"
          >
            Download PDF
          </a>
          <a
            href={FILE}
            target="_blank"
            rel="noreferrer noopener"
            className="link-sweep text-ash-1 transition-colors hover:text-ash-2"
          >
            Open in new tab
          </a>
        </div>
      </div>

      {/* Inline viewer for anyone who just wants to read it. Phone browsers
       * either refuse embedded PDFs or paint a single unscrollable page, so
       * below sm the viewer is gone entirely and the links above are the way
       * in; here it is the enhancement, not the path. */}
      <object
        data={FILE}
        type="application/pdf"
        aria-label={`${site.name} resume`}
        className="hidden h-[80svh] w-full rounded-lg border border-ink-3 bg-ink-1 sm:block"
      >
        <p className="p-6 text-ash-1 text-sm">
          Your browser will not display the PDF inline —{" "}
          <a href={FILE} download className="link-sweep text-ash-3">
            download it instead
          </a>
          .
        </p>
      </object>
    </Section>
  );
}
