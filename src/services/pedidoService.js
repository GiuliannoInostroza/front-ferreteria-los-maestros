const PEDIDOS_URL = import.meta.env.VITE_PEDIDOS_API_URL;

async function request(ruta, opciones = {}) {
  const token = sessionStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...opciones.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${PEDIDOS_URL}${ruta}`, { ...opciones, headers });
  if (!response.ok) throw new Error(`Solicitud rechazada: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

export const listarPedidos = () => request("/pedidos");
export const listarMisPedidos = () => request("/pedidos/mios");
export const crearPedido = datos => request("/pedidos", {
  method: "POST", body: JSON.stringify(datos)
});
export const actualizarPedido = (id, datos) => request(`/pedidos/${id}`, {
  method: "PUT", body: JSON.stringify(datos)
});
