
import { useState } from "react";
import { loadUserPreferences } from './editorStorage';

export function usePanelManager() {
  const [showCitationsPanel, setShowCitationsPanel] = useState(false);
  const [showPdfReaderPanel, setShowPdfReaderPanel] = useState(false);

  const initializePanelState = () => {
    const { showCitations, showPdfReader } = loadUserPreferences();
    if (showCitations) {
      setShowCitationsPanel(true);
    }
    
    if (showPdfReader) {
      setShowPdfReaderPanel(true);
    }
  };

  const toggleCitationsPanel = () => {
    setShowCitationsPanel(!showCitationsPanel);
    if (showCitationsPanel) setShowPdfReaderPanel(false);
  };

  const togglePdfReaderPanel = () => {
    setShowPdfReaderPanel(!showPdfReaderPanel);
    if (showPdfReaderPanel) setShowCitationsPanel(false);
  };

  return {
    showCitationsPanel,
    showPdfReaderPanel,
    initializePanelState,
    toggleCitationsPanel,
    togglePdfReaderPanel
  };
}
