export type Role = {
  company: string;
  title: string;
  location: string;
  start: string;
  end: string | "Present";
  /** Recent roles render expanded; the rest sit behind the "earlier" toggle. */
  tier: "primary" | "earlier";
  /** Public site for the company, shown under the summary where present. */
  url?: string;
  /** The single collapsed line. Condensed from `summary` — never longer. */
  tagline: string;
  summary: string;
  highlights?: readonly string[];
};

/**
 * Single source of truth for work history — consumed by the timeline, the
 * command palette, and the generated OG images.
 *
 * Sourced from the resume, with five roles the resume omits pulled from the
 * LinkedIn export. Where the two disagree the resume wins (Shiv's call):
 *   - Expert AI title is "Lead Software Engineer", not "Software Engineer".
 *   - Rightworks runs Jul–Aug 2024, not Jun–Aug 2024.
 * Where this file outranks both (Shiv's call, 2026-08-18): the Alura founding
 * role and Paradym carry "Co-Founder & CTO", ahead of either export.
 */
export const experience: readonly Role[] = [
  {
    company: "CollectWise",
    title: "Forward Deployed Engineer, Founding",
    location: "Manhattan, NY",
    start: "2026-01",
    end: "Present",
    tier: "primary",
    url: "https://collectwise.com",
    tagline: "Payment, voice, and observability infrastructure across 20+ enterprise accounts",
    summary:
      "FDE on the founding team, owning end-to-end client integrations and the payment, voice, and observability infrastructure underneath them.",
    highlights: [
      "Own end-to-end integrations across 20+ enterprise accounts generating $150K–$200K MRR, working directly with client CEOs from scoping through production launch.",
      "Built and maintain payment processing handling $10M+ in live consumer debt payments monthly; diagnose and resolve production payment failures to protect collections revenue.",
      "Architected SIP trunking and caller ID reputation infrastructure (Jambonz, HAProxy, Five9, LiveKit) supporting 500K–1M AI voice calls monthly; evaluated attestation vendors to preserve answer rates.",
      "Implemented FDCPA/TCPA/Reg F compliance infrastructure including validation letters and SMS consent systems.",
      "Resolved incidents spanning payment processors, SFTP webhook CPU saturation, and dialer throughput; built CloudWatch/Grafana observability across AWS and Fly.io processing 10–50K logs/hr.",
    ],
  },
  {
    company: "Paradym",
    title: "Co-Founder & CTO",
    location: "Remote",
    start: "2026-06",
    end: "Present",
    tier: "primary",
    url: "https://paradym.space",
    tagline:
      "Catching silent API failures for the forward deployed teams and agencies shipping them",
    summary:
      "Outside-in monitoring for the APIs and MCP servers agents are built on: silent breaking changes get caught, confirmed, and turned into ready-made pull requests before the teams shipping them hear it from a user.",
    highlights: [
      "Built the detection engine that exercises third-party APIs and MCP servers from the consumer's side, so silent breaking changes surface as confirmed contract diffs rather than user reports.",
      "Ship confirmed changes as ready-made pull requests against the consuming codebase, turning an outage investigation into a merge.",
      "Run graded, multi-channel alerting so a break reaches the right team once, with the diff attached.",
    ],
  },
  {
    company: "Alura",
    title: "Technical Advisor",
    location: "San Francisco, CA",
    start: "2026-01",
    end: "Present",
    tier: "primary",
    url: "https://alura.love",
    tagline: "Architecture and technical direction after shipping v0",
    summary: "Advising on architecture and technical direction after building v0.",
    highlights: [
      "Advise on system architecture, infrastructure choices, and technical trade-offs as the product scales past the v0 I built.",
      "Review engineering plans and unblock the team on the hard technical calls.",
    ],
  },
  {
    company: "Alura",
    title: "Co-Founder & CTO",
    location: "San Francisco, CA",
    start: "2025-11",
    end: "2026-01",
    tier: "primary",
    tagline: "First engineer — built v0 and the infrastructure under it",
    summary: "First engineer; built the initial product and infrastructure.",
    highlights: [
      "Designed and shipped v0 end-to-end as the first engineer — product, backend, and the deployment infrastructure under it.",
      "Set the initial architecture and technical direction the team still builds on.",
    ],
  },
  {
    company: "Expert AI",
    title: "Lead Software Engineer",
    location: "Farmington Hills, MI",
    start: "2025-05",
    end: "2025-11",
    tier: "primary",
    tagline: "Clinician recordings to SOAP notes and billing codes, straight into the EHR",
    summary:
      "Led architecture for a healthcare AI platform turning clinician recordings into SOAP notes and billing codes delivered straight into an EHR.",
    highlights: [
      "Rebuilt the platform across API, web, and mobile with an agentic SOAP-note pipeline — parallelized sub-agents and a six-tier priority queue — reaching 92%+ structured-note acceptance with one-click Athena import.",
      "Cut failed EHR uploads from 15% to under 3% for 100+ physicians, preventing lost charges.",
      "Migrated Flask to FastAPI and refactored to asyncio, doubling throughput and dropping p90 latency from 600ms to 200ms.",
      "Designed a central document aggregator injected into each SOAP subagent, reducing retries by 97%.",
      "Launched a MedicalGPT product (Python API + Next.js UI) with six clinician modes across lab analysis, record analysis, differential diagnosis, treatment planning, guideline lookup, and general Q&A.",
      "Fine-tuned MedGemma 27B-it on Vertex AI against thousands of non-PHI examples, achieving ≤6s TTFT.",
      "Built a CI/CD pipeline on GCP Cloud Run with dev and prod containers, cutting buggy deployments from 29% to 4%.",
      "Operated as de facto tech lead, managing contractors to deliver the web revamp on schedule.",
    ],
  },
  {
    company: "ActiveLinks",
    title: "Co-Founder, Lead Developer",
    location: "Madison, WI",
    start: "2024-12",
    end: "2025-11",
    tier: "primary",
    tagline: "Swift/SwiftUI iOS app with real-time sync, 500+ beta users",
    summary:
      "Built an iOS application in Swift/SwiftUI serving 500+ beta users with real-time data synchronization.",
    highlights: [
      "Led product and engineering end-to-end as co-founder, from concept through a 500+ user beta.",
      "Built real-time data synchronization in Swift/SwiftUI; the product itself sits under NDA.",
    ],
  },
  {
    company: "EduTools",
    title: "Co-Founder, Lead Developer",
    location: "Madison, WI",
    start: "2024-05",
    end: "2025-01",
    tier: "primary",
    tagline: "Textbooks and lecture notes into collaborative knowledge bases for 1,000+ users",
    summary:
      "Founded a secure educational platform turning textbooks, transcripts, and notes into collaborative knowledge bases for 1,000+ users.",
    highlights: [
      "Built OCR and PDF parsing pipelines that turn textbooks, transcripts, and notes into personalized knowledge bases.",
      "Architected a dual-LLM system pairing Mistral-7B for content analysis with specialized models (LLama3, Gemma2, Qwen2.5-coder, Claude 3.5 Sonnet) for targeted educational tasks.",
      "Built a cross-platform desktop app with Electron, React, and Node.js, deployed on Azure with a microservices architecture.",
      "Migrated from AWS to Azure using App Services, Blob Storage, CosmosDB, and Functions.",
    ],
  },
  {
    company: "Rightworks",
    title: "Software Engineer Intern",
    location: "Nashua, NH",
    start: "2024-07",
    end: "2024-08",
    tier: "earlier",
    tagline: "21 critical bugs cleared in an AngularJS app serving 300,000+ users",
    summary:
      "Resolved 21 critical bugs in AccessHub's AngularJS app for 300,000+ active users; built a Windows C# client and monitored API performance with DataDog.",
    highlights: [
      "Resolved 21 critical bugs and designed new state management for AccessHub's AngularJS app, improving stability for 300,000+ active users.",
      "Developed a Windows AccessHub client in C# and monitored API performance with DataDog.",
    ],
  },
  {
    company: "IHConcepts",
    title: "Software Developer",
    location: "Madison, WI",
    start: "2023-10",
    end: "2024-04",
    tier: "earlier",
    tagline: "Full-stack React and Next.js work, plus a reusable cross-browser UI kit",
    summary:
      "Built full-stack applications with React, Next.js, and TypeScript, delivering reusable cross-browser UI components.",
    highlights: [
      "Built and maintained full-stack web applications with React, Next.js, and TypeScript.",
      "Delivered reusable cross-browser UI components, collaborating with engineers on design and code quality.",
    ],
  },
  {
    company: "Amara Social",
    title: "Software Developer",
    location: "Remote",
    start: "2023-12",
    end: "2024-03",
    tier: "earlier",
    tagline: "React Native social app with real-time messaging and a recommended feed",
    summary:
      "Built a cross-platform React Native social app with real-time messaging, profiles, and a recommended feed, containerized with Docker over MySQL.",
    highlights: [
      "Developed a cross-platform React Native social app for iOS and Android with real-time messaging, user profiles, and a recommended/friends feed.",
      "Containerized the stack with Docker over MySQL for scalable deployment.",
    ],
  },
  {
    company: "Couillard Solar Foundation",
    title: "Software Engineer",
    location: "Madison, WI",
    start: "2023-08",
    end: "2024-12",
    tier: "earlier",
    tagline: "Interactive visualization of solar output across seven arrays in Deerfield, WI",
    summary:
      "Built an interactive visualization of solar output across seven arrays in Deerfield, WI using Svelte, Vite, and Plotly.js, backed by Firebase and GitHub Actions.",
    highlights: [
      "Built an interactive visualization of solar output across seven arrays with Svelte, Vite, and Plotly.js, showcasing renewable energy in small communities.",
      "Integrated Firebase and GitHub Actions for real-time data, authentication, and hosting.",
      "Set up state management and HMR with a clean migration path to SvelteKit.",
    ],
  },
  {
    company: "PerkinElmer",
    title: "Information Technology Intern",
    location: "Remote",
    start: "2021-07",
    end: "2021-08",
    tier: "earlier",
    tagline: "Network and account administration across Google Admin Suite and Windows",
    summary:
      "Administered network and user accounts across Google Admin Suite and Windows, provisioned machines, and authored internal documentation.",
    highlights: [
      "Administered the company network and user accounts across Google Admin Suite and Windows.",
      "Supported remote employees with file access, repaired and provisioned machines for new hires, and authored documentation for application usage and data transfer.",
    ],
  },
] as const;

export const education = {
  school: "University of Wisconsin–Madison",
  degree: "BS, Computer Science & Data Science",
  start: "2022-09",
  end: "2025-05",
} as const;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "2026-01" -> "Jan 2026". Passes "Present" through untouched. */
export function formatPeriod(value: string): string {
  if (value === "Present") return value;
  const [year, month] = value.split("-");
  const label = MONTHS[Number(month) - 1];
  return label && year ? `${label} ${year}` : value;
}
