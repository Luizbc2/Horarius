import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { Mail, MessageCircle, Phone, Plus, Search } from "lucide-react";
import { Toaster, toast } from "sonner";

import { ClientListItem } from "../components/clients/ClientListItem";
import { CrudPagination } from "../components/CrudPagination";
import { EmptyStatePanel, MetricCard, PageShell, SectionCard } from "../components/PageShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { deleteClient, loadClients, type Client } from "../data/clients";
import { paginateItems } from "../data/pagination";

const ITEMS_PER_PAGE = 6;

type LocationState = {
  notice?: string;
};

export function Clientes() {
  const location = useLocation();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setClients(loadClients());
  }, []);

  useEffect(() => {
    if (typeof location.state === "object" && location.state !== null && "notice" in location.state) {
      const state = location.state as LocationState;

      if (state.notice) {
        toast.success(state.notice);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      if (!normalizedSearch) {
        return true;
      }

      return [client.name, client.email, client.phone, client.notes]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [clients, searchTerm]);

  const { safePage, totalPages, paginatedItems } = paginateItems(
    filteredClients,
    currentPage,
    ITEMS_PER_PAGE,
  );

  const unreadCount = clients.filter((client) => client.unread).length;

  const handleDelete = (clientId: number) => {
    deleteClient(clientId);
    setClients(loadClients());
    toast.success("Cliente removido com sucesso.");
  };

  return (
    <>
      <PageShell
        eyebrow="Gestão"
        title="Clientes"
        description="Lista paginada dos clientes cadastrados. Para criar ou editar, use as telas separadas do formulário."
        actions={
          <Button asChild>
            <Link to="/clientes/novo">
              <Plus className="h-4 w-4" />
              Novo cliente
            </Link>
          </Button>
        }
      >
        <div className="metric-grid">
          <MetricCard
            label="Total"
            value={String(clients.length)}
            helper="Clientes cadastrados no armazenamento local."
            icon={<MessageCircle className="h-5 w-5" />}
          />
          <MetricCard
            label="Com e-mail"
            value={String(clients.filter((client) => client.email).length)}
            helper="Registros com contato por e-mail preenchido."
            icon={<Mail className="h-5 w-5" />}
            accent="sand"
          />
          <MetricCard
            label="Não lidas"
            value={String(unreadCount)}
            helper="Marcadores locais de retorno pendente."
            icon={<Phone className="h-5 w-5" />}
            accent="coral"
          />
        </div>

        <SectionCard
          title="Listagem"
          description="Use a busca para localizar um cliente e abra o formulário próprio para criar ou editar."
          action={
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome, e-mail ou telefone"
                className="pl-11"
              />
            </div>
          }
        >
          {filteredClients.length === 0 ? (
            <EmptyStatePanel
              icon={<MessageCircle className="h-7 w-7" />}
              title={clients.length === 0 ? "Nenhum cliente cadastrado" : "Nenhum cliente encontrado"}
              description={
                clients.length === 0
                  ? "Cadastre o primeiro cliente para começar o CRUD dessa área."
                  : "Nenhum registro bate com a busca atual."
              }
              action={
                <Button asChild>
                  <Link to="/clientes/novo">
                    <Plus className="h-4 w-4" />
                    Novo cliente
                  </Link>
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid gap-3">
                {paginatedItems.map((client) => (
                  <ClientListItem key={client.id} client={client} onDelete={handleDelete} />
                ))}
              </div>

              <CrudPagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={filteredClients.length}
                visibleItems={paginatedItems.length}
                onPrevious={() => setCurrentPage(Math.max(1, safePage - 1))}
                onNext={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
              />
            </>
          )}
        </SectionCard>
      </PageShell>

      <Toaster position="bottom-left" closeButton richColors />
    </>
  );
}
