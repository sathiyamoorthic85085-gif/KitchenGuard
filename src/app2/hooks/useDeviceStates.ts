import { useState, useEffect } from "react";

interface DeviceState {
  device_type: string;
  is_on: boolean;
  is_manual_override: boolean;
  last_state_change_at: string;
}

export function useDeviceStates() {
  const [deviceStates, setDeviceStates] = useState<Record<string, DeviceState>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeviceStates = async () => {
    try {
      const response = await fetch("/api/devices/states");
      const data = await response.json();
      
      const statesMap: Record<string, DeviceState> = {};
      for (const state of data.states || []) {
        statesMap[state.device_type] = state;
      }
      
      setDeviceStates(statesMap);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceStates();
    const interval = setInterval(fetchDeviceStates, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleDevice = async (deviceType: string, newState: boolean, isManualOverride: boolean = true) => {
    try {
      await fetch("/api/devices/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_type: deviceType,
          is_on: newState,
          is_manual_override: isManualOverride,
        }),
      });
      
      await fetchDeviceStates();
    } catch (error) {
      // Silently handle error - UI will reflect actual state on next fetch
    }
  };

  return { deviceStates, isLoading, toggleDevice, refetch: fetchDeviceStates };
}
