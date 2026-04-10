const logger = require("../utils/logger");
const db = require("../config/db");

// Get all customers
async function getAllCustomers(req, res) {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as total_spent
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE 1=1
    `;

    const params = [];

    // Search filter
    if (search) {
      query += ` AND (
        c.name LIKE ? OR 
        c.phone LIKE ? OR 
        c.email LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Group by customer
    query += ` GROUP BY c.id`;

    // Order by
    query += ` ORDER BY c.created_at DESC`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT c.id) as total 
      FROM customers c
      WHERE 1=1
    `;
    const countParams = [];

    if (search) {
      countQuery += ` AND (
        c.name LIKE ? OR 
        c.phone LIKE ? OR 
        c.email LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
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
    logger.error("Get customers error:", error);
    console.error("Get customers error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Get customer by ID with order history
async function getCustomerById(req, res) {
  try {
    const { id } = req.params;

    // Get customer
    const [customers] = await db.query("SELECT * FROM customers WHERE id = ?", [
      id,
    ]);

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Customer not found",
        },
      });
    }

    const customer = customers[0];

    // Get customer orders
    const [orders] = await db.query(
      `
      SELECT 
        o.order_number,
        s.name as service_name,
        o.service_date,
        o.service_start_time,
        o.amount,
        o.payment_status,
        o.status,
        o.created_at
      FROM orders o
      JOIN services s ON o.service_id = s.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `,
      [id],
    );

    // Get stats
    const [stats] = await db.query(
      `
      SELECT 
        COUNT(id) as total_orders,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END), 0) as total_spent
      FROM orders
      WHERE customer_id = ?
    `,
      [id],
    );

    res.json({
      success: true,
      data: {
        ...customer,
        orders,
        stats: stats[0],
      },
    });
  } catch (error) {
    logger.error("Get customers error:", error);
    console.error("Get customer error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Create customer
async function createCustomer(req, res) {
  try {
    const { name, phone, email, address, notes } = req.body;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Name and phone are required",
        },
      });
    }

    // Check if phone already exists
    const [existing] = await db.query(
      "SELECT id FROM customers WHERE phone = ?",
      [phone],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "ALREADY_EXISTS",
          message: "Customer with this phone number already exists",
          existing_customer_id: existing[0].id,
        },
      });
    }

    // Insert customer
    const [result] = await db.query(
      "INSERT INTO customers (name, phone, email, address, notes) VALUES (?, ?, ?, ?, ?)",
      [name, phone, email || null, address || null, notes || null],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name,
        phone,
        email,
        address,
        notes,
      },
    });
  } catch (error) {
    logger.error("Create customer error:", error);
    console.error("Create customer error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Update customer
async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, email, address, notes } = req.body;

    // Check if customer exists
    const [existing] = await db.query("SELECT id FROM customers WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Customer not found",
        },
      });
    }

    // Build update query
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (phone !== undefined) {
      // Check if new phone already used by other customer
      const [phoneCheck] = await db.query(
        "SELECT id FROM customers WHERE phone = ? AND id != ?",
        [phone, id],
      );

      if (phoneCheck.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "PHONE_TAKEN",
            message: "Phone number already used by another customer",
          },
        });
      }

      updates.push("phone = ?");
      params.push(phone);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      params.push(email || null);
    }
    if (address !== undefined) {
      updates.push("address = ?");
      params.push(address || null);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      params.push(notes || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "No fields to update",
        },
      });
    }

    params.push(id);

    await db.query(
      `UPDATE customers SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    // Get updated customer
    const [rows] = await db.query("SELECT * FROM customers WHERE id = ?", [id]);

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    logger.error("Update customer error:", error);
    console.error("Update customer error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Delete customer
async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;

    // Check if customer exists
    const [existing] = await db.query("SELECT id FROM customers WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Customer not found",
        },
      });
    }

    // Check if customer has orders
    const [orders] = await db.query(
      "SELECT id FROM orders WHERE customer_id = ? LIMIT 1",
      [id],
    );

    if (orders.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "HAS_ORDERS",
          message: "Cannot delete customer with existing orders",
        },
      });
    }

    // Delete customer
    await db.query("DELETE FROM customers WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    logger.error("Delete customer error:", error);
    console.error("Delete customer error:", error);
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
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
