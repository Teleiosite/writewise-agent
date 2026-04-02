import { useState } from 'react';
import { Copy, CheckCheck } from 'lucide-react';
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
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">SPSS Syntax</span>
          <p className="text-xs text-gray-400 mt-0.5">Generated for all tests run · Copy and paste into SPSS Syntax Editor</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs h-8">
          {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Syntax'}
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-900 px-4 py-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-xs text-gray-500 ml-2 font-mono">analysis.sps</span>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto bg-gray-950">
          <table className="w-full">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-gray-800/30">
                  <td className="select-none text-right pr-4 pl-3 py-0 text-[11px] text-gray-600 font-mono w-10 border-r border-gray-800">{i + 1}</td>
                  <td className="px-4 py-0">
                    <pre className={`text-[12px] font-mono py-0.5 ${
                      line.startsWith('*') ? 'text-green-400 italic' :
                      line.match(/^(DESCRIPTIVES|FREQUENCIES|EXAMINE|RELIABILITY|CORRELATIONS|REGRESSION|T-TEST|ONEWAY|FACTOR|LOGISTIC|NONPAR)/) ? 'text-blue-400 font-bold' :
                      line.match(/^\s+\//) ? 'text-yellow-300' :
                      'text-gray-200'
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
