const db = require("../config/db");
const { generateOrderNumber } = require("../utils/generateOrderNumbers");
const { createTransaction } = require("../utils/midtrans");

// Get all orders
async function getAllOrders(req, res) {
  try {
    const {
      status,
      payment_status,
      date_from,
      date_to,
      customer_id,
      service_id,
      page = 1,
      limit = 20,
    } = req.query;

    let query = `
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        s.name as service_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN services s ON o.service_id = s.id
      WHERE 1=1
    `;

    const params = [];

    // Filters
    if (status) {
      query += ` AND o.status = ?`;
      params.push(status);
    }

    if (payment_status) {
      query += ` AND o.payment_status = ?`;
      params.push(payment_status);
    }

    if (date_from) {
      query += ` AND o.service_date >= ?`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND o.service_date <= ?`;
      params.push(date_to);
    }

    if (customer_id) {
      query += ` AND o.customer_id = ?`;
      params.push(customer_id);
    }

    if (service_id) {
      query += ` AND o.service_id = ?`;
      params.push(service_id);
    }

    query += ` ORDER BY o.created_at DESC`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM orders o
      WHERE 1=1
    `;
    const countParams = [];

    if (status) {
      countQuery += ` AND o.status = ?`;
      countParams.push(status);
    }
    if (payment_status) {
      countQuery += ` AND o.payment_status = ?`;
      countParams.push(payment_status);
    }
    if (date_from) {
      countQuery += ` AND o.service_date >= ?`;
      countParams.push(date_from);
    }
    if (date_to) {
      countQuery += ` AND o.service_date <= ?`;
      countParams.push(date_to);
    }
    if (customer_id) {
      countQuery += ` AND o.customer_id = ?`;
      countParams.push(customer_id);
    }
    if (service_id) {
      countQuery += ` AND o.service_id = ?`;
      countParams.push(service_id);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Get order by ID
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    // Get order with customer and service details
    const [orders] = await db.query(
      `
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address,
        s.name as service_name,
        s.price as service_price,
        s.duration_minutes as service_duration
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN services s ON o.service_id = s.id
      WHERE o.id = ?
    `,
      [id],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Order not found",
        },
      });
    }

    const order = orders[0];

    // Get reschedule history
    const [rescheduleHistory] = await db.query(
      `
      SELECT * FROM order_reschedule_history
      WHERE order_id = ?
      ORDER BY rescheduled_at DESC
    `,
      [id],
    );

    res.json({
      success: true,
      data: {
        ...order,
        reschedule_history: rescheduleHistory,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Get order by order number (public - for payment page)
async function getOrderByOrderNumber(req, res) {
  try {
    const { order_number } = req.params;

    const [orders] = await db.query(
      `
      SELECT 
        o.order_number,
        o.amount,
        o.payment_status,
        o.payment_link,
        o.service_date,
        o.service_start_time,
        c.name as customer_name,
        s.name as service_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN services s ON o.service_id = s.id
      WHERE o.order_number = ?
    `,
      [order_number],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Order not found",
        },
      });
    }

    res.json({
      success: true,
      data: orders[0],
    });
  } catch (error) {
    console.error("Get order by number error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Create order
async function createOrder(req, res) {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      service_id,
      service_date,
      service_start_time,
      service_notes,
      amount,
    } = req.body;

    // Validation
    if (
      !customer_name ||
      !customer_phone ||
      !service_id ||
      !service_date ||
      !service_start_time ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Customer name, phone, service, date, time, and amount are required",
        },
      });
    }

    // Get service details
    const [services] = await db.query(
      "SELECT * FROM services WHERE id = ? AND is_active = 1",
      [service_id],
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "SERVICE_NOT_FOUND",
          message: "Service not found or inactive",
        },
      });
    }

    const service = services[0];

    // Check schedule conflict
    const [conflicts] = await db.query(
      `
      SELECT 
        o.id,
        o.order_number,
        o.service_start_time,
        o.service_duration_minutes,
        c.name as customer_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.service_date = ?
        AND o.status NOT IN ('cancelled', 'refunded')
        AND (
          (o.service_start_time <= ? AND 
           ADDTIME(o.service_start_time, SEC_TO_TIME(o.service_duration_minutes * 60)) > ?)
          OR
          (o.service_start_time < ADDTIME(?, SEC_TO_TIME(? * 60)) AND
           o.service_start_time >= ?)
        )
    `,
      [
        service_date,
        service_start_time,
        service_start_time,
        service_start_time,
        service.duration_minutes,
        service_start_time,
      ],
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "SCHEDULE_CONFLICT",
          message: "Time slot already booked",
          conflict_order: {
            order_number: conflicts[0].order_number,
            customer_name: conflicts[0].customer_name,
            time: conflicts[0].service_start_time,
          },
        },
      });
    }

    // Find or create customer
    let customer_id;
    const [existingCustomers] = await db.query(
      "SELECT id FROM customers WHERE phone = ?",
      [customer_phone],
    );

    if (existingCustomers.length > 0) {
      // Customer exists
      customer_id = existingCustomers[0].id;

      // Update customer info
      await db.query(
        "UPDATE customers SET name = ?, email = ?, address = ? WHERE id = ?",
        [
          customer_name,
          customer_email || null,
          customer_address || null,
          customer_id,
        ],
      );
    } else {
      // New customer
      const [customerResult] = await db.query(
        "INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)",
        [
          customer_name,
          customer_phone,
          customer_email || null,
          customer_address || null,
        ],
      );
      customer_id = customerResult.insertId;
    }

    // Generate order number
    const order_number = await generateOrderNumber();

    // ✨ CREATE MIDTRANS TRANSACTION
    let payment_link = null;
    let qr_code_url = null;
    let thirdparty_transaction_id = null;

    try {
      const midtransResult = await createTransaction({
        order_number,
        amount,
        customer_name,
        customer_email,
        customer_phone,
        service_name: service.name,
      });

      payment_link = midtransResult.redirect_url;
      qr_code_url = midtransResult.qr_code_url;
      thirdparty_transaction_id = midtransResult.token;
    } catch (midtransError) {
      console.error("Midtrans error:", midtransError);
      // Continue without payment link (can be generated later)
    }

    // Create order
    const [orderResult] = await db.query(
      `
      INSERT INTO orders (
        order_number,
        customer_id,
        service_id,
        service_date,
        service_start_time,
        service_duration_minutes,
        service_notes,
        amount,
        payment_status,
        payment_method,
        payment_link,
        thirdparty_transaction_id,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'qris', ?, ?, 'pending_payment')
    `,
      [
        order_number,
        customer_id,
        service_id,
        service_date,
        service_start_time,
        service.duration_minutes,
        service_notes || null,
        amount,
        payment_link,
        thirdparty_transaction_id,
      ],
    );

    res.status(201).json({
      success: true,
      data: {
        order_id: orderResult.insertId,
        order_number,
        customer_id,
        service_id,
        service_date,
        service_start_time,
        amount,
        payment_link,
        qr_code_url,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Reschedule order
async function rescheduleOrder(req, res) {
  try {
    const { id } = req.params;
    const { new_date, new_time, reason } = req.body;

    // Validation
    if (!new_date || !new_time) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "New date and time are required",
        },
      });
    }

    // Get order
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Order not found",
        },
      });
    }

    const order = orders[0];

    // Check schedule conflict for new time
    const [conflicts] = await db.query(
      `
      SELECT 
        o.id,
        o.order_number,
        c.name as customer_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.service_date = ?
        AND o.id != ?
        AND o.status NOT IN ('cancelled', 'refunded')
        AND (
          (o.service_start_time <= ? AND 
           ADDTIME(o.service_start_time, SEC_TO_TIME(o.service_duration_minutes * 60)) > ?)
          OR
          (o.service_start_time < ADDTIME(?, SEC_TO_TIME(? * 60)) AND
           o.service_start_time >= ?)
        )
    `,
      [
        new_date,
        id,
        new_time,
        new_time,
        new_time,
        order.service_duration_minutes,
        new_time,
      ],
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "SCHEDULE_CONFLICT",
          message: "New time slot already booked",
          conflict_order: {
            order_number: conflicts[0].order_number,
            customer_name: conflicts[0].customer_name,
          },
        },
      });
    }

    // Save reschedule history
    await db.query(
      `
      INSERT INTO order_reschedule_history (
        order_id,
        old_date,
        old_time,
        new_date,
        new_time,
        reason
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        order.service_date,
        order.service_start_time,
        new_date,
        new_time,
        reason || null,
      ],
    );

    // Update order
    await db.query(
      "UPDATE orders SET service_date = ?, service_start_time = ? WHERE id = ?",
      [new_date, new_time, id],
    );

    res.json({
      success: true,
      data: {
        order_id: id,
        order_number: order.order_number,
        old_date: order.service_date,
        old_time: order.service_start_time,
        new_date,
        new_time,
      },
    });
  } catch (error) {
    console.error("Reschedule order error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Update order status
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    const validStatuses = [
      "pending_payment",
      "paid",
      "completed",
      "cancelled",
      "refunded",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        },
      });
    }

    // Get order
    const [orders] = await db.query(
      "SELECT order_number FROM orders WHERE id = ?",
      [id],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Order not found",
        },
      });
    }

    // Update status
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

    res.json({
      success: true,
      data: {
        order_id: id,
        order_number: orders[0].order_number,
        status,
      },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Cancel order
async function cancelOrder(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get order
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Order not found",
        },
      });
    }

    const order = orders[0];

    // Update order
    await db.query(
      "UPDATE orders SET status = ?, payment_status = ? WHERE id = ?",
      ["cancelled", "cancelled", id],
    );

    // TODO: If payment was made, process refund

    res.json({
      success: true,
      data: {
        order_id: id,
        order_number: order.order_number,
        status: "cancelled",
        payment_status: "cancelled",
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
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
  getAllOrders,
  getOrderById,
  getOrderByOrderNumber,
  createOrder,
  rescheduleOrder,
  updateOrderStatus,
  cancelOrder,
};
