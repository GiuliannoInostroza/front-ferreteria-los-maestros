import { armarCatalogo } from "../utils/catalogo";

const CATALOGO_URL = import.meta.env.VITE_CATALOGO_API_URL;

async function request(ruta, opciones = {}) {
  const token = sessionStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...opciones.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${CATALOGO_URL}${ruta}`, { ...opciones, headers });
  if (!response.ok) throw new Error(`Solicitud rechazada: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

export const listarCatalogo = () => request("/catalogo");
export const crearProducto = datos => request("/productos", {
  method: "POST", body: JSON.stringify(datos)
});
export const actualizarProducto = (id, datos) => request(`/productos/${id}`, {
  method: "PUT", body: JSON.stringify(datos)
});
export const eliminarProducto = id => request(`/productos/${id}`, {
  method: "DELETE"
});
export const descontarStock = items => request("/productos/descontar-stock", {
  method: "POST", body: JSON.stringify({ items })
});

export async function cargarCatalogo() {
  const catalogo = await listarCatalogo();
  return armarCatalogo(catalogo.productos, catalogo.categorias, catalogo.ofertas);
}
