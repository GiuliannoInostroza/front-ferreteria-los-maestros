const USUARIOS_URL = import.meta.env.VITE_USUARIOS_API_URL;

async function request(ruta, opciones = {}) {
  const token = sessionStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...opciones.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${USUARIOS_URL}${ruta}`, { ...opciones, headers });
  if (!response.ok) throw new Error(`Solicitud rechazada: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

export const listarUsuarios = () => request("/usuarios");
export const buscarUsuario = id => request(`/usuarios/${id}`);
export const crearUsuario = datos => request("/usuarios", {
  method: "POST", body: JSON.stringify(datos)
});
export const actualizarUsuario = (id, datos) => request(`/usuarios/${id}`, {
  method: "PUT", body: JSON.stringify(datos)
});
export const eliminarUsuario = id => request(`/usuarios/${id}`, {
  method: "DELETE"
});
