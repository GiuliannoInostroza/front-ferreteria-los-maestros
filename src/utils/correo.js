export function correoConDominioPermitido(correo) {
  const valor = correo.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}
