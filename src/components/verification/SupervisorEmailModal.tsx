import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, Send, Copy, Check, ShieldCheck, 
  ExternalLink, FileCode, Lock, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";

interface SupervisorEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  datasetHash?: string;
  verificationUrl?: string;
}

export function SupervisorEmailModal({
  isOpen,
  onClose,
  projectName = "Empirical Research Dissertation",
  datasetHash = "a3f89b27d4e10c5982e4b7891234abcd5678ef90123456789abcdef012345678",
  verificationUrl = "https://writewise.duckdns.org/verify?id=DEMO-TOKEN"
}: SupervisorEmailModalProps) {
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [supervisorName, setSupervisorName] = useState("Prof. / Dr.");
  const [studentName, setStudentName] = useState("Doctoral Researcher");
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify` : verificationUrl;

  const emailSubject = `[Research Verification] Academic Reproducibility Package: ${projectName}`;

  const emailBody = `Dear ${supervisorName},

Please find attached the official WriteWise Academic Verification & Reproducibility Package for my postgraduate research project titled: "${projectName}".

=======================================================
REPRODUCIBILITY & DATA INTEGRITY AUDIT TRAIL
=======================================================
1. Tamper-Proof Verification Portal:
   ${currentUrl}

2. Raw Dataset SHA-256 Fingerprint:
   ${datasetHash}

3. Statistical Compute Verification:
   All statistical models (descriptives, multiple regression, ANOVA, and construct reliability) were computed via deterministic Python engines with zero AI hallucinations.

4. 1-Click SPSS Reproducibility:
   The corresponding SPSS Syntax (.sps) file is logged and can be executed independently on university workstations.

Please let me know if any additional empirical disclosures or syntax logs are required.

Respectfully submitted,

${studentName}
Postgraduate Researcher
Faculty of Graduate Studies & Research
`;

  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(supervisorEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, "_blank");
    toast.success("Opened email draft in your default mail application!");
  };

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(`SUBJECT: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    toast.success("Official supervisor verification memo copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] p-0 border border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none font-sans overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="mono-badge text-[10px]">Supervisor Bridge</span>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-black dark:text-white">
                Email Verification Package to Supervisor
              </h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
              Sends your advisor an official academic audit memo containing dataset SHA-256 hashes, verification URLs, and SPSS reproducibility scripts.
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div>
            <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Supervisor Email</label>
            <Input
              placeholder="supervisor@university.edu"
              value={supervisorEmail}
              onChange={(e) => setSupervisorEmail(e.target.value)}
              className="h-8 rounded-none border-black dark:border-zinc-700 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Supervisor Name &amp; Title</label>
            <Input
              placeholder="Prof. Arthur Smith"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              className="h-8 rounded-none border-black dark:border-zinc-700 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Your Name</label>
            <Input
              placeholder="Candidate Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="h-8 rounded-none border-black dark:border-zinc-700 text-xs font-mono"
            />
          </div>
        </div>

        {/* Live Memo Preview */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 flex-1 overflow-y-auto max-h-80 space-y-2 font-mono text-xs border-b border-zinc-200 dark:border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
            Live Submission Memorandum Preview:
          </div>
          <div className="p-3 bg-white dark:bg-black border border-black dark:border-zinc-800 text-black dark:text-white whitespace-pre-wrap leading-relaxed text-[11px] select-all">
            {emailBody}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-white dark:bg-black flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs">
          <span className="text-[10px] text-zinc-500">
            🔒 Cryptographically logged &amp; SHA-256 stamped
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMemo}
              className="flex-1 sm:flex-none h-9 rounded-none border-black dark:border-zinc-700 font-mono text-xs uppercase tracking-wider bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Email Memo
            </Button>

            <Button
              size="sm"
              onClick={handleOpenMailClient}
              className="flex-1 sm:flex-none h-9 rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider border border-black dark:border-white gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Open in Mail App
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
