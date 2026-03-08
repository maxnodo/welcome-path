import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const countries = [
  "Alemania", "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica",
  "Cuba", "Ecuador", "El Salvador", "España", "Estados Unidos", "Francia",
  "Guatemala", "Honduras", "Italia", "México", "Nicaragua", "Panamá", "Paraguay",
  "Perú", "Portugal", "Reino Unido", "República Dominicana", "Uruguay", "Venezuela",
];

const provinces = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz",
  "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real",
  "Córdoba", "Cuenca", "Gerona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva",
  "Huesca", "Islas Baleares", "Jaén", "La Coruña", "La Rioja", "Las Palmas", "León",
  "Lérida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Orense", "Palencia",
  "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria",
  "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza",
];

const phoneCodes = ["+34", "+52", "+1", "+54", "+55", "+56", "+57", "+51", "+593", "+58"];

interface FileUploadFieldProps {
  label: string;
  required?: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const FileUploadField = ({ label, required, file, onFileChange }: FileUploadFieldProps) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <Label>
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => ref.current?.click()}
          className="gap-2"
        >
          <Upload size={14} />
          Subir archivo +
        </Button>
        <span className="text-sm text-muted-foreground">
          {file ? file.name : "Ningún archivo seleccionado"}
        </span>
        <input
          ref={ref}
          type="file"
          accept=".pdf,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
};

const Perfil = () => {
  const { toast } = useToast();

  // Tab 1 state
  const [nombre, setNombre] = useState("Carlos García");
  const [tipoDoc, setTipoDoc] = useState("Pasaporte");
  const [numDoc, setNumDoc] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [nacionalidad, setNacionalidad] = useState("México");
  const [segundaNac, setSegundaNac] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("Soltero");
  const [phoneCode, setPhoneCode] = useState("+52");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("carlos.garcia@email.com");
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [pais, setPais] = useState("México");

  // Tab 2 state
  const [actuacion, setActuacion] = useState("propio");
  const [repNombre, setRepNombre] = useState("");
  const [repNumDoc, setRepNumDoc] = useState("");
  const [repRelacion, setRepRelacion] = useState("");
  const [repPhoneCode, setRepPhoneCode] = useState("+34");
  const [repTelefono, setRepTelefono] = useState("");
  const [repArchivo, setRepArchivo] = useState<File | null>(null);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  // Tab 3 state
  const [docIdentidad, setDocIdentidad] = useState<File | null>(null);
  const [docAdicional, setDocAdicional] = useState<File | null>(null);
  const [docPruebas, setDocPruebas] = useState<File | null>(null);

  const handleSave = () => {
    toast({
      title: "Perfil guardado correctamente",
      description: "Los cambios han sido guardados.",
    });
  };

  const RequiredMark = () => <span className="text-destructive ml-1">*</span>;

  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="datos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="datos">Datos personales</TabsTrigger>
          <TabsTrigger value="actuacion">Actuación y declaración</TabsTrigger>
          <TabsTrigger value="documentacion">Documentación adjunta</TabsTrigger>
        </TabsList>

        {/* TAB 1 */}
        <TabsContent value="datos" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Nombre completo<RequiredMark /></Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre completo" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de documento<RequiredMark /></Label>
                <Select value={tipoDoc} onValueChange={setTipoDoc}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Pasaporte", "DNI", "NIE", "Otro"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número de documento</Label>
                <Input value={numDoc} onChange={(e) => setNumDoc(e.target.value)} placeholder="Ej: AB1234567" />
              </div>
              <div className="space-y-2">
                <Label>Fecha de nacimiento</Label>
                <Input type="date" value={fechaNac} onChange={(e) => setFechaNac(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nacionalidad actual<RequiredMark /></Label>
                <Select value={nacionalidad} onValueChange={setNacionalidad}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Segunda nacionalidad</Label>
                <Select value={segundaNac} onValueChange={setSegundaNac}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado civil<RequiredMark /></Label>
                <Select value={estadoCivil} onValueChange={setEstadoCivil}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Soltero", "Casado", "Divorciado", "Viudo"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teléfono de contacto<RequiredMark /></Label>
                <div className="flex gap-2">
                  <Select value={phoneCode} onValueChange={setPhoneCode}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {phoneCodes.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input className="flex-1" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Número de teléfono" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Correo electrónico<RequiredMark /></Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
              </div>
            </div>

            {/* Address */}
            <div className="pt-4 border-t">
              <h3 className="font-medium text-foreground mb-4">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <Label>Calle</Label>
                  <Input value={calle} onChange={(e) => setCalle(e.target.value)} placeholder="Nombre de la calle" />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Nº" className="w-32" />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ciudad" />
                </div>
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Select value={provincia} onValueChange={setProvincia}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar provincia" /></SelectTrigger>
                    <SelectContent>
                      {provinces.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Código postal</Label>
                  <Input value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} placeholder="Ej: 28001" className="w-40" />
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Select value={pais} onValueChange={setPais}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2 */}
        <TabsContent value="actuacion" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <RadioGroup value={actuacion} onValueChange={setActuacion} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: "propio", label: "Actúo en nombre propio" },
                { value: "tercero", label: "Actúo en nombre de un tercero" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                    actuacion === opt.value ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/40"
                  }`}
                >
                  <RadioGroupItem value={opt.value} />
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </label>
              ))}
            </RadioGroup>

            {actuacion === "tercero" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Nombre completo del representado<RequiredMark /></Label>
                  <Input value={repNombre} onChange={(e) => setRepNombre(e.target.value)} placeholder="Nombre del representado" />
                </div>
                <div className="space-y-2">
                  <Label>Número de documento del representado</Label>
                  <Input value={repNumDoc} onChange={(e) => setRepNumDoc(e.target.value)} placeholder="Número de documento" />
                </div>
                <div className="space-y-2">
                  <Label>Relación con el representado<RequiredMark /></Label>
                  <Select value={repRelacion} onValueChange={setRepRelacion}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar relación" /></SelectTrigger>
                    <SelectContent>
                      {["Familiar", "Abogado", "Representante legal", "Otro"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Teléfono de contacto</Label>
                  <div className="flex gap-2">
                    <Select value={repPhoneCode} onValueChange={setRepPhoneCode}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {phoneCodes.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input className="flex-1" value={repTelefono} onChange={(e) => setRepTelefono(e.target.value)} placeholder="Número" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <FileUploadField label="Documento de autorización" file={repArchivo} onFileChange={setRepArchivo} />
                </div>
              </div>
            )}

            {/* Declarations */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-medium text-foreground">Declaraciones</h3>
              {[
                { id: "c1", checked: check1, set: setCheck1, text: "Declaro que la información proporcionada es veraz, completa y actualizada." },
                { id: "c2", checked: check2, set: setCheck2, text: "Asumo la responsabilidad sobre la autenticidad y legalidad de la documentación enviada a través de la plataforma." },
                { id: "c3", checked: check3, set: setCheck3, text: "Entiendo que la empresa actuará con base en la información suministrada por mí." },
              ].map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <Checkbox
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={(v) => item.set(v === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor={item.id} className="text-sm text-foreground leading-snug cursor-pointer">
                    {item.text}<span className="text-destructive ml-1">*</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* TAB 3 */}
        <TabsContent value="documentacion" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <p className="text-sm text-muted-foreground">
              Adjunta los documentos requeridos en los campos siguientes. Recuerda que puedes subir archivos en formato PDF o JPG. Cada archivo no debe superar los 5 MB.
            </p>
            <FileUploadField label="Documento de identidad (PDF/JPG)" required file={docIdentidad} onFileChange={setDocIdentidad} />
            <FileUploadField label="Documentos adicionales relevantes" file={docAdicional} onFileChange={setDocAdicional} />
            <FileUploadField label="Pruebas de situación y requisitos (si aplica)" required file={docPruebas} onFileChange={setDocPruebas} />
          </div>
        </TabsContent>

        {/* Save button */}
        <div className="flex items-center gap-4 pt-2">
          <Button onClick={handleSave}>Guardar</Button>
          <p className="text-xs text-muted-foreground">
            Los campos marcados con <span className="text-destructive">*</span> son obligatorios. Toda la información enviada será tratada según nuestras políticas de privacidad.
          </p>
        </div>
      </Tabs>
    </div>
  );
};

export default Perfil;
