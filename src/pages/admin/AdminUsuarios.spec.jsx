import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import AdminUsuarios from "./AdminUsuarios";

const usuarios = [
  { id: 3, nombre: "Luis Vega", correo: "cliente@gmail.com", rol: "Cliente", activo: true },
  { id: 4, nombre: "Ana Soto", correo: "ana@duoc.cl", rol: "Vendedor", activo: true },
];

function mostrarPantalla() {
  render(
    <BrowserRouter>
      <AdminUsuarios />
    </BrowserRouter>
  );
}

describe("AdminUsuarios", () => {
  it("muestra los usuarios que entrega la API con su enlace para editar", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => usuarios,
    });
    mostrarPantalla();

    expect(
      await screen.findByRole("heading", { name: "Administración de usuarios" })
    ).toBeInTheDocument();
    expect(screen.getByText("Luis Vega")).toBeInTheDocument();
    expect(screen.getByText("ana@duoc.cl")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Editar" })[0]).toBeInTheDocument();

    espia.mockRestore();
  });

  it("elimina un usuario después de confirmar y lo quita de la tabla", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => usuarios,
    });
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(true);
    const usuario = userEvent.setup();
    mostrarPantalla();

    await screen.findByRole("heading", { name: "Administración de usuarios" });
    espia.mockResolvedValue({ ok: true, status: 204 });
    await usuario.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_USUARIOS_API_URL}/usuarios/3`,
      { method: "DELETE", headers: { "Content-Type": "application/json" } }
    );
    expect(screen.queryByText("Luis Vega")).not.toBeInTheDocument();
    expect(screen.getByText("Ana Soto")).toBeInTheDocument();

    confirmar.mockRestore();
    espia.mockRestore();
  });

  it("avisa el error cuando la API de usuarios no responde bien", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 500 });
    mostrarPantalla();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Solicitud rechazada: 500")).toBeInTheDocument();

    espia.mockRestore();
  });
});
