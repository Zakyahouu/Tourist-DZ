/**
 * Production-safe logger.
 * In production builds, error/warn output is suppressed to avoid
 * leaking internal details through the browser console.
 */
const isDev = import.meta.env.DEV;

const logger = {
    error: (...args) => { if (isDev) console.error(...args); },
    warn:  (...args) => { if (isDev) console.warn(...args);  },
    log:   (...args) => { if (isDev) console.log(...args);   },
};

export default logger;
