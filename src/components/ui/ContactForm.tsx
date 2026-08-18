"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const FIELD =
  "w-full rounded-md border border-ink-3 bg-ink-1 px-3 py-2.5 text-ash-3 text-sm outline-none transition-colors duration-300 placeholder:text-ash-1 focus:border-red";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const payload = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Something went wrong.");
      }

      setStatus("sent");
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <p className="rounded-md border border-ink-3 bg-ink-1 px-4 py-6 text-ash-2 text-sm">
        Got it — I&apos;ll reply soon.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Name" maxLength={120} className={FIELD} />
        <input name="email" type="email" required placeholder="Email" className={FIELD} />
      </div>

      <textarea
        name="message"
        required
        rows={5}
        minLength={10}
        maxLength={4000}
        placeholder="What are you building?"
        className={`${FIELD} resize-y`}
      />

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute size-0 opacity-0"
      />

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-md bg-ash-3 px-4 py-2.5 font-medium text-ink-0 text-sm transition-opacity duration-300 hover:opacity-90 disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send"}
        </button>
        {error ? <p className="text-red text-sm">{error}</p> : null}
      </div>
    </form>
  );
}
