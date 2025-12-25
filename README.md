# USA Music × Political Polarization (1958–2024)

Minimal, data-driven web visualization comparing decade-level music chart dynamics from the **Billboard Hot 100** with a standardized indicator of **U.S. political polarization** derived from congressional ideology scores (**Voteview DW-NOMINATE**).

## What the page shows
- **Music trend:** average song longevity on the Hot 100 by decade (`avg_lifetime_weeks`).
- **Politics trend:** polarization index scaled to **0–100** (`polarization_index_0_100`).
- A preview table of the merged dataset used by the charts.

## Data sources
- **Billboard Hot 100 weekly charts (USA):** 1958–2024.
- **Voteview DW-NOMINATE party means (USA Congress).**

Repository data:
- `data/merged_music_politics_by_decade.csv`
- `data/sources/hot-100-current.csv`
- `data/sources/HSall_parties.csv`

## Method (summary)
1. Music metrics are computed from weekly Hot 100 charts and aggregated by decade.
2. Political polarization is computed as the distance between Democratic and Republican party mean ideology scores (DW-NOMINATE dimension 1), aggregated by decade.
3. Both datasets are aligned on the `decade` column for side-by-side comparison.

## Important limitations
- The **1950s** decade includes only **1958–1959** (Hot 100 starts in 1958).
- The **2020s** decade is partial (2020–mid 2024), which can bias longevity metrics downward due to right-censoring.
- The visualization highlights correlation and temporal convergence; it does **not** claim direct causality.

## Live demo
GitHub Pages: https://mohammad98sh.github.io/music-genres-visualization/
