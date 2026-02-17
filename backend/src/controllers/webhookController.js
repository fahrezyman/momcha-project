const db = require("../config/db");
const { verifySignature } = require("../utils/midtrans");
const { generateInvoiceNumber } = require("../utils/generateInvoiceNumbers");

/**
 * Handle Midtrans payment notification (webhook)
 */
async function handlePaymentNotification(req, res) {
  try {
    const notification = req.body;

    console.log("📥 Midtrans notification received:", notification);

    // Verify signature
    const isValid = verifySignature(notification);

    if (!isValid) {
      console.error("❌ Invalid signature from Midtrans");
      return res.status(403).json({
        success: false,
        error: {
          code: "INVALID_SIGNATURE",
          message: "Invalid signature",
        },
      });
    }

    const { order_id, transaction_status, fraud_status, transaction_id } =
      notification;

    // Get order
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE order_number = ?",
      [order_id],
    );

    if (orders.length === 0) {
      console.error("❌ Order not found:", order_id);
      return res.status(404).json({
        success: false,
        error: {
          code: "ORDER_NOT_FOUND",
          message: "Order not found",
        },
      });
    }

    const order = orders[0];

    // Update order based on transaction status
    let payment_status;
    let order_status;

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      if (fraud_status === "accept") {
        payment_status = "paid";
        order_status = "paid";
      }
    } else if (transaction_status === "pending") {
      payment_status = "pending";
      order_status = "pending_payment";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel"
    ) {
      payment_status = "cancelled";
      order_status = "cancelled";
    } else if (transaction_status === "expire") {
      payment_status = "expired";
      order_status = "cancelled";
    } else if (transaction_status === "refund") {
      payment_status = "refunded";
      order_status = "refunded";
    }

    // Update order
    const updateQuery = `
      UPDATE orders 
      SET payment_status = ?,
          status = ?,
          thirdparty_transaction_id = ?,
          paid_at = ${payment_status === "paid" ? "NOW()" : "paid_at"}
      WHERE id = ?
    `;

    await db.query(updateQuery, [
      payment_status,
      order_status,
      transaction_id,
      order.id,
    ]);

    // If payment successful, generate invoice
    if (payment_status === "paid" && !order.invoice_number) {
      const invoice_number = await generateInvoiceNumber();

      await db.query("UPDATE orders SET invoice_number = ? WHERE id = ?", [
        invoice_number,
        order.id,
      ]);

      // TODO: Generate PDF invoice & send email
      console.log("✅ Payment successful, invoice generated:", invoice_number);
    }

    console.log(`✅ Order ${order_id} updated: ${payment_status}`);

    res.json({
      success: true,
      message: "Notification processed",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

module.exports = {
  handlePaymentNotification,
};
