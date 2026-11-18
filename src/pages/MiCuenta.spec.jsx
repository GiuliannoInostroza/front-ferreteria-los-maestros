import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import MiCuenta from "./MiCuenta";

describe("MiCuenta", () => {
  it("muestra el saldo, lo disponible y el historial de la cuenta", async () => {
    const cuenta = { id: 1, correoCliente: "cliente@gmail.com", limite: 100000, saldo: 20000, activa: true };
    const movimientos = [
      { id: 1, tipo: "Cargo", monto: 30000, descripcion: "Compra de cemento", pedidoId: 7, fecha: "2026-11-11" },
      { id: 2, tipo: "Abono", monto: 10000, descripcion: "Pago parcial", fecha: "2026-11-12" },
    ];
    let llamada = 0;
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        llamada = llamada + 1;
        return llamada === 1 ? cuenta : movimientos;
      },
    });
    render(<MiCuenta />);

    expect(await screen.findByText("Compra de cemento")).toBeInTheDocument();
    expect(screen.getByText("$20.000")).toBeInTheDocument();
    expect(screen.getByText("$80.000")).toBeInTheDocument();
    expect(screen.getByText("Pago parcial")).toBeInTheDocument();
    expect(screen.getByText("Activa")).toBeInTheDocument();

    espia.mockRestore();
  });

  it("avisa cuando el cliente no tiene cuenta corriente", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 404 });
    render(<MiCuenta />);

    expect(
      await screen.findByText("No tienes una cuenta corriente. Pídela en la ferretería.")
    ).toBeInTheDocument();

    espia.mockRestore();
  });
});
