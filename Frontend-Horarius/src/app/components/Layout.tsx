import { useState, type ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  CalendarDays,
  ChevronLeft,
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
import { brand } from "../config/brand";
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

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center", compact ? "justify-center" : "gap-3")}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#42b8ad] text-[#071b19] shadow-[0_10px_28px_-16px_rgba(66,184,173,0.9)]">
        <CalendarDays className="h-5 w-5" strokeWidth={2.2} />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="text-[0.66rem] font-bold uppercase text-white/45">
            {brand.descriptor}
          </p>
          <h1 className="mt-0.5 text-xl font-extrabold text-white">{brand.name}</h1>
        </div>
      ) : null}
    </div>
  );
}

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
      "group flex min-h-11 w-full items-center rounded-md border text-sm font-medium transition-colors",
      isCollapsed ? "justify-center px-2" : "justify-between px-3",
      active
        ? "border-white/10 bg-white/10 text-white"
        : "border-transparent text-white/62 hover:bg-white/[0.06] hover:text-white",
      item.disabled && "cursor-not-allowed opacity-45",
    );
    const content = (
      <>
        <span className="flex min-w-0 items-center gap-3">
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", active ? "bg-[#42b8ad] text-[#071b19]" : "bg-white/[0.06] text-white/65")}>
            <Icon className="h-4 w-4" />
          </span>
          {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
        </span>
        {!isCollapsed && item.badge ? (
          <span className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-white/50">
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
    <div className={cn("flex h-full flex-col bg-[#11191c] py-5 text-white", isCollapsed ? "px-2.5" : "px-4")}>
      <div className={cn("flex min-h-12 items-center", isCollapsed ? "flex-col gap-3" : "justify-between")}>
        <BrandMark compact={isCollapsed} />
        {toggleSidebarCollapse ? (
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className="flex h-9 w-9 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white"
            aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      {!isCollapsed ? (
        <div className="mt-5 border-y border-white/[0.07] py-3">
          <p className="text-[0.65rem] font-bold uppercase text-white/38">Hoje</p>
          <p className="mt-1 text-sm capitalize text-white/75">{workspaceDate}</p>
        </div>
      ) : null}

      <nav className="mt-5 flex-1 space-y-5 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            {!isCollapsed ? (
              <p className="px-3 text-[0.65rem] font-bold uppercase text-white/32">{group.title}</p>
            ) : null}
            <div className="space-y-1">{group.items.map(renderNavigationItem)}</div>
          </div>
        ))}
      </nav>

      <div className="mt-4 border-t border-white/[0.08] pt-4">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3 px-2")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/[0.08] text-xs font-bold text-[#6ed2c8]">{initials}</div>
          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white/90">{userName}</p>
              <p className="truncate text-xs text-white/40">{userEmail}</p>
            </div>
          ) : null}
        </div>
        {withTooltip("Sair", (
          <button onClick={handleLogout} className={cn("mt-3 flex min-h-10 w-full items-center rounded-md text-sm font-medium text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white", isCollapsed ? "justify-center" : "justify-center gap-2")}>
            <LogOut className="h-4 w-4" />
            {!isCollapsed ? <span>Sair</span> : null}
          </button>
        ))}
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
  const workspaceDate = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date());
  const userName = user?.name ?? "Equipe Schedra";
  const userEmail = user?.email ?? brand.supportEmail;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-black/10 transition-[width] duration-200 lg:block", sidebarCollapsed ? "w-[4.75rem]" : "w-[17rem]")}>
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
          <aside className="fixed inset-y-0 left-0 z-50 w-[min(17rem,calc(100vw-2rem))] shadow-2xl lg:hidden">
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 lg:hidden">
          <BrandMark />
          <Button variant="outline" size="icon" onClick={() => setSidebarOpen((value) => !value)} aria-label="Abrir menu">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden"><Outlet /></main>
      </div>
    </div>
  );
}
