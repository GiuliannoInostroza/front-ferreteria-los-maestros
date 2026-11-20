import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CENTRO = [-29.9045, -71.2489];
const RADIO = 5000; // 5 kilometros, cobertura de ejemplo

function MapaCobertura({ onVerificar }) {
  const contenedor = useRef(null);

  useEffect(() => {
    const mapa = L.map(contenedor.current).setView(CENTRO, 12);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(mapa);

    L.circle(CENTRO, {
      radius: RADIO,
      color: "blue",
      fillOpacity: 0.15,
    }).addTo(mapa);

    L.circleMarker(CENTRO, {
      radius: 7,
      color: "blue",
    })
      .addTo(mapa)
      .bindPopup("Centro referencial de cobertura");

    let marcador = null;

    mapa.on("click", function (evento) {
      if (marcador) {
        mapa.removeLayer(marcador);
      }

      marcador = L.circleMarker(evento.latlng, {
        radius: 7,
        color: "red",
      }).addTo(mapa);

      const distancia = L.latLng(CENTRO).distanceTo(evento.latlng);

      onVerificar(distancia <= RADIO);
    });

    return () => mapa.remove();
  }, [onVerificar]);

  return <div ref={contenedor} style={{ height: "300px", width: "100%" }} />;
}

export default MapaCobertura;
