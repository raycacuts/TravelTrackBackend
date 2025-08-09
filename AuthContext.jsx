import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext();
const initial = { user: null, token: null, isAuthenticated: false };

function reducer(state, action) {
  switch (action.type) {
    case "login":
      return { ...state, isAuthenticated: true, user: action.user, token: action.token };
    case "logout":
      return initial;
    default:
      throw new Error("Unknown action");
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  async function login(email, password) {
    const res = await fetch(`${import.meta.env.VITE_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    dispatch({ type: "login", user: data.user, token: data.token });
  }

  function logout() { dispatch({ type: "logout" }); }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
