export function formatearPrecio(valor) {
  if (valor === 0) return "Gratis";
  return `$${valor.toLocaleString("es-CL")}`;
}

export function formatearMonto(valor) {
  return `$${valor.toLocaleString("es-CL")}`;
}
