import { useState, useMemo } from "react";
import { Search, Send, Mail, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminMensajes } from "@/hooks/useAdminMensajes";
import { useAuth } from "@/context/AuthContext";
import { Mensaje } from "@/types/database.types";

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: Mensaje;
  unreadCount: number;
  messages: Mensaje[];
}

const AdminMensajes = () => {
  const { user } = useAuth();
  const { mensajes, loading, sendReply } = useAdminMensajes();
  const [search, setSearch] = useState("");
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const conversations = useMemo(() => {
    const map = new Map<string, Conversation>();
    mensajes.forEach((m) => {
      const otherUserId = m.sender_id === user?.id ? m.receiver_id : m.sender_id;
      const otherUser = m.sender_id === user?.id ? m.receiver : m.sender;
      if (!map.has(otherUserId)) {
        map.set(otherUserId, {
          userId: otherUserId,
          userName: otherUser?.full_name ?? "Usuario",
          lastMessage: m,
          unreadCount: 0,
          messages: [],
        });
      }
      const convo = map.get(otherUserId)!;
      convo.messages.push(m);
      if (!m.is_read && m.receiver_id === user?.id) convo.unreadCount++;
      if (new Date(m.created_at) > new Date(convo.lastMessage.created_at)) {
        convo.lastMessage = m;
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
  }, [mensajes, user?.id]);

  const filteredConvos = conversations.filter((c) =>
    !search || c.userName.toLowerCase().includes(search.toLowerCase())
  );

  const activeConvo = conversations.find((c) => c.userId === selectedConvo);
  const sortedMessages = activeConvo?.messages.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const handleSend = async () => {
    if (!replyText.trim() || !selectedConvo) return;
    await sendReply(selectedConvo, replyText.trim());
    setReplyText("");
  };

  return (
    <div className="flex gap-0 h-[calc(100vh-8rem)] bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Sidebar conversations */}
      <div className="w-80 border-r flex flex-col shrink-0">
        <div className="p-3 border-b">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar conversación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground text-center">Cargando...</p>
          ) : filteredConvos.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">Sin conversaciones.</p>
          ) : filteredConvos.map((convo) => (
            <button
              key={convo.userId}
              onClick={() => setSelectedConvo(convo.userId)}
              className={`w-full text-left px-4 py-3 border-b transition-colors ${
                selectedConvo === convo.userId ? "bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-foreground">{convo.userName}</span>
                {convo.unreadCount > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {convo.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{convo.lastMessage.content}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(convo.lastMessage.created_at).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!selectedConvo ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Mail size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Selecciona una conversación</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-14 border-b px-5 flex items-center shrink-0">
              <h3 className="font-semibold text-foreground text-sm">{activeConvo?.userName}</h3>
              <span className="text-xs text-muted-foreground ml-3">{activeConvo?.messages.length} mensajes</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sortedMessages?.map((m) => {
                const isMine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-lg px-4 py-2.5 text-sm ${
                      isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}>
                      <p>{m.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        <span className="text-[10px]">
                          {new Date(m.created_at).toLocaleString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {!isMine && (m.is_read ? <MailOpen size={10} /> : <Mail size={10} />)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-t flex gap-2">
              <Textarea
                placeholder="Escribe una respuesta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="resize-none text-sm"
                rows={2}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              />
              <Button onClick={handleSend} disabled={!replyText.trim()} className="shrink-0 self-end">
                <Send size={16} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMensajes;
