import { Github, FileText, Presentation } from "lucide-react";
import { RESEARCH_DISCLAIMER, SITE_LINKS } from "../data/scientificContent";

const resourceLinks = [
  { href: SITE_LINKS.github, label: "GitHub", icon: Github },
  { href: SITE_LINKS.paper, label: "Paper", icon: FileText },
  { href: SITE_LINKS.poster, label: "Poster & reports", icon: Presentation },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-neuro-card/40">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <p className="rounded-lg border border-amber-500/35 bg-amber-950/40 px-4 py-3 text-sm leading-relaxed text-amber-100">
          <span className="font-semibold text-amber-200">{RESEARCH_DISCLAIMER.split(".")[0]}.</span>
          {RESEARCH_DISCLAIMER.slice(RESEARCH_DISCLAIMER.indexOf(".") + 1)}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">NeuroVision Neuro</p>
            <p className="text-xs text-slate-500">
              AD-associated astrocyte atlas · Allen WHB + SEA-AD
            </p>
          </div>

          <nav className="flex flex-wrap gap-4" aria-label="Project resources">
            {resourceLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-blue-300"
              >
                <Icon size={16} />
                {label}
              </a>
            ))}
          </nav>
        </div>

        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} Neuro-AI Brain Cell Atlas. Built on Allen Institute WHB
          and SEA-AD public data.
        </p>
      </div>
    </footer>
  );
}
