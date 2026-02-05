import { Hono } from "hono";

const app = new Hono<{ Bindings: any }>();

// Get device states
app.get("/states", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;
  const states = await db
    .prepare("SELECT * FROM device_states WHERE user_id = ? ORDER BY device_type")
    .bind(user.id)
    .all();

  return c.json({ states: states.results });
});

// Toggle device
app.post("/toggle", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { device_type, is_on, is_manual_override } = await c.req.json();

  if (!device_type || is_on === undefined) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const db = c.env.DB;
  const now = new Date().toISOString();

  // Check if device state exists
  const existing = await db
    .prepare("SELECT id FROM device_states WHERE user_id = ? AND device_type = ?")
    .bind(user.id, device_type)
    .first();

  if (existing) {
    await db
      .prepare(
        `
        UPDATE device_states
        SET is_on = ?, is_manual_override = ?, last_state_change_at = ?, updated_at = ?
        WHERE user_id = ? AND device_type = ?
      `
      )
      .bind(is_on ? 1 : 0, is_manual_override ? 1 : 0, now, now, user.id, device_type)
      .run();
  } else {
    await db
      .prepare(
        `
        INSERT INTO device_states (user_id, device_type, is_on, is_manual_override, last_state_change_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      )
      .bind(user.id, device_type, is_on ? 1 : 0, is_manual_override ? 1 : 0, now, now, now)
      .run();
  }

  return c.json({ success: true });
});

export default app;
