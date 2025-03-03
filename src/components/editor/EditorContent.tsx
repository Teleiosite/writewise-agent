
import { Textarea } from "@/components/ui/textarea";

interface EditorContentProps {
  content: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function EditorContent({
  content,
  placeholder,
  onChange
}: EditorContentProps) {
  return (
    <Textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[500px] resize-none"
    />
  );
}
