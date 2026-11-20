import { correoConDominioPermitido } from "./correo";

describe("correoConDominioPermitido", () => {
  it("acepta proveedores válidos y rechaza formatos inválidos", () => {
    expect(correoConDominioPermitido("alumno@duocuc.cl")).toBe(true);
    expect(correoConDominioPermitido("cliente@hotmail.com")).toBe(true);
    expect(correoConDominioPermitido("correo-invalido")).toBe(false);
  });
});
