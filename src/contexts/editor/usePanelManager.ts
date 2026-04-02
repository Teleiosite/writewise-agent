
import { useState } from "react";

export function usePanelManager() {
  const [showCitationsPanel, setShowCitationsPanel] = useState(false);
  const [showPdfReaderPanel, setShowPdfReaderPanel] = useState(false);
  const [showPdfChatPanel, setShowPdfChatPanel] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

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

  const toggleLeftSidebar = () => setShowLeftSidebar(!showLeftSidebar);
  const toggleRightSidebar = () => setShowRightSidebar(!showRightSidebar);

  return {
    showCitationsPanel,
    showPdfReaderPanel,
    showPdfChatPanel,
    showLeftSidebar,
    showRightSidebar,
    toggleCitationsPanel,
    togglePdfReaderPanel,
    togglePdfChatPanel,
    toggleLeftSidebar,
    toggleRightSidebar
  };
}
