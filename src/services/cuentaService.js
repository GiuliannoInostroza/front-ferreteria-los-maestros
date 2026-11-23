import { avisarSiVencio } from "../utils/token";

const CUENTAS_URL = import.meta.env.VITE_CUENTAS_API_URL;

async function request(ruta, opciones = {}) {
  const token = sessionStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...opciones.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${CUENTAS_URL}${ruta}`, { ...opciones, headers });
  avisarSiVencio(response);
  if (!response.ok) throw new Error(`Solicitud rechazada: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

export const miCuenta = () => request("/cuentas/mia");
export const misMovimientos = () => request("/cuentas/mia/movimientos");
export const cargarAMiCuenta = datos => request("/cuentas/mia/cargos", {
  method: "POST", body: JSON.stringify(datos)
});
export const listarCuentas = () => request("/cuentas");
export const crearCuenta = datos => request("/cuentas", {
  method: "POST", body: JSON.stringify(datos)
});
export const actualizarCuenta = (id, datos) => request(`/cuentas/${id}`, {
  method: "PUT", body: JSON.stringify(datos)
});
export const eliminarCuenta = id => request(`/cuentas/${id}`, {
  method: "DELETE"
});
export const listarMovimientos = id => request(`/cuentas/${id}/movimientos`);
export const registrarAbono = (id, datos) => request(`/cuentas/${id}/abonos`, {
  method: "POST", body: JSON.stringify(datos)
});
