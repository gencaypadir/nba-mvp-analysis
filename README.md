# The "Real" MVP — DS4200 NBA Analysis

**Live site:** https://[YOUR-USERNAME].github.io/nba-mvp-analysis

A data visualization project analyzing the 2024–25 NBA season to determine who statistically deserved the MVP award.

## Dataset
- Source: Kaggle — NBA Player Game Logs 2024–25 (MIT License)
- 16,512 rows × 25 columns
- 569 unique players across 30 teams

## Visualizations
1. **MVP Leaderboard** (D3 bar) — Top 15 by Final Score
2. **Candidate Profiles** (D3 radar) — Top 5 percentile profiles, interactive player filter
3. **Volume vs Efficiency** (D3 scatter) — FGA vs FG%, bubble size = PPG
4. **Season Consistency** (D3 line) — 5-game rolling Game Score, clickable legend
5. **Percentile Heatmap** (D3) — Top 15 × 9 stat categories

## Files
```
index.html       — Main website
style.css        — Styles
charts.js        — All D3 chart code
data.js          — Pre-computed player data (from pipeline)
DS4200_Project.ipynb  — Data pipeline + Python visualizations
vis.ipynb        — Additional Altair charts
database_24_25.csv    — Source dataset (optional)
design_notes.docx     — Design rationale document
```

## GitHub Pages Setup
1. Repo → Settings → Pages
2. Source: Deploy from branch → main → / (root)
3. Save → site live at `https://[username].github.io/[repo-name]`
