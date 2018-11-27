const MIGRATION = `
ALTER TABLE accounts
ADD COLUMN balance_posted_at TIME;
`;

module.exports = {
  id: 5,
  migrate (db) { return db.run(MIGRATION); }
}
