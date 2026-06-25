# HPV Knowledge Wiki

> **Not medical advice.** This resource synthesizes published sources, clinical guidelines, and patient-reported experience. It is not a substitute for professional care. Anything relevant to your health decisions belongs in a conversation with a qualified clinician.

A structured, evidence-tiered knowledge base about HPV (human papillomavirus), built to ground LLM responses in layered information — from clinical guidelines down to lived patient experience — and to surface **unknown unknowns**: things a user didn't know to ask but needs to know.

---

## What this is

Most people who receive an HPV diagnosis, positive screening result, or vaccine question turn to search engines or social media first. The answers they find range from authoritative clinical guidance to anecdotal forum posts — all presented with equal weight. This wiki makes those tiers explicit so an LLM assistant can:

1. **Answer the question asked**, grounded in the strongest available evidence.
2. **Surface adjacent information** the user didn't know they needed (unknown unknowns).
3. **Be honest about evidence weight** — a patient anecdote is valuable, but it is not a clinical trial.

---

## Evidence tiers

Every claim in the wiki carries a tier tag:

| Tag | Source type | Examples |
|-----|-------------|---------|
| `[T1]` | Clinical guidelines & synthesized evidence | CDC/ACIP, WHO, ASCCP, ACS, ACOG |
| `[T2]` | Primary research | RCTs, cohort studies, surveillance analyses |
| `[T3]` | Expert/editorial & patient education | ACS booklets, ACOG FAQs, Planned Parenthood |
| `[T4]` | Patient-reported & anecdotal | Reddit threads, forum posts |

When tiers conflict, the wiki records both sides explicitly and defers to the higher tier.

---

## Architecture

```
wiki-hpv/
├── CLAUDE.md              ← maintainer schema (how the LLM agent maintains this wiki)
├── raw/                   ← immutable source files
│   ├── clinical-guidelines/   (T1)
│   ├── research-papers/       (T2)
│   ├── patient-guides/        (T3)
│   └── reddit-discussions/    (T4)
└── wiki/                  ← LLM-maintained synthesis
    ├── overview.md
    ├── index.md               content catalog
    ├── log.md                 append-only activity log
    ├── synthesis.md           cross-tier agreement + conflict register
    ├── conditions/
    ├── treatments/
    ├── topics/
    └── sources/
```

---

## Example queries

The following queries were run against the wiki to validate the knowledge base. Each answer cites its evidence tier. Notice how responses include information the user did **not** ask for — that is the unknown-unknowns mechanism at work.

---

### What is HPV?

HPV (human papillomavirus) is a group of **more than 200 related viruses** that infect squamous epithelial cells on skin and mucosal surfaces. `[T3]` It is the **most common sexually transmitted infection** — about 43 million people in the US are currently infected, and ~13 million new infections occur each year. `[T3]`

**Types matter:** ~40 types infect the genitals. Low-risk types (HPV 6, 11) cause most genital warts; high-risk types (HPV 16, 18, and others) can persist and eventually cause cancer. `[T3]`

**Natural history:** In ~90% of people, the immune system clears HPV within 1–2 years without lasting harm. `[T1]` A minority of high-risk infections persist — that persistence, not the infection itself, is what carries cancer risk over 15–20 years. `[T1]`

**There is no treatment for the HPV infection itself** — only for what it causes (warts, precancers, cancers). `[T1]` Many patients report supplement regimens that "cleared" their HPV `[T4]`, but this is consistent with natural clearance and is not established as effective. `[T1]`

> **Unknown unknown surfaced:** Most people with HPV have no symptoms and never know they have it — but that doesn't mean it's gone. See [Clearance & Persistence](wiki/topics/clearance-and-persistence.md).

---

### How can I protect against HPV?

Protection is layered — no single measure is complete:

1. **Vaccination** — the most effective preventive measure. `[T1]` Gardasil 9 covers the 9 HPV types responsible for >90% of HPV-related cancers and ~90% of genital warts. `[T3]` Routine vaccination is recommended at **ages 11–12** (can start at 9); catch-up through 26. `[T1]`

2. **Condoms and dental dams** — reduce but do **not** eliminate risk because HPV spreads by skin-to-skin contact across areas not covered by a condom. Use correctly every time. `[T3]`

3. **Fewer sexual partners / knowing partner history** lowers exposure odds. `[T3]`

4. **Not smoking** and voluntary male circumcision reduce persistence and acquisition risk. `[T1]`

5. **Screening** doesn't prevent infection but prevents cancer by catching precancers early. `[T1]`

> **Unknown unknown surfaced:** Even a vaccinated person who has only ever had one partner can test positive for HPV. The virus can be dormant for years before showing up on a test — a new positive result is *not* necessarily evidence of recent infidelity. See [Transmission & Prevention](wiki/topics/transmission-and-prevention.md).

---

### Why should I be worried about HPV?

For **most people**, HPV is a temporary, symptomless infection that resolves on its own. A positive HPV test is not a cancer diagnosis. `[T1]`

**Why it still matters:**

- HPV causes ~39,000 cancers in the US each year across **six cancer types**: cervical, oropharyngeal (throat), anal, penile, vulvar, and vaginal. `[T3]`
- **Nearly all cervical cancers** are caused by HPV — and cervical cancer is the only HPV-related cancer with a routine screening test. `[T1]`
- **Oropharyngeal cancer** (back of the throat) is now the most common HPV-related cancer in men, and there is no standard screening for it. `[T3]`
- Cervical cancer typically develops 15–20 years after initial infection, via a detectable precancer stage — which is exactly what screening is designed to catch. `[T1]`

> **Unknown unknown surfaced:** Patient communities show a strong tendency toward catastrophic thinking after diagnosis (`[T4]` [[psychological-impact]]). The emotional response is valid and real, but the clinical picture for most people is far less dire than it feels. See [Psychological Impact](wiki/topics/patient-experience/psychological-impact.md) and [HPV-Related Cancers](wiki/conditions/hpv-related-cancers.md).

---

### Do I still need Pap smears if I had the HPV vaccine?

**Yes.** Vaccination and screening serve different functions and neither replaces the other. `[T3]`

- Gardasil 9 covers 9 HPV types, but there are other oncogenic types not included. Vaccination is not 100% complete protection. `[T3]`
- **Current ACS guidance (average risk):** Start screening at **25**, continue to at least 65 — regardless of vaccination status, relationship status, or menopausal status. `[T3]`
  - Preferred: primary HPV test (provider-collected cervical sample) every **5 years**
  - Acceptable: self-collected vaginal HPV test every 3 years (FDA-approved at-home option: Teal Wand) `[T1]`
  - Co-test (HPV + Pap) every 5 years
  - Pap alone every 3 years if HPV testing unavailable

**Self-collection accuracy:** When PCR (target-amplification) assays are used, self-collected vaginal samples are **as accurate as clinician-collected cervical samples**. `[T1][T2]` mRNA/signal-amplification assays are less sensitive on self-samples. `[T1]`

> **Unknown unknown surfaced:** ACOG starts screening at 21, while ACS recommends starting at 25 — different professional bodies have different schedules. This gap causes real confusion. Your provider's recommended schedule may reflect your specific history; bring any discrepancy up with them. See [Screening & Testing](wiki/treatments/screening-and-testing.md).

---

### ¿Qué es el VPH?

El VPH (virus del papiloma humano) es un grupo de **más de 200 virus relacionados** que infectan las células epiteliales escamosas de la piel y de las mucosas. `[T3]` Es la **infección de transmisión sexual más común**: alrededor de 43 millones de personas en EE. UU. están infectadas actualmente, y se producen ~13 millones de nuevas infecciones cada año. `[T3]`

**Los tipos importan:** Aproximadamente 40 tipos infectan los genitales. Los tipos de **bajo riesgo** (VPH 6, 11) causan la mayoría de las verrugas genitales; los tipos de **alto riesgo** (VPH 16, 18 y otros) pueden persistir y eventualmente causar cáncer. `[T3]`

**Historia natural:** En ~90 % de las personas, el sistema inmunitario controla o elimina el VPH en 1–2 años sin consecuencias duraderas. `[T1]` Una minoría de infecciones de alto riesgo persiste; esa persistencia — no la infección en sí — es la que conlleva riesgo de cáncer a lo largo de 15–20 años. `[T1]`

**No existe tratamiento para la infección por VPH en sí** — solo para sus consecuencias (verrugas, precánceres, cánceres). `[T1]` Muchos pacientes reportan regímenes de suplementos que "eliminaron" su VPH `[T4]`, pero esto es consistente con la eliminación natural y no está establecido como efectivo. `[T1]`

> **Desconocido desconocido:** La mayoría de las personas con VPH no tienen síntomas y nunca saben que lo tienen; eso no significa que haya desaparecido. Ver [Eliminación y Persistencia](wiki/topics/clearance-and-persistence.md).

---

### ¿Cómo puedo protegerme contra el VPH?

La protección es por capas — ninguna medida por sí sola es completa:

1. **Vacunación** — la medida preventiva más eficaz. `[T1]` La Gardasil 9 cubre los 9 tipos de VPH responsables de >90 % de los cánceres relacionados con el VPH y ~90 % de las verrugas genitales. `[T3]` Se recomienda de rutina a los **11–12 años** (puede comenzar a los 9); recuperación hasta los 26 años. `[T1]`

2. **Condones y barreras dentales** — reducen pero **no eliminan** el riesgo, porque el VPH se transmite por contacto piel a piel en zonas no cubiertas por un condón. Usarlos correctamente en todo momento. `[T3]`

3. **Tener menos parejas sexuales / conocer el historial de la pareja** reduce las probabilidades de exposición. `[T3]`

4. **No fumar** y la circuncisión masculina voluntaria reducen el riesgo de persistencia y adquisición. `[T1]`

5. **Las pruebas de detección** no previenen la infección, pero previenen el cáncer al detectar los precánceres a tiempo. `[T1]`

> **Desconocido desconocido:** Una persona vacunada que ha tenido una sola pareja puede dar positivo en una prueba de VPH. El virus puede permanecer latente durante años — un resultado positivo nuevo no es necesariamente evidencia de infidelidad reciente. Ver [Transmisión y Prevención](wiki/topics/transmission-and-prevention.md).

---

### ¿Por qué debería preocuparme por el VPH?

Para **la mayoría de las personas**, el VPH es una infección temporal y sin síntomas que se resuelve sola. Un resultado positivo de VPH no es un diagnóstico de cáncer. `[T1]`

**Por qué sigue siendo importante:**

- El VPH causa ~39,000 cánceres al año en EE. UU. en **seis tipos de cáncer**: cervical, orofaríngeo (garganta), anal, de pene, vulvar y vaginal. `[T3]`
- **Casi todos los cánceres de cuello uterino** son causados por el VPH — y el cáncer de cuello uterino es el único cáncer relacionado con el VPH que tiene una prueba de detección rutinaria. `[T1]`
- El **cáncer orofaríngeo** (parte posterior de la garganta) es ahora el cáncer relacionado con el VPH más común en hombres, y no existe detección sistemática para él. `[T3]`
- El cáncer de cuello uterino generalmente se desarrolla 15–20 años después de la infección inicial, a través de una etapa de precáncer detectable — que es exactamente lo que está diseñado para detectar la prueba de Papanicolaou. `[T1]`

> **Desconocido desconocido:** Las comunidades de pacientes muestran una fuerte tendencia al pensamiento catastrófico tras el diagnóstico `[T4]`. La respuesta emocional es válida y real, pero el cuadro clínico para la mayoría de las personas es mucho menos grave de lo que parece. Ver [Impacto Psicológico](wiki/topics/patient-experience/psychological-impact.md).

---

### ¿Todavía necesito pruebas de Papanicolaou si me vacuné contra el VPH?

**Sí.** La vacunación y las pruebas de detección sirven funciones diferentes y ninguna reemplaza a la otra. `[T3]`

- La Gardasil 9 cubre 9 tipos de VPH, pero existen otros tipos oncogénicos no incluidos. La vacunación no es una protección del 100 %. `[T3]`
- **Guía actual de la Sociedad Americana del Cáncer (riesgo promedio):** Comenzar las pruebas de detección a los **25 años**, continuar hasta al menos los 65 años, independientemente del estado de vacunación, estado de la relación o estado menopáusico. `[T3]`
  - Preferido: prueba primaria de VPH (muestra cervical recogida por el proveedor) cada **5 años**
  - Aceptable: prueba de VPH vaginal autorecolectada cada 3 años (opción aprobada por la FDA para uso en casa: Teal Wand) `[T1]`
  - Co-prueba (VPH + Papanicolaou) cada 5 años
  - Solo Papanicolaou cada 3 años si la prueba de VPH no está disponible

**Precisión de la autorrecolección:** Cuando se utilizan ensayos de PCR (amplificación de diana), las muestras vaginales autorrecolectadas son **tan precisas como las muestras cervicales recogidas por un clínico**. `[T1][T2]` Los ensayos de ARNm/amplificación de señal son menos sensibles en muestras autorrecolectadas. `[T1]`

> **Desconocido desconocido:** El ACOG recomienda iniciar las pruebas a los 21 años, mientras que la ACS recomienda a los 25 — distintos organismos profesionales tienen calendarios diferentes. Esta discrepancia genera confusión real. Si hay disparidad, consúltelo con su proveedor de salud. Ver [Detección y Pruebas](wiki/treatments/screening-and-testing.md).

---

## How LLM grounding works here

When a user asks any of the questions above, the LLM:

1. Reads `wiki/index.md` to find relevant pages.
2. Pulls claims from condition/treatment/topic pages with their `[T1]`–`[T4]` markers.
3. Checks `wiki/synthesis.md` for known conflicts (e.g. supplement claims vs. guidelines).
4. Surfaces adjacent pages the user didn't ask about — the unknown unknowns.
5. Carries the not-medical-advice boundary on every response.

The evidence tier visible to the reader tells them *how much to trust* a given claim without requiring them to evaluate the source themselves. A `[T4]` patient anecdote is still included (it reflects real experience and emotional truth), but it is never dressed up as `[T1]` evidence.

---

## Contributing

- Drop new sources into the appropriate `raw/<tier-folder>/` directory with YAML frontmatter (`title`, `source`, `url`, `captured`, `tags`).
- Ask the LLM agent to ingest it — it will assign a tier, update the relevant wiki pages, bump `index.md`, and append to `log.md`.
- Treatment-relevant changes or anything that overrides a higher-tier claim go through a branch/PR for human review before merging to `main`.

See [CLAUDE.md](CLAUDE.md) for the full maintainer schema, evidence-tier rules, page anatomy, and workflow instructions.
