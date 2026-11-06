import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import Login from "./Login";

describe("Login", () => {
  it("inicia sesión, guarda el token y entrega el usuario a onIngresar", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        token: "token-de-prueba",
        correo: "pedro@gmail.com",
        rol: "Vendedor",
        nombre: "Pedro Soto",
      }),
    });
    const usuario = userEvent.setup();
    const onIngresar = vi.fn();
    render(
      <BrowserRouter>
        <Login onIngresar={onIngresar} />
      </BrowserRouter>
    );

    await usuario.type(screen.getByLabelText("Correo"), "pedro@gmail.com");
    await usuario.type(screen.getByLabelText("Contraseña"), "1234");
    await usuario.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_AUTH_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: "pedro@gmail.com", password: "1234" }),
      }
    );
    expect(onIngresar).toHaveBeenCalledWith({
      nombre: "Pedro Soto",
      correo: "pedro@gmail.com",
      rol: "Vendedor",
    });
    expect(sessionStorage.getItem("token")).toBe("token-de-prueba");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    espia.mockRestore();
  });

  it("muestra un aviso cuando el backend rechaza las credenciales", async () => {
    const espia = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: false, status: 401 });
    const usuario = userEvent.setup();
    const onIngresar = vi.fn();
    render(
      <BrowserRouter>
        <Login onIngresar={onIngresar} />
      </BrowserRouter>
    );

    await usuario.type(screen.getByLabelText("Correo"), "pedro@gmail.com");
    await usuario.type(screen.getByLabelText("Contraseña"), "mala");
    await usuario.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("No fue posible iniciar sesión")).toBeInTheDocument();
    expect(onIngresar).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("token")).toBe(null);

    espia.mockRestore();
  });
});
