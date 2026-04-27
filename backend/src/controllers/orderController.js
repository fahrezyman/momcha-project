const logger = require("../utils/logger");
const db = require("../config/db");
const { generateOrderNumber } = require("../utils/generateOrderNumbers");
const { createTransaction } = require("../utils/midtrans");

// Fetch service details and calculate totals from an array of { service_id, quantity, custom_price? }
// allowCustomPrice: only createOrder supports overriding price
async function resolveServiceDetails(services, allowCustomPrice = false) {
  let total_amount = 0;
  let total_duration = 0;
  const serviceDetails = [];

  for (const svc of services) {
    const [dbServices] = await db.query(
      "SELECT * FROM services WHERE id = ? AND is_active = 1",
      [svc.service_id],
    );

    if (dbServices.length === 0) {
      return {
        error: {
          code: "SERVICE_NOT_FOUND",
          message: `Service ID ${svc.service_id} not found or inactive`,
        },
      };
    }

    const service = dbServices[0];
    const quantity = svc.quantity || 1;
    const price = (allowCustomPrice && svc.custom_price) ? svc.custom_price : service.price;
    const subtotal = price * quantity;

    total_amount += subtotal;
    total_duration += service.duration_minutes * quantity;

    serviceDetails.push({
      service_id: service.id,
      service_name: service.name,
      price,
      duration_minutes: service.duration_minutes,
      quantity,
      subtotal,
    });
  }

  return { total_amount, total_duration, serviceDetails };
}

// Check for schedule conflicts on a given date/time/duration.
// excludeOrderId: pass the current order id when rescheduling to exclude itself.
async function checkScheduleConflict(date, time, duration, excludeOrderId = null) {
  let query = `
    SELECT
      o.id,
      o.order_number,
      o.service_start_time,
      o.total_duration_minutes,
      c.name as customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.service_date = ?
      AND o.status NOT IN ('cancelled', 'refunded')
      AND (
        (o.service_start_time <= ? AND
         ADDTIME(o.service_start_time, SEC_TO_TIME(o.total_duration_minutes * 60)) > ?)
        OR
        (o.service_start_time < ADDTIME(?, SEC_TO_TIME(? * 60)) AND
         o.service_start_time >= ?)
      )
  `;
  const params = [date, time, time, time, duration, time];

  if (excludeOrderId !== null) {
    query += ` AND o.id != ?`;
    params.push(excludeOrderId);
  }

  const [conflicts] = await db.query(query, params);
  return conflicts;
}

// Get all orders
async function getAllOrders(req, res) {
  try {
    const {
      status,
      payment_status,
      date_from,
      date_to,
      customer_id,
      page = 1,
      limit = 20,
    } = req.query;

    let query = `
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        GROUP_CONCAT(DISTINCT os.service_name SEPARATOR ', ') as services_names,
        COUNT(DISTINCT os.id) as services_count
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_services os ON o.id = os.order_id
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

    query += ` GROUP BY o.id`;
    query += ` ORDER BY o.created_at DESC`;

    // Pagination
    const safePage = Math.max(1, parseInt(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (safePage - 1) * safeLimit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(safeLimit, offset);

    const [rows] = await db.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT o.id) as total 
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

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
      },
    });
  } catch (error) {
    logger.error("Get all orders error:", error);
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

    // Get order with customer details
    const [orders] = await db.query(
      `
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
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

    // Get order services
    const [services] = await db.query(
      `
      SELECT * FROM order_services
      WHERE order_id = ?
      ORDER BY id
    `,
      [id],
    );

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
        services: services,
        reschedule_history: rescheduleHistory,
      },
    });
  } catch (error) {
    logger.error("Get order by ID error:", error);
    console.error("Get order by ID error:", error);
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
        o.total_amount,
        o.payment_status,
        o.payment_link,
        o.service_date,
        o.service_start_time,
        c.name as customer_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
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

    const order = orders[0];

    // Get services
    const [services] = await db.query(
      `SELECT service_name, quantity, subtotal FROM order_services WHERE order_id = (SELECT id FROM orders WHERE order_number = ?)`,
      [order_number],
    );

    res.json({
      success: true,
      data: {
        ...order,
        services: services,
      },
    });
  } catch (error) {
    logger.error("Get order by number error:", error);
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
      services, // ← Array of services
      service_date,
      service_start_time,
      notes,
    } = req.body;

    // Validation
    if (
      !customer_name ||
      !customer_phone ||
      !services ||
      services.length === 0 ||
      !service_date ||
      !service_start_time
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Customer name, phone, services, date, and time are required",
        },
      });
    }

    // Get service details & calculate totals
    const resolved = await resolveServiceDetails(services, true);
    if (resolved.error) {
      return res.status(404).json({ success: false, error: resolved.error });
    }
    const { total_amount, total_duration, serviceDetails } = resolved;

    // Check schedule conflict
    const conflicts = await checkScheduleConflict(
      service_date,
      service_start_time,
      total_duration,
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
      customer_id = existingCustomers[0].id;
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

    // Create Midtrans transaction
    let payment_link = null;
    let qr_code_url = null;
    let thirdparty_transaction_id = null;

    try {
      const midtransResult = await createTransaction({
        order_number,
        amount: total_amount,
        customer_name,
        customer_email,
        customer_phone,
        service_name: serviceDetails.map((s) => s.service_name).join(", "),
      });

      payment_link = midtransResult.redirect_url;
      qr_code_url = midtransResult.qr_code_url;
      thirdparty_transaction_id = midtransResult.token;
    } catch (midtransError) {
      logger.error("Midtrans error:", midtransError);
      console.error("Midtrans error:", midtransError);
    }

    // Create order
    const [orderResult] = await db.query(
      `
      INSERT INTO orders (
        order_number,
        customer_id,
        service_date,
        service_start_time,
        total_amount,
        total_duration_minutes,
        notes,
        payment_status,
        payment_method,
        payment_link,
        thirdparty_transaction_id,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'qris', ?, ?, 'pending_payment')
    `,
      [
        order_number,
        customer_id,
        service_date,
        service_start_time,
        total_amount,
        total_duration,
        notes || null,
        payment_link,
        thirdparty_transaction_id,
      ],
    );

    const order_id = orderResult.insertId;

    // Insert order services
    for (const detail of serviceDetails) {
      await db.query(
        `
        INSERT INTO order_services (
          order_id,
          service_id,
          service_name,
          price,
          duration_minutes,
          quantity,
          subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          order_id,
          detail.service_id,
          detail.service_name,
          detail.price,
          detail.duration_minutes,
          detail.quantity,
          detail.subtotal,
        ],
      );
    }

    res.status(201).json({
      success: true,
      data: {
        order_id,
        order_number,
        services: serviceDetails,
        total_amount,
        total_duration,
        payment_link,
        qr_code_url,
      },
    });
  } catch (error) {
    logger.error("Create order error:", error);
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

// Update order
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { services, notes } = req.body;

    // Get current order
    const [orders] = await db.query(
      `
      SELECT 
        o.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
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

    // If services updated
    if (services && services.length > 0) {
      // Recalculate totals
      const resolved = await resolveServiceDetails(services);
      if (resolved.error) {
        return res.status(404).json({ success: false, error: resolved.error });
      }
      const { total_amount, total_duration, serviceDetails } = resolved;

      // Delete old services
      await db.query("DELETE FROM order_services WHERE order_id = ?", [id]);

      // Insert new services
      for (const detail of serviceDetails) {
        await db.query(
          `
          INSERT INTO order_services (
            order_id, service_id, service_name, price,
            duration_minutes, quantity, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            id,
            detail.service_id,
            detail.service_name,
            detail.price,
            detail.duration_minutes,
            detail.quantity,
            detail.subtotal,
          ],
        );
      }

      // Update order totals
      await db.query(
        "UPDATE orders SET total_amount = ?, total_duration_minutes = ? WHERE id = ?",
        [total_amount, total_duration, id],
      );

      // Regenerate payment link if pending
      if (order.payment_status === "pending") {
        try {
          const midtransResult = await createTransaction({
            order_number: order.order_number,
            amount: total_amount,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            service_name: serviceDetails.map((s) => s.service_name).join(", "),
          });

          await db.query(
            "UPDATE orders SET payment_link = ?, thirdparty_transaction_id = ? WHERE id = ?",
            [midtransResult.redirect_url, midtransResult.token, id],
          );
        } catch (midtransError) {
          logger.error("Midtrans error:", midtransError);
          console.error("Midtrans error:", midtransError);
        }
      }
    }

    // Update notes
    if (notes !== undefined) {
      await db.query("UPDATE orders SET notes = ? WHERE id = ?", [notes, id]);
    }

    res.json({
      success: true,
      data: {
        order_id: id,
        order_number: order.order_number,
      },
    });
  } catch (error) {
    logger.error("Update order error:", error);
    console.error("Update order error:", error);
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

    if (!new_date || !new_time) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "New date and time are required",
        },
      });
    }

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

    // Check conflict (exclude current order)
    const conflicts = await checkScheduleConflict(
      new_date,
      new_time,
      order.total_duration_minutes,
      id,
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

    // Save history
    await db.query(
      `
      INSERT INTO order_reschedule_history (
        order_id, old_date, old_time, new_date, new_time, reason
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
    logger.error("Reschedule order error:", error);
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

    let updateQuery = "UPDATE orders SET status = ?";
    let params = [status];

    if (status === "paid") {
      updateQuery += ", payment_status = ?, paid_at = NOW()";
      params.push("paid");
    }

    updateQuery += " WHERE id = ?";
    params.push(id);

    await db.query(updateQuery, params);

    res.json({
      success: true,
      data: {
        order_id: id,
        order_number: order.order_number,
        status,
        payment_status: status === "paid" ? "paid" : order.payment_status,
      },
    });
  } catch (error) {
    logger.error("Update order status error:", error);
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
    const { reason, refund_notes } = req.body;

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

    if (order.payment_status === "paid" && !refund_notes) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Keterangan refund wajib diisi untuk order yang sudah lunas",
        },
      });
    }

    const cancelNotes = reason ? `[Dibatalkan] ${reason}` : "[Dibatalkan]";
    const fullNotes = refund_notes
      ? `${cancelNotes}\n[Refund Manual] ${refund_notes}`
      : cancelNotes;

    await db.query(
      "UPDATE orders SET status = ?, payment_status = ?, notes = ? WHERE id = ?",
      ["cancelled", "cancelled", fullNotes, id],
    );

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
    logger.error("Cancel order error:", error);
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
  updateOrder,
  rescheduleOrder,
  updateOrderStatus,
  cancelOrder,
};
