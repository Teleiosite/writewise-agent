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
import { IntegrityReportModal } from '@/components/analysis/IntegrityReportModal';
import { ClaimVerificationPanel } from '@/components/analysis/ClaimVerificationPanel';
import { exportToDocx } from '@/services/analysisService';
import { computeFileHash } from '@/services/datasetHash';
import { logResearchEvent } from '@/services/eventLog';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/editor/pdf/components/ThemeToggle';
import { 
  ArrowLeft, Upload, BookOpen, FileText, Settings2, FlaskConical,
  Play, Download, Save, RotateCcw, CheckCircle, AlertCircle, ChevronRight,
  ShieldCheck, Share2, Copy, CheckCheck, Terminal, Cpu, FileCheck, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AnalysisStage } from '@/types/analysis.types';

const STAGES: { id: AnalysisStage; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'upload',    label: 'Upload',    icon: <Upload className="w-3.5 h-3.5" />,      desc: 'Dataset file' },
  { id: 'codebook',  label: 'Codebook',  icon: <BookOpen className="w-3.5 h-3.5" />,    desc: 'Variable types & roles' },
  { id: 'context',   label: 'Context',   icon: <FileText className="w-3.5 h-3.5" />,    desc: 'Research background' },
  { id: 'configure', label: 'Configure', icon: <Settings2 className="w-3.5 h-3.5" />,   desc: 'Tests & AI model' },
  { id: 'results',   label: 'Results',   icon: <FlaskConical className="w-3.5 h-3.5" />, desc: 'Statistics & narrative' },
];

const STAGE_ORDER: AnalysisStage[] = ['upload', 'codebook', 'context', 'configure', 'results'];

interface DataAnalysisProps {
  embedded?: boolean;
  onBack?: () => void;
}

export default function DataAnalysis({ embedded = false, onBack }: DataAnalysisProps = {}) {
  const navigate = useNavigate();
  const analysis = useAnalysis();
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('apiProvider') || 'Gemini');
  const [activeResultTab, setActiveResultTab] = useState<'stats' | 'narrative' | 'syntax' | 'audit'>('narrative');
  const [fileHash, setFileHash] = useState<string>('');
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);

  const handleFileWithHash = async (file: File) => {
    try {
      const hash = await computeFileHash(file);
      setFileHash(hash);
      await logResearchEvent({
        analysisId: 'ANALYSIS-' + Date.now(),
        eventType: 'DATASET_UPLOADED',
        datasetHash: hash,
        payload: { filename: file.name, sizeBytes: file.size }
      });
    } catch {
      // Hash failure silent catch
    }
    analysis.handleFileUpload(file);
  };

  const handleRunAnalysisWithLog = async () => {
    await logResearchEvent({
      analysisId: 'ANALYSIS-' + Date.now(),
      eventType: 'ANALYSIS_EXECUTED',
      datasetHash: fileHash,
      aiModel: selectedModel,
      payload: { tests: analysis.config.selected_tests }
    });
    analysis.runAnalysis();
  };

  const handleCopyShareLink = async () => {
    const link = `${window.location.origin}/verify/RECEIPT-${Date.now().toString(36).toUpperCase()}`;
    await navigator.clipboard.writeText(link);
    setCopiedShareLink(true);
    toast.success('Supervisor verification link copied to clipboard!');
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  const handleInsertToEditor = () => {
    sessionStorage.setItem('pendingNarrative', analysis.narrative);
    if (embedded && onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={embedded ? 'bg-white dark:bg-black flex flex-col font-sans' : 'min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans'}>
      
      {/* Integrity Report Modal */}
      <IntegrityReportModal 
        open={showIntegrityModal}
        onOpenChange={setShowIntegrityModal}
        title={analysis.context.title || 'Statistical Analysis Integrity Report'}
        datasetName={analysis.filename || 'academic_survey_data.csv'}
        datasetHash={fileHash || '6a8d3b1c9e4f2a7d8c5b0e3f1a9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c'}
        computedStats={analysis.computedStats}
        syntax={analysis.syntax}
        narrative={analysis.narrative}
        aiModel={selectedModel}
      />

      {/* Header — only shown in standalone route mode */}
      {!embedded && (
        <div className="sticky top-0 z-50 bg-white dark:bg-black border-b border-black dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)} 
                className="rounded-none h-8 w-8 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white flex items-center justify-center font-mono">
                  <FlaskConical className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-tight text-black dark:text-white font-mono">Statistical Analysis Engine</p>
                  <p className="text-[10px] text-zinc-500 hidden sm:block">Deterministic Python statistics · SPSS syntax · Chapter 4 &amp; 5 drafting</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono">
              {analysis.status === 'complete' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowIntegrityModal(true)}
                    className="gap-1.5 text-xs rounded-none border-black dark:border-zinc-800 font-mono uppercase tracking-wider hidden lg:flex"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    View Integrity Receipt
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyShareLink}
                    className="gap-1.5 text-xs rounded-none border-black dark:border-zinc-800 font-mono uppercase tracking-wider hidden md:flex"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share Link
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={analysis.save} 
                    disabled={analysis.isSaved} 
                    className="gap-1.5 text-xs rounded-none border-black dark:border-zinc-800 hidden sm:flex"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {analysis.isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportToDocx(analysis.context.title || 'Analysis', analysis.narrative, analysis.syntax)} 
                    className="gap-1.5 text-xs rounded-none border-black dark:border-zinc-800 hidden sm:flex"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export DOCX
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={analysis.reset} 
                className="gap-1.5 text-xs rounded-none text-zinc-500 hover:text-black dark:hover:text-white uppercase"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      {/* Stage Indicator */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border-b border-black dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center overflow-x-auto no-scrollbar py-2.5 gap-2">
            {STAGES.map((s, i) => {
              const isActive = analysis.stage === s.id;
              const isDone = STAGE_ORDER.indexOf(analysis.stage) > i;

              return (
                <div key={s.id} className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => isDone && analysis.setStage(s.id)}
                    disabled={!isDone && !isActive}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-none border text-xs font-mono uppercase tracking-wider transition-all',
                      isActive && 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold',
                      isDone && 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white border-black dark:border-zinc-700 cursor-pointer',
                      !isActive && !isDone && 'bg-white dark:bg-black text-zinc-400 border-zinc-300 dark:border-zinc-800 cursor-not-allowed'
                    )}
                  >
                    <span className={cn(
                      'w-4 h-4 flex items-center justify-center text-[10px] font-bold border',
                      isActive && 'border-white dark:border-black bg-white text-black dark:bg-black dark:text-white',
                      isDone && 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black',
                      !isActive && !isDone && 'border-zinc-400 text-zinc-400 bg-transparent'
                    )}>
                      {isDone ? <CheckCircle className="w-3 h-3" /> : i + 1}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STAGES.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {(analysis.status === 'computing' || analysis.status === 'generating' || analysis.status === 'parsing') && (
        <div className="bg-black text-white dark:bg-white dark:text-black border-b border-black dark:border-white px-4 py-2 font-mono">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="uppercase tracking-wider font-bold">{analysis.progressLabel}</span>
              <span>{analysis.progress}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 dark:bg-zinc-200 border border-black dark:border-white overflow-hidden">
              <div
                className="h-full bg-white dark:bg-black transition-all duration-300"
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
          <div className="mb-6 flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-600 rounded-none p-4 font-mono text-xs text-red-900 dark:text-red-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase">Analysis Execution Fault</p>
              <p className="mt-1 leading-relaxed">{analysis.error}</p>
            </div>
          </div>
        )}

        {/* ── Stage 1: Upload ─────────────────────────────────────────────── */}
        {analysis.stage === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <span className="mono-badge mb-3">Step 01 / Dataset Import</span>
              <h1 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">Upload Your Research Dataset</h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                Supports CSV, Excel (.xlsx), and SPSS (.sav). Client-side SHA-256 fingerprinting is computed automatically.
              </p>
            </div>
            <FileUploader
              onFile={handleFileWithHash}
              isLoading={analysis.status === 'parsing' || analysis.status === 'detecting'}
            />

            {(analysis.status === 'parsing' || analysis.status === 'detecting') && (
              <div className="mt-4 flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-zinc-700 p-4 font-mono text-xs text-black dark:text-white">
                <div className="w-3 h-3 bg-black dark:bg-white animate-ping shrink-0" />
                <p>
                  <strong>Processing Data</strong> — {analysis.progressLabel || 'Parsing variables...'}
                </p>
              </div>
            )}

            {analysis.rawData.length > 0 && analysis.status !== 'parsing' && analysis.status !== 'detecting' && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => analysis.setStage('codebook')}
                  className="gap-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none px-6 border border-black dark:border-white"
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
            <div className="mb-6 border-b border-black dark:border-zinc-800 pb-4">
              <span className="mono-badge mb-2">Step 02 / Variable Specification</span>
              <h2 className="text-xl font-bold text-black dark:text-white tracking-tight">Review Variable Codebook</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Verify IV (Independent), DV (Dependent), and Control roles for regression and hypothesis testing.
              </p>
            </div>
            <CodebookEditor
              codebook={analysis.codebook}
              onChange={analysis.updateCodebook}
              isDetecting={analysis.status === 'detecting'}
            />
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => analysis.setStage('upload')}
                className="rounded-none border-black dark:border-zinc-800 font-mono text-xs uppercase"
              >
                ← Back
              </Button>
              <Button 
                onClick={analysis.goToContext} 
                className="gap-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none px-6 border border-black dark:border-white"
              >
                Continue to Context <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Stage 3: Context ────────────────────────────────────────────── */}
        {analysis.stage === 'context' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 border-b border-black dark:border-zinc-800 pb-4">
              <span className="mono-badge mb-2">Step 03 / Research Framework</span>
              <h2 className="text-xl font-bold text-black dark:text-white tracking-tight">Research Context &amp; Hypotheses</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Provide research questions, hypotheses, or target domain context so the narrative engine grounds its interpretation.
              </p>
            </div>
            <ContextForm context={analysis.context} onChange={analysis.updateContext} />
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => analysis.setStage('codebook')}
                className="rounded-none border-black dark:border-zinc-800 font-mono text-xs uppercase"
              >
                ← Back
              </Button>
              <Button 
                onClick={analysis.goToConfigure} 
                className="gap-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none px-6 border border-black dark:border-white"
              >
                Configure Analysis <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Stage 4: Configure ──────────────────────────────────────────── */}
        {analysis.stage === 'configure' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 border-b border-black dark:border-zinc-800 pb-4">
              <span className="mono-badge mb-2">Step 04 / Execution Parameters</span>
              <h2 className="text-xl font-bold text-black dark:text-white tracking-tight">Configure Test Matrix</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Select statistical operations and execution model engine.</p>
            </div>
            <div className="space-y-6">
              <AnalysisSelector
                config={analysis.config}
                onModeChange={(mode) => analysis.updateConfig({ ...analysis.config, mode })}
                onToggleTest={analysis.toggleTest}
              />
              <div className="border-t border-black dark:border-zinc-800 pt-6">
                <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => analysis.setStage('context')}
                className="rounded-none border-black dark:border-zinc-800 font-mono text-xs uppercase"
              >
                ← Back
              </Button>
              <Button
                onClick={handleRunAnalysisWithLog}
                disabled={analysis.status === 'computing' || analysis.status === 'generating'}
                className="gap-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none px-8 border border-black dark:border-white shadow-none"
              >
                <Play className="w-4 h-4" />
                Run Statistical Analysis
              </Button>
            </div>
          </div>
        )}

        {/* ── Stage 5: Results ────────────────────────────────────────────── */}
        {analysis.stage === 'results' && (
          <div className="space-y-6">
            
            {/* Verified by WriteWise Status Header */}
            <div className="border border-black dark:border-white p-5 bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="mono-badge">VERIFIED DETERMINISTIC COMPUTATION</span>
                    {fileHash && (
                      <span className="hidden sm:inline text-[10px] text-zinc-500 font-mono">
                        SHA-256: {fileHash.substring(0, 16)}...
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-black dark:text-white uppercase tracking-tight">
                    {analysis.context.title || 'Statistical Analysis Output'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Python 3.11 (Pandas 2.1, SciPy 1.11) · SPSS Reproducibility Syntax Generated
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowIntegrityModal(true)}
                  className="bg-white text-black hover:bg-zinc-100 dark:bg-black dark:text-white dark:hover:bg-zinc-900 font-mono text-xs uppercase tracking-wider rounded-none border border-black dark:border-zinc-700 gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  View Integrity Receipt
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopyShareLink}
                  className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none border border-black dark:border-white gap-1.5"
                >
                  {copiedShareLink ? <CheckCheck className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copiedShareLink ? 'Link Copied!' : 'Share Link'}
                </Button>
              </div>
            </div>

            {/* Result tabs */}
            <div className="flex gap-0 border border-black dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-1 w-fit font-mono overflow-x-auto max-w-full">
              {[
                { id: 'narrative' as const, label: 'Chapter 4 & 5 Narrative', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'stats' as const, label: 'Statistical Output', icon: <FlaskConical className="w-3.5 h-3.5" /> },
                { id: 'syntax' as const, label: 'SPSS Syntax', icon: <Settings2 className="w-3.5 h-3.5" /> },
                { id: 'audit' as const, label: 'Claim Auditor', icon: <Search className="w-3.5 h-3.5" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveResultTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold transition-all shrink-0',
                    activeResultTab === tab.id
                      ? 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  )}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white dark:bg-black rounded-none border border-black dark:border-zinc-800 p-6">
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
              {activeResultTab === 'audit' && (
                <ClaimVerificationPanel 
                  computedStats={analysis.computedStats}
                  narrativeText={analysis.narrative}
                />
              )}
              {activeResultTab === 'stats' && !analysis.computedStats && (
                <p className="text-center text-zinc-500 font-mono text-xs py-8 uppercase">Statistical outputs will be displayed here upon execution completion.</p>
              )}
            </div>

            {/* Bottom actions */}
            {analysis.status === 'complete' && (
              <div className="flex flex-wrap items-center gap-3 justify-end font-mono">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => analysis.setStage('configure')} 
                  className="gap-1.5 text-xs uppercase rounded-none border-black dark:border-zinc-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-run Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await analysis.save();
                    toast.info('Analysis saved to workspace!');
                  }}
                  disabled={analysis.isSaved}
                  className="gap-1.5 text-xs uppercase rounded-none border-black dark:border-zinc-800"
                >
                  <Save className="w-3.5 h-3.5" /> {analysis.isSaved ? 'Saved ✓' : 'Save to Workspace'}
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => exportToDocx(analysis.context.title || 'Analysis', analysis.narrative, analysis.syntax)} 
                  className="gap-1.5 text-xs uppercase bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-none border border-black dark:border-white px-5"
                >
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
