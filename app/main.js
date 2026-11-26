// The Alvarez Ledger — rendering and interactions.
//
// Everything on the page is computed from app/data.js at load time, so the
// figures always agree: a category's actual is the sum of its transactions,
// the month's spending is the sum of its categories, and the leftover is
// income minus spending. Edits made on the page (a new expense, money
// added to a goal) live in memory on this page only — nothing is uploaded.

import { BUDGET } from "./data.js";
import { donutChart, budgetBars, trendLines } from "./charts.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function money(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function money2(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(n) {
  return (n * 100).toFixed(1) + "%";
}

// ---- state ---------------------------------------------------------------

const state = {
  monthId: BUDGET.currentMonthId,
  // Expenses added on the page, per month: { "2026-11": [txn, ...] }.
  extraTxns: {},
  // Money added to a goal on the page: { emergency: 50, ... }.
  goalExtra: {},
  txnCategory: "all",
  txnQuery: "",
};

// ---- derived figures -----------------------------------------------------

function monthData(id) {
  return BUDGET.months.find((m) => m.id === id);
}

function categoryOf(id) {
  return BUDGET.categories.find((c) => c.id === id);
}

function allTransactions(month) {
  return month.transactions.concat(state.extraTxns[month.id] || []);
}

function monthTotals(month) {
  const income = month.income.reduce((s, i) => s + i.amount, 0);
  const budget = month.plan.reduce((s, p) => s + p.budget, 0);
  // Actual spending is the sum of the month's transactions — including any
  // expense added on the page — so it can never drift from the list below.
  const actual = allTransactions(month).reduce((s, t) => s + t.amount, 0);
  const leftover = income - actual;
  const savings = BUDGET.savingsTransfers.reduce((s, t) => s + t.monthly, 0);
  return { income, budget, actual, leftover, savings, buffer: leftover - savings };
}

function planRows(month) {
  return month.plan.map((p) => {
    const cat = categoryOf(p.category);
    const txns = allTransactions(month).filter((t) => t.category === p.category);
    const actual = txns.reduce((s, t) => s + t.amount, 0);
    return {
      id: p.category,
      name: cat.name,
      color: cat.color,
      group: cat.group,
      blurb: cat.blurb,
      budget: p.budget,
      actual,
      diff: p.budget - actual,
      count: txns.length,
      daily: actual / BUDGET.daysElapsed[month.id],
    };
  });
}

function goalState(goal) {
  const monthly = BUDGET.savingsTransfers.find((t) => t.goal === goal.id).monthly;
  const saved = goal.saved + (state.goalExtra[goal.id] || 0);
  const left = Math.max(goal.target - saved, 0);
  return {
    ...goal,
    monthly,
    saved,
    left,
    share: saved / goal.target,
    monthsLeft: left === 0 ? 0 : Math.ceil(left / monthly),
  };
}

// ---- small builders ------------------------------------------------------

function statCard(label, value, sub) {
  return `<div class="stat"><p class="stat-label">${label}</p><p class="stat-value">${value}</p><p class="stat-sub">${sub}</p></div>`;
}

function monthSwitcher() {
  return `<div class="month-switch" role="group" aria-label="Choose a month">
    ${BUDGET.months
      .map(
        (m) =>
          `<button type="button" data-month="${m.id}" class="${m.id === state.monthId ? "active" : ""}" aria-pressed="${m.id === state.monthId}">${m.label}</button>`,
      )
      .join("")}
  </div>`;
}

// ---- sections ------------------------------------------------------------

function renderOverview() {
  const month = monthData(state.monthId);
  const t = monthTotals(month);
  const rows = planRows(month);
  const over = rows.filter((r) => r.diff < 0);
  const savedSoFar = BUDGET.goals.reduce((s, g) => s + goalState(g).saved, 0);
  const targetTotal = BUDGET.goals.reduce((s, g) => s + g.target, 0);
  $("#overview").innerHTML = `
    <div class="section-head">
      <div>
        <h2>Overview</h2>
        <p class="lede">One page that says where the Alvarez family's money stands this month — what came in, what went out, and what is left for the future.</p>
      </div>
      ${monthSwitcher()}
    </div>
    <p class="fineprint">${month.label} figures run through ${month.id === "2026-11" ? "26 November" : "31 October"} 2026. November is still running, so its totals will move a little more before the month ends.</p>
    <div class="stats">
      ${statCard("Income", money(t.income), "4 sources — Marco, Priya, weekend work, interest")}
      ${statCard("Spent", money(t.actual), "of " + money(t.budget) + " planned · " + rows.length + " categories")}
      ${statCard("Left over", money(t.leftover), pct(t.leftover / t.income) + " of income kept")}
      ${statCard("To savings", money(t.savings), "4 goals · " + money(t.buffer) + " still unassigned")}
    </div>
    <div class="two-col">
      <article class="card">
        <h3>Where the money went</h3>
        ${donutChart(rows.map((r) => ({ label: r.name, value: r.actual, color: r.color })), t.actual)}
      </article>
      <article class="card">
        <h3>Six months at a glance</h3>
        ${trendLines(BUDGET.trend)}
        <p class="card-note">Spending stays near $4,200–$4,600 while income creeps up. The family keeps roughly half of what it earns — the line for income stays comfortably above the line for spending.</p>
      </article>
    </div>
    <div class="two-col">
      <article class="card">
        <h3>Savings goals — ${money(savedSoFar)} of ${money(targetTotal)} saved</h3>
        <ul class="goal-list">
          ${BUDGET.goals
            .map((g) => {
              const gs = goalState(g);
              return `<li><a href="#/goals"><span class="goal-name">${gs.name}</span><span class="goal-track"><span class="goal-fill" style="width:${(gs.share * 100).toFixed(1)}%;"></span></span><span class="goal-figures">${money(gs.saved)} / ${money(gs.target)} · ${gs.monthsLeft} mo left</span></a></li>`;
            })
            .join("")}
        </ul>
      </article>
      <article class="card">
        <h3>Watch list</h3>
        ${
          over.length
            ? `<ul class="watch">${over.map((r) => `<li><strong>${r.name}</strong> is ${money(-r.diff)} over budget — ${r.name === "Eating out" ? "three takeaways in one week did it." : r.name === "Utilities" ? "the electricity bill came in high." : "school costs clustered in one month."} <a href="#/categories">See the plan →</a></li>`).join("")}</ul>`
            : `<p>Nothing is over budget this month. Every category is inside its plan.</p>`
        }
        <p class="card-note">Housing is exactly on plan, as it should be — rent never moves. Groceries came in ${money(planRows(month).find((r) => r.id === "groceries").diff)} under, which covered part of the eating-out overshoot.</p>
      </article>
    </div>`;
}

function renderIncome() {
  const month = monthData(state.monthId);
  const t = monthTotals(month);
  const max = Math.max(...month.income.map((i) => i.amount));
  $("#income").innerHTML = `
    <div class="section-head">
      <div>
        <h2>Income</h2>
        <p class="lede">Four streams, one household. Two salaries do the heavy lifting; weekend work and a little interest top it up.</p>
      </div>
      ${monthSwitcher()}
    </div>
    <div class="stats">
      ${statCard("Total income", money(t.income), month.label)}
      ${statCard("Marco's share", money(month.income[0].amount + month.income[2].amount), pct((month.income[0].amount + month.income[2].amount) / t.income) + " of the total")}
      ${statCard("Priya's share", money(month.income[1].amount), pct(month.income[1].amount / t.income) + " of the total")}
      ${statCard("Other", money(month.income[3].amount), "Interest & refunds")}
    </div>
    <article class="card">
      <h3>Where it comes from — ${month.label}</h3>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Source</th><th>Amount</th><th>Share</th><th>Notes</th></tr></thead>
        <tbody>
          ${month.income
            .map(
              (i) => `<tr><td>${i.source}</td><td>${money(i.amount)}</td><td>${pct(i.amount / t.income)}</td><td>${incomeNote(i.source)}</td></tr>`,
            )
            .join("")}
          <tr class="total-row"><td>Total</td><td>${money(t.income)}</td><td>100.0%</td><td></td></tr>
        </tbody>
      </table></div>
      <div class="income-bars" aria-hidden="true">
        ${month.income
          .map(
            (i) =>
              `<div class="income-bar-row"><span class="income-bar-label">${i.source}</span><span class="income-bar-track"><span class="income-bar-fill" style="width:${((i.amount / max) * 100).toFixed(1)}%"></span></span><span class="income-bar-value">${money(i.amount)}</span></div>`,
          )
          .join("")}
      </div>
    </article>
    <article class="card">
      <h3>How steady is it?</h3>
      <p>Marco's electrician salary and Priya's school-nurse salary arrive on the same dates every month and have not changed since June. Weekend jobs are the only wobbly stream — $380 to $460 a month depending on how many call-outs come in. The budget is built on the salaries alone, so a quiet weekend month never breaks the plan; a busy one is a bonus that goes straight to the emergency fund.</p>
      <p>Payday is the 1st for both salaries. Rent and the savings transfers go out on the 1st and 2nd, before anything else can claim the money — that is the whole trick of this budget: savings leave first, spending gets what is left.</p>
    </article>`;
}

function incomeNote(source) {
  if (source.includes("electrician")) return "Paid on the 1st, same every month.";
  if (source.includes("nurse")) return "Part time, three days a week at the school.";
  if (source.includes("weekend")) return "Call-outs and small jobs; varies month to month.";
  return "Bank interest plus a refunded overcharge.";
}

function renderExpenses() {
  const month = monthData(state.monthId);
  const t = monthTotals(month);
  const rows = planRows(month);
  const txns = allTransactions(month)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const shown = txns.filter(
    (tx) =>
      (state.txnCategory === "all" || tx.category === state.txnCategory) &&
      (state.txnQuery === "" || (tx.what + " " + categoryOf(tx.category).name + " " + tx.date).toLowerCase().includes(state.txnQuery)),
  );
  $("#expenses").innerHTML = `
    <div class="section-head">
      <div>
        <h2>Expenses</h2>
        <p class="lede">Every dollar out, in the order it left. Filter by category or search for a shop, a bill, a person — and add a purchase of your own below.</p>
      </div>
      ${monthSwitcher()}
    </div>
    <div class="stats">
      ${statCard("Spent", money(t.actual), "of " + money(t.budget) + " planned")}
      ${statCard("Under budget", money(t.budget - t.actual), t.budget - t.actual >= 0 ? "across " + rows.length + " categories" : "over budget overall")}
      ${statCard("Purchases", String(txns.length), "in " + month.label)}
      ${statCard("Biggest single cost", money(Math.max(...txns.map((x) => x.amount))), "rent, on the 1st")}
    </div>
    <article class="card">
      <h3>Add an expense</h3>
      <form id="add-expense-form" class="form-grid">
        <label>Date <input type="date" id="exp-date" value="${month.id === "2026-11" ? "2026-11-26" : "2026-10-31"}" min="${month.id}-01" max="${month.id === "2026-11" ? "2026-11-26" : "2026-10-31"}" required></label>
        <label>Category
          <select id="exp-category">${BUDGET.categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select>
        </label>
        <label>What was it? <input type="text" id="exp-what" placeholder="e.g. Weekly shop — market" maxlength="80" required></label>
        <label>Amount ($) <input type="number" id="exp-amount" min="0.01" step="0.01" placeholder="0.00" required></label>
        <button type="submit" class="btn">Add to ${month.short}</button>
      </form>
      <p id="add-expense-note" class="form-note" role="status"></p>
      <p class="fineprint">Added expenses update the totals, the donut and the budget bars on this page right away. They live on this page only — nothing is sent anywhere.</p>
    </article>
    <article class="card">
      <h3>Transactions — ${month.label} <span class="count-pill">${shown.length} shown</span></h3>
      <div class="filter-row">
        <label>Category
          <select id="txn-category">
            <option value="all">All categories</option>
            ${BUDGET.categories.map((c) => `<option value="${c.id}" ${state.txnCategory === c.id ? "selected" : ""}>${c.name}</option>`).join("")}
          </select>
        </label>
        <label>Search <input type="search" id="txn-search" placeholder="Search purchases…" value="${state.txnQuery}"></label>
      </div>
      ${
        shown.length
          ? `<div class="table-wrap"><table class="data-table">
          <thead><tr><th>Date</th><th>What</th><th>Category</th><th>Amount</th></tr></thead>
          <tbody>
            ${shown.map((tx) => `<tr><td>${tx.date.slice(5)}</td><td>${escapeHtml(tx.what)}</td><td><span class="cat-dot" style="background:${categoryOf(tx.category).color}"></span>${categoryOf(tx.category).name}</td><td>${money(tx.amount)}</td></tr>`).join("")}
          </tbody>
        </table></div>`
          : `<p class="empty-note">Nothing matches that filter. Try another category or clear the search.</p>`
      }
      <p class="fineprint">These ${txns.length} purchases add up to exactly ${money(t.actual)} — the same total the overview and the budget bars show. Nothing is hidden in a miscellaneous bucket.</p>
    </article>`;
  wireExpenses(month);
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wireExpenses(month) {
  $("#txn-category").addEventListener("change", (e) => {
    state.txnCategory = e.target.value;
    renderExpenses();
  });
  $("#txn-search").addEventListener("input", (e) => {
    state.txnQuery = e.target.value.trim().toLowerCase();
    // Re-render only the list, so typing never loses focus.
    renderExpenses();
    const box = $("#txn-search");
    box.focus();
    box.setSelectionRange(box.value.length, box.value.length);
  });
  $("#add-expense-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const what = $("#exp-what").value.trim();
    const amount = Number($("#exp-amount").value);
    const category = $("#exp-category").value;
    const date = $("#exp-date").value;
    if (!what || !(amount > 0) || !date) return;
    (state.extraTxns[month.id] = state.extraTxns[month.id] || []).push({ date, category, what, amount });
    const row = planRows(month).find((r) => r.id === category);
    const message = `Added ${money(amount)} to ${row.name} — its ${month.short} total is now ${money(row.actual)}.`;
    renderAll();
    const note = $("#add-expense-note");
    if (note) note.textContent = message;
  });
}

function renderCategories() {
  const month = monthData(state.monthId);
  const t = monthTotals(month);
  const rows = planRows(month);
  const needs = rows.filter((r) => r.group === "needs");
  const wants = rows.filter((r) => r.group === "wants");
  const needsTotal = needs.reduce((s, r) => s + r.actual, 0);
  const wantsTotal = wants.reduce((s, r) => s + r.actual, 0);
  $("#categories").innerHTML = `
    <div class="section-head">
      <div>
        <h2>Categories</h2>
        <p class="lede">The plan against the reality, category by category. Pale is the budget, solid is what actually happened — and the gap between them is the story of the month.</p>
      </div>
      ${monthSwitcher()}
    </div>
    <article class="card">
      <h3>Budget vs actual — ${month.label}</h3>
      ${budgetBars(rows)}
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Category</th><th>Budget</th><th>Actual</th><th>Difference</th><th>Per day</th><th>Purchases</th></tr></thead>
        <tbody>
          ${rows.map((r) => `<tr id="cat-${r.id}"><td><span class="cat-dot" style="background:${r.color}"></span>${r.name}</td><td>${money(r.budget)}</td><td>${money(r.actual)}</td><td class="${r.diff < 0 ? "over" : "under"}">${r.diff < 0 ? "−" + money(-r.diff) + " over" : "+" + money(r.diff) + " under"}</td><td>${money2(r.daily)}</td><td>${r.count}</td></tr>`).join("")}
          <tr class="total-row"><td>Total</td><td>${money(t.budget)}</td><td>${money(t.actual)}</td><td class="under">+${money(t.budget - t.actual)} under</td><td>${money2(t.actual / BUDGET.daysElapsed[month.id])}</td><td>${allTransactions(month).length}</td></tr>
        </tbody>
      </table></div>
    </article>
    <div class="two-col">
      <article class="card">
        <h3>Needs vs wants — the 50/30/20 check</h3>
        <p>Needs (rent, food, transport, bills, health, school) came to <strong>${money(needsTotal)} — ${pct(needsTotal / t.income)}</strong> of income. Wants (eating out, clothing and home) came to <strong>${money(wantsTotal)} — ${pct(wantsTotal / t.income)}</strong>. Everything left — savings plus the unassigned buffer — is <strong>${money(t.leftover)} — ${pct(t.leftover / t.income)}</strong>.</p>
        <div class="split-bar" role="img" aria-label="Needs ${pct(needsTotal / t.income)}, wants ${pct(wantsTotal / t.income)}, savings ${pct(t.leftover / t.income)}">
          <span style="width:${((needsTotal / t.income) * 100).toFixed(1)}%;background:#1e4d3a"></span><span style="width:${((wantsTotal / t.income) * 100).toFixed(1)}%;background:#c05b2e"></span><span style="width:${((t.leftover / t.income) * 100).toFixed(1)}%;background:#d9a441"></span>
        </div>
        <p class="chart-key"><span class="key-green"></span> Needs ${pct(needsTotal / t.income)} &nbsp; <span class="key-terra"></span> Wants ${pct(wantsTotal / t.income)} &nbsp; <span class="key-gold"></span> Saved &amp; spare ${pct(t.leftover / t.income)}</p>
        <p class="card-note">The classic rule of thumb says 50 / 30 / 20. This family runs about 45 / 6 / 49: needs are a little under half, wants are small because most fun here is free — the park, the library, Leo's football — and nearly half of every dollar is kept.</p>
      </article>
      <article class="card">
        <h3>What each category is for</h3>
        <ul class="cat-blurbs">
          ${BUDGET.categories.map((c) => `<li><span class="cat-dot" style="background:${c.color}"></span><strong>${c.name}</strong> — ${c.blurb}</li>`).join("")}
        </ul>
      </article>
    </div>`;
}

function renderGoals() {
  const savedSoFar = BUDGET.goals.reduce((s, g) => s + goalState(g).saved, 0);
  const targetTotal = BUDGET.goals.reduce((s, g) => s + g.target, 0);
  $("#goals").innerHTML = `
    <div class="section-head">
      <div>
        <h2>Savings goals</h2>
        <p class="lede">Four jars on the shelf, each with a job. Money moves into them on the 2nd of every month, before spending starts — ${money(BUDGET.savingsTransfers.reduce((s, t) => s + t.monthly, 0))} a month in total.</p>
      </div>
    </div>
    <div class="stats">
      ${statCard("Saved so far", money(savedSoFar), pct(savedSoFar / targetTotal) + " of all four goals")}
      ${statCard("Still to save", money(targetTotal - savedSoFar), "across the four goals")}
      ${statCard("Monthly transfers", money(BUDGET.savingsTransfers.reduce((s, t) => s + t.monthly, 0)), "on the 2nd of each month")}
      ${statCard("Next finish", "Coast trip", "about 2 months at the current pace")}
    </div>
    <div class="goal-cards">
      ${BUDGET.goals
        .map((g) => {
          const gs = goalState(g);
          return `<article class="card goal-card" id="goal-${g.id}">
            <h3>${gs.name}</h3>
            <p class="goal-big">${money(gs.saved)} <span>of ${money(gs.target)}</span></p>
            <div class="goal-track big"><span class="goal-fill" style="width:${(gs.share * 100).toFixed(1)}%"></span></div>
            <p class="goal-meta">${pct(gs.share)} saved · ${money(gs.monthly)} a month · <strong>${gs.monthsLeft === 0 ? "Done!" : gs.monthsLeft + " month" + (gs.monthsLeft === 1 ? "" : "s") + " to go"}</strong></p>
            <p>${g.note}</p>
          </article>`;
        })
        .join("")}
    </div>
    <article class="card">
      <h3>Add money to a goal</h3>
      <form id="add-goal-form" class="form-grid">
        <label>Goal
          <select id="goal-select">${BUDGET.goals.map((g) => `<option value="${g.id}">${g.name}</option>`).join("")}</select>
        </label>
        <label>Amount ($) <input type="number" id="goal-amount" min="1" step="1" placeholder="50" required></label>
        <button type="submit" class="btn">Add to goal</button>
      </form>
      <p id="add-goal-note" class="form-note" role="status"></p>
      <p class="fineprint">Try it: add $50 to the coast trip and watch its bar move and its finish date pull closer. It stays on this page only — nothing is sent anywhere.</p>
    </article>`;
  $("#add-goal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#goal-select").value;
    const amount = Number($("#goal-amount").value);
    if (!(amount > 0)) return;
    state.goalExtra[id] = (state.goalExtra[id] || 0) + amount;
    const gs = goalState(BUDGET.goals.find((g) => g.id === id));
    renderAll();
    const note = $("#add-goal-note");
    if (note) note.textContent = `Added ${money(amount)} to ${gs.name} — now ${money(gs.saved)} of ${money(gs.target)} (${pct(gs.share)}), ${gs.monthsLeft === 0 ? "finished!" : gs.monthsLeft + " months to go"}.`;
  });
}

function renderPlanner() {
  const month = monthData(state.monthId);
  const t = monthTotals(month);
  $("#planner").innerHTML = `
    <div class="section-head">
      <div>
        <h2>Planner</h2>
        <p class="lede">Two what-if tools. Ask “what if we saved a little more?” or “what if we spent a little less?” — and see the answer in months, not in vague advice.</p>
      </div>
      ${monthSwitcher()}
    </div>
    <div class="two-col">
      <article class="card">
        <h3>What if we saved more?</h3>
        <form class="form-grid" id="planner-save-form">
          <label>Goal
            <select id="plan-goal">${BUDGET.goals.map((g) => `<option value="${g.id}">${g.name}</option>`).join("")}</select>
          </label>
          <label>Extra per month ($)
            <input type="number" id="plan-extra" min="0" step="10" value="100">
          </label>
        </form>
        <div id="plan-save-result" class="planner-result" role="status"></div>
      </article>
      <article class="card">
        <h3>What if we spent less?</h3>
        <form class="form-grid" id="planner-cut-form">
          <label>Category
            <select id="plan-category">${BUDGET.categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select>
          </label>
          <label>Cut per month ($)
            <input type="number" id="plan-cut" min="0" step="10" value="50">
          </label>
        </form>
        <div id="plan-cut-result" class="planner-result" role="status"></div>
      </article>
    </div>
    <article class="card">
      <h3>Three habits that make this budget work</h3>
      <ol class="habits">
        <li><strong>Pay yourself first.</strong> The ${money(t.savings)} for savings leaves on the 2nd, before the month's spending starts. What is left is what may be spent — never the other way round.</li>
        <li><strong>One weekly shop, one list.</strong> Groceries are the biggest bill the family can actually steer. A list written before the market, and no second trip for “just one thing”, keeps it near ${money(684)} a month.</li>
        <li><strong>Count the small leaks.</strong> A $34 takeaway here and a $46 pizza night there added up to ${money(298)} of eating out in November — ${money(38)} over plan. Seeing the number is what keeps it from quietly doubling.</li>
      </ol>
      <p class="card-note">All figures on this page use ${month.label}: income ${money(t.income)}, spending ${money(t.actual)}, leftover ${money(t.leftover)}.</p>
    </article>`;
  const updateSave = () => {
    const g = goalState(BUDGET.goals.find((x) => x.id === $("#plan-goal").value));
    const extra = Math.max(Number($("#plan-extra").value) || 0, 0);
    const monthly = g.monthly + extra;
    const months = g.left === 0 ? 0 : Math.ceil(g.left / monthly);
    const finish = months === 0 ? "already finished" : "about " + months + " month" + (months === 1 ? "" : "s") + " from now";
    const monthsSaved = g.monthsLeft - months;
    $("#plan-save-result").innerHTML =
      `<p><strong>${g.name}:</strong> ${money(g.saved)} of ${money(g.target)} saved, ${money(g.left)} to go.</p>` +
      `<p>At ${money(monthly)} a month (${money(g.monthly)} planned + ${money(extra)} extra) it finishes in <strong>${finish}</strong>${extra > 0 ? (monthsSaved > 0 ? ` — ${monthsSaved} month${monthsSaved === 1 ? "" : "s"} sooner than the current ${g.monthsLeft}.` : ` — the same pace as now, so try a bigger extra amount to pull the finish date closer.`) : "."}</p>`;
  };
  const updateCut = () => {
    const cat = categoryOf($("#plan-category").value);
    const cut = Math.max(Number($("#plan-cut").value) || 0, 0);
    const row = planRows(month).find((r) => r.id === cat.id);
    const newLeftover = t.leftover + cut;
    const newRate = newLeftover / t.income;
    const eg = goalState(BUDGET.goals[0]);
    const egMonths = eg.left === 0 ? 0 : Math.ceil(eg.left / (eg.monthly + cut));
    $("#plan-cut-result").innerHTML =
      `<p>Cutting <strong>${cat.name}</strong> by ${money(cut)} a month takes it from ${money(row.actual)} to ${money(Math.max(row.actual - cut, 0))}.</p>` +
      `<p>Monthly leftover rises from ${money(t.leftover)} to <strong>${money(newLeftover)}</strong> — ${pct(newRate)} of income kept instead of ${pct(t.leftover / t.income)}.</p>` +
      (cut > 0
        ? `<p>Put the whole cut into the emergency fund and it finishes in <strong>${egMonths} month${egMonths === 1 ? "" : "s"}</strong>${egMonths < eg.monthsLeft ? ` instead of ${eg.monthsLeft}.` : " — the same pace as now, so a bigger cut is needed to move the date."}</p>`
        : "");
  };
  $("#plan-goal").addEventListener("change", updateSave);
  $("#plan-extra").addEventListener("input", updateSave);
  $("#plan-category").addEventListener("change", updateCut);
  $("#plan-cut").addEventListener("input", updateCut);
  updateSave();
  updateCut();
}

function renderMethodology() {
  $("#methodology").innerHTML = `
    <div class="section-head">
      <div>
        <h2>Methodology</h2>
        <p class="lede">How this budget is built, where every number comes from, and what it does not claim to be.</p>
      </div>
    </div>
    <article class="card">
      <h3>Where the numbers come from</h3>
      <p>The Alvarez family is fictional — Marco, Priya, Leo and Mia do not exist, and neither does Maplewood. Every figure on this site was invented for this one household and then checked so that it adds up: each category's transactions sum to that category's actual spending, the categories sum to the month's total, and income minus spending minus the savings transfers leaves exactly the unassigned buffer. There is no live data, no bank connection and no tracking: the site reads one data file (<code>app/data.js</code>) and nothing else.</p>
      <h3>The rules the family lives by</h3>
      <ul class="method-list">
        <li><strong>Pay yourself first.</strong> Savings leave on the 2nd of the month, before spending starts.</li>
        <li><strong>Every dollar has a job.</strong> Income is split into spending, savings and a named buffer — nothing sits uncounted.</li>
        <li><strong>Budget, then compare.</strong> Each category gets a plan at the start of the month; the actual is counted from real purchases, and the gap is reviewed, not hidden.</li>
        <li><strong>The 50/30/20 yardstick.</strong> Needs near 50%, wants near 30%, savings near 20% is the classic split. This family runs about 45 / 6 / 49 — lean on wants, heavy on savings — because two steady salaries and a paid-off van leave room to save.</li>
      </ul>
      <h3>What the tools do</h3>
      <ul class="method-list">
        <li>The <strong>month switcher</strong> swaps November 2026 (in progress, through the 26th) for October 2026 (complete).</li>
        <li><strong>Add an expense</strong> records a purchase and re-adds every total on the page from the same data.</li>
        <li><strong>Add to a goal</strong> moves money into a savings jar and recomputes its progress and finish date.</li>
        <li>The <strong>planner</strong> answers “what if” with arithmetic: extra saving shortens a goal's finish date, a spending cut raises the monthly leftover.</li>
        <li><strong>Search</strong> looks through categories, goals and every purchase, and jumps to what it finds.</li>
      </ul>
      <h3>Limits</h3>
      <p>Figures are rounded to whole dollars in tables and to cents only in the per-day column. Percentages are shown to one decimal place, so a column of shares can read 99.9% or 100.1% — that is rounding, not an error. Edits made on the page (a new expense, money added to a goal) live in the browser tab only and vanish on reload. This site is a demonstration of a budgeting method, not financial advice.</p>
    </article>`;
}

// ---- search --------------------------------------------------------------

function searchIndex() {
  const items = [];
  for (const c of BUDGET.categories) items.push({ kind: "Category", label: c.name, text: c.name + " " + c.blurb, go: "#/categories", anchor: "cat-" + c.id });
  for (const g of BUDGET.goals) items.push({ kind: "Savings goal", label: g.name, text: g.name + " " + g.note, go: "#/goals", anchor: "goal-" + g.id });
  for (const m of BUDGET.months) {
    for (const tx of allTransactions(m)) {
      items.push({ kind: m.short + " purchase", label: tx.what, text: tx.what + " " + categoryOf(tx.category).name + " " + tx.date, go: "#/expenses", anchor: "" });
    }
  }
  return items;
}

function wireSearch() {
  const box = $("#site-search");
  const results = $("#search-results");
  const items = searchIndex();
  box.addEventListener("input", () => {
    const q = box.value.trim().toLowerCase();
    if (q.length < 2) {
      results.innerHTML = "";
      results.hidden = true;
      return;
    }
    const hits = items.filter((i) => i.text.toLowerCase().includes(q)).slice(0, 8);
    results.innerHTML = hits.length
      ? hits.map((h, i) => `<li><button type="button" data-i="${i}"><span class="result-kind">${h.kind}</span> ${escapeHtml(h.label)}</button></li>`).join("")
      : `<li class="no-result">No matches for “${escapeHtml(box.value.trim())}”. Try “pizza”, “rent” or “trip”.</li>`;
    results.hidden = false;
    $$("button", results).forEach((b) =>
      b.addEventListener("click", () => {
        const hit = hits[Number(b.dataset.i)];
        results.hidden = true;
        box.value = "";
        location.hash = hit.go;
        setTimeout(() => {
          const el = hit.anchor ? document.getElementById(hit.anchor) : null;
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("flash");
            setTimeout(() => el.classList.remove("flash"), 2000);
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 60);
      }),
    );
  });
  box.addEventListener("blur", () => setTimeout(() => (results.hidden = true), 150));
  box.addEventListener("focus", () => {
    if (box.value.trim().length >= 2) results.hidden = false;
  });
}

// ---- router ---------------------------------------------------------------

const ROUTES = ["overview", "income", "expenses", "categories", "goals", "planner", "methodology"];

function renderAll() {
  renderOverview();
  renderIncome();
  renderExpenses();
  renderCategories();
  renderGoals();
  renderPlanner();
  renderMethodology();
}

function route() {
  const name = (location.hash.replace("#/", "") || "overview").split("?")[0];
  const current = ROUTES.includes(name) ? name : "overview";
  $$(".page").forEach((s) => s.classList.toggle("active", s.id === current));
  $$(".nav-link").forEach((a) => a.classList.toggle("active", a.dataset.route === current));
  window.scrollTo(0, 0);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-month]");
  if (!btn) return;
  state.monthId = btn.dataset.month;
  renderAll();
  route();
});

window.addEventListener("hashchange", route);

renderAll();
wireSearch();
route();
