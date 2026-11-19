import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import AdminOfertas from "./AdminOfertas";

function respuesta(datos, status = 200) {
  return { ok: true, status, json: async () => datos };
}

describe("AdminOfertas", () => {
  const catalogo = {
    productos: [
      { id: 1, codigo: "PT001", nombre: "Pintura látex", precio: 10000, categoriaId: 1 },
      { id: 2, codigo: "HM001", nombre: "Martillo", precio: 8000, categoriaId: 2 },
    ],
    categorias: [
      { id: 1, nombre: "Pinturas" },
      { id: 2, nombre: "Herramientas Manuales" },
    ],
    ofertas: [{ id: 5, productoId: 1, porcentaje: 20, activa: true }],
  };

  it("muestra las ofertas activas con su precio normal y su precio con oferta", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue(respuesta(catalogo));
    render(<AdminOfertas />);

    expect(await screen.findByText("20%")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "$10.000" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "$8.000" })).toBeInTheDocument();

    espia.mockRestore();
  });

  it("exige producto y porcentaje, y luego crea la oferta", async () => {
    const espia = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(respuesta({ ...catalogo, ofertas: [] }));
    const usuario = userEvent.setup();
    render(<AdminOfertas />);

    await usuario.click(await screen.findByRole("button", { name: "Crear oferta" }));
    expect(screen.getByText("Elige un producto")).toBeInTheDocument();
    expect(screen.getByText("El porcentaje debe estar entre 1 y 90")).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText("Producto"), "Martillo");
    await usuario.type(screen.getByLabelText("Porcentaje de descuento"), "25");
    espia.mockResolvedValue(
      respuesta({ id: 9, productoId: 2, porcentaje: 25, activa: true }, 201)
    );
    await usuario.click(screen.getByRole("button", { name: "Crear oferta" }));

    expect(await screen.findByText("Oferta creada correctamente")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_CATALOGO_API_URL}/ofertas`,
      {
        method: "POST",
        body: JSON.stringify({ productoId: 2, porcentaje: 25 }),
        headers: { "Content-Type": "application/json" },
      }
    );

    espia.mockRestore();
  });

  it("quita una oferta después de confirmar", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue(respuesta(catalogo));
    const confirmacion = vi.spyOn(window, "confirm").mockReturnValue(true);
    const usuario = userEvent.setup();
    render(<AdminOfertas />);

    await screen.findByText("20%");
    espia.mockResolvedValue({ ok: true, status: 204 });
    await usuario.click(screen.getByRole("button", { name: "Quitar oferta" }));

    expect(await screen.findByText("Oferta eliminada correctamente")).toBeInTheDocument();
    expect(screen.getByText("No hay ofertas activas.")).toBeInTheDocument();

    confirmacion.mockRestore();
    espia.mockRestore();
  });
});
