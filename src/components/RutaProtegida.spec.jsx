import { render, screen } from "@testing-library/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RutaProtegida from "./RutaProtegida";

function mostrar(rol) {
  render(
    <BrowserRouter>
      <Routes>
        <Route element={<RutaProtegida rol={rol} />}>
          <Route path="/" element={<h1>Panel privado</h1>} />
        </Route>
        <Route path="/login" element={<h1>Pantalla de login</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

describe("RutaProtegida", () => {
  it("muestra la página hija cuando el usuario tiene el rol pedido", () => {
    sessionStorage.setItem(
      "usuario",
      JSON.stringify({ nombre: "Ana", correo: "ana@gmail.com", rol: "Administrador" })
    );

    mostrar("Administrador");

    expect(screen.getByRole("heading", { name: "Panel privado" })).toBeInTheDocument();
    sessionStorage.removeItem("usuario");
  });

  it("redirige al login cuando no hay sesión", () => {
    mostrar();

    expect(screen.getByRole("heading", { name: "Pantalla de login" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Panel privado" })).not.toBeInTheDocument();
  });
});
