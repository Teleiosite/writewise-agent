import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Wallet as WalletIcon, CreditCard, History } from "lucide-react";
import { HomeLayout } from "@/components/layout/HomeLayout";

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAddFunds = () => {
    if (!amountToAdd || parseFloat(amountToAdd) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid dollar amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      const amount = parseFloat(amountToAdd);
      setBalance(prev => prev + amount);
      setAmountToAdd("");
      setIsProcessing(false);
      
      toast({
        title: "Funds added successfully",
        description: `$${amount.toFixed(2)} credited to your research workspace balance.`,
      });
    }, 1200);
  };

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-4xl mx-auto py-6 font-sans space-y-6">
        <div className="border-b border-black dark:border-zinc-800 pb-4">
          <span className="mono-badge mb-2">Billing & Tokens</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white mt-1">Research Compute Wallet</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Manage API execution balance for high-throughput Python statistical runs & LLM synthesis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2 rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none">
            <CardHeader className="border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase font-bold text-black dark:text-white">
                <WalletIcon className="h-4 w-4 text-black dark:text-white" />
                Compute Balance & Deposit
              </CardTitle>
              <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">Add prepaid credits for research operations</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="p-6 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-mono text-center mb-6">
                <p className="text-xs uppercase tracking-wider mb-1 font-bold text-zinc-400 dark:text-zinc-600">Available Compute Balance</p>
                <div className="text-3xl font-extrabold flex items-center justify-center tracking-tight">
                  <DollarSign className="h-6 w-6" />
                  <span>{balance.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-3 font-mono">
                <label htmlFor="amount" className="block text-xs uppercase font-bold text-black dark:text-white">
                  Add Credit (USD)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-zinc-500" />
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="25.00"
                      className="pl-8 rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black focus:ring-1 focus:ring-black dark:focus:ring-white"
                      value={amountToAdd}
                      onChange={(e) => setAmountToAdd(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-mono uppercase tracking-wider px-6 border border-black dark:border-white" 
                    onClick={handleAddFunds} 
                    disabled={isProcessing || !amountToAdd}
                  >
                    {isProcessing ? "Processing..." : "Add Funds"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none font-sans">
            <CardHeader className="border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <CardTitle className="text-sm font-mono uppercase font-bold text-black dark:text-white">Execution Tariffs</CardTitle>
              <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">Rate breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Python Dataset Fit</span>
                <span className="font-bold text-black dark:text-white">$0.00 / free</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Chapter 4/5 Narrative</span>
                <span className="font-bold text-black dark:text-white">$0.05 / run</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">SPSS Syntax Build</span>
                <span className="font-bold text-black dark:text-white">$0.02 / run</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">PDF OCR Literature</span>
                <span className="font-bold text-black dark:text-white">$0.01 / 100 pages</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="outline" className="w-full rounded-none border-black dark:border-zinc-800 font-mono text-xs uppercase" disabled>
                <History className="h-3.5 w-3.5 mr-1.5" />
                Ledger History
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-6">
          <Card className="rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none font-sans">
            <CardHeader className="border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase font-bold text-black dark:text-white">
                <CreditCard className="h-4 w-4" />
                Registered Payment Instruments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-center text-xs font-mono text-zinc-500 py-4 uppercase">
                No active credit/debit instruments connected.
              </p>
              <Button variant="outline" className="w-full rounded-none border-black dark:border-zinc-800 font-mono text-xs uppercase">
                Connect Card Instrument
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
}
