import { useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { useAuth } from "../auth/AuthContext";
import { AuthShowcasePanel } from "../components/auth/AuthShowcasePanel";
import { brand } from "../config/brand";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  FIELD_LIMITS,
  normalizeEmailInput,
  normalizePasswordInput,
  validateEmailField,
} from "../lib/field-rules";

type FormErrors = {
  email?: string;
  password?: string;
  submit?: string;
};

const loginFeatures = [
  {
    icon: CalendarDays,
    title: "Agenda em tempo real",
    description: "Horários, confirmações e disponibilidade em uma visão operacional.",
    iconClassName: "bg-[#42b8ad] text-[#071b19]",
  },
  {
    icon: ShieldCheck,
    title: "Operação protegida",
    description: "Sessão autenticada e dados isolados para sua equipe trabalhar com segurança.",
    iconClassName: "bg-[#e76f51] text-white",
  },
  {
    icon: LockKeyhole,
    title: "Gestão sem ruído",
    description: "Clientes, equipe e serviços conectados ao mesmo fluxo de atendimento.",
    iconClassName: "bg-[#2563eb] text-white",
  },
];

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState(() => {
    if (
      typeof location.state === "object" &&
      location.state !== null &&
      "registeredEmail" in location.state &&
      typeof location.state.registeredEmail === "string"
    ) {
      return location.state.registeredEmail;
    }

    return "";
  });
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof location.state.from === "string"
      ? location.state.from
      : "/agenda/timeline";
  const successNotice =
    typeof location.state === "object" &&
    location.state !== null &&
    "notice" in location.state &&
    typeof location.state.notice === "string"
      ? location.state.notice
      : "";

  if (isAuthenticated) {
    return <Navigate to="/agenda/timeline" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      nextErrors.email = "Informe seu e-mail.";
    } else {
      const emailError = validateEmailField(normalizedEmail);

      if (emailError) {
        nextErrors.email = emailError;
      }
    }

    if (!password.trim()) {
      nextErrors.password = "Informe sua senha.";
    } else if (password.length > FIELD_LIMITS.password) {
      nextErrors.password = `A senha deve ter no máximo ${FIELD_LIMITS.password} caracteres.`;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(normalizedEmail, password);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Não foi possível entrar agora.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background px-4 py-4 lg:px-6 lg:py-6">
      <div className="mx-auto grid w-full max-w-[90rem] gap-4 lg:grid-cols-[minmax(0,1.2fr)_28rem]">
        <AuthShowcasePanel
          eyebrow="Controle da operação"
          title="Seu dia inteiro, organizado antes do primeiro atendimento."
          description="Uma central de trabalho feita para equipes que precisam agir rápido, reduzir conflitos de agenda e cuidar melhor de cada cliente."
          features={loginFeatures}
        />

        <section className="surface-panel flex flex-col justify-center p-6 lg:p-8">
          <div className="mb-8 flex items-center gap-3 border-b border-border pb-5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold text-foreground">{brand.name}</p>
              <p className="text-xs text-muted-foreground">{brand.descriptor}</p>
            </div>
          </div>
          <div className="animate-fade-up animate-fade-up-delay-1">
            <p className="text-[0.72rem] font-semibold uppercase text-muted-foreground">
              Acesso seguro
            </p>
            <h2 className="mt-3 text-3xl text-foreground">Entrar no {brand.name}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Use suas credenciais para acessar o workspace da sua equipe.
            </p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="mt-8 grid gap-4">
            {successNotice ? (
              <Alert className="border-primary/15 bg-primary/5">
                <AlertTitle>Conta criada</AlertTitle>
                <AlertDescription>{successNotice}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-2">
              <label htmlFor="login-email">E-mail</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(normalizeEmailInput(event.target.value))}
                  placeholder="voce@empresa.com"
                  className="pl-11"
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                  maxLength={FIELD_LIMITS.email}
                />
              </div>
              {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
            </div>

            <div className="grid gap-2">
              <label htmlFor="login-password">Senha</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(normalizePasswordInput(event.target.value))}
                  placeholder="Digite sua senha"
                  className="pl-11"
                  aria-invalid={Boolean(errors.password)}
                  autoComplete="current-password"
                  maxLength={FIELD_LIMITS.password}
                />
              </div>
              {errors.password ? <p className="text-sm text-destructive">{errors.password}</p> : null}
            </div>

            {errors.submit ? (
              <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                <AlertTitle>Falha no login</AlertTitle>
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 w-full">
              {isSubmitting ? "Entrando..." : "Entrar"}
              {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>

            <Button asChild type="button" variant="ghost" className="w-full">
              <Link to="/cadastro">Ainda não tem acesso? Criar conta</Link>
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
