function MapaDespacho({ direccion }) {
  if (!direccion) {
    return <p>No hay dirección de despacho registrada.</p>;
  }

  const ubicacion = encodeURIComponent(`${direccion}, Chile`);

  const urlMapa = `https://www.google.com/maps?q=${ubicacion}&output=embed`;

  return (
    <section className="mt-4">
      <h2 className="h5">Ubicación del despacho</h2>

      <p>
        <strong>Dirección:</strong> {direccion}
      </p>

      <iframe
        title="Mapa de ubicación del despacho"
        src={urlMapa}
        width="100%"
        height="350"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
      />
    </section>
  );
}

export default MapaDespacho;
