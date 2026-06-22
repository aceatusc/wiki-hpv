---
title: "Real-world safety of HPV vaccines over 18 y: A comprehensive analysis of U.S. VAERS reports"
source: Human Vaccines & Immunotherapeutics (Taylor & Francis)
type: journal-article
article_type: research-article
journal: "Human Vaccines & Immunotherapeutics"
year: 2025
citation: "Hum Vaccin Immunother. 2025 Dec;21(1):2539590. Epub 2025 Aug 1."
doi: 10.1080/21645515.2025.2539590
pmid: 40746171
pmcid: PMC12320879
license: CC BY-NC
url: https://www.tandfonline.com/doi/full/10.1080/21645515.2025.2539590
captured: 2026-06-21
tags:
  - hpv
  - vaccination
  - vaccine-safety
  - vaers
  - pharmacovigilance
  - journal-article
---

# Real-world safety of HPV vaccines over 18 y: A comprehensive analysis of U.S. VAERS reports

> [!info] Citation
> Su Y, Huang Y, Wei J, Wang X, Zhou Y, Wu X, Fu H.
> *Human Vaccines & Immunotherapeutics.* 2025 Dec;21(1):2539590. Epub 2025 Aug 1.
> DOI: [10.1080/21645515.2025.2539590](https://doi.org/10.1080/21645515.2025.2539590) · PMID: 40746171 · PMCID: PMC12320879 · License: CC BY-NC
> <https://www.tandfonline.com/doi/full/10.1080/21645515.2025.2539590>

> [!note] Access note
> The Taylor & Francis page is behind a Cloudflare bot challenge; full text below was reconstructed from the open-access PMC version (PMC12320879). Figures are referenced but not reproduced.

Related notes: [[hpv-vaccine-recommendations]] · [[human-papillomavirus-infection-and-vaccination]] · [[hpv-human-papillomavirus]]

## Authors & affiliations
Yonglong Su¹, Yirong Huang², Jinbao Wei¹, Xinjin Wang³, Yanyan Zhou¹, Xiaohong Wu¹, Honghong Fu³

1. Xiamen Haicang Hospital, Xiamen, Fujian Province, China
2. Fujian Medical University Union Hospital, Fuzhou, Fujian Province, China
3. Fujian Institute for Food and Drug Quality Control, Fuzhou, Fujian Province, China

## Abstract

Human papillomavirus (HPV) vaccination is central to preventing cervical and other HPV-associated cancers. Although clinical trials have established favorable safety profiles, long-term, brand-specific real-world data remain limited. We evaluated adverse events (AEs) reported to the U.S. Vaccine Adverse Event Reporting System (VAERS) for Cervarix® (bivalent), Gardasil® (quadrivalent), and Gardasil-9® (9-valent) between January 2006 and December 2024. Domestic VAERS reports listing ≥1 HPV vaccine were extracted, deduplicated, and classified by brand. Disproportionality analyses were performed using reporting odds ratios (RORs) and 95% confidence intervals (CIs), adjusting for multiplicity with a 5% Benjamini–Hochberg false discovery rate (FDR). Time-to-onset was assessed with Kaplan–Meier analysis. This analysis of 76,575 HPV vaccine adverse event reports shows improving safety profiles across vaccine generations. Serious adverse events decreased significantly from Cervarix® (33.4%) to Gardasil® (16.2%) to Gardasil-9® (7.8%). The most common signals were presyncope for Cervarix® (ROR 11.5) and administration errors for Gardasil® and Gardasil-9®, including inappropriate scheduling (ROR 19.5) and incorrect storage (ROR 12.1). Most adverse events (82.9%) occurred within 7 d post-vaccination, with 62.5% occurring on the same day. Gardasil-9® exhibited the narrowest IQR for time to onset (0–1 d), compared to other HPV vaccines. HPV vaccines demonstrate a consistent, favorable safety profile in U.S. real-world practice. Most reported AEs were acute vasovagal reactions, and strongest signals reflected preventable errors. Strengthening provider education in cold-chain management and schedule adherence may further enhance vaccine safety. Continued active surveillance is recommended.

## Introduction

Infection with high-risk HPV types is a necessary cause of nearly all cervical cancers and contributes substantially to anogenital and oropharyngeal malignancies. In 2020, an estimated 604,000 new cases of cervical cancer and 342,000 related deaths occurred globally, with over 90% of cases in low- and middle-income countries. The WHO has set a 2030 goal of 90% HPV vaccination coverage among girls.

In the United States, three prophylactic HPV vaccines have been licensed: quadrivalent Gardasil® (2006), bivalent Cervarix® (2009), and 9-valent Gardasil-9® (2014). Each demonstrated >90% efficacy against vaccine-type high-grade cervical lesions in phase 3 trials. Since 2006, more than 135 million doses have been distributed nationwide; recommendations have expanded to males and adults up to 45 y via shared clinical decision-making.

VAERS, jointly managed by the CDC and FDA, is a passive surveillance system for early safety signals. Initial analyses identified syncope as the predominant acute AE and found no unexpected serious risks, but earlier evaluations had shorter follow-up and did not fully capture Gardasil-9's profile. This study, using 18 years of VAERS data, aimed to (i) describe longitudinal reporting trends; (ii) compare demographic and seriousness profiles across brands; (iii) detect disproportionality signals with FDR adjustment; and (iv) evaluate time-to-onset distributions.

## Methods

- **Data source:** Publicly available VAERS data (2025 Q1 release). U.S. reports listing ≥1 HPV vaccine code retained. Duplicate case IDs resolved by preserving the most complete record; foreign reports excluded.
- **Case definitions:** Vaccines categorized as Cervarix® (HPV2), Gardasil® (HPV4), Gardasil-9® (HPV9). Serious AEs defined per FDA MedWatch criteria (death, life-threatening illness, hospitalization, permanent disability, congenital anomaly). Percentages calculated relative to total reports per brand.
- **Statistics:** Descriptive statistics for annual counts, sex, age groups (0–8, 9–26, 27–45, ≥46 y), and seriousness. Disproportionality via 2×2 tables comparing each brand against all other vaccines; RORs and 95% CIs by Woolf method. Signal = ≥3 reports and lower 95% CI limit >1; FDR controlled at 5% (Benjamini–Hochberg). Kaplan–Meier curves for time-to-onset (χ² test for trend).
- **Software:** R 4.4.2 (tidyverse, epitools, survival, ggplot2).

## Results

### Descriptive overview
From Jan 1, 2006 to Dec 31, 2024, **76,575** HPV vaccine AE reports met inclusion criteria: Cervarix® 5,004 (6.5%), Gardasil® 47,539 (62.1%), Gardasil-9® 24,032 (31.4%). Annual reports peaked in 2008 (Gardasil), 2010 (Cervarix), and 2021 (Gardasil-9). Overall, 68% of reports involved females. Among vaccines with known sex, Gardasil-9® had the highest male proportion (35.3%) vs 11.1% (Gardasil®) and 3.0% (Cervarix®). The 9–26 y age group dominated (64.9% Cervarix®, 68.8% Gardasil®, 57.1% Gardasil-9®).

**Serious reports declined across generations:** 33.4% (Cervarix®) → 16.2% (Gardasil®) → 7.8% (Gardasil-9®). Deaths were rare — 504 total (0.6%): 45 (0.9%) Cervarix®, 401 (0.8%) Gardasil®, 58 (0.2%) Gardasil-9®.

Death did **not** meet signal detection criteria for any HPV vaccine (all RORs <1.0): Cervarix® ROR 0.43 (0.31–0.60), Gardasil® 0.70 (0.63–0.77), Gardasil-9® 0.23 (0.17–0.31) — indicating significantly lower proportional reporting of deaths following HPV vaccination than other vaccines.

#### Severity outcomes by vaccine (Table 1, summary)

| Vaccine | Reports (n, %) | Serious (n, %) | Deaths (n, %) |
|---|---|---|---|
| Cervarix® | 5,004 (6.5%) | 1,668 (33.3%) | 45 (0.9%) |
| Gardasil® | 47,539 (62.1%) | 7,709 (16.2%) | 401 (0.8%) |
| Gardasil-9® | 24,032 (31.4%) | 1,878 (7.8%) | 58 (0.2%) |
| **Total** | **76,575 (100%)** | **11,255 (14.7%)** | **504 (0.6%)** |

### Disproportionality signals
After FDR adjustment, **218 MedDRA preferred terms (PTs)** met signal criteria.

- **Cervarix®:** vasovagal-related events predominated; top signal **presyncope** (ROR 11.5; 95% CI 10.5–12.7).
- **Gardasil® and Gardasil-9®:** primarily administration-related errors — strongest signals **inappropriate schedule adherence** (ROR 19.5; 18.6–20.4) and **improper storage** (ROR 12.1; 11.6–12.6).

No neurological or autoimmune PTs — including Guillain–Barré syndrome and demyelinating diseases — surpassed the signal detection threshold. Mortality showed no safety signal (combined ROR 0.70; 95% CI 0.65–0.76).

### Time-to-onset analysis
Among 51,436 reports with valid onset dates, median time to symptom onset was **0 days** for all brands (overall IQR 0–2). IQRs narrowed across generations: Cervarix® 0–7 d, Gardasil® 0–3 d, Gardasil-9® 0–1 d. Serious events showed delayed onset (median 5 d, IQR 0–44) vs all events (median 0 d, IQR 0–2).

Symptom-onset breakdown: **62.5%** (n=32,692) on vaccination day, 20.4% (n=10,703) within 1–7 d, 6.3% (n=3,287) within 8–30 d. Overall, **82.9%** occurred within the first week and 89.2% within 30 days. Events beyond 180 d represented only 4.2% (n=2,212).

## Discussion

### Principal findings
This 18-year national analysis reaffirms the favorable, consistent safety profile of HPV vaccines under real-world conditions. Most AEs were non-serious immediate vasovagal reactions; serious outcomes became progressively rarer across generations (33.3% Cervarix® → 7.8% Gardasil-9®), likely reflecting enhanced formulation and improved provider familiarity. The majority of AEs (82.9%) occurred within the first week, supporting biological plausibility and the importance of immediate post-vaccination observation.

### Consistency with the literature
Findings align with large active-surveillance systems: the Denmark–Sweden registry (Arnheim-Dahlström et al., ~997,585 girls) found no causal associations with autoimmune, neurological, or venous thromboembolic events; Vaccine Safety Datalink analyses (Gee et al., Klein et al., Donahue et al.) found no GBS or other safety signals; Scheller et al. found no association with demyelinating diseases; a WHO VigiBase® analysis identified syncope/vasovagal reactions as most frequent without new serious risks.

### Public health implications
Given the predominance of preventable administration errors and acute vasovagal reactions, maintaining a **15-minute observation period** after HPV vaccination and reinforcing provider training on cold-chain management and schedule adherence remain critical. Integration of real-time active surveillance, registry–EHR interoperability, and continued global pharmacovigilance are essential to sustain trust and support WHO's cervical cancer elimination goals.

### Strengths and limitations
**Strengths:** largest HPV vaccine AE dataset to date, brand-specific comparisons within one national system, rigorous FDR-controlled signal detection. **Limitations:** passive-reporting biases (underreporting, stimulated reporting, no denominator data, variable completeness); ROR quantifies disproportionality but not causality; comparison against all vaccines without age stratification may introduce confounding. Active surveillance is needed to estimate true incidence and validate rare signals.

## Conclusions
Eighteen years of national surveillance reaffirm the favorable, consistent safety profile of Cervarix®, Gardasil®, and Gardasil-9® in routine U.S. practice. Most reported AEs were mild, acute vasovagal reactions, with no new serious safety concerns. Strengthening provider education on storage protocols and schedule adherence could further enhance program safety. Continued pharmacovigilance remains critical to maintaining public trust and high HPV vaccination coverage.

---
*Disclosure: No potential conflict of interest reported. Ethics: Used de-identified, publicly available data; IRB approval not required. Supplementary data: <https://doi.org/10.1080/21645515.2025.2539590>*
