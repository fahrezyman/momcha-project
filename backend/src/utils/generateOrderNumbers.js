const db = require("../config/db");

/**
 * Generate order number: ORD-YYYYMMDD-XXX
 * Example: ORD-20260215-001
 */
async function generateOrderNumber() {
  try {
    // Get today's date in YYYYMMDD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const datePrefix = `${year}${month}${day}`;

    // Count orders created today
    const [rows] = await db.query(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE DATE(created_at) = CURDATE()
    `);

    const count = rows[0].count;
    const sequence = String(count + 1).padStart(3, "0");

    return `ORD-${datePrefix}-${sequence}`;
  } catch (error) {
    console.error("Generate order number error:", error);
    throw error;
  }
}

module.exports = { generateOrderNumber };
