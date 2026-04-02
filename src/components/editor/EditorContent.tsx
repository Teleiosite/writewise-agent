
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
    <div className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-8 min-h-screen">
      <RichTextEditor 
        content={content}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}
