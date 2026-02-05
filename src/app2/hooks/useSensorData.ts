import { useState, useEffect } from "react";

interface SensorReading {
  sensor_type: string;
  value: number;
  unit: string;
  created_at: string;
}

interface SensorData {
  lpg: {
    value: number;
    unit: string;
    status: "safe" | "warning" | "danger";
  };
  co: {
    value: number;
    unit: string;
    status: "safe" | "warning" | "danger";
  };
  temperature: {
    value: number;
    unit: string;
    status: "safe" | "warning" | "danger";
  };
  childDetected: {
    value: number;
    isDetected: boolean;
    status: "safe" | "warning" | "danger";
  };
}

export function useSensorData(refreshInterval = 5000) {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [thresholds, setThresholds] = useState({
    lpg: 50,
    co: 35,
    temp: 60,
  });

  const fetchSensorData = async () => {
    try {
      // Fetch latest sensor readings
      const sensorsResponse = await fetch("/api/sensors/latest");
      const sensorsData = await sensorsResponse.json();

      // Fetch user settings for thresholds
      const settingsResponse = await fetch("/api/settings");
      const settingsData = await settingsResponse.json();

      if (settingsData.settings) {
        setThresholds({
          lpg: settingsData.settings.lpg_threshold,
          co: settingsData.settings.co_threshold,
          temp: settingsData.settings.temp_threshold,
        });
      }

      // Process sensor readings
      const readings = sensorsData.readings || [];
      const readingsMap: Record<string, SensorReading> = {};
      for (const reading of readings) {
        readingsMap[reading.sensor_type] = reading;
      }

      const getStatus = (value: number, threshold: number): "safe" | "warning" | "danger" => {
        if (value >= threshold) return "danger";
        if (value >= threshold * 0.8) return "warning";
        return "safe";
      };

      const lpgReading = readingsMap.lpg || { value: 0, unit: "ppm" };
      const coReading = readingsMap.co || { value: 0, unit: "ppm" };
      const tempReading = readingsMap.temperature || { value: 0, unit: "°C" };
      const childReading = readingsMap.child_detected || { value: 0, unit: "boolean" };

      setSensorData({
        lpg: {
          value: lpgReading.value,
          unit: lpgReading.unit,
          status: getStatus(lpgReading.value, thresholds.lpg),
        },
        co: {
          value: coReading.value,
          unit: coReading.unit,
          status: getStatus(coReading.value, thresholds.co),
        },
        temperature: {
          value: tempReading.value,
          unit: tempReading.unit,
          status: getStatus(tempReading.value, thresholds.temp),
        },
        childDetected: {
          value: childReading.value,
          isDetected: childReading.value >= 1,
          status: childReading.value >= 1 ? "danger" : "safe",
        },
      });

      // Run automation analysis
      await fetch("/api/automation/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { sensorData, isLoading, thresholds, refetch: fetchSensorData };
}
