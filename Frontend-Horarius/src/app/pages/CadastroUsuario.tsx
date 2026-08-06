import { useState, type FormEvent } from "react";
import { ArrowRight, CreditCard, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { BrandLockup } from "../components/BrandLockup";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuthShowcasePanel } from "../components/auth/AuthShowcasePanel";
import { PasswordRequirementList } from "../components/auth/PasswordRequirementList";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCpf } from "../lib/cpf";
import {
  FIELD_LIMITS,
  normalizeEmailInput,
  normalizePasswordInput,
  normalizeSingleLineTextInput,
} from "../lib/field-rules";
import {
  createSignupPayload,
  initialSignupFormData,
  mapSignupApiError,
  mapSignupSuccessMessage,
  type SignupFormData,
  type SignupFormErrors,
  validateSignupForm,
} from "../features/auth/signup-form";
import { signupWithApi } from "../services/auth";

export function CadastroUsuario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>(initialSignupFormData);
  const [formErrors, setFormErrors] = useState<SignupFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleChange = (field: keyof SignupFormData, value: string) => {
    const nextValue =
      field === "cpf"
        ? formatCpf(value)
        : field === "name"
          ? normalizeSingleLineTextInput(value, FIELD_LIMITS.userName)
          : field === "email"
            ? normalizeEmailInput(value)
            : normalizePasswordInput(value);

    setFormData((currentData) => ({
      ...currentData,
      [field]: nextValue,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
      submit: undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateSignupForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const response = await signupWithApi(createSignupPayload(formData));

      navigate("/login", {
        replace: true,
        state: {
          notice: mapSignupSuccessMessage(response.message),
          registeredEmail: response.user.email,
        },
      });
    } catch (error) {
      setFormErrors(mapSignupApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div className="mx-auto grid w-full max-w-[96rem] gap-3 lg:grid-cols-[minmax(0,1.4fr)_31rem]">
        <AuthShowcasePanel
          eyebrow="Novo workspace"
          title="Uma rotina mais clara começa com uma agenda bem desenhada."
          description="Crie seu acesso e monte a base da operação que vai acompanhar clientes, equipe e crescimento."
        />

        <section className="surface-panel relative flex flex-col justify-center px-6 py-8 lg:px-8">
          <ThemeToggle className="absolute right-5 top-5" />
          <div className="mb-8 border-b border-border pb-5 lg:hidden">
            <BrandLockup />
          </div>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase text-muted-foreground">
              Cadastro
            </p>
            <h2 className="mt-3 text-4xl font-medium text-foreground">Criar conta</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Preencha seus dados para liberar seu acesso ao painel.
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
                  aria-invalid={Boolean(formErrors.name)}
                  maxLength={FIELD_LIMITS.userName}
                />
              </div>
              {formErrors.name ? <p className="text-sm text-destructive">{formErrors.name}</p> : null}
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
                  aria-invalid={Boolean(formErrors.email)}
                  maxLength={FIELD_LIMITS.email}
                />
              </div>
              {formErrors.email ? <p className="text-sm text-destructive">{formErrors.email}</p> : null}
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
                  aria-invalid={Boolean(formErrors.cpf)}
                  maxLength={FIELD_LIMITS.cpfFormatted}
                />
              </div>
              {formErrors.cpf ? <p className="text-sm text-destructive">{formErrors.cpf}</p> : null}
            </div>

            <div className="grid gap-3">
              <div className="grid items-start gap-4 md:grid-cols-2">
                <div className="grid gap-2 self-start">
                  <label htmlFor="signup-password">Senha</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      value={formData.password}
                      onChange={(event) => handleChange("password", event.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      placeholder="Crie uma senha"
                      className="pl-11"
                      autoComplete="new-password"
                      aria-invalid={Boolean(formErrors.password)}
                      maxLength={FIELD_LIMITS.password}
                    />
                  </div>
                  {formErrors.password ? <p className="text-sm text-destructive">{formErrors.password}</p> : null}
                </div>

                <div className="grid gap-2 self-start">
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
                      aria-invalid={Boolean(formErrors.confirmPassword)}
                      maxLength={FIELD_LIMITS.password}
                    />
                  </div>
                  {formErrors.confirmPassword ? (
                    <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
                  ) : null}
                </div>
              </div>

              {isPasswordFocused || formData.password ? (
                <PasswordRequirementList password={formData.password} />
              ) : null}
            </div>

            {formErrors.submit ? (
              <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                <AlertTitle>Não deu para concluir seu cadastro</AlertTitle>
                <AlertDescription>{formErrors.submit}</AlertDescription>
              </Alert>
            ) : null}

            <div className="mt-2 grid gap-3">
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Salvando..." : "Criar conta"}
                {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>

              <Button asChild type="button" variant="ghost" className="w-full">
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
