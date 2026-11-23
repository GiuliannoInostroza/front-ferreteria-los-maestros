import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import * as validaciones from "../utils/validaciones";
import Checkout from "./Checkout";

describe("Checkout", () => {
  const carrito = [
    {
      id: 1,
      codigo: "MC001",
      nombre: "Cemento",
      precio: 5990,
      stock: 80,
      cantidad: 2,
    },
  ];

  const cliente = { nombre: "Giulianno", correo: "giu@duocuc.cl", rol: "Cliente" };

  const respuestaCatalogo = {
    productos: [
      {
        id: 1,
        codigo: "MC001",
        nombre: "Cemento Polpaico gris 25 kg",
        precio: 5990,
        stock: 80,
        stockCritico: 20,
        categoriaId: 1,
      },
    ],
    categorias: [{ id: 1, nombre: "Materiales de Construcción" }],
    ofertas: [],
    id: 15,
    total: 11980,
    direccionDespacho: "Av. Francisco de Aguirre 1234",
  };

  it("pide la comuna para despacho y confirma la compra con retiro en tienda", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => respuestaCatalogo,
    });
    const usuario = userEvent.setup();
    const onVaciar = vi.fn();
    render(
      <BrowserRouter>
        <Checkout carrito={carrito} usuario={cliente} onVaciar={onVaciar} />
      </BrowserRouter>
    );

    await usuario.selectOptions(screen.getByLabelText("Entrega"), "Despacho a domicilio");
    await usuario.click(screen.getByRole("button", { name: /confirmar compra/i }));
    expect(screen.getByText("Solo realizamos despachos en La Serena")).toBeInTheDocument();
    expect(onVaciar).not.toHaveBeenCalled();

    await usuario.selectOptions(screen.getByLabelText("Entrega"), "Retiro en tienda");
    await usuario.click(screen.getByRole("button", { name: /confirmar compra/i }));

    expect(await screen.findByRole("heading", { name: /compra exitosa/i })).toBeInTheDocument();
    expect(onVaciar).toHaveBeenCalled();
    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_CATALOGO_API_URL}/productos/descontar-stock`,
      {
        method: "POST",
        body: JSON.stringify({ items: [{ productoId: 1, cantidad: 2 }] }),
        headers: { "Content-Type": "application/json" },
      }
    );
    expect(espia).toHaveBeenCalledWith(
      `${import.meta.env.VITE_PEDIDOS_API_URL}/pedidos`,
      {
        method: "POST",
        body: JSON.stringify({
          tipoEntrega: "Retiro en tienda",
          direccionDespacho: "",
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
        <Checkout carrito={carrito} usuario={cliente} onVaciar={onVaciar} />
      </BrowserRouter>
    );

    await usuario.click(screen.getByRole("button", { name: /confirmar compra/i }));

    expect(espia).toHaveBeenCalled();
    expect(screen.getByText("Nombre obligatorio")).toBeInTheDocument();
    expect(onVaciar).not.toHaveBeenCalled();

    espia.mockRestore();
  });

  it("muestra el pago fallido cuando un producto supera el stock", async () => {
    const espia = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => respuestaCatalogo,
    });
    const usuario = userEvent.setup();
    const sinStock = [{ ...carrito[0], cantidad: 81 }];
    render(
      <BrowserRouter>
        <Checkout carrito={sinStock} usuario={cliente} onVaciar={vi.fn()} />
      </BrowserRouter>
    );

    await usuario.click(screen.getByRole("button", { name: /confirmar compra/i }));
    expect(
      await screen.findByRole("heading", { name: /no se pudo realizar el pago/i })
    ).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: /volver a intentar/i }));
    expect(screen.getByRole("heading", { name: /finalizar compra/i })).toBeInTheDocument();

    espia.mockRestore();
  });
});
