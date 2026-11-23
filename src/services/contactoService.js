import { avisarSiVencio } from "../utils/token";

const CONTENIDO_URL = import.meta.env.VITE_CONTENIDO_API_URL;

function crearHeaders() {
  const token = sessionStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function enviarContacto(datos) {
  const response = await fetch(`${CONTENIDO_URL}/contactos`, {
    method: "POST",
    headers: crearHeaders(),
    body: JSON.stringify(datos),
  });

  avisarSiVencio(response);
  if (!response.ok) {
    throw new Error("No fue posible enviar el mensaje");
  }

  return response.json();
}
