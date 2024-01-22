const MIGRATION_1 = `
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_income INTEGER NOT NULL,

  created_at TIME,
  updated_at TIME,

  CONSTRAINT budget_unique_month_year UNIQUE (month, year)
);`;

const MIGRATION_2 = `
CREATE TABLE budget_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  budget_id INTEGER NOT NULL,
  transaction_category_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,

  created_at TIME,
  updated_at TIME,

  CONSTRAINT budget_entries_unique_categories UNIQUE (budget_id, transaction_category_id)
);`;

module.exports = {
  id: 6,
  migrate (db) {
    db.exec(MIGRATION_1);
    db.exec(MIGRATION_2);
  }
}
