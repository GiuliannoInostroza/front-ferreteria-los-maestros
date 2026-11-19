export function productosDeCategoria(productos, categoria) {
  return productos.filter((producto) => producto.categoria === categoria);
}

export function productosEnOferta(productos) {
  return productos.filter((producto) => producto.oferta);
}

export function precioConOferta(precio, porcentaje) {
  const precioPorCien = precio * (100 - porcentaje);
  return (precioPorCien - (precioPorCien % 100)) / 100;
}

export function armarCatalogo(productos, categorias, ofertas) {
  const productosListos = productos.map((producto) => {
    const categoria = categorias.find((item) => item.id === producto.categoriaId);
    const oferta = ofertas.find((item) => item.productoId === producto.id);
    const base = {
      ...producto,
      categoria: categoria ? categoria.nombre : "",
    };

    if (!oferta) return base;

    return {
      ...base,
      oferta: true,
      precioAnterior: producto.precio,
      precio: precioConOferta(producto.precio, oferta.porcentaje),
    };
  });

  return {
    productos: productosListos,
    categorias: categorias.map((categoria) => categoria.nombre),
  };
}
