import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import AdminAlertas from "./AdminAlertas";

describe("AdminAlertas", () => {
  it("muestra los productos con stock bajo y los que están sin stock", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        { id: 1, codigo: "HE001", nombre: "Taladro percutor", stock: 2, stockCritico: 2 },
        { id: 2, codigo: "PT004", nombre: "Esmalte sintético", stock: 0, stockCritico: 15 },
      ],
    });
    render(<AdminAlertas />);

    expect(await screen.findByText("Taladro percutor")).toBeInTheDocument();
    expect(screen.getByText("Stock bajo")).toBeInTheDocument();
    expect(screen.getByText("Esmalte sintético")).toBeInTheDocument();
    expect(screen.getByText("Sin stock")).toBeInTheDocument();
    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_CATALOGO_API_URL}/productos/alertas`,
      { headers: { "Content-Type": "application/json" } }
    );

    espia.mockRestore();
  });

  it("avisa cuando no hay productos con stock bajo", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });
    render(<AdminAlertas />);

    expect(await screen.findByText("No hay productos con stock bajo.")).toBeInTheDocument();

    espia.mockRestore();
  });

  it("avisa el error cuando la API no responde", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 403 });
    render(<AdminAlertas />);

    expect(await screen.findByText("Solicitud rechazada: 403")).toBeInTheDocument();

    espia.mockRestore();
  });
});
