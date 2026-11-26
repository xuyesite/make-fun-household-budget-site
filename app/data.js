// The Alvarez family budget — the single data file for this site.
//
// Every figure here is invented for one fictional household and every total
// is the sum of its parts: each month's category actuals add up to that
// month's spending, the transactions inside a category add up to that
// category's actual, and income minus spending minus the savings transfers
// leaves exactly the unassigned buffer. The site never fetches data; it
// reads this file only.

export const BUDGET = {
  family: {
    name: "The Alvarez family",
    members: [
      { name: "Marco", age: 42, role: "Electrician" },
      { name: "Priya", age: 40, role: "School nurse, part time" },
      { name: "Leo", age: 14, role: "Year 9, plays goalkeeper" },
      { name: "Mia", age: 9, role: "Year 4, collects smooth stones" },
    ],
    home: "A rented three-bedroom flat in Maplewood",
    currency: "USD",
    note: "A fictional household. The numbers are made up to show how a real family budget adds up — they are not anyone's real money.",
  },

  // The month the site opens on. November is still running: figures are
  // through 26 November 2026, so the month's totals will still move.
  currentMonthId: "2026-11",
  daysElapsed: { "2026-10": 31, "2026-11": 26 },

  categories: [
    { id: "housing", name: "Housing", color: "#1e4d3a", group: "needs", blurb: "Rent for the flat. Fixed every month, due on the 1st." },
    { id: "groceries", name: "Groceries", color: "#3a7d44", group: "needs", blurb: "Weekly shop at the market and the corner store." },
    { id: "eating", name: "Eating out", color: "#c05b2e", group: "wants", blurb: "Pizza nights, the cafe by the school, takeaway Fridays." },
    { id: "transport", name: "Transport", color: "#a67c00", group: "needs", blurb: "Petrol for Marco's van, bus passes, parking." },
    { id: "utilities", name: "Utilities", color: "#3f6d8e", group: "needs", blurb: "Electricity, water, internet and two phone lines." },
    { id: "health", name: "Health", color: "#8a4b6e", group: "needs", blurb: "Pharmacy, dentist visits, vitamins." },
    { id: "kids", name: "Kids & school", color: "#6b5ca8", group: "needs", blurb: "School lunches, shoes, art supplies, field trips." },
    { id: "clothing", name: "Clothing & home", color: "#7a5c2e", group: "wants", blurb: "Coats, towels, bedding, the odd household fix." },
  ],

  months: [
    {
      id: "2026-11",
      label: "November 2026",
      short: "Nov",
      income: [
        { source: "Marco — electrician salary", amount: 4850 },
        { source: "Priya — school nurse salary", amount: 2940 },
        { source: "Marco — weekend jobs", amount: 420 },
        { source: "Interest & refunds", amount: 65 },
      ],
      // budget is the plan, actual is what really happened. Budget total
      // 4280, actual total 4240.
      plan: [
        { category: "housing", budget: 1850, actual: 1850 },
        { category: "groceries", budget: 720, actual: 684 },
        { category: "eating", budget: 260, actual: 298 },
        { category: "transport", budget: 410, actual: 392 },
        { category: "utilities", budget: 340, actual: 351 },
        { category: "health", budget: 180, actual: 142 },
        { category: "kids", budget: 300, actual: 327 },
        { category: "clothing", budget: 220, actual: 196 },
      ],
      transactions: [
        { date: "2026-11-01", category: "housing", what: "Rent — Maplewood Apartments", amount: 1850 },
        { date: "2026-11-02", category: "eating", what: "Pizza night — Leo picked the toppings", amount: 46 },
        { date: "2026-11-03", category: "groceries", what: "Weekly shop — market", amount: 212 },
        { date: "2026-11-03", category: "kids", what: "School lunches — two weeks", amount: 95 },
        { date: "2026-11-04", category: "utilities", what: "Electricity bill", amount: 128 },
        { date: "2026-11-05", category: "transport", what: "Petrol — Marco's van", amount: 52 },
        { date: "2026-11-06", category: "utilities", what: "Internet — monthly", amount: 79 },
        { date: "2026-11-07", category: "health", what: "Pharmacy — cough syrup and plasters", amount: 38 },
        { date: "2026-11-08", category: "clothing", what: "Winter coats for Leo and Mia", amount: 112 },
        { date: "2026-11-09", category: "eating", what: "Family dinner — the cafe by the school", amount: 58 },
        { date: "2026-11-10", category: "groceries", what: "Weekly shop — corner store", amount: 168 },
        { date: "2026-11-11", category: "utilities", what: "Water bill", amount: 64 },
        { date: "2026-11-12", category: "transport", what: "Petrol — Marco's van", amount: 48 },
        { date: "2026-11-13", category: "kids", what: "Leo's new school shoes", amount: 88 },
        { date: "2026-11-14", category: "health", what: "Dentist — Mia's check-up", amount: 65 },
        { date: "2026-11-15", category: "eating", what: "Takeaway Friday — noodles", amount: 34 },
        { date: "2026-11-16", category: "clothing", what: "Towels and new bedding", amount: 84 },
        { date: "2026-11-17", category: "groceries", what: "Weekly shop — market", amount: 145 },
        { date: "2026-11-17", category: "kids", what: "Mia's art supplies", amount: 54 },
        { date: "2026-11-18", category: "utilities", what: "Phone lines — two mobiles", amount: 80 },
        { date: "2026-11-19", category: "transport", what: "Petrol — Marco's van", amount: 55 },
        { date: "2026-11-20", category: "health", what: "Vitamins and paracetamol", amount: 39 },
        { date: "2026-11-21", category: "transport", what: "Bus passes — Priya and Leo", amount: 120 },
        { date: "2026-11-22", category: "eating", what: "Sunday lunch out — grandparents came too", amount: 87 },
        { date: "2026-11-24", category: "groceries", what: "Weekly shop — market", amount: 159 },
        { date: "2026-11-25", category: "kids", what: "Field trip — Mia's class", amount: 90 },
        { date: "2026-11-25", category: "transport", what: "Parking — hospital car park", amount: 70 },
        { date: "2026-11-26", category: "eating", what: "Takeaway Thursday — burgers", amount: 73 },
        { date: "2026-11-26", category: "transport", what: "Petrol — Marco's van", amount: 47 },
      ],
    },
    {
      id: "2026-10",
      label: "October 2026",
      short: "Oct",
      income: [
        { source: "Marco — electrician salary", amount: 4850 },
        { source: "Priya — school nurse salary", amount: 2940 },
        { source: "Marco — weekend jobs", amount: 380 },
        { source: "Interest & refunds", amount: 60 },
      ],
      // Budget total 4280 (same plan as November), actual total 4180.
      plan: [
        { category: "housing", budget: 1850, actual: 1850 },
        { category: "groceries", budget: 720, actual: 661 },
        { category: "eating", budget: 260, actual: 271 },
        { category: "transport", budget: 410, actual: 385 },
        { category: "utilities", budget: 340, actual: 329 },
        { category: "health", budget: 180, actual: 158 },
        { category: "kids", budget: 300, actual: 312 },
        { category: "clothing", budget: 220, actual: 214 },
      ],
      transactions: [
        { date: "2026-10-01", category: "housing", what: "Rent — Maplewood Apartments", amount: 1850 },
        { date: "2026-10-02", category: "kids", what: "School lunches — two weeks", amount: 142 },
        { date: "2026-10-03", category: "groceries", what: "Weekly shop — market", amount: 221 },
        { date: "2026-10-04", category: "eating", what: "Pizza night", amount: 96 },
        { date: "2026-10-05", category: "utilities", what: "Electricity bill", amount: 118 },
        { date: "2026-10-06", category: "transport", what: "Petrol — Marco's van", amount: 145 },
        { date: "2026-10-09", category: "health", what: "Dentist — Leo's filling", amount: 158 },
        { date: "2026-10-10", category: "clothing", what: "Rain jackets for the kids", amount: 118 },
        { date: "2026-10-11", category: "groceries", what: "Weekly shop — corner store", amount: 208 },
        { date: "2026-10-12", category: "utilities", what: "Water bill", amount: 96 },
        { date: "2026-10-14", category: "kids", what: "Leo's football boots", amount: 96 },
        { date: "2026-10-15", category: "transport", what: "Petrol — Marco's van", amount: 128 },
        { date: "2026-10-16", category: "eating", what: "Takeaway Friday — noodles", amount: 88 },
        { date: "2026-10-20", category: "utilities", what: "Phone lines — two mobiles", amount: 115 },
        { date: "2026-10-21", category: "clothing", what: "New curtains — living room", amount: 96 },
        { date: "2026-10-23", category: "transport", what: "Petrol — Marco's van", amount: 112 },
        { date: "2026-10-24", category: "groceries", what: "Weekly shop — market", amount: 232 },
        { date: "2026-10-26", category: "kids", what: "Mia's school trip deposit", amount: 74 },
        { date: "2026-10-27", category: "eating", what: "Sunday lunch out", amount: 87 },
      ],
    },
  ],

  // What the family moves to savings on the 2nd of every month, same in
  // October and November. Monthly total 2550.
  savingsTransfers: [
    { goal: "emergency", monthly: 1200 },
    { goal: "trip", monthly: 450 },
    { goal: "car", monthly: 600 },
    { goal: "college", monthly: 300 },
  ],

  goals: [
    { id: "emergency", name: "Emergency fund", target: 12000, saved: 7850, note: "Six months of rent if work ever dries up. The one we never touch." },
    { id: "trip", name: "Coast trip", target: 2400, saved: 1680, note: "A week by the sea next summer — train tickets, a cottage, ice cream money." },
    { id: "car", name: "New car fund", target: 8000, saved: 2300, note: "Marco's van is fifteen years old. A newer used car, bought outright." },
    { id: "college", name: "Leo's college starter", target: 5000, saved: 1150, note: "A small head start for Leo, added to a little at a time." },
  ],

  // Six months of income against spending, for the trend line.
  // Savings rate is (income - spending) / income.
  trend: [
    { month: "Jun", income: 7940, spending: 4380 },
    { month: "Jul", income: 8120, spending: 4610 },
    { month: "Aug", income: 8050, spending: 4520 },
    { month: "Sep", income: 8190, spending: 4310 },
    { month: "Oct", income: 8230, spending: 4180 },
    { month: "Nov", income: 8275, spending: 4240 },
  ],

  // The 50/30/20 rule of thumb, checked against this family's real shares.
  rule503020: {
    needs: ["housing", "groceries", "transport", "utilities", "health", "kids"],
    wants: ["eating", "clothing"],
    note: "Needs are the bills you cannot skip, wants are the fun that can wait, and the rest is savings. The classic split is 50 / 30 / 20 — this family sits at about 45 / 6 / 49, because two salaries and a paid-off van leave a lot to save.",
  },
};
