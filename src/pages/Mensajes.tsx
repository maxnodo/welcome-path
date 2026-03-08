import { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, MoreVertical, Smile, Paperclip, SendHorizontal, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Message {
  id: string;
  sender: "user" | "advisor";
  text: string;
  time: string;
  attachment?: string;
}

interface Conversation {
  id: string;
  avatar: string;
  advisorName: string;
  title: string;
  status: "Activo" | "Cerrado";
  unread: boolean;
  lastMessage: string;
  time: string;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: "1",
    avatar: "ML",
    advisorName: "María López",
    title: "Nacionalidad Española",
    status: "Activo",
    unread: true,
    lastMessage: "Perfecto Carlos. Quedo atento a rec...",
    time: "Hace 15 min",
    messages: [
      { id: "m1", sender: "user", text: "Hola María, te envío los documentos que faltan para completar la solicitud de nacionalidad.", time: "11:10 am", attachment: "Justificante_pago.pdf" },
      { id: "m2", sender: "advisor", text: "Hola Carlos, he recibido tus documentos. Los revisaré y se los presentaré al Ministerio de Justicia cuanto antes.", time: "11:56 am" },
      { id: "m3", sender: "advisor", text: "Perfecto Carlos. Quedo atento a recibir la resolución y si tienes alguna duda, ya sabes que puedes contactarme.", time: "12:12 pm" },
    ],
  },
  {
    id: "2",
    avatar: "CM",
    advisorName: "Carlos Martínez",
    title: "NIE",
    status: "Activo",
    unread: true,
    lastMessage: "Gracias, he recibido los documentos. E...",
    time: "Ayer",
    messages: [
      { id: "m1", sender: "user", text: "Buenos días Carlos, adjunto los documentos del NIE.", time: "9:30 am" },
      { id: "m2", sender: "advisor", text: "Gracias, he recibido los documentos. Estaré revisándolos durante el día de hoy.", time: "10:15 am" },
    ],
  },
  {
    id: "3",
    avatar: "ML",
    advisorName: "María López",
    title: "Consulta general",
    status: "Cerrado",
    unread: false,
    lastMessage: "Gracias. En cuanto tenga novedades.",
    time: "29 abril",
    messages: [
      { id: "m1", sender: "user", text: "Hola María, ¿hay alguna novedad sobre mi expediente?", time: "3:00 pm" },
      { id: "m2", sender: "advisor", text: "Gracias. En cuanto tenga novedades te lo haré saber.", time: "4:30 pm" },
    ],
  },
];

const Mensajes = () => {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState("1");
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = conversations.find((c) => c.id === selectedId)!;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected.messages.length]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    );
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text && !attachment) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      sender: "user",
      text: text || (attachment ? `Archivo adjunto: ${attachment.name}` : ""),
      time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      attachment: attachment?.name,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text.slice(0, 40) + "...", time: "Ahora" }
          : c
      )
    );
    setInput("");
    setAttachment(null);
  };

  const filtered = search
    ? conversations.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.advisorName.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  return (
    <div className="max-w-6xl space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Aquí puedes comunicarte directamente con tu asesor y consultar el historial de mensajes relacionados con tus trámites.
        </p>
        <p className="text-xs text-muted-foreground mt-1">Tiempo estimado de respuesta: 24–48 horas laborables.</p>
      </div>

      <div className="flex bg-card rounded-lg border shadow-sm overflow-hidden" style={{ height: "calc(100vh - 240px)" }}>
        {/* Left panel */}
        <div className="w-80 border-r flex flex-col shrink-0">
          <div className="p-3 border-b flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9"><SlidersHorizontal size={16} /></Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`w-full flex items-start gap-3 p-3 text-left transition-colors border-b border-border/50 ${
                  selectedId === c.id ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">{c.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{c.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Gestor: {c.advisorName}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {c.unread && <span className="w-2.5 h-2.5 rounded-full bg-secondary" />}
                  {c.status === "Cerrado" && <span className="text-[10px] bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded">Cerrado</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel - chat */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {selected.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{selected.advisorName}</p>
              <p className="text-xs text-muted-foreground">Asesora Asignada</p>
            </div>
            <Button variant="ghost" size="icon"><MoreVertical size={18} /></Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {selected.messages.map((msg) => (
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

          {/* Input area */}
          <div className="border-t p-3 space-y-2">
            {attachment && (
              <div className="flex items-center gap-2 text-xs bg-muted rounded px-2 py-1 w-fit">
                <FileText size={12} className="text-primary" />
                <span>{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-foreground ml-1">×</button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9"><Smile size={18} /></Button>
              <Input
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="h-9"
              />
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={() => fileRef.current?.click()}>
                <Paperclip size={18} />
              </Button>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} />
              <Button size="icon" className="shrink-0 h-9 w-9" onClick={sendMessage}><SendHorizontal size={18} /></Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Adjuntar documento — PDF / JPG</p>
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2 space-y-1">
            <div className="flex items-center gap-2">
              <Checkbox checked disabled className="h-3.5 w-3.5" />
              <span className="text-[11px] text-muted-foreground">Utiliza este canal únicamente para asuntos relacionados con tus trámites activos.</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Toda la comunicación realizada a través de esta plataforma queda registrada y forma parte del expediente digital del usuario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mensajes;
