const CONTENIDO_URL = import.meta.env.VITE_CONTENIDO_API_URL;

export async function listarBlogs() {
  const response = await fetch(`${CONTENIDO_URL}/blogs`);

  if (!response.ok) {
    throw new Error("No fue posible cargar los blogs");
  }

  return response.json();
}

export async function buscarBlog(id) {
  const response = await fetch(`${CONTENIDO_URL}/blogs/${id}`);

  if (!response.ok) {
    throw new Error("No fue posible cargar el artículo");
  }

  return response.json();
}
