
import { useState } from "react";

export function usePanelManager() {
  const [showCitationsPanel, setShowCitationsPanel] = useState(false);
  const [showPdfReaderPanel, setShowPdfReaderPanel] = useState(false);
  const [showPdfChatPanel, setShowPdfChatPanel] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [analysisTab, setAnalysisTab] = useState("writing");

  const toggleCitationsPanel = () => {
    setShowCitationsPanel(!showCitationsPanel);
    if (!showCitationsPanel) {
      setShowPdfReaderPanel(false);
      setShowPdfChatPanel(false);
    }
  };

  const togglePdfReaderPanel = () => {
    setShowPdfReaderPanel(!showPdfReaderPanel);
    if (!showPdfReaderPanel) {
      setShowCitationsPanel(false);
      setShowPdfChatPanel(false);
    }
  };

  const togglePdfChatPanel = () => {
    setShowPdfChatPanel(!showPdfChatPanel);
    if (!showPdfChatPanel) {
      setShowCitationsPanel(false);
      setShowPdfReaderPanel(false);
    }
  };

  const toggleAnalysisPanel = (tab?: string) => {
    if (tab) {
      if (showAnalysisPanel && analysisTab === tab) {
        setShowAnalysisPanel(false);
      } else {
        setAnalysisTab(tab);
        setShowAnalysisPanel(true);
      }
    } else {
      setShowAnalysisPanel(!showAnalysisPanel);
    }
    
    // When opening analysis, we might want to close other intrusive panels, 
    // but typically it can coexist with sidebar tools. 
    // Let's keep it simple for now.
  };

  return {
    showCitationsPanel,
    showPdfReaderPanel,
    showPdfChatPanel,
    showAnalysisPanel,
    analysisTab,
    toggleCitationsPanel,
    togglePdfReaderPanel,
    togglePdfChatPanel,
    toggleAnalysisPanel
  };
}
