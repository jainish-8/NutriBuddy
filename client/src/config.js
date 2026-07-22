// In development, we use React's package.json proxy (which points to localhost:5000)
// In production, we fetch from the REACT_APP_API_URL environment variable
export const API_BASE = process.env.REACT_APP_API_URL || '';
