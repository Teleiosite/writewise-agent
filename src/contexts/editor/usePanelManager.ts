
import { useState } from "react";
import { loadUserPreferences } from './editorStorage';

export function usePanelManager() {
  const [showCitationsPanel, setShowCitationsPanel] = useState(false);
  const [showPdfReaderPanel, setShowPdfReaderPanel] = useState(false);
  const [showPdfChatPanel, setShowPdfChatPanel] = useState(false);

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
    if (showCitationsPanel) {
      setShowPdfReaderPanel(false);
      setShowPdfChatPanel(false);
    }
  };

  const togglePdfReaderPanel = () => {
    setShowPdfReaderPanel(!showPdfReaderPanel);
    if (showPdfReaderPanel) {
      setShowCitationsPanel(false);
      setShowPdfChatPanel(false);
    }
  };

  const togglePdfChatPanel = () => {
    setShowPdfChatPanel(!showPdfChatPanel);
    if (showPdfChatPanel) {
      setShowCitationsPanel(false);
      setShowPdfReaderPanel(false);
    }
  };

  return {
    showCitationsPanel,
    showPdfReaderPanel,
    showPdfChatPanel,
    initializePanelState,
    toggleCitationsPanel,
    togglePdfReaderPanel,
    togglePdfChatPanel
  };
}
