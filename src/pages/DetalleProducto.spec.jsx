import { render, screen } from "@testing-library/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import DetalleProducto from "./DetalleProducto";

function mostrarDetalle(codigo) {
  window.history.pushState({}, "", `/productos/${codigo}`);
  render(
    <BrowserRouter>
      <Routes>
        <Route
          path="/productos/:codigo"
          element={<DetalleProducto onAgregar={vi.fn()} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

describe("DetalleProducto", () => {
  it("muestra un mensaje cuando el código del producto no existe", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ productos: [], categorias: [], ofertas: [] }),
    });
    mostrarDetalle("XX999");

    expect(
      await screen.findByText("El producto solicitado no existe.")
    ).toBeInTheDocument();

    espia.mockRestore();
  });

  it("muestra el producto del catálogo y avisa cuando quedan pocas unidades", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        productos: [
          {
            id: 1,
            codigo: "MC001",
            nombre: "Cemento Polpaico",
            marca: "Polpaico",
            descripcion: "Cemento gris",
            precio: 5990,
            stock: 4,
            stockCritico: 20,
            categoriaId: 1,
          },
        ],
        categorias: [{ id: 1, nombre: "Materiales de Construcción" }],
        ofertas: [],
      }),
    });
    mostrarDetalle("MC001");

    expect(await screen.findByText("Cemento Polpaico")).toBeInTheDocument();
    expect(screen.getByText("¡Últimas unidades!")).toBeInTheDocument();

    espia.mockRestore();
  });
});
