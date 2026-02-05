import { Hono } from "hono";

const app = new Hono<{ Bindings: any }>();

// Get latest sensor readings
app.get("/latest", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;
  const readings = await db
    .prepare(
      `
      SELECT sensor_type, value, unit, created_at
      FROM sensor_readings
      WHERE user_id = ?
      AND id IN (
        SELECT MAX(id)
        FROM sensor_readings
        WHERE user_id = ?
        GROUP BY sensor_type
      )
      ORDER BY sensor_type
    `
    )
    .bind(user.id, user.id)
    .all();

  return c.json({ readings: readings.results });
});

// Add a new sensor reading
app.post("/reading", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { sensor_type, value, unit } = await c.req.json();

  if (!sensor_type || value === undefined || !unit) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const db = c.env.DB;
  const now = new Date().toISOString();

  await db
    .prepare(
      `
      INSERT INTO sensor_readings (user_id, sensor_type, value, unit, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    )
    .bind(user.id, sensor_type, value, unit, now, now)
    .run();

  return c.json({ success: true });
});

export default app;
