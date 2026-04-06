import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAnalysis } from '@/hooks/useAnalysis';
import { FileUploader } from '@/components/analysis/FileUploader';
import { CodebookEditor } from '@/components/analysis/CodebookEditor';
import { ContextForm } from '@/components/analysis/ContextForm';
import { AnalysisSelector } from '@/components/analysis/AnalysisSelector';
import { ModelSelector } from '@/components/analysis/ModelSelector';
import { StatisticsPanel } from '@/components/analysis/StatisticsPanel';
import { NarrativeStream } from '@/components/analysis/NarrativeStream';
import { SyntaxPanel } from '@/components/analysis/SyntaxPanel';
import { exportToDocx } from '@/services/analysisService';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/editor/pdf/components/ThemeToggle';
import { 
  ArrowLeft, Upload, BookOpen, FileText, Settings2, FlaskConical,
  Play, Download, Save, RotateCcw, CheckCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AnalysisStage } from '@/types/analysis.types';

const STAGES: { id: AnalysisStage; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'upload',    label: 'Upload',    icon: <Upload className="w-4 h-4" />,      desc: 'Dataset file' },
  { id: 'codebook',  label: 'Codebook',  icon: <BookOpen className="w-4 h-4" />,    desc: 'Variable types & roles' },
  { id: 'context',   label: 'Context',   icon: <FileText className="w-4 h-4" />,    desc: 'Research background' },
  { id: 'configure', label: 'Configure', icon: <Settings2 className="w-4 h-4" />,   desc: 'Tests & AI model' },
  { id: 'results',   label: 'Results',   icon: <FlaskConical className="w-4 h-4" />, desc: 'Statistics & narrative' },
];

const STAGE_ORDER: AnalysisStage[] = ['upload', 'codebook', 'context', 'configure', 'results'];

export default function DataAnalysis() {
  const navigate = useNavigate();
  const analysis = useAnalysis();
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('apiProvider') || 'Gemini');
  const [activeResultTab, setActiveResultTab] = useState<'stats' | 'narrative' | 'syntax'>('narrative');

  const stageIndex = STAGE_ORDER.indexOf(analysis.stage);
  const canProceed = {
    upload: analysis.rawData.length > 0,
    codebook: analysis.codebook.length > 0,
    context: true, // always optional
    configure: true,
    results: false,
  };

  const handleInsertToEditor = () => {
    // Store narrative in sessionStorage so the editor can pick it up
    sessionStorage.setItem('pendingNarrative', analysis.narrative);
    navigate(-1); // go back to wherever we came from (editor)
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-9 w-9 text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <FlaskConical className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">AI Data Analysis</p>
                <p className="text-[10px] text-gray-400 hidden sm:block">Full-spectrum statistical engine · Chapter 4 & 5 generator</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {analysis.status === 'complete' && (
              <>
                <Button variant="outline" size="sm" onClick={analysis.save} disabled={analysis.isSaved} className="gap-1.5 text-xs hidden sm:flex">
                  <Save className="w-3.5 h-3.5" />
                  {analysis.isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportToDocx(analysis.context.title || 'Analysis', analysis.narrative, analysis.syntax)} className="gap-1.5 text-xs hidden sm:flex">
                  <Download className="w-3.5 h-3.5" />
                  Export DOCX
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={analysis.reset} className="gap-1.5 text-xs text-gray-400">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Stage Indicator */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center overflow-x-auto no-scrollbar py-2 gap-1">
            {STAGES.map((s, i) => {
              const isActive = analysis.stage === s.id;
              const isDone = STAGE_ORDER.indexOf(analysis.stage) > i;
              const isClickable = isDone || (i <= stageIndex + 1 && canProceed[STAGE_ORDER[i - 1] as AnalysisStage] !== false);
              return (
                <div key={s.id} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => isDone && analysis.setStage(s.id)}
                    disabled={!isDone && !isActive}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      isActive && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                      isDone && 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 cursor-pointer',
                      !isActive && !isDone && 'text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <span className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                      isActive && 'bg-blue-600 text-white',
                      isDone && 'bg-green-100 dark:bg-green-900/30 text-green-600',
                      !isActive && !isDone && 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    )}>
                      {isDone ? <CheckCircle className="w-3 h-3" /> : i + 1}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STAGES.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {(analysis.status === 'computing' || analysis.status === 'generating' || analysis.status === 'parsing') && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-blue-600">{analysis.progressLabel}</span>
              <span className="text-xs text-gray-400">{analysis.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${analysis.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">

        {/* Error State */}
        {analysis.error && (
          <div className="mb-4 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Analysis Error</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{analysis.error}</p>
            </div>
          </div>
        )}

        {/* ── Stage 1: Upload ─────────────────────────────────────────────── */}
        {analysis.stage === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Upload Your Dataset</h1>
              <p className="text-gray-400 mt-2">Upload your research data. The AI will auto-detect variable types and prepare your codebook.</p>
            </div>
            <FileUploader
              onFile={analysis.handleFileUpload}
              isLoading={analysis.status === 'parsing' || analysis.status === 'detecting'}
            />

            {/* Parsing in progress — informative message */}
            {(analysis.status === 'parsing' || analysis.status === 'detecting') && (
              <div className="mt-4 flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-blue-500 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Please wait</strong> — {analysis.progressLabel || 'Parsing your dataset...'}
                  {' '}The page will advance automatically when ready.
                </p>
              </div>
            )}

            {/* Ready — show Continue button only after parsing is fully done */}
            {analysis.rawData.length > 0 && analysis.status !== 'parsing' && analysis.status !== 'detecting' && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => analysis.setStage('codebook')}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue to Codebook <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}


        {/* ── Stage 2: Codebook ───────────────────────────────────────────── */}
        {analysis.stage === 'codebook' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Review Variable Codebook</h2>
              <p className="text-sm text-gray-400 mt-1">
                The AI has detected your variable types. Review and correct any field — especially <strong>IV/DV roles</strong> for regression and correlation.
              </p>
            </div>
            <CodebookEditor
              codebook={analysis.codebook}
              onChange={analysis.updateCodebook}
              isDetecting={analysis.status === 'detecting'}
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => analysis.setStage('upload')}>← Back</Button>
              <Button onClick={analysis.goToContext} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                Continue to Context <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Stage 3: Context ────────────────────────────────────────────── */}
        {analysis.stage === 'context' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Research Context</h2>
              <p className="text-sm text-gray-400 mt-1">
                Add your research background so the AI can write a specific, academically grounded Chapter 4 & 5. All fields are optional.
              </p>
            </div>
            <ContextForm context={analysis.context} onChange={analysis.updateContext} />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => analysis.setStage('codebook')}>← Back</Button>
              <Button onClick={analysis.goToConfigure} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                Configure Analysis <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Stage 4: Configure ──────────────────────────────────────────── */}
        {analysis.stage === 'configure' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Configure Analysis</h2>
              <p className="text-sm text-gray-400 mt-1">Choose which statistical tests to run and which AI model to use for narrative generation.</p>
            </div>
            <div className="space-y-6">
              <AnalysisSelector
                config={analysis.config}
                onModeChange={(mode) => analysis.updateConfig({ ...analysis.config, mode })}
                onToggleTest={analysis.toggleTest}
              />
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => analysis.setStage('context')}>← Back</Button>
              <Button
                onClick={analysis.runAnalysis}
                disabled={analysis.status === 'computing' || analysis.status === 'generating'}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200/50 dark:shadow-none px-8"
              >
                <Play className="w-4 h-4" />
                Run Analysis
              </Button>
            </div>
          </div>
        )}

        {/* ── Stage 5: Results ────────────────────────────────────────────── */}
        {analysis.stage === 'results' && (
          <div className="space-y-4">
            {/* Result tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
              {[
                { id: 'narrative' as const, label: 'Chapter 4 & 5', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'stats' as const, label: 'Statistics', icon: <FlaskConical className="w-3.5 h-3.5" /> },
                { id: 'syntax' as const, label: 'SPSS Syntax', icon: <Settings2 className="w-3.5 h-3.5" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveResultTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    activeResultTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              {activeResultTab === 'narrative' && (
                <NarrativeStream
                  narrative={analysis.narrative}
                  isStreaming={analysis.status === 'generating'}
                  onInsertToEditor={analysis.narrative ? handleInsertToEditor : undefined}
                />
              )}
              {activeResultTab === 'stats' && analysis.computedStats && (
                <StatisticsPanel stats={analysis.computedStats} />
              )}
              {activeResultTab === 'syntax' && analysis.syntax && (
                <SyntaxPanel syntax={analysis.syntax} />
              )}
              {activeResultTab === 'stats' && !analysis.computedStats && (
                <p className="text-center text-gray-400 text-sm py-8">Statistics will appear here after running the analysis</p>
              )}
            </div>

            {/* Bottom actions */}
            {analysis.status === 'complete' && (
              <div className="flex flex-wrap items-center gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => analysis.setStage('configure')} className="gap-1.5 text-xs">
                  <RotateCcw className="w-3.5 h-3.5" /> Re-run
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await analysis.save();
                    toast.info('Analysis saved! Find it in your project dashboard under the Analytics tab.');
                  }}
                  disabled={analysis.isSaved}
                  className="gap-1.5 text-xs"
                >
                  <Save className="w-3.5 h-3.5" /> {analysis.isSaved ? 'Saved ✓' : 'Save to Project'}
                </Button>
                <Button size="sm" onClick={() => exportToDocx(analysis.context.title || 'Analysis', analysis.narrative, analysis.syntax)} className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  <Download className="w-3.5 h-3.5" /> Export DOCX
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
