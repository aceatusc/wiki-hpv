# HPV Knowledge Wiki — Maintainer Schema

This file configures the LLM agent that maintains this wiki. Read it fully before any ingest,
query, lint, or review. It defines the boundary, the evidence hierarchy, the page formats, and the
workflows. The group co-evolves this file; treat it as the source of truth for *how* the wiki works.

---

## 0. What this is (and is not)

This repository is a **shared study and synthesis resource about HPV** (human papillomavirus). It
organizes and interlinks what the group has collectively read — peer-reviewed research, clinical
guidelines, patient-education references, and patient discussions — into a persistent, compounding
wiki.

> [!warning] Not medical advice
> Nothing in this wiki is medical advice, diagnosis, or a treatment recommendation. It is a synthesis
> of sources, not a substitute for professional care. Anything that would change what someone does —
> especially screening decisions, treatment choices, or anything involving symptoms — belongs in a
> conversation with a qualified clinician. **Synthesis is not advice.** Preserve this boundary on
> every page, so a reader who lands on a single page (not just the overview) cannot mistake it for
> guidance.

The agent's job is the bookkeeping: read sources, tag them by evidence tier, summarize, integrate
into the right pages, flag agreements and conflicts with tiers attached, and keep the index and log
current. The group's job is sourcing, asking good questions, reviewing changes, and carrying
anything that matters to a clinician.

---

## 1. Architecture (three layers)

```
wiki-hpv/
├── CLAUDE.md              ← this schema
├── raw/                   ← LAYER 1: raw sources (IMMUTABLE — never edit)
│   ├── clinical-guidelines/   (tier 1)
│   ├── research-papers/       (tier 2)
│   ├── patient-guides/        (tier 3)
│   └── reddit-discussions/    (tier 4)
└── wiki/                  ← LAYER 2: LLM-owned synthesis (you maintain this)
    ├── overview.md            entry point + boundary + map
    ├── index.md               content catalog (read FIRST on a query)
    ├── log.md                 append-only chronological activity log
    ├── synthesis.md           running cross-tier synthesis + conflict register
    ├── sources/               reddit-index.md (T4 catalog; high-tier sources cataloged in index.md)
    ├── conditions/            HPV infection, warts, dysplasia, cancers
    ├── treatments/            vaccine, screening, wart/lesion tx, supplements
    └── topics/                transmission, clearance, + patient-experience/ (tier-4 themes)
```

- **`raw/` is immutable.** Read from it; never modify it. Members add sources here; the agent treats
  it as ground truth. Each raw file already carries YAML frontmatter (`title`, `source`, `url`,
  `captured`, `tags`) and Obsidian `[[wikilinks]]`.
- **`wiki/` is yours.** Members read it and propose sources/questions; they generally do not
  hand-edit it, which keeps it consistent. You own the evidence-level metadata on every page.

---

## 2. Source tiers (the most important rule)

Tag **every source and every claim** with its tier, regardless of who contributed it. The system
breaks if a Reddit anecdote is treated like a randomized trial.

| Tier | Name | What belongs here | Folder |
|------|------|-------------------|--------|
| **T1** | Synthesized evidence & guidelines | Systematic reviews, meta-analyses, Cochrane reviews, clinical practice guidelines from major bodies (CDC/ACIP, ACS, ACOG, ASCCP, WHO, USPSTF) | `raw/clinical-guidelines/` |
| **T2** | Primary research | RCTs > cohort/case-control > case series/reports; surveillance/pharmacovigilance studies | `raw/research-papers/` |
| **T3** | Expert & editorial | Reputable clinical references and patient-education material (ACS, ACOG, Planned Parenthood, WHO fact sheets), review articles, mainstream medical journalism | `raw/patient-guides/` |
| **T4** | Patient-reported & anecdotal | Reddit threads, forum posts, social media, patient blogs, video testimonials | `raw/reddit-discussions/` |

The folder a source lives in is the **default** tier signal, but judge each source on its merits.
(Example: a WHO fact sheet filed under `patient-guides/` is editorial/reference T3 even though WHO
also issues T1 guidance; a CDC vaccine *recommendation* is T1.) Record the tier you assigned and
why if it differs from the folder default.

### Tier-4 discipline (non-negotiable)
Patient-reported material earns its place — it captures lived experience, side effects patients
actually notice, coping strategies, questions worth investigating, and early signals the literature
is slow to record. But it is anecdotal, unverified, subject to selection/recall bias, and sometimes
simply wrong. Therefore:

1. **Never present T4 material as established fact.** Label it *patient-reported* throughout.
2. **On conflict with a higher tier, say so explicitly**, defer to the stronger evidence, and still
   record that the anecdote exists (with a `> [!warning] Tier conflict` block, see §3).
3. **Do not let a remedy claim borrow authority** from an unrelated real study. (E.g. the EGCG/
   folate/B12/HA "Pervistop" regimen circulating in r/HPV cites a small single-arm study; the wiki
   records the claim *and* its evidence weight — it does not restate it as "this clears HPV.")
4. Be especially careful with threads involving self-harm or acute distress: synthesize the theme
   (HPV diagnosis can cause severe anxiety) and route to support resources; do not quote individuals
   gratuitously.

---

## 3. Page anatomy

Every `wiki/` page (except `index.md`, `log.md`) carries YAML frontmatter:

```yaml
---
entity_type: condition | treatment | symptom | topic | source | overview | synthesis
tags: [hpv, ...]
last_updated: YYYY-MM-DD
source_count: <int>            # how many raw sources currently support this page
evidence_tier_high: T1         # strongest tier supporting the page
evidence_tier_low: T4          # weakest tier supporting the page
contributors: [uscacelab]      # members whose sourcing fed this page
status: draft | reviewed
---
```

Then, immediately after the H1 title, the boundary banner on every condition/treatment/topic/
overview page:

```markdown
> [!warning] Not medical advice — synthesis of sources, not a substitute for clinical care. See [[overview]].
```

### Claim-level evidence convention
Attach a tier marker (and where useful a source `[[wikilink]]`) to substantive claims so a reader
can see whether a statement rests on a meta-analysis or three people in a comment thread:

```markdown
Nearly all cervical cancers are caused by persistent high-risk HPV. `[T1]` [[human-papillomavirus-and-cancer]]
Some patients report supplement regimens "cleared" their HPV. `[T4]` [[clearance-anecdotes]]
```

### Tier-conflict convention
When tiers disagree, render it explicitly and defer to the higher tier:

```markdown
> [!warning] Tier conflict — supplement "cures"
> **T4 (patient-reported):** Many r/HPV users credit Pervistop / EGCG+folate+B12+HA, AHCC, or
> Papilocare for clearing persistent HPV.
> **T1 (guidelines):** There is no treatment for the HPV infection itself; most infections clear via
> the immune system within 1–2 years regardless of intervention. `[T1]` [[human-papillomavirus-and-cancer]]
> **Resolution:** Recorded as patient-reported experience; not established as effective. Clearance in
> these accounts is consistent with the expected natural history.
```

### Source records
The raw markdown files in `raw/` already carry full provenance (YAML frontmatter: citation, link,
date, captured, tags) and are well-structured summaries, so **they serve as the source records** —
cite them directly by their raw slug in `[T*]` markers. The full source **catalog** (every source
with its tier, a one-line summary, and study-quality basics — design, sample size, preprint vs
peer-reviewed, funding/conflicts if noted) lives in `index.md`. The one exception is tier-4: the 50
Reddit threads are cataloged together in `wiki/sources/reddit-index.md` (one line each + theme tags),
since per-thread pages add bookkeeping without proportional value.

If a future raw source is *not* self-summarizing (e.g. a long PDF or an image-heavy paper), write a
dedicated summary page for it in `wiki/sources/` with a slug distinct from any raw basename to avoid
Obsidian link collisions.

---

## 4. Workflows

### Ingest
A member drops a source into `raw/<tier-folder>/` and asks to process it.
1. Read the raw source. Assign its tier (§2); note if it differs from the folder default.
2. Write/update its source-summary page in `wiki/sources/` (provenance, contributor, tier, quality
   basics, takeaways). For T4 batches, update `sources/reddit-index.md` instead of one page each.
3. Update the relevant condition / treatment / topic pages: integrate claims with tier markers, and
   flag agreement / strengthening / conflict with existing claims (`> [!warning] Tier conflict`).
4. Update `index.md` (catalog entry + bump `source_count` / tier range / `last_updated`).
5. Append a `log.md` entry naming the contributor (§5).
6. If the change is treatment-relevant or downgrades/overrides a higher-tier claim → flag for Review
   (§ Review).

### Query
Anyone asks a question against the wiki.
1. Read `index.md` first, then drill into the relevant pages.
2. Answer with citations and the **evidence tier attached to each claim**.
3. Carry the not-medical-advice framing.
4. If the answer is reusable, offer to file it back as a new/updated page so explorations compound.

### Lint
Periodic health-check. Look for:
- Claims resting only on T4 but stated too confidently.
- Tier conflicts that haven't been reconciled.
- Guidelines/studies superseded by newer ones.
- Important treatments/mechanisms lacking a page; missing cross-references; orphans.
- Gaps a targeted literature search could fill — suggest specific questions and stronger sources.
Output suggested fixes; do not silently rewrite contested content — route via Review.

### Review
Recommended for a shared resource. Anything treatment-relevant, or any change that downgrades or
overrides a higher-tier claim, goes via a git branch / PR before it lands on `main`. The git history
records who approved what. Use:
```
git checkout -b ingest/<short-name>
# ... make wiki changes ...
git commit && open a PR for a member to review
```

---

## 5. Indexing & logging

- **`index.md`** is content-oriented: a catalog of every page with a link, a one-line summary, and
  metadata (`last_updated`, `source_count`, tier range). Read it FIRST when answering a query.
- **`log.md`** is chronological and append-only. Each entry uses a grep-able prefix:
  ```
  ## [YYYY-MM-DD] <op> | tier-N | <contributor> | <title>
  ```
  where `<op>` ∈ {ingest, query, lint, review}. So `grep "^## \[" wiki/log.md | tail -5` shows recent
  activity, and you can filter by tier or contributor. Default contributor for this repo: `uscacelab`.

---

## 6. Conventions to preserve

- Match the existing `raw/` style: YAML frontmatter, Obsidian `[[wikilink]]` slugs (filename without
  `.md`), and `> [!info]` / `> [!note]` / `> [!warning]` / `> [!tip]` callouts.
- Link liberally between wiki pages; a `[[link]]` to a page that doesn't exist yet marks a gap to
  fill, not an error.
- Source-summary slugs should be stable; link back to the raw file slug they summarize.
- Keep tiers physically and visibly separated — the `raw/` subfolders and the `T1`–`T4` markers are
  what let members trust pages they didn't write.

## 7. Out of scope (current)
- Per-thread Reddit summary pages (T4 handled as thematic synthesis + `sources/reddit-index.md`).
- CLI search (`qmd`), Marp decks, Dataview tables — add when the wiki grows enough to need them.
