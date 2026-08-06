import { useState, type ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  CalendarDays,
  Clock3,
  List,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Scissors,
  Sparkles,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { brand } from "../config/brand";
import { BrandLockup } from "./BrandLockup";
import { ThemeToggle } from "./ThemeToggle";
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

const navigationGroups: Array<{ title: string; items: NavigationItem[] }> = [
  {
    title: "Agenda",
    items: [
      { label: "Timeline", path: "/agenda/timeline", icon: Clock3 },
      { label: "Lista", path: "/agenda/lista", icon: List },
    ],
  },
  {
    title: "Operação",
    items: [
      { label: "Clientes", path: "/clientes", icon: Users },
      { label: "Profissionais", path: "/profissionais", icon: Scissors },
      { label: "Serviços", path: "/servicos", icon: Package },
      { label: "Insights", icon: Sparkles, badge: "em breve", disabled: true },
    ],
  },
  {
    title: "Conta",
    items: [{ label: "Perfil", path: "/perfil", icon: User }],
  },
];

const mobileNavigationItems: NavigationItem[] = [
  { label: "Agenda", path: "/agenda/timeline", icon: Clock3 },
  { label: "Clientes", path: "/clientes", icon: Users },
  { label: "Equipe", path: "/profissionais", icon: Scissors },
  { label: "Perfil", path: "/perfil", icon: User },
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
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(`${path}/`);

  const withTooltip = (label: string, content: ReactNode) => {
    if (!isCollapsed) return content;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const active = item.path ? isActive(item.path) : false;
    const className = cn(
      "group relative flex min-h-11 w-full items-center text-sm font-medium transition-colors",
      isCollapsed ? "justify-center rounded-md px-2" : "justify-between rounded-r-md py-2 pl-4 pr-3",
      active
        ? "bg-white/[0.075] text-white"
        : "text-white/58 hover:bg-white/[0.04] hover:text-white/90",
      item.disabled && "cursor-not-allowed opacity-45",
    );
    const content = (
      <>
        {active && !isCollapsed ? <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#d7f75b]" /> : null}
        <span className="flex min-w-0 items-center gap-3.5">
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center", active ? "text-[#d7f75b]" : "text-white/48 group-hover:text-white/72")}>
            <Icon className="h-[1.05rem] w-[1.05rem] stroke-[1.8]" />
          </span>
          {!isCollapsed ? <span className="truncate tracking-[0.01em]">{item.label}</span> : null}
        </span>
        {!isCollapsed && item.badge ? (
          <span className="text-[0.58rem] font-bold uppercase tracking-[0.08em] text-white/32">
            {item.badge}
          </span>
        ) : null}
      </>
    );

    if (!item.path || item.disabled) {
      return withTooltip(item.label, <button key={item.label} type="button" disabled className={className}>{content}</button>);
    }

    return withTooltip(item.label, <Link key={item.label} to={item.path} onClick={closeSidebar} className={className}>{content}</Link>);
  };

  const initials = userName.split(" ").filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join("") || "SC";

  return (
    <div className={cn("flex h-full flex-col bg-[#1d1e22] text-white", isCollapsed ? "px-2.5 py-4" : "px-5 py-6")}>
      <div className={cn("flex min-h-10 items-start", isCollapsed ? "flex-col items-center gap-3" : "justify-between")}>
        <BrandLockup compact={isCollapsed} inverse />
        {toggleSidebarCollapse ? (
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/38 transition-colors hover:bg-white/[0.06] hover:text-white/85"
            aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-[1.05rem] w-[1.05rem]" /> : <PanelLeftClose className="h-[1.05rem] w-[1.05rem]" />}
          </button>
        ) : null}
      </div>

      {!isCollapsed ? (
        <div className="mt-7 flex items-center gap-3 border-b border-white/[0.07] pb-5">
          <CalendarDays className="h-4 w-4 shrink-0 text-[#d7f75b]" />
          <div className="min-w-0">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-white/32">Hoje</p>
            <p className="mt-0.5 truncate text-[0.78rem] capitalize text-white/68">{workspaceDate}</p>
          </div>
        </div>
      ) : null}

      <nav className={cn("flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", isCollapsed ? "mt-6 space-y-5" : "mt-7 space-y-7")}>
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            {!isCollapsed ? (
              <p className="px-4 text-[0.58rem] font-bold uppercase tracking-[0.13em] text-white/28">{group.title}</p>
            ) : null}
            <div className="space-y-0.5">{group.items.map(renderNavigationItem)}</div>
          </div>
        ))}
      </nav>

      <div className="mt-5 border-t border-white/[0.08] pt-5">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-[0.66rem] font-bold text-[#d7f75b]">{initials}</div>
          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.78rem] font-semibold text-white/82">{userName}</p>
              <p className="mt-0.5 truncate text-[0.68rem] text-white/36">{userEmail}</p>
            </div>
          ) : null}
        </div>
        <div className={cn("mt-4 flex items-center", isCollapsed ? "flex-col gap-2" : "gap-1")}>
          <ThemeToggle inverse showLabel={!isCollapsed} className={cn(!isCollapsed && "flex-1 border-transparent bg-transparent px-2.5 text-white/55 hover:bg-white/[0.05] hover:text-white")} />
          {withTooltip("Sair", (
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium text-white/42 transition-colors hover:bg-white/[0.05] hover:text-white/80"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname === "/" ? "/agenda/timeline" : location.pathname;
  const isQuickAppointmentOpen =
    currentPath.startsWith("/agenda/timeline") && new URLSearchParams(location.search).get("novo") === "1";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const workspaceDate = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date());
  const userName = user?.name ?? "Equipe Schedra";
  const userEmail = user?.email ?? brand.supportEmail;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isMobileNavigationActive = (item: NavigationItem) => {
    if (item.label === "Agenda") {
      return currentPath.startsWith("/agenda/");
    }

    return Boolean(item.path && (currentPath === item.path || currentPath.startsWith(`${item.path}/`)));
  };

  const openQuickAppointment = () => {
    navigate("/agenda/timeline?novo=1");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-black/10 transition-[width] duration-200 lg:block", sidebarCollapsed ? "w-[4.5rem]" : "w-[18.5rem]")}>
        <SidebarContent
          isCollapsed={sidebarCollapsed}
          currentPath={currentPath}
          workspaceDate={workspaceDate}
          userName={userName}
          userEmail={userEmail}
          closeSidebar={() => setSidebarOpen(false)}
          handleLogout={handleLogout}
          toggleSidebarCollapse={() => setSidebarCollapsed((value) => !value)}
        />
      </aside>

      {sidebarOpen ? (
        <>
          <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-[min(18.5rem,calc(100vw-2rem))] shadow-2xl lg:hidden">
            <SidebarContent
              isCollapsed={false}
              currentPath={currentPath}
              workspaceDate={workspaceDate}
              userName={userName}
              userEmail={userEmail}
              closeSidebar={() => setSidebarOpen(false)}
              handleLogout={handleLogout}
            />
          </aside>
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:hidden">
          <BrandLockup />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={() => setSidebarOpen((value) => !value)} aria-label="Abrir menu">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-0"><Outlet /></main>
      </div>

      {!sidebarOpen && !isQuickAppointmentOpen ? (
        <button
          type="button"
          onClick={openQuickAppointment}
          className="fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_32px_rgba(167,44,83,0.38)] transition-[transform,box-shadow] active:scale-95 lg:hidden"
          aria-label="Novo agendamento rápido"
          title="Novo agendamento"
        >
          <Plus className="h-6 w-6 stroke-[2.4]" />
        </button>
      ) : null}

      <nav
        aria-label="Navegação principal mobile"
        className="fixed inset-x-0 bottom-0 z-40 box-border flex min-h-[4.75rem] items-center gap-2 border-t border-border bg-card px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_28px_rgba(0,0,0,0.08)] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[100dvh] after:bg-card after:content-[''] lg:hidden"
      >
        {mobileNavigationItems.map((item) => {
          const Icon = item.icon;
          const active = isMobileNavigationActive(item);

          return (
            <Link
              key={item.label}
              to={item.path ?? "/"}
              aria-label={item.label}
              className={cn(
                "flex h-11 min-w-0 items-center justify-center rounded-lg border text-sm font-semibold shadow-sm transition-[flex,color,background-color,border-color,transform] duration-200 active:scale-95",
                active
                  ? "flex-[1.65] gap-2.5 border-primary/25 bg-primary/15 px-4 text-primary"
                  : "flex-1 border-border/80 bg-muted/55 text-muted-foreground hover:border-primary/25 hover:bg-muted hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active ? "stroke-[2.2]" : "stroke-[1.8]")} />
              {active ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
