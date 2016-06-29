const MIGRATION = `
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name VARCHAR(255) NOT NULL,
  account_type VARCHAR(255) NOT NULL,
  account_id VARCHAR(255),
  bank_id VARCHAR(255),
  balance INTEGER,
  created_at TIME,
  updated_at TIME
);`;

module.exports = {
  id: 1,
  migrate (db) { return db.run(MIGRATION); }
}
