
import { RichTextEditor } from "./RichTextEditor";

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
    <div className="flex-1 bg-gray-100 dark:bg-zinc-950 p-2 sm:p-4 md:p-6 min-h-screen">
      <RichTextEditor 
        content={content}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}
