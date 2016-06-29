const MIGRATION = `
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  fit_id VARCHAR(255),
  date DATE NOT NULL,
  description TEXT,
  memo TEXT,
  name VARCHAR(255),
  payee VARCHAR(255),
  checkNumber VARCHAR(255),
  amount INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  created_at TIME,
  updated_at TIME
);`;

module.exports = {
  id: 2,
  migrate (db) { return db.run(MIGRATION); }
}
