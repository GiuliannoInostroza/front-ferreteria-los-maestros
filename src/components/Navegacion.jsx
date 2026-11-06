import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { NavLink } from "react-router-dom";

import { esAdministrador, puedeAdministrar } from "../utils/sesion";

function Navegacion({ unidades, usuario }) {
  return (
    <Navbar expand="xl" className="navbar-ferreteria" data-bs-theme="dark">
      <Container>
        <NavLink className="navbar-brand" to="/">
          <img src="/assets/img/logo.png" alt="Logo de la ferretería" />
          <span className="brand-text">Ferretería Los Maestros</span>
        </NavLink>

        <Navbar.Toggle
          aria-controls="menu-principal"
          aria-label="Abrir menú de navegación"
        />

        <Navbar.Collapse id="menu-principal">
          <Nav className="ms-auto align-items-lg-center">
            <NavLink className="nav-link" to="/">
              Inicio
            </NavLink>

            {puedeAdministrar(usuario) ? (
              <NavDropdown title="Tienda" id="menu-tienda">
                <NavDropdown.Item as={NavLink} to="/productos">
                  Productos
                </NavDropdown.Item>

                <NavDropdown.Item as={NavLink} to="/categorias">
                  Categorías
                </NavDropdown.Item>

                <NavDropdown.Item as={NavLink} to="/ofertas">
                  Ofertas
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <NavLink className="nav-link" to="/productos">
                  Productos
                </NavLink>

                <NavLink className="nav-link" to="/categorias">
                  Categorías
                </NavLink>

                <NavLink className="nav-link" to="/ofertas">
                  Ofertas
                </NavLink>
              </>
            )}

            <NavDropdown title="Información" id="menu-informacion">
              <NavDropdown.Item as={NavLink} to="/nosotros">
                Nosotros
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/blogs">
                Blogs
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/contacto">
                Contacto
              </NavDropdown.Item>
            </NavDropdown>

            <NavLink className="nav-link" to="/carrito">
              Carrito ({unidades})
            </NavLink>

            {usuario && (
              <NavLink className="nav-link" to="/mis-pedidos">
                Mis pedidos
              </NavLink>
            )}

            {puedeAdministrar(usuario) && (
              <NavDropdown title="Administración" id="menu-admin">
                <NavDropdown.Item as={NavLink} to="/admin/productos">
                  Productos
                </NavDropdown.Item>

                <NavDropdown.Item as={NavLink} to="/admin/pedidos">
                  Pedidos
                </NavDropdown.Item>

                {esAdministrador(usuario) && (
                  <NavDropdown.Item as={NavLink} to="/admin/usuarios">
                    Usuarios
                  </NavDropdown.Item>
                )}
              </NavDropdown>
            )}

            <NavLink className="nav-link" to="/login">
              {usuario ? `${usuario.nombre} (${usuario.rol})` : "Ingresar"}
            </NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navegacion;
