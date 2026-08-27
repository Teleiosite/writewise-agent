
import React, { useRef, useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  // Track whether the last content change came FROM this editor (user typing / execCommand)
  // vs FROM an external source (section switch, AI insert, toolbar format).
  // If it came from here, we must NOT set innerHTML or we'll wipe the undo stack.
  const isInternalChange = useRef(false);

  // Initialize once on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync ONLY when content changes from an external source (e.g. section switch, AI insert).
  // Skip if this editor itself produced the change — that would wipe the undo stack.
  useEffect(() => {
    if (!editorRef.current) return;

    if (isInternalChange.current) {
      // This render was triggered by our own onInput → onChange → parent state update.
      // The DOM already has the correct content; do NOT touch innerHTML.
      isInternalChange.current = false;
      return;
    }

    // External change (different section selected, AI content injected, etc.)
    if (editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || "";
    }
  }, [content]);

  const handleInput = () => {
    if (!editorRef.current) return;
    // Mark as internal so the next effect cycle doesn't clobber the DOM
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="w-full min-h-[11in] bg-white shadow-xl mx-auto p-[1in] border border-gray-200 outline-none print:shadow-none transition-all">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="w-full min-h-[9in] outline-none prose prose-slate max-w-none text-gray-800 font-serif text-[11pt] leading-normal empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
        data-placeholder={placeholder}
        style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
      />
    </div>
  );
}
