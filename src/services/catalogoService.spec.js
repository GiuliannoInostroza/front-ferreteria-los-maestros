import { vi } from "vitest";
import { cargarCatalogo, descontarStock } from "./catalogoService";

describe("catalogoService", () => {
  it("hace una sola solicitud y arma el catálogo con el precio de oferta", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        productos: [
          { id: 1, codigo: "PT001", nombre: "Pintura", precio: 10000, categoriaId: 3 },
        ],
        categorias: [{ id: 3, nombre: "Pinturas" }],
        ofertas: [{ id: 1, productoId: 1, porcentaje: 20, activa: true }],
      }),
    });

    const catalogo = await cargarCatalogo();

    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_CATALOGO_API_URL}/catalogo`,
      { headers: { "Content-Type": "application/json" } }
    );
    expect(catalogo.productos[0].categoria).toBe("Pinturas");
    expect(catalogo.productos[0].precio).toBe(8000);
    expect(catalogo.productos[0].precioAnterior).toBe(10000);

    espia.mockRestore();
  });

  it("envía el token y las cantidades al descontar el stock", async () => {
    sessionStorage.setItem("token", "token-de-prueba");
    const espia = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, status: 200, json: async () => [] });

    await descontarStock([{ productoId: 1, cantidad: 2 }]);

    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_CATALOGO_API_URL}/productos/descontar-stock`,
      {
        method: "POST",
        body: JSON.stringify({ items: [{ productoId: 1, cantidad: 2 }] }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-de-prueba",
        },
      }
    );

    sessionStorage.removeItem("token");
    espia.mockRestore();
  });

  it("lanza un error cuando el catálogo rechaza el descuento de stock", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 400 });
    let mensaje = "";

    try {
      await descontarStock([{ productoId: 1, cantidad: 999 }]);
    } catch (e) {
      mensaje = e.message;
    }

    expect(mensaje).toBe("Solicitud rechazada: 400");

    espia.mockRestore();
  });
});
