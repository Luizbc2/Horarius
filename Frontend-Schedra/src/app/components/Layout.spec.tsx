import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { AuthProvider } from "../auth/AuthContext";
import { Layout } from "./Layout";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark", setTheme: vi.fn() }),
}));

function LocationProbe() {
  const location = useLocation();

  return <p data-testid="current-location">{`${location.pathname}${location.search}`}</p>;
}

function renderLayout(initialPath: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="*" element={<LocationProbe />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("Layout mobile navigation", () => {
  test("shows the primary destinations and highlights the current section", () => {
    renderLayout("/clientes");

    const navigation = screen.getByRole("navigation", { name: "Navegação principal mobile" });

    expect(within(navigation).getByRole("link", { name: "Agenda" })).toHaveAttribute("href", "/agenda/timeline");
    expect(within(navigation).getByRole("link", { name: "Clientes" })).toHaveAttribute("aria-current", "page");
    expect(within(navigation).getByRole("link", { name: "Equipe" })).toHaveAttribute("href", "/profissionais");
    expect(within(navigation).getByRole("link", { name: "Perfil" })).toHaveAttribute("href", "/perfil");
    expect(screen.getByRole("button", { name: "Sair da conta" })).toHaveTextContent("Sair");
  });

  test("opens the quick appointment flow from any protected page", async () => {
    const user = userEvent.setup();

    renderLayout("/clientes");
    await user.click(screen.getByRole("button", { name: "Novo agendamento rápido" }));

    expect(screen.getByTestId("current-location")).toHaveTextContent("/agenda/timeline?novo=1");
    expect(screen.queryByRole("button", { name: "Novo agendamento rápido" })).not.toBeInTheDocument();
  });

  test("opens mobile navigation as a full-screen menu", async () => {
    const user = userEvent.setup();

    renderLayout("/perfil");
    await user.click(screen.getByRole("button", { name: "Abrir menu" }));

    expect(screen.queryByRole("navigation", { name: /principal mobile/i })).not.toBeInTheDocument();
    const closeButton = screen.getByRole("button", { name: "Fechar menu" });
    const fullScreenMenu = closeButton.closest("aside");

    expect(closeButton).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Sair da conta" })).toHaveLength(3);

    await user.click(closeButton);

    expect(fullScreenMenu).toHaveClass("-translate-y-full", "opacity-0");
    expect(screen.getByRole("navigation", { name: /principal mobile/i })).toBeInTheDocument();
  });
});
