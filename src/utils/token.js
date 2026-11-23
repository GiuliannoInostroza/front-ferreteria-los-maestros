export function leerExpiracion(token) {
  const partes = token ? token.split(".") : [];
  if (partes.length !== 3) return 0;
  try {
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const datos = JSON.parse(atob(base64));
    return datos.exp ? datos.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export function avisarSiVencio(response) {
  if (response.status === 401) {
    window.dispatchEvent(new Event("sesion-vencida"));
  }
}
