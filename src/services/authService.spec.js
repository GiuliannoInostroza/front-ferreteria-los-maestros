import { vi } from "vitest";
import { login } from "./authService";

describe("authService", () => {
  it("envía las credenciales al backend y devuelve el token", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: "token-de-prueba", correo: "ana@gmail.com", rol: "Cliente" }),
    });

    const sesion = await login({ correo: "ana@gmail.com", password: "1234" });

    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_AUTH_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: "ana@gmail.com", password: "1234" }),
      }
    );
    expect(sesion.token).toBe("token-de-prueba");

    espia.mockRestore();
  });
});
