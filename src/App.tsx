/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { LeftSidebar } from "./components/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar";
import { Canvas } from "./components/Canvas";
import { AiChat } from "./components/AiChat";
import { SetupScreen } from "./components/SetupScreen";
import { EditorProvider, useEditor } from "./store/EditorContext";
import { Toaster, toast } from "sonner";
import { useTranslation } from "./i18n/TranslationContext";

function CheatSheetModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#181818] rounded-xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2A2A2A] flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("Keyboard Shortcuts")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t("Save Project")}
            </span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-[#252525] border border-gray-300 dark:border-[#333] rounded text-xs">
              Ctrl + S
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t("Export JSON")}
            </span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-[#252525] border border-gray-300 dark:border-[#333] rounded text-xs">
              Ctrl + E
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t("Remove Element")}
            </span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-[#252525] border border-gray-300 dark:border-[#333] rounded text-xs">
              Delete
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t("Duplicate Element")}
            </span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-[#252525] border border-gray-300 dark:border-[#333] rounded text-xs">
              Ctrl + D
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t("Undo / Redo")}
            </span>
            <div className="space-x-2">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-[#252525] border border-gray-300 dark:border-[#333] rounded text-xs">
                Ctrl + Z
              </kbd>
              /
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-[#252525] border border-gray-300 dark:border-[#333] rounded text-xs">
                Ctrl + Y
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { AnimatePresence, motion } from "motion/react";

function EditorLayout() {
  const { state, dispatch } = useEditor();
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("force_reset") !== "done_v3") {
      localStorage.removeItem("vwe_setup_completed");
      localStorage.setItem("force_reset", "done_v3");
    }
    const isSetupCompleted = localStorage.getItem("vwe_setup_completed");
    if (!isSetupCompleted) {
      setShowSetup(true);
    }
  }, []);

  const handleSetupComplete = () => {
    localStorage.setItem("vwe_setup_completed", "true");
    setShowSetup(false);
  };

  useEffect(() => {
    const toggleAiChat = () => setShowAiChat((p) => !p);
    window.addEventListener("toggle-ai-chat", toggleAiChat);
    return () => window.removeEventListener("toggle-ai-chat", toggleAiChat);
  }, []);

  useEffect(() => {
    // Sync theme class to body
    if (state.theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [state.theme]);

  useEffect(() => {
    // Initial Load
    const saved = localStorage.getItem("vwe_project_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: "LOAD_STATE", payload: parsed });
      } catch (e) {
        console.error("Failed to load project state", e);
      }
    }
  }, []);

  useEffect(() => {
    // Auto Save every 30s
    let lastSaveStr = JSON.stringify({
      pages: state.pages,
      currentPageId: state.currentPageId,
      elements: state.elements,
      theme: state.theme,
    });
    const interval = setInterval(() => {
      const currentStr = JSON.stringify({
        pages: state.pages,
        currentPageId: state.currentPageId,
        elements: state.elements,
        theme: state.theme,
      });
      if (currentStr !== lastSaveStr) {
        localStorage.setItem("vwe_project_state", currentStr);
        lastSaveStr = currentStr;
        // Notify UI via a global event so TopBar can show "Saved" indicator
        window.dispatchEvent(new Event("project-auto-saved"));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [state.pages, state.currentPageId, state.elements, state.theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      if (e.key === "?") {
        setShowCheatSheet(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col dark:text-gray-300 text-gray-700 font-sans overflow-hidden dark:bg-[#0F0F0F] bg-gray-100 transition-colors duration-300">
      <TopBar />
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence>
          {!state.previewMode && (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0, position: "absolute" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full z-10 shrink-0"
            >
              <LeftSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          id="canvas-scroll-container"
          className="flex-1 overflow-auto bg-white flex justify-center h-full relative z-0"
        >
          <Canvas />
        </motion.div>

        <AnimatePresence>
          {!state.previewMode && (
            <motion.div
              initial={{ x: 280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 280, opacity: 0, position: "absolute", right: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full z-10 shrink-0"
            >
              <RightSidebar />
            </motion.div>
          )}
        </AnimatePresence>
        <AiChat isOpen={showAiChat} onClose={() => setShowAiChat(false)} />
      </div>
      {showCheatSheet && (
        <CheatSheetModal onClose={() => setShowCheatSheet(false)} />
      )}
      {showSetup && <SetupScreen onComplete={handleSetupComplete} />}
      <Toaster theme={state.theme} />
    </div>
  );
}

export default function App() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
}
