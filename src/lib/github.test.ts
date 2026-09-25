import { describe, expect, it } from "vitest";
import { parseContributionsHtml, toWeeks } from "./github";

/** Two cells in GitHub's markup: attribute order varies, tooltips follow the table. */
const cell = (date: string, id: string, level: number) =>
  `<td tabindex="0" data-date="${date}" id="${id}" data-level="${level}" class="ContributionCalendar-day"></td>`;
const tip = (id: string, text: string) =>
  `<tool-tip id="t-${id}" for="${id}" popover="manual" class="sr-only">${text}</tool-tip>`;

describe("parseContributionsHtml", () => {
  const html = [
    cell("2026-01-02", "c-5-0", 3),
    cell("2026-01-01", "c-4-0", 0),
    cell("2026-01-03", "c-6-0", 4),
    tip("c-4-0", "No contributions on January 1st."),
    tip("c-5-0", "1 contribution on January 2nd."),
    tip("c-6-0", "1,204 contributions on January 3rd."),
  ].join("\n");

  it("reads counts from tooltips, sorted oldest first", () => {
    expect(parseContributionsHtml(html, "2026-12-31")).toEqual([
      { date: "2026-01-01", count: 0, level: 0 },
      { date: "2026-01-02", count: 1, level: 3 },
      { date: "2026-01-03", count: 1204, level: 4 },
    ]);
  });

  it("drops days after today", () => {
    expect(parseContributionsHtml(html, "2026-01-02").map((day) => day.date)).toEqual([
      "2026-01-01",
      "2026-01-02",
    ]);
  });

  it("throws when the markup yields nothing", () => {
    expect(() => parseContributionsHtml("<html></html>", "2026-12-31")).toThrow();
  });
});

describe("toWeeks", () => {
  it("starts a new column on each Sunday", () => {
    // 2026-01-01 is a Thursday; 2026-01-04 a Sunday.
    const days = ["01", "02", "03", "04", "05"].map((d) => ({
      date: `2026-01-${d}`,
      count: 0,
      level: 0,
    }));
    expect(toWeeks(days).map((week) => week.map((day) => day.date.slice(-2)))).toEqual([
      ["01", "02", "03"],
      ["04", "05"],
    ]);
  });
});
