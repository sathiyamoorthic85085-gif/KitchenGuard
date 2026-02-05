import { Hono } from "hono";

const app = new Hono<{ Bindings: any }>();

// Get user settings
app.get("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;
  const settings = await db
    .prepare("SELECT * FROM user_settings WHERE user_id = ? LIMIT 1")
    .bind(user.id)
    .first();

  if (!settings) {
    // Return default settings if none exist
    return c.json({
      settings: {
        lpg_threshold: 50,
        co_threshold: 35,
        temp_threshold: 60,
        is_email_notifications_enabled: 1,
        is_push_notifications_enabled: 1,
        is_sms_notifications_enabled: 0,
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_email: "",
      },
    });
  }

  return c.json({ settings });
});

// Update user settings
app.put("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const {
    lpg_threshold,
    co_threshold,
    temp_threshold,
    is_email_notifications_enabled,
    is_push_notifications_enabled,
    is_sms_notifications_enabled,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_email,
  } = await c.req.json();

  const db = c.env.DB;
  const now = new Date().toISOString();

  // Check if settings exist
  const existing = await db
    .prepare("SELECT id FROM user_settings WHERE user_id = ? LIMIT 1")
    .bind(user.id)
    .first();

  if (existing) {
    await db
      .prepare(
        `
        UPDATE user_settings
        SET lpg_threshold = ?, co_threshold = ?, temp_threshold = ?,
            is_email_notifications_enabled = ?, is_push_notifications_enabled = ?,
            is_sms_notifications_enabled = ?, emergency_contact_name = ?,
            emergency_contact_phone = ?, emergency_contact_email = ?, updated_at = ?
        WHERE user_id = ?
      `
      )
      .bind(
        lpg_threshold,
        co_threshold,
        temp_threshold,
        is_email_notifications_enabled ? 1 : 0,
        is_push_notifications_enabled ? 1 : 0,
        is_sms_notifications_enabled ? 1 : 0,
        emergency_contact_name || "",
        emergency_contact_phone || "",
        emergency_contact_email || "",
        now,
        user.id
      )
      .run();
  } else {
    await db
      .prepare(
        `
        INSERT INTO user_settings (
          user_id, lpg_threshold, co_threshold, temp_threshold,
          is_email_notifications_enabled, is_push_notifications_enabled,
          is_sms_notifications_enabled, emergency_contact_name,
          emergency_contact_phone, emergency_contact_email,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      )
      .bind(
        user.id,
        lpg_threshold,
        co_threshold,
        temp_threshold,
        is_email_notifications_enabled ? 1 : 0,
        is_push_notifications_enabled ? 1 : 0,
        is_sms_notifications_enabled ? 1 : 0,
        emergency_contact_name || "",
        emergency_contact_phone || "",
        emergency_contact_email || "",
        now,
        now
      )
      .run();
  }

  return c.json({ success: true });
});

export default app;
