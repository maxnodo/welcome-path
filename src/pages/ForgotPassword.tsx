import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-[520px] px-4">
        <div className="text-center mb-10">
          <Logo size="lg" />
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-8">
          <h2 className="text-xl font-semibold text-center mb-6 text-foreground">
            Recuperar contraseña
          </h2>

          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Si existe una cuenta con el correo <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
              </p>
              <Link to="/login">
                <Button variant="outline" className="mt-4">Volver al inicio de sesión</Button>
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-3 mb-4">
                  {error}
                </div>
              )}

              <p className="text-sm text-muted-foreground mb-4">
                Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
              </form>

              <div className="text-center mt-4">
                <Link to="/login" className="text-sm text-secondary hover:underline">
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
