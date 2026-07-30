import { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFile: (file: File) => void;
  isLoading?: boolean;
}

const ACCEPTED = ['.xlsx', '.xls', '.csv', '.sav'];

export function FileUploader({ onFile, isLoading }: FileUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError(`Unsupported format. Upload ${ACCEPTED.join(', ')}`);
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('Dataset file must be under 50MB');
      return false;
    }
    setError('');
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validate(file)) onFile(file);
  }, [onFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-4 font-sans">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative border border-dashed rounded-none p-12 text-center cursor-pointer transition-all duration-200 group bg-white dark:bg-black font-sans',
          dragging
            ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-900'
            : 'border-black dark:border-zinc-800 hover:border-black dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-950',
          isLoading && 'pointer-events-none opacity-60'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className={cn(
          'inline-flex items-center justify-center w-14 h-14 border rounded-none mb-4 transition-all duration-200 font-mono',
          dragging 
            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' 
            : 'bg-zinc-100 dark:bg-zinc-900 border-black dark:border-zinc-800 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black'
        )}>
          {isLoading
            ? <div className="w-5 h-5 border-2 border-current border-t-transparent animate-spin" />
            : <Upload className="w-6 h-6" />
          }
        </div>

        <p className="text-sm font-mono font-bold uppercase tracking-wider text-black dark:text-white mb-1">
          {isLoading ? 'Parsing Research Dataset...' : dragging ? 'Drop File to Ingest' : 'Drag & Drop Research Dataset'}
        </p>
        <p className="text-xs text-zinc-500 font-mono">or click to browse local filesystem</p>

        <div className="flex items-center justify-center gap-2 mt-5 flex-wrap font-mono">
          {['XLSX', 'CSV', 'XLS', 'SAV (SPSS)'].map((ext) => (
            <span key={ext} className="mono-badge">
              {ext}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-500">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Max 50MB · Native SPSS binary files & CSV datasets supported
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs font-mono text-red-900 dark:text-red-200 bg-red-50 dark:bg-red-950/40 p-4 border border-red-600 rounded-none">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
