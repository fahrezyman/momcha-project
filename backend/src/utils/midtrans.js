const midtransClient = require("midtrans-client");

// Create Snap API instance
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION_DEV === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY_DEV,
  clientKey: process.env.MIDTRANS_CLIENT_KEY_DEV,
});

/**
 * Create Midtrans transaction
 * @param {Object} orderData - Order data
 * @returns {Object} Transaction token and redirect URL
 */
async function createTransaction(orderData) {
  try {
    const {
      order_number,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      service_name,
    } = orderData;

    // Midtrans transaction parameter
    const parameter = {
      transaction_details: {
        order_id: order_number,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customer_name,
        email: customer_email || `${customer_phone}@momcha.temp`,
        phone: customer_phone,
      },
      item_details: [
        {
          id: order_number,
          price: amount,
          quantity: 1,
          name: service_name,
        },
      ],
      enabled_payments: ["qris"], // Only QRIS payment
      callbacks: {
        finish: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/success?order=${order_number}`,
      },
    };

    // Create transaction
    const transaction = await snap.createTransaction(parameter);

    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      qr_code_url: transaction.qr_code_url || null,
    };
  } catch (error) {
    console.error("Midtrans create transaction error:", error);
    throw error;
  }
}

/**
 * Get transaction status
 * @param {String} order_id - Order ID / Order Number
 * @returns {Object} Transaction status
 */
async function getTransactionStatus(order_id) {
  try {
    const statusResponse = await snap.transaction.status(order_id);
    return statusResponse;
  } catch (error) {
    console.error("Midtrans get status error:", error);
    throw error;
  }
}

/**
 * Verify notification signature
 * @param {Object} notification - Notification data from webhook
 * @returns {Boolean} Valid or not
 */
function verifySignature(notification) {
  const crypto = require("crypto");

  const { order_id, status_code, gross_amount, signature_key } = notification;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  // Create signature
  const hash = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  return hash === signature_key;
}

module.exports = {
  createTransaction,
  getTransactionStatus,
  verifySignature,
};
