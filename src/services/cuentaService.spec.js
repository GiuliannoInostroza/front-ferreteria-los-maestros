import { vi } from "vitest";
import { miCuenta, registrarAbono } from "./cuentaService";

describe("cuentaService", () => {
  it("envía el token guardado al pedir mi cuenta corriente", async () => {
    sessionStorage.setItem("token", "token-de-prueba");
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, saldo: 20000 }),
    });

    const cuenta = await miCuenta();

    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_CUENTAS_API_URL}/cuentas/mia`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-de-prueba",
        },
      }
    );
    expect(cuenta.saldo).toBe(20000);

    sessionStorage.removeItem("token");
    espia.mockRestore();
  });

  it("envía el monto y el detalle al registrar un pago", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 5, tipo: "Abono", monto: 10000 }),
    });

    const movimiento = await registrarAbono(3, { monto: 10000, descripcion: "Pago parcial" });

    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_CUENTAS_API_URL}/cuentas/3/abonos`,
      {
        method: "POST",
        body: JSON.stringify({ monto: 10000, descripcion: "Pago parcial" }),
        headers: { "Content-Type": "application/json" },
      }
    );
    expect(movimiento.tipo).toBe("Abono");

    espia.mockRestore();
  });

  it("lanza un error cuando el pago supera el saldo", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 400 });
    let mensaje = "";

    try {
      await registrarAbono(3, { monto: 999999 });
    } catch (e) {
      mensaje = e.message;
    }

    expect(mensaje).toBe("Solicitud rechazada: 400");

    espia.mockRestore();
  });
});
