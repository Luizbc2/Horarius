import { useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, CreditCard, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const SIGNUP_STORAGE_KEY = "horarius:last-signup";

type SignupFormData = {
  name: string;
  email: string;
  cpf: string;
  password: string;
  confirmPassword: string;
};

const initialFormData: SignupFormData = {
  name: "",
  email: "",
  cpf: "",
  password: "",
  confirmPassword: "",
};

export function CadastroUsuario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>(initialFormData);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasEmptyField = Object.values(formData).some((value) => !value.trim());

    if (hasEmptyField) {
      setSubmitError("Preencha todos os campos do cadastro para continuar.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const signupPayload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      cpf: formData.cpf.trim(),
      createdAt: new Date().toISOString(),
    };

    await new Promise((resolve) => {
      window.setTimeout(resolve, 350);
    });

    window.localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(signupPayload));

    navigate("/login", {
      replace: true,
      state: {
        notice: "Cadastro salvo localmente. Agora voce pode entrar no painel.",
        registeredEmail: signupPayload.email,
      },
    });
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden px-4 py-6 lg:px-6 lg:py-8">
      <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(89,184,171,0.24),transparent_68%)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(211,140,86,0.18),transparent_68%)] blur-2xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.05fr)_30rem]">
        <section className="surface-panel flex min-h-[24rem] flex-col justify-between overflow-hidden rounded-[2rem] p-6 lg:p-8">
          <div className="max-w-2xl animate-fade-up">
            <span className="eyebrow">Primeiro acesso</span>
            <h1 className="page-title mt-5 max-w-xl">Crie sua conta e deixe o painel pronto para rodar com voce.</h1>
            <p className="page-description mt-5 max-w-xl">
              O cadastro organiza os dados basicos de quem vai usar o sistema e prepara a entrada no painel logo em seguida.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-[0_20px_50px_-34px_rgba(73,47,22,0.35)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,rgba(89,184,171,0.96),rgba(31,109,104,0.92))] text-primary-foreground">
                <UserRound className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl text-foreground">Dados basicos</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Nome, e-mail, CPF e senha em um fluxo direto, sem excesso de etapas.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-[0_20px_50px_-34px_rgba(73,47,22,0.35)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,rgba(211,140,86,0.94),rgba(168,103,53,0.92))] text-white">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl text-foreground">Fluxo separado</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Cadastro e entrada ficam separados para deixar a experiencia mais clara desde o primeiro uso.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-[0_20px_50px_-34px_rgba(73,47,22,0.35)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,rgba(53,92,125,0.94),rgba(31,47,80,0.92))] text-white">
                <ArrowRight className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl text-foreground">Retorno ao login</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Assim que terminar, voce volta para o login com os dados frescos para entrar.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-panel flex flex-col justify-center rounded-[2rem] p-6 lg:p-7">
          <div className="animate-fade-up animate-fade-up-delay-1">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Cadastro
            </p>
            <h2 className="mt-3 text-3xl text-foreground">Criar conta</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Preencha seus dados para liberar o acesso ao painel do Horarius.
            </p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="mt-8 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="signup-name">Nome</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="signup-name"
                  type="text"
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Ex.: Luiz Otavio"
                  className="pl-11"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="signup-email">E-mail</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  placeholder="voce@empresa.com"
                  className="pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="signup-cpf">CPF</label>
              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="signup-cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={(event) => handleChange("cpf", event.target.value)}
                  placeholder="000.000.000-00"
                  className="pl-11"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="signup-password">Senha</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    value={formData.password}
                    onChange={(event) => handleChange("password", event.target.value)}
                    placeholder="Crie uma senha"
                    className="pl-11"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="signup-confirm-password">Confirmar senha</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(event) => handleChange("confirmPassword", event.target.value)}
                    placeholder="Repita a senha"
                    className="pl-11"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {submitError ? (
              <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                <AlertTitle>Cadastro incompleto</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="mt-2 grid gap-3">
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Salvando..." : "Criar conta"}
                {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>

              <Button asChild type="button" variant="ghost" className="w-full">
                <Link to="/login">Ja tenho conta</Link>
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
