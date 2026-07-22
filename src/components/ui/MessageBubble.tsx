import { formatMessageTime } from "@/lib/utils/time";

type MessageBubbleProps = {
  content: string;
  created_at: string;
  isMine: boolean;
  showDateHeader?: boolean;
};

/**
 * MessageBubble — renders a chat message bubble with correct alignment and styling.
 * Sent messages: right-aligned teal. Received: left-aligned dark card.
 */
export function MessageBubble({ content, created_at, isMine, showDateHeader }: MessageBubbleProps) {
  return (
    <div>
      {showDateHeader && (
        <div className="message-date-header">
          {new Date(created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      )}
      <div
        className={`message-bubble-wrapper ${isMine ? "message-bubble--sent" : "message-bubble--received"}`}
      >
        <div className={`message-bubble ${isMine ? "message-bubble-sent" : "message-bubble-received"}`}>
          {content}
        </div>
        <span className="message-timestamp">
          {formatMessageTime(created_at)}
        </span>
      </div>
    </div>
  );
}
