import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import FormularioExpress from "@/components/FormularioExpress";

const Preinscripcion = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-[520px] px-4">
        <div className="text-center mb-10">
          <Logo size="lg" />
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-8">
          <h2 className="text-xl font-semibold text-center mb-6 text-foreground">
            Formulario Express
          </h2>
          <FormularioExpress onBack={() => navigate("/login")} />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 WCE Welcome — Immigration &amp; Foreign Affairs
        </p>
      </div>
    </div>
  );
};

export default Preinscripcion;
