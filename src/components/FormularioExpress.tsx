import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";

const necesidadOptions = [
  "Regularizar mi situación",
  "Renovar papeles",
  "Traer a un familiar",
  "Permiso de trabajo",
  "Nacionalidad española",
  "No lo tengo claro",
];

const ubicacionOptions = [
  "En España",
  "En España, docs caducados",
  "Fuera de España",
];

const cuandoOptions = ["Ya", "En unos meses", "Solo información"];

interface ChipSelectorProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
}

const ChipSelector = ({ options, selected, onToggle }: ChipSelectorProps) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => {
      const isSelected = selected.includes(opt);
      return (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            isSelected
              ? "bg-[hsl(217_57%_95%)] border-secondary text-secondary font-medium"
              : "border-border text-muted-foreground hover:border-secondary/50"
          }`}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

interface FormularioExpressProps {
  onBack?: () => void;
}

const FormularioExpress = ({ onBack }: FormularioExpressProps) => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [paisOrigen, setPaisOrigen] = useState("");
  const [necesidad, setNecesidad] = useState<string[]>([]);
  const [ubicacion, setUbicacion] = useState<string[]>([]);
  const [cuando, setCuando] = useState<string[]>([]);
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleMulti = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const toggleSingle = (value: string) => [value];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) {
      setError("Nombre y teléfono son obligatorios.");
      return;
    }
    setError("");
    setLoading(true);

    const { error: dbError } = await supabase.from("leads").insert({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      pais_origen: paisOrigen.trim() || null,
      necesidad: necesidad.join(", ") || null,
      ubicacion: ubicacion[0] || null,
      cuando: cuando[0] || null,
      descripcion: descripcion.trim() || null,
    });

    setLoading(false);
    if (dbError) {
      setError("Error al enviar. Inténtalo de nuevo.");
      console.error("Lead insert error:", dbError);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-6 py-8">
        <CheckCircle2 className="w-16 h-16 text-secondary mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            ¡Solicitud recibida!
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Tus datos se han registrado correctamente. Nos pondremos en contacto
            contigo pronto.
          </p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Volver
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-3">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="lead-nombre">Nombre *</Label>
        <Input
          id="lead-nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre completo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead-telefono">Teléfono *</Label>
        <Input
          id="lead-telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+34 600 000 000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead-pais">País de origen</Label>
        <Input
          id="lead-pais"
          value={paisOrigen}
          onChange={(e) => setPaisOrigen(e.target.value)}
          placeholder="Ej: Colombia, Marruecos..."
        />
      </div>

      <div className="space-y-2">
        <Label>¿Qué necesitas? (puedes elegir varias)</Label>
        <ChipSelector
          options={necesidadOptions}
          selected={necesidad}
          onToggle={(v) => setNecesidad(toggleMulti(necesidad, v))}
          multi
        />
      </div>

      <div className="space-y-2">
        <Label>¿Dónde te encuentras?</Label>
        <ChipSelector
          options={ubicacionOptions}
          selected={ubicacion}
          onToggle={(v) => setUbicacion(toggleSingle(v))}
        />
      </div>

      <div className="space-y-2">
        <Label>¿Cuándo necesitas ayuda?</Label>
        <ChipSelector
          options={cuandoOptions}
          selected={cuando}
          onToggle={(v) => setCuando(toggleSingle(v))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead-desc">Cuéntanos más (opcional)</Label>
        <Textarea
          id="lead-desc"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe brevemente tu situación..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar solicitud"}
      </Button>
    </form>
  );
};

export default FormularioExpress;
