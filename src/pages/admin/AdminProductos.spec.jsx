import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import AdminProductos from "./AdminProductos";

function respuesta(datos, status = 200) {
  return { ok: true, status, json: async () => datos };
}

describe("AdminProductos", () => {
  const categorias = [
    { id: 1, nombre: "Materiales de Construcción" },
    { id: 2, nombre: "Herramientas Eléctricas" },
  ];
  const cemento = {
    id: 1,
    codigo: "MC001",
    nombre: "Cemento Polpaico",
    marca: "Polpaico",
    categoriaId: 1,
    precio: 5990,
    stock: 80,
    stockCritico: 20,
    descripcion: "Cemento gris",
    destacado: false,
  };

  it("muestra errores al guardar vacío y luego crea el producto en la API y lo agrega a la tabla", async () => {
    const espia = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(respuesta({ productos: [], categorias, ofertas: [] }));
    const usuario = userEvent.setup();
    render(<AdminProductos />);

    await usuario.click(await screen.findByRole("button", { name: /agregar producto/i }));
    await usuario.click(screen.getByRole("button", { name: "Guardar" }));
    expect(screen.getByText("Código obligatorio")).toBeInTheDocument();

    await usuario.type(screen.getByLabelText("Código"), "TL001");
    await usuario.type(screen.getByLabelText("Nombre"), "Taladro de prueba");
    await usuario.type(screen.getByLabelText("Marca"), "Bosch");
    await usuario.selectOptions(screen.getByLabelText("Categoría"), "Herramientas Eléctricas");
    await usuario.type(screen.getByLabelText("Precio"), "1500");
    await usuario.type(screen.getByLabelText("Stock"), "10");
    await usuario.type(screen.getByLabelText("Stock crítico"), "3");

    espia.mockResolvedValue(
      respuesta({
        id: 9,
        codigo: "TL001",
        nombre: "Taladro de prueba",
        marca: "Bosch",
        categoriaId: 2,
        precio: 1500,
        stock: 10,
        stockCritico: 3,
      })
    );
    await usuario.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Taladro de prueba")).toBeInTheDocument();
    expect(screen.getByText("Producto agregado correctamente")).toBeInTheDocument();
    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_CATALOGO_API_URL}/productos`,
      {
        method: "POST",
        body: JSON.stringify({
          codigo: "TL001",
          nombre: "Taladro de prueba",
          marca: "Bosch",
          descripcion: "",
          precio: 1500,
          stock: 10,
          stockCritico: 3,
          destacado: false,
          categoriaId: 2,
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    espia.mockRestore();
  });

  it("edita el stock de un producto y luego lo elimina avisando en cada paso", async () => {
    const espia = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(respuesta({ productos: [cemento], categorias, ofertas: [] }));
    const confirmacion = vi.spyOn(window, "confirm").mockReturnValue(true);
    const usuario = userEvent.setup();
    render(<AdminProductos />);

    await usuario.click(await screen.findByRole("button", { name: "Editar" }));
    await usuario.clear(screen.getByLabelText("Stock"));
    await usuario.type(screen.getByLabelText("Stock"), "120");

    espia.mockResolvedValue(respuesta({ ...cemento, stock: 120 }));
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("120")).toBeInTheDocument();
    expect(screen.getByText("Producto actualizado correctamente")).toBeInTheDocument();

    espia.mockResolvedValue({ ok: true, status: 204 });
    await usuario.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(await screen.findByText("Producto eliminado correctamente")).toBeInTheDocument();
    expect(screen.queryByText("Cemento Polpaico")).not.toBeInTheDocument();
    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_CATALOGO_API_URL}/productos/1`,
      { method: "DELETE", headers: { "Content-Type": "application/json" } }
    );

    confirmacion.mockRestore();
    espia.mockRestore();
  });

  it("avisa el error cuando la API del catálogo no responde", async () => {
    const espia = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: false, status: 500 });
    render(<AdminProductos />);

    expect(await screen.findByText("Solicitud rechazada: 500")).toBeInTheDocument();

    espia.mockRestore();
  });
});
