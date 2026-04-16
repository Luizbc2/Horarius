import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useState, type Dispatch, type SetStateAction } from "react";
import {
  CalendarDays,
  Clock3,
  List,
  LogOut,
  Menu,
  Package,
  Scissors,
  Sparkles,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "./ui/utils";

type NavigationItem = {
  label: string;
  path?: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
};

const agendaItems: NavigationItem[] = [
  { label: "Timeline", path: "/agenda/timeline", icon: Clock3 },
  { label: "Lista", path: "/agenda/lista", icon: List },
];

const navigationGroups: Array<{ title: string; items: NavigationItem[] }> = [
  {
    title: "Agenda",
    items: agendaItems,
  },
  {
    title: "Operação",
    items: [
      { label: "Clientes", path: "/clientes", icon: Users },
      { label: "Profissionais", path: "/profissionais", icon: Scissors },
      { label: "Serviços", path: "/servicos", icon: Package },
      { label: "Em breve", icon: Sparkles, badge: "soon", disabled: true },
    ],
  },
  {
    title: "Conta",
    items: [{ label: "Perfil", path: "/perfil", icon: User }],
  },
];

type SidebarContentProps = {
  isCollapsed: boolean;
  currentPath: string;
  workspaceDate: string;
  userName: string;
  userEmail: string;
  closeSidebar: () => void;
  handleLogout: () => void;
  toggleSidebarCollapse?: () => void;
};

function SidebarContent({
  isCollapsed,
  currentPath,
  workspaceDate,
  userName,
  userEmail,
  closeSidebar,
  handleLogout,
  toggleSidebarCollapse,
}: SidebarContentProps) {
  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const renderTooltip = (label: string, content: React.ReactNode) => {
    if (!isCollapsed) {
      return content;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const Icon = item.icon;

    if (!item.path || item.disabled) {
      const disabledItem = (
        <button
          key={item.label}
          type="button"
          disabled
          className={cn(
            "flex w-full items-center rounded-[1rem] border border-transparent text-left text-[0.95rem] text-foreground/45 transition-all duration-300 disabled:cursor-not-allowed",
            isCollapsed ? "justify-center px-2 py-2.5" : "justify-between px-3 py-3",
          )}
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[rgba(89,184,171,0.12)] text-primary">
              <Icon className="h-[1.05rem] w-[1.05rem]" />
            </span>
            {!isCollapsed ? <span>{item.label}</span> : null}
          </span>
          {!isCollapsed && item.badge ? (
            <span className="rounded-full border border-primary/12 bg-[rgba(89,184,171,0.1)] px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-primary/75">
              {item.badge}
            </span>
          ) : null}
        </button>
      );

      return renderTooltip(item.label, disabledItem);
    }

    const active = isActive(item.path);

    const linkItem = (
      <Link
        key={item.label}
        to={item.path}
        onClick={closeSidebar}
        className={cn(
          "group flex items-center rounded-[1rem] border text-[0.95rem] transition-all duration-300",
          isCollapsed ? "justify-center px-2 py-2.5" : "justify-between px-3 py-3",
          active
            ? "border-primary/18 bg-[linear-gradient(135deg,rgba(89,184,171,0.18),rgba(255,255,255,0.92))] text-foreground shadow-[0_18px_42px_-30px_rgba(31,109,104,0.35)]"
            : "border-transparent text-foreground/72 hover:border-white/90 hover:bg-white/76 hover:text-foreground",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-[0.95rem] transition-colors duration-300",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-[rgba(89,184,171,0.12)] text-primary group-hover:bg-[rgba(89,184,171,0.18)] group-hover:text-primary",
            )}
          >
            <Icon className="h-[1.05rem] w-[1.05rem]" />
          </span>
          {!isCollapsed ? <span>{item.label}</span> : null}
        </span>
        {!isCollapsed && item.badge ? (
          <span className="rounded-full border border-primary/12 bg-[rgba(89,184,171,0.1)] px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-primary/75">
            {item.badge}
          </span>
        ) : null}
      </Link>
    );

    return renderTooltip(item.label, linkItem);
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden py-6",
        isCollapsed ? "px-2.5" : "px-4",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(89,184,171,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(211,140,86,0.08),transparent_72%)] blur-3xl" />

      <div className="relative rounded-[1.2rem] border border-white/80 bg-white/72 p-3 shadow-[0_24px_56px_-36px_rgba(73,47,22,0.24)] backdrop-blur-xl">
        <div className={cn("flex items-center", isCollapsed ? "justify-center flex-col gap-2" : "gap-3")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[linear-gradient(135deg,rgba(89,184,171,0.94),rgba(31,109,104,0.9))] text-primary-foreground shadow-[0_18px_36px_-22px_rgba(31,109,104,0.5)]">
            <CalendarDays className="h-[1.05rem] w-[1.05rem]" />
          </div>
          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
              <p className="text-[0.72rem] uppercase tracking-[0.3em] text-muted-foreground">
                Studio planner
              </p>
              <h1 className="font-[var(--font-display)] text-2xl leading-none text-foreground">Horarius</h1>
            </div>
          ) : null}
          {toggleSidebarCollapse ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleSidebarCollapse}
              className={cn(
                "border border-white/90 bg-white text-foreground hover:bg-white hover:text-foreground",
                isCollapsed ? "h-9 w-9" : "ml-auto h-9 w-9 shrink-0",
              )}
              aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            >
              <Menu className="h-[1.05rem] w-[1.05rem]" />
            </Button>
          ) : null}
        </div>
        {!isCollapsed ? (
          <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-[1.1rem] border border-white/80 bg-white/76 px-3 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
              Workspace
            </p>
            <p className="mt-2 text-sm text-foreground">{userName}</p>
          </div>
          <div className="rounded-[1.1rem] border border-white/80 bg-white/76 px-3 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
              Hoje
            </p>
            <p className="mt-2 text-sm capitalize text-foreground">{workspaceDate}</p>
          </div>
          </div>
        ) : null}
      </div>

      <nav className="relative mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            {!isCollapsed ? (
              <p className="px-2 text-[0.72rem] uppercase tracking-[0.32em] text-muted-foreground">
                {group.title}
              </p>
            ) : null}
            <div className="space-y-2">{group.items.map(renderNavigationItem)}</div>
          </div>
        ))}
      </nav>

      <div className="relative mt-5 rounded-[1.2rem] border border-white/80 bg-white/72 p-3 shadow-[0_22px_56px_-38px_rgba(73,47,22,0.26)] backdrop-blur-xl">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-primary/12 bg-[rgba(89,184,171,0.12)] text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-primary">
            {userName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part.charAt(0))
              .join("") || "HR"}
          </div>
          {!isCollapsed ? (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-foreground">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
          ) : null}
        </div>
        {renderTooltip(
          "Sair",
          <button
            onClick={handleLogout}
            className={cn(
              "mt-4 flex rounded-[1rem] border border-white/90 bg-white text-sm text-foreground transition-colors hover:bg-white hover:text-foreground",
              isCollapsed ? "w-full items-center justify-center px-3 py-2.5" : "w-full items-center justify-center gap-2 px-4 py-3",
            )}
          >
            <LogOut className="h-[1.05rem] w-[1.05rem]" />
            {!isCollapsed ? <span>Sair</span> : null}
          </button>,
        )}
      </div>
    </div>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname === "/" ? "/agenda/timeline" : location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const workspaceDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
  }).format(new Date());
  const userName = user?.name ?? "Usuário Horarius";
  const userEmail = user?.email ?? "usuario@horarius.com";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="relative flex min-h-screen bg-transparent">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(89,184,171,0.14),transparent_65%)]" />

      <aside
        className={cn(
          "hidden border-r border-white/70 bg-[linear-gradient(180deg,rgba(248,245,239,0.96),rgba(244,239,232,0.92))] transition-[width] duration-300 lg:block",
          sidebarCollapsed ? "lg:w-[6rem]" : "lg:w-[19rem] xl:w-[20rem]",
        )}
      >
        <div className="h-screen">
          <SidebarContent
            isCollapsed={sidebarCollapsed}
            currentPath={currentPath}
            workspaceDate={workspaceDate}
            userName={userName}
            userEmail={userEmail}
            closeSidebar={closeSidebar}
            handleLogout={handleLogout}
            toggleSidebarCollapse={() => setSidebarCollapsed((value) => !value)}
          />
        </div>
      </aside>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[min(18rem,calc(100vw-2.5rem))] border-r border-white/80 bg-[linear-gradient(180deg,rgba(248,245,239,0.98),rgba(244,239,232,0.96))] shadow-[0_28px_80px_-44px_rgba(73,47,22,0.3)] lg:hidden">
            <SidebarContent
              isCollapsed={false}
              currentPath={currentPath}
              workspaceDate={workspaceDate}
              userName={userName}
              userEmail={userEmail}
              closeSidebar={closeSidebar}
              handleLogout={handleLogout}
            />
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="px-4 pt-4 lg:hidden">
          <div className="flex items-center justify-between rounded-[1.5rem] border border-white/70 bg-white/70 px-4 py-3 shadow-[0_24px_60px_-34px_rgba(73,47,22,0.35)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,rgba(89,184,171,0.96),rgba(31,109,104,0.92))] text-primary-foreground shadow-[0_18px_38px_-20px_rgba(31,109,104,0.9)]">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Studio planner</p>
                <h1 className="font-[var(--font-display)] text-2xl leading-none text-foreground">Horarius</h1>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="border-white/70 bg-white/72"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden pb-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


