import { useEffect, useState, type FormEvent } from "react";
import { Save } from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { ProfileIdentitySection } from "../components/profile/ProfileIdentitySection";
import { ProfileMetrics } from "../components/profile/ProfileMetrics";
import { ProfileSecuritySection } from "../components/profile/ProfileSecuritySection";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { PageShell } from "../components/PageShell";
import { Button } from "../components/ui/button";
import {
  createEmptyProfileFormData,
  createProfileFormData,
  formatProfileField,
  type ProfileFormData,
  type ProfileFormErrors,
  validateProfileForm,
} from "../features/profile/profile-form";

export function Perfil() {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>(createEmptyProfileFormData);
  const [formErrors, setFormErrors] = useState<ProfileFormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData((currentData) => ({
      ...createProfileFormData(user),
      password: currentData.password,
      confirmPassword: currentData.confirmPassword,
    }));
  }, [user]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: formatProfileField(field, value),
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
      submit: undefined,
    }));
    setSuccessMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateProfileForm(formData);
    const isPasswordUpdate = Boolean(formData.password || formData.confirmPassword);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    setSuccessMessage("");

    try {
      await updateUserProfile({
        name: formData.name.trim(),
        cpf: formData.cpf,
        password: formData.password,
      });

      setFormData((currentData) => ({
        ...currentData,
        password: "",
        confirmPassword: "",
      }));
      setSuccessMessage(
        isPasswordUpdate
          ? "Seus dados e sua nova senha foram salvos com sucesso."
          : "Seus dados foram atualizados com sucesso.",
      );
    } catch (error) {
      setFormErrors({
        submit: error instanceof Error ? error.message : "Não foi possível salvar agora.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStatus = formData.password ? "Preenchida" : "Em branco";

  return (
    <PageShell
      eyebrow="Conta"
      title="Minha conta"
      description="Revise seus dados, ajuste a senha quando quiser e salve tudo em um único fluxo."
    >
      <ProfileMetrics passwordStatus={passwordStatus} />

      <form id="profile-form" noValidate onSubmit={handleSubmit} className="grid gap-6">
        {successMessage ? (
          <Alert className="border-primary/15 bg-primary/5">
            <AlertTitle>Tudo certo</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        {formErrors.submit ? (
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
            <AlertTitle>Não foi possível concluir a atualização</AlertTitle>
            <AlertDescription>{formErrors.submit}</AlertDescription>
          </Alert>
        ) : null}

        <ProfileIdentitySection
          name={formData.name}
          email={formData.email}
          cpf={formData.cpf}
          nameError={formErrors.name}
          cpfError={formErrors.cpf}
          onChange={(field, value) => handleChange(field, value)}
        />

        <ProfileSecuritySection
          password={formData.password}
          confirmPassword={formData.confirmPassword}
          passwordError={formErrors.password}
          confirmPasswordError={formErrors.confirmPassword}
          onChange={(field, value) => handleChange(field, value)}
        />

        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/60 bg-card/70 p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Use o botão ao lado para salvar suas novas informações.
          </p>
          <Button type="submit" form="profile-form" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            {isSubmitting ? "Salvando tudo..." : "Salvar tudo"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
