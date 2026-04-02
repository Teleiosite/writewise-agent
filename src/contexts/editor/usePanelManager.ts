
import { useState } from "react";

export function usePanelManager() {
  const [showCitationsPanel, setShowCitationsPanel] = useState(false);
  const [showPdfReaderPanel, setShowPdfReaderPanel] = useState(false);
  const [showPdfChatPanel, setShowPdfChatPanel] = useState(false);

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
    toggleCitationsPanel,
    togglePdfReaderPanel,
    togglePdfChatPanel
  };
}
