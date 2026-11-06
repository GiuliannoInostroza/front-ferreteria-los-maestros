import { vi } from "vitest";
import { eliminarUsuario } from "./usuarioService";

describe("usuarioService", () => {
  it("envía el token guardado en el encabezado Authorization", async () => {
    sessionStorage.setItem("token", "token-de-prueba");
    const espia = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, status: 204 });

    const resultado = await eliminarUsuario(5);

    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_USUARIOS_API_URL}/usuarios/5`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-de-prueba",
        },
      }
    );
    expect(resultado).toBe(null);

    sessionStorage.removeItem("token");
    espia.mockRestore();
  });
});
