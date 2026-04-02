
import React, { useRef, useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize content once
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || "";
    }
  }, []);

  // Update content if it changes externally (e.g. section switch)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || "";
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="w-full h-full min-h-[11in] bg-white shadow-xl mx-auto p-[1in] border border-gray-200 outline-none print:shadow-none transition-all">
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full h-full min-h-[9in] outline-none prose prose-slate max-w-none text-gray-800 font-serif text-[11pt] leading-normal empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
        data-placeholder={placeholder}
        style={{
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      />
    </div>
  );
}
