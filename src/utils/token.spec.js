import { vi } from "vitest";
import { avisarSiVencio, leerExpiracion } from "./token";

describe("token", () => {
  it("lee la expiración del payload del JWT en milisegundos", () => {
    const payload = btoa(JSON.stringify({ sub: "ana@gmail.com", exp: 1800000000 }));
    const token = `cabecera.${payload}.firma`;

    expect(leerExpiracion(token)).toBe(1800000000000);
  });

  it("devuelve cero si el token no tiene formato JWT", () => {
    expect(leerExpiracion("token-de-prueba")).toBe(0);
  });

  it("avisa que la sesión venció cuando el backend responde 401", () => {
    const escucha = vi.fn();
    window.addEventListener("sesion-vencida", escucha);

    avisarSiVencio({ status: 401 });
    avisarSiVencio({ status: 200 });

    expect(escucha).toHaveBeenCalledTimes(1);
    window.removeEventListener("sesion-vencida", escucha);
  });
});
