const MIGRATION_1 = `
ALTER TABLE transactions
ADD COLUMN category_ids JSON1 DEFAULT '[]' NOT NULL;
`;

const MIGRATION_2 = `
UPDATE transactions SET category_ids = (
  SELECT data.c_ids
  FROM (
    SELECT
      transactions.id as id,
      '[' || GROUP_CONCAT(JSON_EXTRACT(categories.value, '$.key')) || ']' as c_ids
    FROM transactions,  JSON_EACH(categories) as categories
    GROUP BY transactions.id
  ) data
  WHERE data.id = transactions.id
)
WHERE transactions.categories != '[]'
;`;

module.exports = {
  id: 7,
  migrate (db) {
    db.exec(MIGRATION_1);
    db.exec(MIGRATION_2);
  }
}
