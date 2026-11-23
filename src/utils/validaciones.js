import { correoConDominioPermitido } from "./correo";

export function hayErrores(errores) {
  return Object.keys(errores).length > 0;
}

export function validarCheckout(datos) {
  const errores = {};

  if (!datos.nombre.trim()) {
    errores.nombre = "Nombre obligatorio";
  }
  if (datos.nombre.trim().length > 100) {
    errores.nombre = "El nombre puede tener máximo 100 caracteres";
  }
  if (!datos.correo.trim()) {
    errores.correo = "Correo obligatorio";
  }
  if (datos.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) {
    errores.correo = "Ingresa un correo electrónico válido";
  }

  if (datos.entrega === "Despacho a domicilio") {
    const direccion = datos.direccion.trim();

    if (!direccion) {
      errores.direccion = "Dirección obligatoria";
    }
    if (direccion && direccion.length < 5) {
      errores.direccion = "Ingresa una dirección válida";
    }
    if (direccion.length > 150) {
      errores.direccion = "La dirección puede tener máximo 150 caracteres";
    }
  }

  return errores;
}

export function validarContacto(datos) {
  const errores = {};

  if (!datos.nombre.trim()) {
    errores.nombre = "Nombre obligatorio";
  }
  if (datos.nombre.trim().length > 100) {
    errores.nombre = "El nombre puede tener máximo 100 caracteres";
  }

  if (!datos.email.trim()) {
    errores.email = "Correo obligatorio";
  }
  if (datos.email.trim() && !correoConDominioPermitido(datos.email)) {
    errores.email =
      "Ingresa un correo electrónico válido";
  }

  if (!datos.asunto) {
    errores.asunto = "Selecciona un motivo";
  }

  const largoMensaje = datos.mensaje.trim().length;

  if (largoMensaje < 20) {
    errores.mensaje = "El mensaje debe tener al menos 20 caracteres";
  }
  if (largoMensaje > 500) {
    errores.mensaje = "El mensaje puede tener máximo 500 caracteres";
  }

  return errores;
}

export function validarLogin(datos, encontrado) {
  const errores = {};
  const correo = datos.correo.trim().toLowerCase();

  if (!correo) {
    errores.correo = "Correo obligatorio";
  }
  if (correo && !correoConDominioPermitido(correo)) {
    errores.correo =
      "Ingresa un correo electrónico válido";
  }
  if (correoConDominioPermitido(correo) && !encontrado) {
    errores.correo = "No existe una cuenta con ese correo";
  }
  if (encontrado && !encontrado.activo) {
    errores.correo = "La cuenta está desactivada";
  }
  if (datos.contrasena.length < 4) {
    errores.contrasena = "La contraseña debe tener entre 4 y 10 caracteres";
  }
  if (datos.contrasena.length > 10) {
    errores.contrasena = "La contraseña debe tener entre 4 y 10 caracteres";
  }

  return errores;
}

export function validarRegistro(datos, registrados) {
  const errores = {};
  const correo = datos.correo.trim().toLowerCase();
  const existe = registrados.some((item) => item.correo === correo);

  if (!datos.nombre.trim()) {
    errores.nombre = "Nombre obligatorio";
  }
  if (!correo) {
    errores.correo = "Correo obligatorio";
  }
  if (correo && !correoConDominioPermitido(correo)) {
    errores.correo =
      "Ingresa un correo electrónico válido";
  }
  if (correo && correoConDominioPermitido(correo) && existe) {
    errores.correo = "Ya existe una cuenta con ese correo";
  }
  if (datos.contrasena.length < 4) {
    errores.contrasena = "La contraseña debe tener entre 4 y 10 caracteres";
  }
  if (datos.contrasena.length > 10) {
    errores.contrasena = "La contraseña debe tener entre 4 y 10 caracteres";
  }

  return errores;
}

export function validarProducto(datos, productos, codigoActual) {
  const errores = {};
  const codigo = datos.codigo.trim();

  if (!codigo) {
    errores.codigo = "Código obligatorio";
  }
  if (
    codigo &&
    productos.some(
      (item) => item.codigo === codigo && item.codigo !== codigoActual
    )
  ) {
    errores.codigo = "Ya existe un producto con ese código";
  }
  if (!datos.nombre.trim()) {
    errores.nombre = "Nombre obligatorio";
  }
  if (!datos.marca.trim()) {
    errores.marca = "Marca obligatoria";
  }
  if (!datos.categoria.trim()) {
    errores.categoria = "Categoría obligatoria";
  }
  if (!(Number(datos.precio) > 0)) {
    errores.precio = "El precio debe ser mayor que 0";
  }
  if (Number(datos.precio) % 1 !== 0) {
    errores.precio = "El precio debe ser un número entero";
  }
  if (datos.stock === "") {
    errores.stock = "El stock es obligatorio";
  }
  if (!(Number(datos.stock) >= 0)) {
    errores.stock = "El stock no puede ser negativo";
  }
  if (Number(datos.stock) % 1 !== 0) {
    errores.stock = "El stock debe ser un número entero";
  }
  if (datos.stockCritico === "") {
    errores.stockCritico = "El stock crítico es obligatorio";
  }
  if (!(Number(datos.stockCritico) >= 0)) {
    errores.stockCritico = "El stock crítico no puede ser negativo";
  }
  if (Number(datos.stockCritico) % 1 !== 0) {
    errores.stockCritico = "El stock crítico debe ser un número entero";
  }

  return errores;
}

export function validarUsuario(datos, usuarios, idActual) {
  const errores = {};
  const correo = datos.correo.trim().toLowerCase();

  if (!datos.nombre.trim()) {
    errores.nombre = "Nombre obligatorio";
  }
  if (!correo) {
    errores.correo = "Correo obligatorio";
  }
  if (correo && !correoConDominioPermitido(correo)) {
    errores.correo =
      "Ingresa un correo electrónico válido";
  }
  if (
    correoConDominioPermitido(correo) &&
    usuarios.some((item) => item.correo === correo && item.id !== idActual)
  ) {
    errores.correo = "Ya existe un usuario con ese correo";
  }
  if (!datos.rol) {
    errores.rol = "Rol obligatorio";
  }

  return errores;
}
