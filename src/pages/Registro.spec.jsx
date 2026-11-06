import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import Registro from "./Registro";

describe("Registro", () => {
  it("muestra errores del formulario vacío y luego crea la cuenta en el backend", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 1,
        nombre: "Ana Soto",
        correo: "ana@gmail.com",
        rol: "Cliente",
        activo: true,
      }),
    });
    const usuario = userEvent.setup();
    render(
      <BrowserRouter>
        <Registro />
      </BrowserRouter>,
    );

    await usuario.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(screen.getByText("Nombre obligatorio")).toBeInTheDocument();
    expect(espia).not.toHaveBeenCalled();

    await usuario.type(screen.getByLabelText("Nombre"), "Ana Soto");
    await usuario.type(screen.getByLabelText("Correo"), "ana@gmail.com");
    await usuario.type(screen.getByLabelText("Contraseña"), "1234");
    await usuario.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_AUTH_API_URL}/auth/registro`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: "Ana Soto",
          correo: "ana@gmail.com",
          password: "1234",
        }),
      },
    );
    expect(
      await screen.findByRole("heading", { name: "Cuenta creada" }),
    ).toBeInTheDocument();

    espia.mockRestore();
  });

  it("avisa cuando el correo ya tiene una cuenta", async () => {
    const espia = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: false, status: 409 });
    const usuario = userEvent.setup();
    render(
      <BrowserRouter>
        <Registro />
      </BrowserRouter>,
    );

    await usuario.type(screen.getByLabelText("Nombre"), "Otra Persona");
    await usuario.type(screen.getByLabelText("Correo"), "agu.perez@duocuc.cl");
    await usuario.type(screen.getByLabelText("Contraseña"), "1234");
    await usuario.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(
      screen.getByText("Ya existe una cuenta con ese correo"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Cuenta creada" }),
    ).not.toBeInTheDocument();

    espia.mockRestore();
  });
});
