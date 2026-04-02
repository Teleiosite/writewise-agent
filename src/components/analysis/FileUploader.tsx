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
      setError(`Unsupported file type. Please upload ${ACCEPTED.join(', ')}`);
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File must be under 50MB');
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
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 group',
          dragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50',
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
          'inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-all duration-200',
          dragging ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30'
        )}>
          {isLoading
            ? <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            : <Upload className={cn('w-7 h-7 transition-colors', dragging ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500')} />
          }
        </div>

        <p className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">
          {isLoading ? 'Parsing your dataset...' : dragging ? 'Drop to upload' : 'Drop your dataset here'}
        </p>
        <p className="text-sm text-gray-400">or click to browse</p>

        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {[
            { ext: 'XLSX', color: 'bg-green-50 text-green-700 border-green-200' },
            { ext: 'CSV', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { ext: 'XLS', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            { ext: 'SAV (SPSS)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
          ].map(({ ext, color }) => (
            <span key={ext} className={cn('text-[11px] font-bold px-2 py-0.5 rounded-md border', color)}>
              {ext}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Max 50MB · SPSS files parsed server-side for accuracy
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-100 dark:border-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
