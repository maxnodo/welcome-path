import { useState, useRef, useEffect } from "react";
import { Paperclip, Smile, SendHorizontal, FileText, Lock, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  sender: "user" | "advisor";
  text: string;
  time: string;
  attachment?: string;
}

const initialMessages: Message[] = [
  { id: "1", sender: "advisor", text: "Hola Carlos, ¿en qué puedo ayudarte hoy?", time: "15:42" },
  { id: "2", sender: "user", text: "Hola Alejandro, tengo una duda sobre la renovación de mi NIE.", time: "15:43" },
  { id: "3", sender: "advisor", text: "Claro, ¿cuál es tu duda sobre la renovación?", time: "15:43" },
];

const Chat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text && !attachment) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        sender: "user",
        text: text || `Archivo: ${attachment?.name}`,
        time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        attachment: attachment?.name,
      },
    ]);
    setInput("");
    setAttachment(null);
  };

  return (
    <div className="max-w-6xl space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Comunícate en tiempo real con nuestro equipo cuando el chat esté disponible. Este canal está destinado a consultas breves relacionadas con tus trámites activos.
        </p>
      </div>

      <div className="flex gap-4" style={{ height: "calc(100vh - 240px)" }}>
        {/* Left info panel */}
        <div className="w-72 shrink-0 hidden lg:block space-y-4">
          <div className="bg-card rounded-lg border shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Chat en Vivo</h3>
            <p className="text-sm text-muted-foreground">
              Comunícate en tiempo real con nuestro equipo cuando el chat esté disponible.
            </p>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-sm font-medium text-success">Activo</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Activo: puedes consultar en tiempo real con uno de nuestros asesores.
            </p>

            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Paperclip size={14} className="shrink-0 mt-0.5" />
                <span>Archivos admitidos: JPG, PDF</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Lock size={14} className="shrink-0 mt-0.5" />
                <span>El chat queda registrado y forma parte de tu expediente digital.</span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs font-medium text-foreground">Estado</p>
              <p className="text-xs text-muted-foreground mt-1">Ahora disponible para atender tu consulta.</p>
              <p className="text-[10px] text-muted-foreground mt-2">El chat queda registrado y firmado.</p>
            </div>
          </div>
        </div>

        {/* Right chat panel */}
        <div className="flex-1 bg-card rounded-lg border shadow-sm flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs text-success font-medium">En línea</span>
              <span className="text-xs text-muted-foreground ml-1">— Un asesor está disponible para atender tu consulta</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                AT
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Alejandro Torres</p>
                <p className="text-xs text-muted-foreground">Asesor Migratorio</p>
              </div>
              <span className="text-[10px] text-muted-foreground ml-auto">Responde en promedio en menos de 5 min</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2.5 ${
                    msg.sender === "user"
                      ? "bg-card border border-primary/20 text-foreground"
                      : "bg-[hsl(220_80%_96%)] text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  {msg.attachment && (
                    <div className="flex items-center gap-2 mt-2 bg-primary/10 rounded px-2.5 py-1.5">
                      <FileText size={14} className="text-primary" />
                      <span className="text-xs font-medium text-primary">{msg.attachment}</span>
                    </div>
                  )}
                  <p className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-right" : "text-left"} text-muted-foreground`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 space-y-2">
            {attachment && (
              <div className="flex items-center gap-2 text-xs bg-muted rounded px-2 py-1 w-fit">
                <FileText size={12} className="text-primary" />
                <span>{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-foreground ml-1">×</button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={() => fileRef.current?.click()}>
                <Paperclip size={18} />
              </Button>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} />
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9"><Smile size={18} /></Button>
              <Input
                placeholder="Escribe tu mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="h-9"
              />
              <Button size="icon" className="shrink-0 h-9 w-9 rounded-full" onClick={sendMessage}>
                <SendHorizontal size={18} />
              </Button>
            </div>
          </div>

          {/* Footer warning */}
          <div className="border-t px-4 py-3">
            <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-md p-3">
              <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-foreground">
                El chat en vivo está destinado a consultas breves. Para revisión completa de documentación o seguimiento detallado de expediente, utiliza la sección «Mis Mensajes».
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
