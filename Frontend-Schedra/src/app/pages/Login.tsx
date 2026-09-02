import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { useAuth } from "../auth/AuthContext";
import { BrandLockup } from "../components/BrandLockup";
import { ThemeToggle } from "../components/ThemeToggle";
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
    <div className="auth-shell flex min-h-screen overflow-x-hidden bg-background px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 xl:h-dvh xl:min-h-0 xl:overflow-y-auto">
      <div className="auth-layout mx-auto grid min-w-0 w-full max-w-[118rem] gap-4 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,2.05fr)_minmax(30rem,0.88fr)]">
        <AuthShowcasePanel
          eyebrow="Visão do dia"
          title="A agenda fala. O Schedra deixa tudo claro."
          description="Acompanhe o ritmo da equipe, enxergue os espaços livres e mantenha cada atendimento no lugar certo."
        />

        <section className="auth-form-panel surface-panel relative flex min-h-[calc(100vh-1.5rem)] flex-col justify-center px-6 py-8 sm:min-h-[calc(100vh-2rem)] sm:py-10 lg:px-10 xl:h-full xl:min-h-0 xl:px-12">
          <ThemeToggle className="absolute right-6 top-6 h-12 w-12 border-primary/25 bg-primary/5 xl:right-7 xl:top-7" />
          <div className="mb-10 border-b border-border pb-5 xl:hidden">
            <BrandLockup />
          </div>
          <div className="auth-form-content mx-auto w-full max-w-[31rem]">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Área da equipe</p>
            <h2 className="auth-form-title mt-4 text-[2.7rem] font-medium leading-[1.02] text-foreground sm:mt-5 sm:text-5xl">Entrar no {brand.name}</h2>
            <p className="auth-form-description mt-3 text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7">
              Entre para continuar de onde sua operação parou.
            </p>
          <form noValidate onSubmit={handleSubmit} className="auth-login-form mt-8 grid gap-4 sm:mt-10 sm:gap-5">
            {successNotice ? (
              <Alert className="border-primary/15 bg-primary/5">
                <AlertTitle>Conta criada</AlertTitle>
                <AlertDescription>{successNotice}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-2.5">
              <label htmlFor="login-email">E-mail</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(normalizeEmailInput(event.target.value))}
                  placeholder="voce@empresa.com"
                  className="h-12 pl-11 sm:h-14"
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                  maxLength={FIELD_LIMITS.email}
                />
              </div>
              {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
            </div>

            <div className="grid gap-2.5">
              <label htmlFor="login-password">Senha</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(normalizePasswordInput(event.target.value))}
                  placeholder="Digite sua senha"
                  className="h-12 pl-11 sm:h-14"
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

            <Button type="submit" size="lg" disabled={isSubmitting} className="auth-submit-button mt-2 h-12 w-full sm:mt-3 sm:h-14 sm:text-base">
              {isSubmitting ? "Entrando..." : "Entrar"}
              {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>

            <Button asChild type="button" variant="ghost" className="w-full">
              <Link to="/cadastro">Ainda não tem acesso? Criar conta</Link>
            </Button>
          </form>
          </div>
        </section>
      </div>
    </div>
  );
}
