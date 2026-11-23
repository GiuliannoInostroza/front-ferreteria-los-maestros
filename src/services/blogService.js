const CONTENIDO_URL = import.meta.env.VITE_CONTENIDO_API_URL;

function crearHeaders() {
  const token = sessionStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function listarBlogs() {
  const response = await fetch(`${CONTENIDO_URL}/blogs`, { headers: crearHeaders() });

  if (!response.ok) {
    throw new Error("No fue posible cargar los blogs");
  }

  return response.json();
}

export async function buscarBlog(id) {
  const response = await fetch(`${CONTENIDO_URL}/blogs/${id}`, { headers: crearHeaders() });

  if (!response.ok) {
    throw new Error("No fue posible cargar el artículo");
  }

  return response.json();
}
