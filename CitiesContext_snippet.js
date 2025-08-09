// Example usage inside your CitiesContext.jsx
// const BASE_URL = `${import.meta.env.VITE_API}`;
// import { useAuth } from "./AuthContext";
// const { token } = useAuth();
// async function fetchWithAuth(path, options = {}) {
//   const headers = {
//     ...(options.headers || {}),
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {})
//   };
//   const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
//   if (!res.ok) throw new Error(await res.text());
//   return res.json().catch(() => ({}));
// }
