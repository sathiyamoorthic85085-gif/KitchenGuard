import { Hono } from "hono";

const app = new Hono<{ Bindings: any }>();

// Get all family members
app.get("/members", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;
  const members = await db
    .prepare("SELECT * FROM family_members WHERE user_id = ? ORDER BY created_at DESC")
    .bind(user.id)
    .all();

  return c.json({ members: members.results });
});

// Add a family member
app.post("/members", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { name, relationship, email, phone, has_app_access } = await c.req.json();

  if (!name || !relationship) {
    return c.json({ error: "Name and relationship are required" }, 400);
  }

  const db = c.env.DB;
  const now = new Date().toISOString();

  const result = await db
    .prepare(
      `
      INSERT INTO family_members (user_id, name, relationship, email, phone, has_app_access, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
    .bind(
      user.id,
      name,
      relationship,
      email || "",
      phone || "",
      has_app_access ? 1 : 0,
      now,
      now
    )
    .run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

// Update a family member
app.put("/members/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const { name, relationship, email, phone, has_app_access } = await c.req.json();

  const db = c.env.DB;
  const now = new Date().toISOString();

  await db
    .prepare(
      `
      UPDATE family_members
      SET name = ?, relationship = ?, email = ?, phone = ?, has_app_access = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `
    )
    .bind(name, relationship, email || "", phone || "", has_app_access ? 1 : 0, now, id, user.id)
    .run();

  return c.json({ success: true });
});

// Delete a family member
app.delete("/members/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  const db = c.env.DB;
  await db
    .prepare("DELETE FROM family_members WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .run();

  return c.json({ success: true });
});

// Get all paired devices
app.get("/devices", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;
  const devices = await db
    .prepare("SELECT * FROM paired_devices WHERE user_id = ? ORDER BY created_at DESC")
    .bind(user.id)
    .all();

  return c.json({ devices: devices.results });
});

// Generate pairing code for new device
app.post("/devices/pair/start", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Generate a 6-digit pairing code
  const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();

  return c.json({ pairingCode, expiresIn: 300 }); // 5 minutes
});

// Complete device pairing
app.post("/devices/pair/complete", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { device_id, device_name, pairing_code, device_type, firmware_version } = await c.req.json();

  if (!device_id || !device_name || !pairing_code) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const db = c.env.DB;
  const now = new Date().toISOString();

  // Check if device already exists
  const existing = await db
    .prepare("SELECT id FROM paired_devices WHERE device_id = ?")
    .bind(device_id)
    .first();

  if (existing) {
    return c.json({ error: "Device already paired" }, 400);
  }

  const result = await db
    .prepare(
      `
      INSERT INTO paired_devices (
        user_id, device_id, device_name, device_type, pairing_code,
        is_paired, is_online, paired_at, firmware_version, last_seen_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?, ?)
    `
    )
    .bind(
      user.id,
      device_id,
      device_name,
      device_type || "esp32",
      pairing_code,
      now,
      firmware_version || "unknown",
      now,
      now,
      now
    )
    .run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

// Update device status
app.put("/devices/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const { device_name, is_online } = await c.req.json();

  const db = c.env.DB;
  const now = new Date().toISOString();

  await db
    .prepare(
      `
      UPDATE paired_devices
      SET device_name = ?, is_online = ?, last_seen_at = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `
    )
    .bind(device_name, is_online ? 1 : 0, now, now, id, user.id)
    .run();

  return c.json({ success: true });
});

// Delete a paired device
app.delete("/devices/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  const db = c.env.DB;
  await db
    .prepare("DELETE FROM paired_devices WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .run();

  return c.json({ success: true });
});

export default app;
