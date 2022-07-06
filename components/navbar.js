import React from "react";
import withTransition from "../HOC/withTransition";
import { Navbar, Container, Nav } from "react-bootstrap";
const NavComponent = () => {
  return (
    <>
      <Navbar
        bg="black"
        style={{
          color: "white",
        }}
        variant="dark"
      >
        <Container>
          <Nav
            style={{
              display: "flex",
              margin: 0,
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Nav.Link
              href="#"
              style={{
                fontWeight: "bold",
                fontSize: "2rem",
              }}
            >
              Oaziz
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <br />
    </>
  );
};

export default withTransition(NavComponent);
