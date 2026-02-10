export function validateEnv() {
    const required = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
    }

    const optional = {
        VITE_ESP32_IP: import.meta.env.VITE_ESP32_IP
    }

    const missing = Object.entries(required)
        .filter(([_, value]) => !value)
        .map(([key]) => key)

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables:\n${missing.join('\n')}\n\n` +
            'Please create a .env.local file with the required variables.'
        )
    }

    // Warn about optional variables
    Object.entries(optional).forEach(([key, value]) => {
        if (!value) {
            console.warn(`Optional environment variable ${key} is not set. Some features may not work.`)
        }
    })

    return {
        supabaseUrl: required.VITE_SUPABASE_URL,
        supabaseKey: required.VITE_SUPABASE_ANON_KEY,
        esp32Ip: optional.VITE_ESP32_IP || 'localhost'
    }
}
