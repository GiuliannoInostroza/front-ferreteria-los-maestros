import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import AdminCuentas from "./AdminCuentas";

function respuesta(datos, status = 200) {
  return { ok: true, status, json: async () => datos };
}

describe("AdminCuentas", () => {
  const cuenta = {
    id: 1,
    correoCliente: "cliente@gmail.com",
    limite: 100000,
    saldo: 30000,
    activa: true,
  };

  it("exige correo y límite, y luego crea la cuenta y la agrega a la tabla", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue(respuesta([]));
    const usuario = userEvent.setup();
    render(<AdminCuentas />);

    await usuario.click(await screen.findByRole("button", { name: "Crear cuenta" }));
    expect(screen.getByText("El correo del cliente es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("El límite debe ser 0 o más")).toBeInTheDocument();

    await usuario.type(screen.getByLabelText("Correo del cliente"), "nuevo@gmail.com");
    await usuario.type(screen.getByLabelText("Límite de crédito"), "50000");
    espia.mockResolvedValue(
      respuesta({ id: 2, correoCliente: "nuevo@gmail.com", limite: 50000, saldo: 0, activa: true }, 201)
    );
    await usuario.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("nuevo@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Cuenta corriente creada correctamente")).toBeInTheDocument();
    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_CUENTAS_API_URL}/cuentas`,
      {
        method: "POST",
        body: JSON.stringify({ correoCliente: "nuevo@gmail.com", limite: 50000 }),
        headers: { "Content-Type": "application/json" },
      }
    );

    espia.mockRestore();
  });

  it("muestra los movimientos de una cuenta y rebaja el saldo al registrar un pago", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue(respuesta([cuenta]));
    const usuario = userEvent.setup();
    render(<AdminCuentas />);

    espia.mockResolvedValue(
      respuesta([{ id: 1, tipo: "Cargo", monto: 30000, descripcion: "Compra de cemento", fecha: "2026-11-11" }])
    );
    await usuario.click(await screen.findByRole("button", { name: "Ver movimientos" }));
    expect(await screen.findByText("Compra de cemento")).toBeInTheDocument();

    await usuario.type(screen.getByLabelText("Monto del pago"), "10000");
    await usuario.type(screen.getByLabelText("Detalle"), "Pago parcial");
    espia.mockResolvedValue(
      respuesta({ id: 2, tipo: "Abono", monto: 10000, descripcion: "Pago parcial", fecha: "2026-11-12" }, 201)
    );
    await usuario.click(screen.getByRole("button", { name: "Registrar pago" }));

    expect(await screen.findByText("Pago registrado correctamente")).toBeInTheDocument();
    expect(screen.getByText("Abono")).toBeInTheDocument();
    expect(screen.getByText("Saldo pendiente:").parentElement.textContent).toBe(
      "Saldo pendiente: $20.000"
    );

    espia.mockRestore();
  });

  it("avisa el error cuando la API de cuentas no responde", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 500 });
    render(<AdminCuentas />);

    expect(await screen.findByText("Solicitud rechazada: 500")).toBeInTheDocument();

    espia.mockRestore();
  });
});
