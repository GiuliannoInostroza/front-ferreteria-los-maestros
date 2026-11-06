import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import MisPedidos from "./MisPedidos";

describe("MisPedidos", () => {
  it("pide los pedidos del cliente con su token y los muestra", async () => {
    sessionStorage.setItem("token", "token-de-prueba");
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 3,
          fecha: "2026-11-06",
          tipoEntrega: "Retiro en tienda",
          medioPago: "Transferencia",
          total: 11980,
          estado: "En preparación",
        },
      ],
    });

    render(<MisPedidos />);

    expect(await screen.findByRole("heading", { name: "Mis pedidos" })).toBeInTheDocument();
    expect(screen.getByText("En preparación")).toBeInTheDocument();
    expect(screen.getByText("2026-11-06")).toBeInTheDocument();
    expect(screen.getByText("Transferencia")).toBeInTheDocument();
    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_PEDIDOS_API_URL}/pedidos/mios`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-de-prueba",
        },
      }
    );

    sessionStorage.removeItem("token");
    espia.mockRestore();
  });
});
