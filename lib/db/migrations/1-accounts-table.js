const MIGRATION = `
CREATE TABLE accounts (
  id INT PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  account_type VARCHAR(255) NOT NULL,
  balance INT,
  created_at TIME,
  updated_at TIME
);`;

module.exports = {
  id: 1,
  migrate (db) { return db.run(MIGRATION); }
}
