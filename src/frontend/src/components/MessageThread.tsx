import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useState } from "react";
import type { Message } from "../backend.d";
import { useAddMessage, useMessages } from "../hooks/useQueries";

interface MessageThreadProps {
  bookingId: bigint;
  senderName: string;
}

function formatTime(ts: bigint): string {
  return new Date(Number(ts / 1000000n)).toLocaleString();
}

export default function MessageThread({
  bookingId,
  senderName,
}: MessageThreadProps) {
  const { data: messages = [] } = useMessages(bookingId);
  const addMessage = useAddMessage();
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim()) return;
    addMessage.mutate(
      { bookingId, senderName, content: content.trim() },
      { onSuccess: () => setContent("") },
    );
  };

  return (
    <div className="space-y-3">
      <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-muted/40 rounded-lg">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No messages yet
          </p>
        )}
        {(messages as Message[]).map((msg, idx) => (
          <div
            key={`${msg.timestamp}-${msg.senderName}-${idx}`}
            className="bg-white rounded-lg p-2.5 shadow-xs"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-semibold text-primary">
                {msg.senderName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(msg.timestamp)}
              </span>
            </div>
            <p className="text-sm text-foreground">{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Textarea
          data-ocid="message.textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="resize-none h-20 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) handleSend();
          }}
        />
        <Button
          data-ocid="message.submit_button"
          onClick={handleSend}
          disabled={addMessage.isPending || !content.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 self-end"
          size="icon"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
