import { Hono } from "hono";

const app = new Hono<{ Bindings: any }>();

// Get automation rules
app.get("/rules", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;
  const rules = await db
    .prepare("SELECT * FROM automation_rules WHERE user_id = ? ORDER BY id")
    .bind(user.id)
    .all();

  return c.json({ rules: rules.results });
});

// Analyze all sensors and trigger automations if needed
app.post("/analyze", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;

  // Get latest readings for all sensors
  const readings = await db
    .prepare(
      `
      SELECT sensor_type, value
      FROM sensor_readings
      WHERE user_id = ?
      AND id IN (
        SELECT MAX(id)
        FROM sensor_readings
        WHERE user_id = ?
        GROUP BY sensor_type
      )
    `
    )
    .bind(user.id, user.id)
    .all();

  // Get user settings for thresholds
  const settings = await db
    .prepare("SELECT * FROM user_settings WHERE user_id = ? LIMIT 1")
    .bind(user.id)
    .first();

  const thresholds = settings || {
    lpg_threshold: 50,
    co_threshold: 35,
    temp_threshold: 60,
  };

  // Get all enabled automation rules
  const rules = await db
    .prepare("SELECT * FROM automation_rules WHERE user_id = ? AND is_enabled = 1")
    .bind(user.id)
    .all();

  const triggeredActions: any[] = [];
  const abnormalReadings: any[] = [];
  const now = new Date().toISOString();

  // Check each sensor reading against its rules
  for (const reading of readings.results as any[]) {
    const sensorValue = reading.value;
    const sensorType = reading.sensor_type;

    // Check if reading is abnormal based on thresholds
    let isAbnormal = false;
    if (sensorType === "lpg" && sensorValue >= thresholds.lpg_threshold * 0.8) {
      isAbnormal = true;
    } else if (sensorType === "co" && sensorValue >= thresholds.co_threshold * 0.8) {
      isAbnormal = true;
    } else if (sensorType === "temperature" && sensorValue >= thresholds.temp_threshold * 0.8) {
      isAbnormal = true;
    } else if (sensorType === "child_detected" && sensorValue >= 1) {
      isAbnormal = true;
    }

    if (isAbnormal) {
      abnormalReadings.push({
        sensor_type: sensorType,
        value: sensorValue,
      });
    }

    // Find matching rules for this sensor
    const sensorRules = (rules.results as any[]).filter(
      (rule) => rule.trigger_sensor === sensorType
    );

    for (const rule of sensorRules) {
      let shouldTrigger = false;

      if (rule.trigger_condition === "greater_than" && sensorValue >= rule.trigger_threshold) {
        shouldTrigger = true;
      } else if (rule.trigger_condition === "less_than" && sensorValue <= rule.trigger_threshold) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        const newState = rule.action_state === "on" ? 1 : 0;

        // Update device state
        await db
          .prepare(
            `
            INSERT OR REPLACE INTO device_states (user_id, device_type, is_on, is_manual_override, last_state_change_at, created_at, updated_at)
            VALUES (?, ?, ?, 0, ?, ?, ?)
          `
          )
          .bind(user.id, rule.action_device, newState, now, now, now)
          .run();

        triggeredActions.push({
          device: rule.action_device,
          action: rule.action_state,
          trigger: sensorType,
        });

        // Create alert if critical
        if (sensorType === "child_detected" || sensorValue >= rule.trigger_threshold) {
          const severity = sensorType === "child_detected" ? "critical" : "high";
          await db
            .prepare(
              `
              INSERT INTO alerts (user_id, alert_type, severity, sensor_type, sensor_value, is_resolved, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, 0, ?, ?)
            `
            )
            .bind(
              user.id,
              `${sensorType}_threshold_exceeded`,
              severity,
              sensorType,
              sensorValue,
              now,
              now
            )
            .run();
        }
      }
    }
  }

  return c.json({
    abnormalReadings,
    triggeredActions,
    hasAbnormalReadings: abnormalReadings.length > 0,
  });
});

// Process automation rules based on sensor readings
app.post("/process", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { sensor_type, value } = await c.req.json();

  if (!sensor_type || value === undefined) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const db = c.env.DB;

  // Get all enabled rules for this sensor
  const rules = await db
    .prepare(
      `
      SELECT * FROM automation_rules
      WHERE user_id = ? AND is_enabled = 1 AND trigger_sensor = ?
    `
    )
    .bind(user.id, sensor_type)
    .all();

  const triggeredActions: any[] = [];

  for (const rule of rules.results as any[]) {
    let shouldTrigger = false;

    if (rule.trigger_condition === "greater_than" && value > rule.trigger_threshold) {
      shouldTrigger = true;
    } else if (rule.trigger_condition === "less_than" && value < rule.trigger_threshold) {
      shouldTrigger = true;
    }

    if (shouldTrigger) {
      // Update device state
      const now = new Date().toISOString();
      const newState = rule.action_state === "on" ? 1 : 0;

      await db
        .prepare(
          `
          INSERT OR REPLACE INTO device_states (user_id, device_type, is_on, is_manual_override, last_state_change_at, created_at, updated_at)
          VALUES (?, ?, ?, 0, ?, ?, ?)
        `
        )
        .bind(user.id, rule.action_device, newState, now, now, now)
        .run();

      triggeredActions.push({
        device: rule.action_device,
        action: rule.action_state,
      });
    }
  }

  return c.json({ triggeredActions });
});

export default app;
