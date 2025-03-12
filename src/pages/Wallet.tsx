
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Wallet as WalletIcon, CreditCard, History } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAddFunds = () => {
    if (!amountToAdd || parseFloat(amountToAdd) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to add to your wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing payment
    setTimeout(() => {
      const amount = parseFloat(amountToAdd);
      setBalance(prev => prev + amount);
      setAmountToAdd("");
      setIsProcessing(false);
      
      toast({
        title: "Funds added successfully",
        description: `$${amount.toFixed(2)} has been added to your wallet.`,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Token Wallet</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-primary" />
                Your Wallet
              </CardTitle>
              <CardDescription>Add funds to your wallet to use for AI features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-muted rounded-lg text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                <div className="text-3xl font-bold flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                  <span>{balance.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-1">
                    Amount to Add (USD)
                  </label>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={amountToAdd}
                        onChange={(e) => setAmountToAdd(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="ml-2" 
                      onClick={handleAddFunds} 
                      disabled={isProcessing || !amountToAdd}
                    >
                      {isProcessing ? "Processing..." : "Add Funds"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Token Usage</CardTitle>
              <CardDescription>How tokens are used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span>AI Document Analysis</span>
                <span className="font-medium">$0.05 / page</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Citation Generation</span>
                <span className="font-medium">$0.02 / citation</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Grammar Checking</span>
                <span className="font-medium">$0.01 / 1000 words</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Content Generation</span>
                <span className="font-medium">$0.10 / request</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                <History className="h-4 w-4 mr-2" />
                View Transaction History
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-6">
                No payment methods added yet. Add a payment method to quickly fund your wallet.
              </p>
              <Button variant="outline" className="w-full">
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
