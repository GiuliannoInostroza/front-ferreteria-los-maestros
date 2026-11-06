# Ferretería Los Maestros

Tienda online desarrollada para Ferretería Los Maestros.

Proyecto del ramo Desarrollo FullStack II (DSY1104) de Duoc UC. En la Evaluación Parcial 2 el sitio fue migrado a React y se incorporaron componentes reutilizables, navegación, persistencia local, administración y pruebas unitarias. En la Evaluación Parcial 3 se conectó con los microservicios Spring Boot del backend: inicio de sesión con JWT, administración de usuarios y pedidos.

## Equipo

| Integrante          | Área principal                                                         |
| ------------------- | ---------------------------------------------------------------------- |
| Giulianno Inostroza | Carrito, checkout, login, roles y persistencia                         |
| Agustín Pérez       | Base React, inicio, catálogo, categorías, ofertas, detalle y contenido |
| Nicolás Pérez       | Administración de productos y usuarios, y registro                     |

## Tecnologías

- Node.js 20
- React con Vite
- React Bootstrap y Bootstrap
- React Router
- localStorage y sessionStorage
- Backend: https://github.com/GiuliannoInostroza/ferreteria-los-maestros-backend
- Vitest
- React Testing Library
- jsdom

## Cómo ejecutar

Entorno utilizado: Node.js 20.

```bash
git clone https://github.com/GiuliannoInostroza/front-ferreteria-los-maestros.git
cd front-ferreteria-los-maestros
npm install
npm run dev
```

La aplicación se abrirá normalmente en:

```text
http://localhost:5173
```

El frontend se conecta con estos microservicios (deben estar levantados, ver el README del backend). Las direcciones están en `.env.development`, y `.env.example` documenta los nombres:

| Variable | Valor local | Microservicio |
| -------- | ----------- | ------------- |
| `VITE_AUTH_API_URL` | `http://localhost:8090/api` | ms-usuarios (login y registro) |
| `VITE_USUARIOS_API_URL` | `http://localhost:8090/api` | ms-usuarios (administración) |
| `VITE_PEDIDOS_API_URL` | `http://localhost:8092/api` | ms-pedidos |

Después de cambiar un `.env` hay que reiniciar `npm run dev`.

Para generar la versión de producción:

```bash
npm run build
```

## Pruebas

Para ejecutar las pruebas:

```bash
npm run test:run
```

Para ejecutar las pruebas con cobertura:

```bash
npm run coverage
```

Resultado final:

- 26 de 26 archivos de prueba aprobados.
- 39 de 39 pruebas aprobadas.

Cobertura final:

| Indicador  | Cobertura |
| ---------- | --------: |
| Statements |   84,76 % |
| Branches   |   72,81 % |
| Functions  |   89,93 % |
| Lines      |   86,63 % |

Las pruebas utilizan `vi.fn`, `vi.spyOn`, `mockRestore` y `mockResolvedValue` según el caso. Las que llaman a la API reemplazan `fetch` con `vi.spyOn(globalThis, "fetch")`, así no necesitan el backend levantado.

## Sesión y roles

El inicio de sesión se hace contra `ms-usuarios`, que valida la contraseña (guardada con BCrypt) y entrega un JWT. React guarda el token y el usuario en `sessionStorage`: la sesión se mantiene al recargar y se borra al cerrar la pestaña o con "Cerrar sesión". Cada servicio envía el token en el encabezado `Authorization: Bearer`. El token dura 1 hora; al vencer, hay que volver a iniciar sesión.

La cuenta de administrador inicial la crea `ms-usuarios` al arrancar con `ADMIN_CORREO` y `ADMIN_PASSWORD`. Las cuentas nuevas se crean en `/registro` (como Cliente) o desde la administración de usuarios.

### Permisos

- Cliente: navegación, compra y sus propios pedidos.
- Vendedor: lo anterior, administración de productos y gestión de todos los pedidos.
- Administrador: lo anterior y administración de usuarios (crear, editar, asignar rol y desactivar).

## Funcionalidades principales

- Inicio y catálogo de productos.
- Detalle de productos.
- Filtro por categorías.
- Vista de ofertas.
- Productos destacados.
- Carrito de compras.
- Modificación y eliminación de productos del carrito.
- Checkout que registra el pedido en el backend.
- Mis pedidos con su estado.
- Gestión de pedidos para Vendedor y Administrador.
- Validación de formularios.
- Control y actualización de stock.
- Registro de clientes.
- Inicio y cierre de sesión.
- Roles Cliente, Vendedor y Administrador.
- Administración de productos.
- Administración de usuarios.
- Persistencia del carrito mediante `localStorage` y de la sesión mediante `sessionStorage`.
- Diseño responsive.

## Estructura principal

```text
src/
├── components/   componentes reutilizables
├── pages/        vistas de la aplicación
│   └── admin/    administración de productos y usuarios
├── data/         datos iniciales
├── services/     servicios
├── utils/        funciones, validaciones y persistencia
├── test/         configuración de pruebas
├── App.jsx       rutas y estado compartido
└── main.jsx      punto de entrada
```

## Rutas principales

| Ruta                 | Vista                       |
| -------------------- | --------------------------- |
| `/`                  | Inicio                      |
| `/productos`         | Catálogo                    |
| `/productos/:codigo` | Detalle de producto         |
| `/categorias`        | Categorías                  |
| `/ofertas`           | Ofertas                     |
| `/carrito`           | Carrito                     |
| `/checkout`          | Finalizar compra            |
| `/login`             | Inicio de sesión            |
| `/registro`          | Registro                    |
| `/nosotros`          | Nosotros                    |
| `/blogs`             | Blogs                       |
| `/contacto`          | Contacto                    |
| `/admin/productos`   | Administración de productos |
| `/admin/usuarios`    | Administración de usuarios  |
| `/mis-pedidos`       | Mis pedidos                 |
| `/admin/pedidos`     | Gestión de pedidos          |

## Diseño responsive

La aplicación utiliza Bootstrap para adaptarse a dispositivos móviles, tablet y escritorio.

El menú cambia a navegación colapsada bajo el breakpoint `xl` de Bootstrap y se revisó el sitio entre 320 px y 1920 px sin desplazamiento horizontal significativo.

## Despliegue

La versión final está publicada en AWS EC2 utilizando Nginx:

http://54.88.103.128

## Alcance

Los usuarios y los pedidos se guardan en el backend (MySQL). El catálogo, las ofertas, los blogs y el stock siguen en datos locales hasta que se conecten `ms-catalogo` y `ms-contenido`.

No se incluyen pagos reales.
