/**
 * Client-side Logger
 * Lightweight logging wrapper for browser environment
 * (Pino doesn't work in browsers, so we use console with structured format)
 */

const isDev = import.meta.env.DEV

const logger = {
  info: (message, data) => {
    if (isDev) {
      console.info(`[INFO] ${message}`, data || '')
    }
  },

  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data || '')
  },

  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error || '')
  },

  debug: (message, data) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, data || '')
    }
  },
}

export default logger
