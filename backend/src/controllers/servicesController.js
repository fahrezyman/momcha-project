const db = require("../config/db");

// Get all services
async function getAllServices(req, res) {
  try {
    const { is_active } = req.query;

    let query = "SELECT * FROM services";
    const params = [];

    if (is_active !== undefined) {
      query += " WHERE is_active = ?";
      params.push(is_active === "true" ? 1 : 0);
    }

    query += " ORDER BY sort_order ASC, created_at DESC";

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Get single service
async function getServiceById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT * FROM services WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Service not found",
        },
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get service error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Create service
async function createService(req, res) {
  try {
    const { name, description, price, duration_minutes } = req.body;

    // Validation
    if (!name || !price || !duration_minutes) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Name, price, and duration are required",
        },
      });
    }

    const [result] = await db.query(
      "INSERT INTO services (name, description, price, duration_minutes) VALUES (?, ?, ?, ?)",
      [name, description, price, duration_minutes],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name,
        description,
        price,
        duration_minutes,
        is_active: true,
      },
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Update service
async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, duration_minutes, is_active } = req.body;

    // Check if service exists
    const [existing] = await db.query("SELECT id FROM services WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Service not found",
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
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (price !== undefined) {
      updates.push("price = ?");
      params.push(price);
    }
    if (duration_minutes !== undefined) {
      updates.push("duration_minutes = ?");
      params.push(duration_minutes);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active ? 1 : 0);
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
      `UPDATE services SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    // Get updated service
    const [rows] = await db.query("SELECT * FROM services WHERE id = ?", [id]);

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Delete service (soft delete)
async function deleteService(req, res) {
  try {
    const { id } = req.params;

    // Check if service exists
    const [existing] = await db.query("SELECT id FROM services WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Service not found",
        },
      });
    }

    // Soft delete
    await db.query("UPDATE services SET is_active = 0 WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Service deactivated successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Reorder services
async function reorderServices(req, res) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "ids harus berupa array" },
      });
    }

    await Promise.all(
      ids.map((id, index) =>
        db.query("UPDATE services SET sort_order = ? WHERE id = ?", [index, id]),
      ),
    );

    res.json({ success: true, message: "Urutan berhasil disimpan" });
  } catch (error) {
    console.error("Reorder services error:", error);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  reorderServices,
};
