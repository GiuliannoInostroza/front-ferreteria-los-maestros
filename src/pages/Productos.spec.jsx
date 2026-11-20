import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import Productos from "./Productos";

function respuesta(datos) {
  return { ok: true, status: 200, json: async () => datos };
}

describe("Productos", () => {
  const catalogo = {
    productos: [
      {
        id: 1,
        codigo: "PT001",
        nombre: "Pintura látex",
        marca: "Sipa",
        precio: 9990,
        stock: 30,
        stockCritico: 5,
        categoriaId: 1,
      },
      {
        id: 2,
        codigo: "JA004",
        nombre: "Pala punta redonda",
        marca: "Corona",
        precio: 10990,
        stock: 8,
        stockCritico: 2,
        categoriaId: 2,
      },
    ],
    categorias: [
      { id: 1, nombre: "Pinturas" },
      { id: 2, nombre: "Jardín" },
    ],
    ofertas: [],
  };

  it("filtra por categoría y muestra solo los productos de esa categoría", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue(respuesta(catalogo));
    const usuario = userEvent.setup();
    render(
      <BrowserRouter>
        <Productos onAgregar={vi.fn()} />
      </BrowserRouter>
    );

    await screen.findByText("Pintura látex");
    await usuario.selectOptions(
      screen.getByLabelText("Filtrar por categoría"),
      "Pinturas"
    );

    expect(screen.getByText("Pintura látex")).toBeInTheDocument();
    expect(screen.queryByText("Pala punta redonda")).not.toBeInTheDocument();

    espia.mockRestore();
  });

  it("muestra el aviso de producto agregado al presionar Añadir", async () => {
    const espia = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(respuesta({ ...catalogo, productos: [catalogo.productos[0]] }));
    const usuario = userEvent.setup();
    const onAgregar = vi.fn();
    render(
      <BrowserRouter>
        <Productos onAgregar={onAgregar} />
      </BrowserRouter>
    );

    await usuario.click(await screen.findByRole("button", { name: "Añadir" }));

    expect(onAgregar).toHaveBeenCalledWith({
      ...catalogo.productos[0],
      categoria: "Pinturas",
    });
    expect(screen.getByText("Pintura látex agregado al carrito")).toBeInTheDocument();

    espia.mockRestore();
  });

  it("avisa el error cuando el catálogo no responde", async () => {
    const espia = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: false, status: 500 });
    render(
      <BrowserRouter>
        <Productos onAgregar={vi.fn()} />
      </BrowserRouter>
    );

    expect(await screen.findByText("Solicitud rechazada: 500")).toBeInTheDocument();

    espia.mockRestore();
  });
});
