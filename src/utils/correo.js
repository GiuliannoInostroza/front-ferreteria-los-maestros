export function correoConDominioPermitido(correo) {
  // El cliente puede usar cualquier proveedor, no solo Duoc o Gmail.
  const valor = correo.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}
