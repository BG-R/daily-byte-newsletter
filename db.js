const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'newsletter.db'));

// Create table if it doesn't exist
const initSQL = `
  CREATE TABLE IF NOT EXISTS subscribers (
    email TEXT PRIMARY KEY,
    stripe_customer_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

db.exec(initSQL);

function addSubscriber(email, stripeCustomerId) {
  const stmt = db.prepare('INSERT OR REPLACE INTO subscribers (email, stripe_customer_id, status) VALUES (?, ?, ?)');
  stmt.run(email, stripeCustomerId, 'active');
}

function setSubscriptionStatus(email, status) {
  const stmt = db.prepare('UPDATE subscribers SET status = ? WHERE email = ?');
  stmt.run(status, email);
}

function getActiveSubscribers() {
  const stmt = db.prepare("SELECT email FROM subscribers WHERE status = 'active'");
  return stmt.all().map(row => row.email);
}

module.exports = {
  addSubscriber,
  setSubscriptionStatus,
  getActiveSubscribers,
};
