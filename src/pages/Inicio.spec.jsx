import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import Inicio from "./Inicio";

describe("Inicio", () => {
  it("muestra solo los productos destacados", async () => {
    const catalogo = {
      productos: [
        {
          id: 1,
          codigo: "MC001",
          nombre: "Cemento destacado",
          marca: "Polpaico",
          precio: 5990,
          stock: 80,
          stockCritico: 20,
          destacado: true,
          categoriaId: 1,
        },
        {
          id: 2,
          codigo: "PT001",
          nombre: "Pintura común",
          marca: "Sipa",
          precio: 9990,
          stock: 30,
          stockCritico: 5,
          destacado: false,
          categoriaId: 2,
        },
      ],
      categorias: [
        { id: 1, nombre: "Materiales de Construcción" },
        { id: 2, nombre: "Pinturas" },
      ],
      ofertas: [],
    };
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => catalogo,
    });
    render(
      <BrowserRouter>
        <Inicio />
      </BrowserRouter>
    );

    expect(await screen.findByText("Cemento destacado")).toBeInTheDocument();
    expect(screen.queryByText("Pintura común")).not.toBeInTheDocument();

    espia.mockRestore();
  });
});
