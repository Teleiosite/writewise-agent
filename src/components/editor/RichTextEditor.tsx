
import React, { useRef, useEffect } from "react";
import { useEditor } from "@/contexts/editor";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { showLeftSidebar, showRightSidebar } = useEditor();
  const isWideMode = !showLeftSidebar && !showRightSidebar;

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
    <div className={`h-full min-h-[11in] bg-white shadow-xl mx-auto border border-gray-200 outline-none print:shadow-none transition-all duration-500 ease-in-out ${isWideMode ? 'p-[0.5in] md:p-[0.75in] w-full' : 'p-[1in] w-full'}`}>
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
