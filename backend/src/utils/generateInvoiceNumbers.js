const db = require("../config/db");

/**
 * Generate invoice number: INV-YYYY-MM-XXX
 * Example: INV-2026-02-001
 */
async function generateInvoiceNumber() {
  try {
    // Get current year and month
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    // Count paid orders this month that have invoice
    const [rows] = await db.query(
      `
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE YEAR(created_at) = ? 
        AND MONTH(created_at) = ?
        AND invoice_number IS NOT NULL
    `,
      [year, month],
    );

    const count = rows[0].count;
    const sequence = String(count + 1).padStart(3, "0");

    return `INV-${year}-${month}-${sequence}`;
  } catch (error) {
    console.error("Generate invoice number error:", error);
    throw error;
  }
}

module.exports = { generateInvoiceNumber };
