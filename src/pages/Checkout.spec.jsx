import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import * as validaciones from "../utils/validaciones";
import Checkout from "./Checkout";

describe("Checkout", () => {
  const carrito = [
    {
      codigo: "MC001",
      nombre: "Cemento",
      precio: 5990,
      stock: 80,
      cantidad: 2,
    },
  ];

  it("muestra errores con el formulario vacío y confirma la compra al corregirlos", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 15,
        total: 11980,
        direccionDespacho: "Av. Francisco de Aguirre 1234",
      }),
    });
    const usuario = userEvent.setup();
    const onVaciar = vi.fn();
    render(
      <BrowserRouter>
        <Checkout carrito={carrito} onVaciar={onVaciar} />
      </BrowserRouter>
    );

    await usuario.click(screen.getByRole("button", { name: /confirmar compra/i }));
    expect(screen.getByText("Nombre obligatorio")).toBeInTheDocument();
    expect(screen.getByText("Correo obligatorio")).toBeInTheDocument();

    await usuario.type(screen.getByLabelText("Nombre"), "Giulianno");
    await usuario.type(screen.getByLabelText("Correo"), "giu@duocuc.cl");
    await usuario.selectOptions(screen.getByLabelText("Entrega"), "Despacho a domicilio");
    await usuario.click(screen.getByRole("button", { name: /confirmar compra/i }));
    expect(screen.getByText("Dirección obligatoria")).toBeInTheDocument();

    await usuario.type(screen.getByLabelText("Dirección"), "Av. Francisco de Aguirre 1234");
    await usuario.click(screen.getByRole("button", { name: /confirmar compra/i }));

    expect(await screen.findByRole("heading", { name: /compra exitosa/i })).toBeInTheDocument();
    expect(onVaciar).toHaveBeenCalled();
    expect(screen.getByText(/Av. Francisco de Aguirre 1234/)).toBeInTheDocument();
    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_PEDIDOS_API_URL}/pedidos`,
      {
        method: "POST",
        body: JSON.stringify({
          tipoEntrega: "Despacho a domicilio",
          direccionDespacho: "Av. Francisco de Aguirre 1234",
          medioPago: "Pago en tienda",
          detalles: [
            {
              codigoProducto: "MC001",
              nombreProducto: "Cemento Polpaico gris 25 kg",
              cantidad: 2,
              precioUnitario: 5990,
            },
          ],
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    espia.mockRestore();
  });

  it("muestra los errores entregados por la validación y no vacía el carrito", async () => {
    const espia = vi
      .spyOn(validaciones, "validarCheckout")
      .mockReturnValue({ nombre: "Nombre obligatorio" });
    const usuario = userEvent.setup();
    const onVaciar = vi.fn();
    render(
      <BrowserRouter>
        <Checkout carrito={carrito} onVaciar={onVaciar} />
      </BrowserRouter>
    );

    await usuario.click(screen.getByRole("button", { name: /confirmar compra/i }));

    expect(espia).toHaveBeenCalled();
    expect(screen.getByText("Nombre obligatorio")).toBeInTheDocument();
    expect(onVaciar).not.toHaveBeenCalled();

    espia.mockRestore();
  });

  it("muestra el pago fallido cuando un producto supera el stock", async () => {
    const usuario = userEvent.setup();
    const sinStock = [{ ...carrito[0], cantidad: 81 }];
    render(
      <BrowserRouter>
        <Checkout carrito={sinStock} onVaciar={vi.fn()} />
      </BrowserRouter>
    );

    await usuario.type(screen.getByLabelText("Nombre"), "Giulianno");
    await usuario.type(screen.getByLabelText("Correo"), "giu@duocuc.cl");
    await usuario.click(screen.getByRole("button", { name: /confirmar compra/i }));
    expect(
      screen.getByRole("heading", { name: /no se pudo realizar el pago/i })
    ).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: /volver a intentar/i }));
    expect(screen.getByRole("heading", { name: /finalizar compra/i })).toBeInTheDocument();
  });
});
