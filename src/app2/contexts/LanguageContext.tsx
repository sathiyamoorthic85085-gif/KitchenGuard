import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ta";

interface Translations {
  header: {
    appName: string;
    signOut: string;
    settings: string;
  };
  status: {
    safe: string;
    warning: string;
    alert: string;
  };
  nav: {
    home: string;
    control: string;
    alerts: string;
    family: string;
    settings: string;
  };
  home: {
    childDetection: string;
    childDetected: string;
    noChildDetected: string;
    gasClosed: string;
    lpg: string;
    co: string;
    temperature: string;
    threshold: string;
    normal: string;
    warning: string;
    critical: string;
  };
  family: {
    title: string;
    familyMembers: string;
    addMember: string;
    add: string;
    addNewMember: string;
    name: string;
    relationship: string;
    email: string;
    phone: string;
    grantAccess: string;
    hasAccess: string;
    cancel: string;
    devices: string;
    pair: string;
    pairDevice: string;
    generateCode: string;
    waitingForDevice: string;
    enterCode: string;
    listeningForDevice: string;
    simulateConnection: string;
    forDemo: string;
    deviceConnected: string;
    deviceReady: string;
    online: string;
    offline: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    header: {
      appName: "KitchenGuard",
      signOut: "Sign out",
      settings: "Settings",
    },
    status: {
      safe: "Safe",
      warning: "Warning",
      alert: "Alert",
    },
    nav: {
      home: "Home",
      control: "Control",
      alerts: "Alerts",
      family: "Family",
      settings: "Settings",
    },
    home: {
      childDetection: "Child Detection",
      childDetected: "Child detected",
      noChildDetected: "No child detected",
      gasClosed: "Gas Closed",
      lpg: "LPG",
      co: "CO",
      temperature: "Temperature",
      threshold: "Threshold",
      normal: "Normal",
      warning: "Warning",
      critical: "Critical",
    },
    family: {
      title: "Family Center",
      familyMembers: "Family Members",
      addMember: "Add Member",
      add: "Add",
      addNewMember: "Add New Member",
      name: "Name",
      relationship: "Relationship",
      email: "Email (optional)",
      phone: "Phone (optional)",
      grantAccess: "Grant app access",
      hasAccess: "Access",
      cancel: "Cancel",
      devices: "ESP32 Devices",
      pair: "Pair",
      pairDevice: "Pair ESP32 Device",
      generateCode: "Generate Pairing Code",
      waitingForDevice: "Waiting for Device",
      enterCode: "Enter this code on your ESP32 device",
      listeningForDevice: "Listening for device connection...",
      simulateConnection: "Simulate ESP32 Connection",
      forDemo: "For demo purposes",
      deviceConnected: "Device Connected!",
      deviceReady: "Your ESP32 device is now paired and ready",
      online: "Online",
      offline: "Offline",
    },
  },
  ta: {
    header: {
      appName: "சமையலறை பாதுகாப்பு",
      signOut: "வெளியேறு",
      settings: "அமைப்புகள்",
    },
    status: {
      safe: "பாதுகாப்பானது",
      warning: "எச்சரிக்கை",
      alert: "அபாயம்",
    },
    nav: {
      home: "முகப்பு",
      control: "கட்டுப்பாடு",
      alerts: "எச்சரிக்கைகள்",
      family: "குடும்பம்",
      settings: "அமைப்புகள்",
    },
    home: {
      childDetection: "குழந்தை கண்டறிதல்",
      childDetected: "குழந்தை கண்டறியப்பட்டது",
      noChildDetected: "குழந்தை கண்டறியப்படவில்லை",
      gasClosed: "எரிவாயு மூடப்பட்டது",
      lpg: "எல்பிஜி",
      co: "கார்பன் மோனாக்சைடு",
      temperature: "வெப்பநிலை",
      threshold: "வரம்பு",
      normal: "சாதாரண",
      warning: "எச்சரிக்கை",
      critical: "முக்கியமான",
    },
    family: {
      title: "குடும்ப மையம்",
      familyMembers: "குடும்ப உறுப்பினர்கள்",
      addMember: "உறுப்பினர் சேர்",
      add: "சேர்",
      addNewMember: "புதிய உறுப்பினரைச் சேர்க்கவும்",
      name: "பெயர்",
      relationship: "உறவு",
      email: "மின்னஞ்சல் (விருப்பம்)",
      phone: "தொலைபேசி (விருப்பம்)",
      grantAccess: "பயன்பாட்டு அணுகலை வழங்கவும்",
      hasAccess: "அணுகல்",
      cancel: "ரத்து செய்",
      devices: "ESP32 சாதனங்கள்",
      pair: "இணை",
      pairDevice: "ESP32 சாதனத்தை இணைக்கவும்",
      generateCode: "இணைப்பு குறியீட்டை உருவாக்கவும்",
      waitingForDevice: "சாதனத்திற்காக காத்திருக்கிறது",
      enterCode: "உங்கள் ESP32 சாதனத்தில் இந்த குறியீட்டை உள்ளிடவும்",
      listeningForDevice: "சாதன இணைப்பிற்காக கேட்கிறது...",
      simulateConnection: "ESP32 இணைப்பை உருவகப்படுத்தவும்",
      forDemo: "டெமோ நோக்கங்களுக்காக",
      deviceConnected: "சாதனம் இணைக்கப்பட்டது!",
      deviceReady: "உங்கள் ESP32 சாதனம் இப்போது இணைக்கப்பட்டு தயாராக உள்ளது",
      online: "ஆன்லைன்",
      offline: "ஆஃப்லைன்",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
