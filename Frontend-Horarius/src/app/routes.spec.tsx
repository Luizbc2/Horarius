import { MemoryRouter, Outlet, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";

import { AuthProvider } from "./auth/AuthContext";
import { persistSession } from "./lib/auth-storage";
import { ProtectedLayout, PublicLoginRoute } from "./routes";

describe("App routes", () => {
  test("redirects unauthenticated users to login when they open a protected page", async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/clientes"]}>
          <Routes>
            <Route path="/login" element={<div>Login publica</div>} />
            <Route element={<ProtectedLayout />}>
              <Route path="/clientes" element={<div>Clientes protegidos</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByText("Login publica")).toBeInTheDocument();
  });

  test("redirects authenticated users away from the public login page", async () => {
    persistSession({
      token: "token-front",
      user: {
        id: 1,
        name: "Luiz",
        email: "luiz@example.com",
        cpf: "12345678901",
      },
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/agenda/timeline" element={<div>Agenda timeline mock</div>} />
            <Route path="/login" element={<PublicLoginRoute />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByText("Agenda timeline mock")).toBeInTheDocument();
  });
});
