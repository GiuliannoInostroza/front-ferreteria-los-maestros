const CONTENIDO_URL = import.meta.env.VITE_CONTENIDO_API_URL;

export async function enviarContacto(datos) {
  const response = await fetch(`${CONTENIDO_URL}/contactos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    throw new Error("No fue posible enviar el mensaje");
  }

  return response.json();
}
