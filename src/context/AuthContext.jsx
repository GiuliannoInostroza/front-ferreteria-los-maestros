import { createContext, useContext, useEffect, useState } from "react";

import { renovar } from "../services/authService";
import { leerExpiracion } from "../utils/token";

const AuthContext = createContext(null);
const MARGEN_RENOVACION_MS = 5 * 60 * 1000;

function leerUsuario() {
  const texto = sessionStorage.getItem("usuario");
  return texto ? JSON.parse(texto) : null;
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => leerUsuario());
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));

  function login(usuarioSesion) {
    setUsuario(usuarioSesion);
    setToken(sessionStorage.getItem("token"));
  }

  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
  }

  async function renovarSesion() {
    try {
      const sesion = await renovar();
      const usuarioSesion = {
        nombre: sesion.nombre,
        correo: sesion.correo,
        rol: sesion.rol,
      };
      sessionStorage.setItem("token", sesion.token);
      sessionStorage.setItem("usuario", JSON.stringify(usuarioSesion));
      login(usuarioSesion);
    } catch {
      logout();
    }
  }

  useEffect(() => {
    if (!token) return undefined;
    const restante = leerExpiracion(token) - Date.now();
    if (restante <= 0) {
      logout();
      return undefined;
    }
    const espera = restante > MARGEN_RENOVACION_MS ? restante - MARGEN_RENOVACION_MS : 0;
    const temporizador = setTimeout(renovarSesion, espera);
    return () => clearTimeout(temporizador);
  }, [token]);

  useEffect(() => {
    window.addEventListener("sesion-vencida", logout);
    return () => window.removeEventListener("sesion-vencida", logout);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
