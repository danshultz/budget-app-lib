const MIGRATION = `
CREATE TABLE transactions (
  id INT PRIMARY KEY NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  memo TEXT,
  name VARCHAR(255),
  amount INT NOT NULL,
  balance INT NOT NULL,
  account_id INT NOT NULL,
  created_at TIME,
  updated_at TIME
);`;

module.exports = {
  id: 2,
  migrate (db) { return db.run(MIGRATION); }
}
