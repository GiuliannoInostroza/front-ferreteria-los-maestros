const AUTH_URL = import.meta.env.VITE_AUTH_API_URL;

export async function login(credenciales) {
  const response = await fetch(`${AUTH_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credenciales),
  });
  if (!response.ok) throw new Error("Credenciales inválidas");
  return response.json();
}

export async function registrar(datos) {
  const response = await fetch(`${AUTH_URL}/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!response.ok) {
    throw new Error(
      response.status === 409
        ? "Ya existe una cuenta con ese correo"
        : "No fue posible crear la cuenta"
    );
  }
  return response.json();
}
