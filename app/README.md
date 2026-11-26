# The Alvarez Ledger

A household budget site for the fictional Alvarez family — two parents, two
children, one rented flat in Maplewood — built for the make.fun bounty
“Make the best household budget site”.

November 2026 (in progress, through the 26th): $8,275 in, $4,240 spent,
$4,035 left over, of which $2,550 moves to four savings goals and $1,485
sits unassigned. October 2026 is there too, for comparison. Every figure
comes from one data file (`data.js`) and every total is the sum of its
parts — each category's purchases add up to its actual, the categories add
up to the month's spending, and income minus spending minus savings leaves
exactly the buffer.

## What is on the site

- **Overview** — income, spending, leftover and savings at a glance, a
  donut of spending by category, a six-month income-against-spending line,
  and the goals and watch list.
- **Income** — the four income streams, their shares and how steady they are.
- **Expenses** — every purchase in date order, filterable by category and
  searchable, plus a form to add an expense of your own (totals, donut and
  bars update on the page).
- **Categories** — budget against actual for all eight categories, a
  50/30/20 needs-wants-savings check, and what each category covers.
- **Savings goals** — four goals with progress bars, monthly transfers and
  months to go, plus a form to add money to a goal.
- **Planner** — two what-if tools: save a little more each month, or spend
  a little less, and see the answer in months and dollars.
- **Methodology** — where the numbers come from, the rules the family lives
  by, and the limits of the site.

## How it is built

Static files under `app/`, no build step, no network request. Serve `app/`
with any static server (`node serve.ts` → http://localhost:8080) and open it
on a desktop or a phone.

- `index.html` — the page shell: header, search, navigation, seven sections.
- `data.js` — the single data file (ES module, read locally, never fetched).
- `charts.js` — hand-rolled SVG charts: donut, budget bars, trend lines.
- `main.js` — rendering, routing, month switching, forms, planner and search.
- `styles.css` — cream paper, deep green and terracotta; system fonts only.

Edits made on the page (a new expense, money added to a goal) live in the
browser tab only — nothing is sent anywhere.
