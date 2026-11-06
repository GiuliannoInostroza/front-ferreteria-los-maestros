import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import GestionPedidos from "./GestionPedidos";

describe("GestionPedidos", () => {
  it("cambia el estado de un pedido y muestra el valor guardado", async () => {
    const pedido = {
      id: 3,
      correoCliente: "ana@gmail.com",
      fecha: "2026-11-06T10:15:00",
      tipoEntrega: "Retiro en tienda",
      medioPago: "Pago en tienda",
      total: 11980,
      estado: "Pendiente",
    };
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [pedido],
    });
    const usuario = userEvent.setup();

    render(<GestionPedidos />);

    const estado = await screen.findByLabelText("Estado del pedido 3");
    expect(screen.getByText("ana@gmail.com")).toBeInTheDocument();

    espia.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ...pedido, estado: "Confirmado" }),
    });
    await usuario.selectOptions(estado, "Confirmado");

    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_PEDIDOS_API_URL}/pedidos/3`,
      {
        method: "PUT",
        body: JSON.stringify({ ...pedido, estado: "Confirmado" }),
        headers: { "Content-Type": "application/json" },
      }
    );
    expect(await screen.findByDisplayValue("Confirmado")).toBeInTheDocument();

    espia.mockRestore();
  });
});
