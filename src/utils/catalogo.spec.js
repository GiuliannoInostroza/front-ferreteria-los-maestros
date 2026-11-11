import {
  armarCatalogo,
  precioConOferta,
  productosDeCategoria,
  productosEnOferta,
} from "./catalogo";

describe("catálogo", () => {
  const categorias = [
    { id: 1, nombre: "Pinturas" },
    { id: 2, nombre: "Jardín" },
  ];
  const productos = [
    { id: 10, codigo: "PT001", nombre: "Pintura látex", precio: 10000, categoriaId: 1 },
    { id: 11, codigo: "JA004", nombre: "Pala", precio: 8000, categoriaId: 2 },
  ];

  it("agrega el nombre de la categoría a cada producto", () => {
    const catalogo = armarCatalogo(productos, categorias, []);

    expect(catalogo.productos[0].categoria).toBe("Pinturas");
    expect(catalogo.productos[1].categoria).toBe("Jardín");
    expect(catalogo.categorias).toEqual(["Pinturas", "Jardín"]);
  });

  it("aplica el porcentaje de la oferta y guarda el precio anterior", () => {
    const ofertas = [{ id: 1, productoId: 10, porcentaje: 15, activa: true }];

    const catalogo = armarCatalogo(productos, categorias, ofertas);

    expect(catalogo.productos[0].oferta).toBe(true);
    expect(catalogo.productos[0].precioAnterior).toBe(10000);
    expect(catalogo.productos[0].precio).toBe(8500);
    expect(catalogo.productos[1].precio).toBe(8000);
  });

  it("calcula el precio con oferta sin decimales", () => {
    expect(precioConOferta(9990, 15)).toBe(8491);
    expect(precioConOferta(5000, 20)).toBe(4000);
  });

  it("filtra los productos por categoría y los que están en oferta", () => {
    const ofertas = [{ id: 1, productoId: 11, porcentaje: 10, activa: true }];
    const catalogo = armarCatalogo(productos, categorias, ofertas);

    expect(productosDeCategoria(catalogo.productos, "Jardín")).toEqual([
      catalogo.productos[1],
    ]);
    expect(productosEnOferta(catalogo.productos)[0].nombre).toBe("Pala");
  });
});
