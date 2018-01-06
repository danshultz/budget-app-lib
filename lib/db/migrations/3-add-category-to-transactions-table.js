const MIGRATION = `
ALTER TABLE transactions
ADD COLUMN categories JSON1;
`;

module.exports = {
  id: 3,
  migrate (db) { return db.run(MIGRATION); }
}
