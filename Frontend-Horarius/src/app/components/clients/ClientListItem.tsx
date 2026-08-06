import { Mail, PencilLine, Phone, Trash2 } from "lucide-react";
import { Link } from "react-router";

import { formatPhone } from "../../data/clients";
import { Button } from "../ui/button";

type ClientListView = {
  id: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  createdAt?: string;
};

type ClientListItemProps = {
  client: ClientListView;
  onDelete: (clientId: number) => void;
};

export function ClientListItem({ client, onDelete }: ClientListItemProps) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-white p-4 shadow-sm transition-[border-color,box-shadow] hover:border-primary/20 hover:shadow-md md:flex-row md:items-start">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        {client.name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">{client.name}</h3>
          {client.createdAt ? (
            <span className="text-xs uppercase text-muted-foreground">
              Cliente desde{" "}
              {new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).format(new Date(client.createdAt))}
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {client.notes.trim() || "Sem observações por enquanto."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="data-pill text-xs">
            <Mail className="h-3.5 w-3.5" />
            {client.email || "E-mail não informado"}
          </span>
          <span className="data-pill text-xs">
            <Phone className="h-3.5 w-3.5" />
            {formatPhone(client.phone)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:w-auto md:flex-col">
        <Button asChild variant="outline" size="sm">
          <Link to={`/clientes/${client.id}/editar`} state={{ client }}>
            <PencilLine className="h-4 w-4" />
            Abrir ficha
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(client.id)}
        >
          <Trash2 className="h-4 w-4" />
          Remover
        </Button>
      </div>
    </article>
  );
}
