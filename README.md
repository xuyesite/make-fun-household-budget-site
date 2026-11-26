# The Alvarez Ledger

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/xuyesite/make-fun-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/xuyesite/make-fun-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

A household budget site for the fictional Alvarez family, built for the
[make.fun bounty “Make the best household budget site”](https://make.fun/bounty/best-household-budget-site-20261126-1457).

November 2026: $8,275 in, $4,240 spent, $4,035 left over — $2,550 to four
savings goals and $1,485 unassigned. Every figure on the site comes from
one self-consistent data file (`app/data.js`): each category's purchases add
up to its actual, the categories add up to the month's spending, and income
minus spending minus savings leaves exactly the buffer. October 2026 is
there too, for comparison.

## The site

Static files under `app/`, no build step, no network request. Serve `app/`
with any static server (`node serve.ts` → http://localhost:8080) and open it
on a desktop or a phone.

- `app/index.html` — seven sections: Overview, Income, Expenses,
  Categories, Savings goals, Planner, Methodology, plus search.
- `app/data.js` — the single data file.
- `app/charts.js` — hand-rolled SVG charts (donut, budget bars, trend line);
  no library.
- `app/main.js` — rendering, routing, month switching, forms, planner,
  search.
- `app/styles.css` — cream paper, deep green and terracotta; system fonts
  only.

## Entry

`main.ts` (Node 22) copies `app/` and `screenshots/` to `/output` and writes
`/output/dossier.json` with the kit's vendored `vendor/makefun-frontend.ts`.
