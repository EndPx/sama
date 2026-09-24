import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type EducationHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  art: ReactNode;
  tone?: "paper" | "forest";
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
};

export function EducationHero({
  eyebrow,
  title,
  description,
  art,
  tone = "paper",
  primary,
  secondary,
}: EducationHeroProps) {
  return (
    <section className="education-hero page-shell">
      <div className="education-hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lede">{description}</p>
        <div className="education-hero-actions">
          <Button size="lg" asChild>
            <Link href={primary.href}>
              {primary.label} <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
          {secondary && (
            <Link className="text-link" href={secondary.href}>
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
      <div
        className={`education-hero-art${tone === "forest" ? " education-art-dark" : ""}`}
      >
        {art}
      </div>
    </section>
  );
}
