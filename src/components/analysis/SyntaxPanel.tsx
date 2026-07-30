import { useState } from 'react';
import { Copy, CheckCheck, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SyntaxPanelProps {
  syntax: string;
}

export function SyntaxPanel({ syntax }: SyntaxPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(syntax);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = syntax.split('\n');

  return (
    <div className="font-sans">
      <div className="flex items-center justify-between mb-3 border-b border-black dark:border-zinc-800 pb-3">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">IBM SPSS Command Syntax (.sps)</span>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Automated script output for 1-click supervisor verification</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy} 
          className="gap-1.5 text-xs font-mono rounded-none border-black dark:border-zinc-800 uppercase tracking-wider h-8"
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied ✓' : 'Copy Syntax'}
        </Button>
      </div>

      <div className="rounded-none border border-black dark:border-zinc-800 overflow-hidden font-mono">
        <div className="bg-black text-white px-4 py-2 flex items-center justify-between border-b border-black">
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-bold tracking-wider">analysis.sps</span>
          </div>
          <span className="text-[10px] text-zinc-400 uppercase">UTF-8 SPSS Script</span>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto bg-black text-white">
          <table className="w-full">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-zinc-900">
                  <td className="select-none text-right pr-3 pl-3 py-0 text-[11px] text-zinc-600 font-mono w-10 border-r border-zinc-800">{i + 1}</td>
                  <td className="px-4 py-0">
                    <pre className={`text-[11px] font-mono py-0.5 ${
                      line.startsWith('*') ? 'text-zinc-400 italic' :
                      line.match(/^(DESCRIPTIVES|FREQUENCIES|EXAMINE|RELIABILITY|CORRELATIONS|REGRESSION|T-TEST|ONEWAY|FACTOR|LOGISTIC|NONPAR)/) ? 'text-white font-bold underline' :
                      line.match(/^\s+\//) ? 'text-zinc-300 font-semibold' :
                      'text-zinc-200'
                    }`}>{line || ' '}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
