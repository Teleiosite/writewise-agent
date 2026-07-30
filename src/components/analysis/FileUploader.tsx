import { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  // Create a synthetic sample dataset CSV file for 1-click testing
  const handleLoadSampleDataset = (e: React.MouseEvent) => {
    e.stopPropagation();
    const csvContent = `ID,Gender,Age,Education,Work_Experience_Years,Job_Satisfaction_1,Job_Satisfaction_2,Job_Satisfaction_3,Performance_Score
1,Female,28,Master,4,4,5,4,82
2,Male,34,Bachelor,8,3,3,2,68
3,Female,45,PhD,18,5,5,5,94
4,Male,29,Bachelor,3,2,3,2,61
5,Female,31,Master,6,4,4,4,79
6,Male,52,PhD,24,5,4,5,91
7,Female,26,Bachelor,2,3,2,3,72
8,Male,39,Master,12,4,4,3,84
9,Female,41,Bachelor,14,3,4,4,77
10,Male,33,Master,7,4,3,4,80
11,Female,27,Bachelor,3,5,4,5,88
12,Male,48,PhD,20,4,5,4,89
13,Female,36,Master,10,3,3,3,74
14,Male,30,Bachelor,5,2,2,3,63
15,Female,44,PhD,17,5,5,4,93`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const sampleFile = new File([blob], 'academic_sample_survey_data.csv', { type: 'text/csv' });
    onFile(sampleFile);
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLoadSampleDataset}
          disabled={isLoading}
          className="font-mono text-xs uppercase tracking-wider rounded-none border-black dark:border-zinc-800 gap-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          Load Sample Academic Dataset (1-Click Demo)
        </Button>
      </div>

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
          Max 50MB · Native SPSS binary files &amp; CSV datasets supported
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
