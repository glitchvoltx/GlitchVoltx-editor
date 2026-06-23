import React, { useRef, useEffect, useState } from "react";
import {
  Layout,
  MonitorPlay,
  Code,
  Download,
  Upload,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Grid3X3,
  Play,
  Moon,
  Sun,
  Check,
  Sparkles,
  Settings,
} from "lucide-react";
import { useEditor } from "../store/EditorContext";
import { exportProjectToZip } from "../utils/export";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { GlobalSettingsModal } from "./GlobalSettingsModal";

import { useTranslation } from "../i18n/TranslationContext";

export const TopBar: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);

  useEffect(() => {
    const handleAutoSaved = () => {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    };
    window.addEventListener("project-auto-saved", handleAutoSaved);
    return () =>
      window.removeEventListener("project-auto-saved", handleAutoSaved);
  }, []);

  const handleManualSave = () => {
    localStorage.setItem(
      "vwe_project_state",
      JSON.stringify({
        pages: state.pages,
        currentPageId: state.currentPageId,
        elements: state.elements,
        theme: state.theme,
      }),
    );
    setIsSaved(true);
    toast.success("Project saved securely to local storage.");
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportJson = () => {
    const loadingToast = toast.loading("Exporting project...");
    setTimeout(() => {
      try {
        const dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(
            JSON.stringify(
              {
                pages: state.pages,
                currentPageId: state.currentPageId,
                elements: state.elements,
                theme: state.theme,
              },
              null,
              2,
            ),
          );
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "website-layout.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        toast.dismiss(loadingToast);
        toast.success("Project exported successfully");
      } catch (err) {
        toast.dismiss(loadingToast);
        toast.error("Failed to export project");
      }
    }, 800); // Simulate processing time for UX
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading("Importing project...");
    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        // Simulate processing time for UX
        try {
          const json = JSON.parse(e.target?.result as string);
          // Check for valid format
          if (
            (Array.isArray(json) && json.length > 0 && json[0].id === "root") ||
            json.pages
          ) {
            dispatch({ type: "LOAD_STATE", payload: json });
            toast.success("Project imported successfully");
          } else {
            toast.error("Invalid project file format.");
          }
        } catch (err) {
          toast.error("Error parsing JSON file.");
        }
        toast.dismiss(loadingToast);
      }, 800);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePublish = () => {
    exportProjectToZip(state.pages, state.globalSettings);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        handleExportJson();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.elements]);

  return (
    <>
      <AnimatePresence>
        {state.previewMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-4 right-4 z-[999]"
          >
            <button
              onClick={() =>
                dispatch({ type: "SET_PREVIEW_MODE", payload: false })
              }
              className="bg-black/80 hover:bg-black text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-colors border border-white/20 shadow-lg flex items-center space-x-2"
            >
              <MonitorPlay size={16} />
              <span>{t("editor.exitPreview")}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!state.previewMode && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-14 dark:bg-[#181818] bg-gray-50 border-b dark:border-[#2A2A2A] border-gray-200 flex items-center justify-between px-4 shrink-0 overflow-x-auto gap-4 relative z-50"
          >
            <div className="flex items-center space-x-4 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center relative overflow-hidden flex-shrink-0 border border-black/10 shadow-sm" style={{ background: 'linear-gradient(135deg, #1800d0 0%, #00001a 100%)' }}>
                  <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 39 46 L 49 71 L 61 24 L 57 28 L 50 60 L 43 44 Z" fill="white" />
                  </svg>
                </div>
                <span className="dark:text-white text-gray-900 opacity-80 text-sm font-bold tracking-tight">
                  {t("editor.visualEditor")}
                </span>
                {isSaved && (
                  <div className="ml-2 flex items-center space-x-1 text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full text-xs font-medium">
                    <Check size={12} />
                    <span>{t("editor.saved")}</span>
                  </div>
                )}
              </div>

              <div className="pl-4 border-l dark:border-[#2A2A2A] border-gray-200 flex items-center space-x-1">
                <button
                  onClick={() => dispatch({ type: "TOGGLE_THEME" })}
                  className="p-1.5 dark:text-gray-400 text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded transition-colors"
                  title={t("editor.toggleTheme")}
                >
                  {state.theme === "dark" ? (
                    <Sun size={16} />
                  ) : (
                    <Moon size={16} />
                  )}
                </button>
                <button
                  onClick={() => dispatch({ type: "UNDO" })}
                  disabled={state.past.length === 0}
                  className="p-1.5 dark:text-gray-400 text-gray-500 hover:text-gray-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed hover:bg-white/5 rounded transition-colors"
                  title={`${t("editor.undo")} (Ctrl+Z)`}
                >
                  <Undo2 size={16} />
                </button>
                <button
                  onClick={() => dispatch({ type: "REDO" })}
                  disabled={state.future.length === 0}
                  className="p-1.5 dark:text-gray-400 text-gray-500 hover:text-gray-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed hover:bg-white/5 rounded transition-colors"
                  title={`${t("editor.redo")} (Ctrl+Y)`}
                >
                  <Redo2 size={16} />
                </button>
              </div>

              <div className="pl-4 border-l dark:border-[#2A2A2A] border-gray-200 flex items-center space-x-1">
                <button
                  onClick={() =>
                    dispatch({ type: "TOGGLE_GRID", payload: !state.showGrid })
                  }
                  className={`p-1.5 rounded transition-colors flex items-center ${state.showGrid ? "bg-blue-500/20 text-blue-400" : "dark:text-gray-400 text-gray-500 hover:text-gray-200 hover:bg-white/5"}`}
                  title={t("editor.toggleGrid")}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setShowGlobalSettings(true)}
                  className="p-1.5 rounded transition-colors flex items-center text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 ml-2"
                  title={t("editor.globalSettings")}
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-1 dark:bg-[#0F0F0F] bg-gray-100 p-1 rounded-md border dark:border-[#2A2A2A] border-gray-200">
              <button
                onClick={() =>
                  dispatch({ type: "SET_DEVICE_VIEW", payload: "desktop" })
                }
                className={`p-1.5 rounded transition-colors ${state.deviceView === "desktop" ? "dark:bg-[#252525] bg-white dark:text-white text-gray-900 shadow-sm" : "dark:text-gray-400 text-gray-500 hover:text-gray-200"}`}
                title={t("editor.desktop")}
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() =>
                  dispatch({ type: "SET_DEVICE_VIEW", payload: "tablet" })
                }
                className={`p-1.5 rounded transition-colors ${state.deviceView === "tablet" ? "dark:bg-[#252525] bg-white dark:text-white text-gray-900 shadow-sm" : "dark:text-gray-400 text-gray-500 hover:text-gray-200"}`}
                title={t("editor.tablet")}
              >
                <Tablet size={16} />
              </button>
              <button
                onClick={() =>
                  dispatch({ type: "SET_DEVICE_VIEW", payload: "mobile" })
                }
                className={`p-1.5 rounded transition-colors ${state.deviceView === "mobile" ? "dark:bg-[#252525] bg-white dark:text-white text-gray-900 shadow-sm" : "dark:text-gray-400 text-gray-500 hover:text-gray-200"}`}
                title={t("editor.mobile")}
              >
                <Smartphone size={16} />
              </button>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("toggle-ai-chat"))
                }
                className="flex items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium text-purple-600 bg-purple-500/10 hover:bg-purple-500/20 transition-colors border border-purple-500/20"
              >
                <Sparkles size={14} />
                <span className="hidden sm:inline">Gemini AI</span>
              </button>
              <button
                onClick={() =>
                  dispatch({ type: "SET_PREVIEW_MODE", payload: true })
                }
                className="flex items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium dark:text-gray-300 text-gray-700 hover:bg-white/5 transition-colors border border-transparent hover:dark:border-[#333] border-gray-300"
              >
                <Play size={14} />
                <span className="hidden sm:inline">{t("editor.preview")}</span>
              </button>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImportJson}
              />
              <div className="h-4 w-px bg-[#333] mx-1 hidden sm:block"></div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium dark:text-gray-300 text-gray-700 hover:bg-white/5 transition-colors hidden md:flex"
              >
                <Upload size={14} />
                <span>{t("editor.import")}</span>
              </button>
              <button
                onClick={handleExportJson}
                className="items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium dark:text-gray-300 text-gray-700 hover:bg-white/5 transition-colors hidden md:flex"
              >
                <Download size={14} />
                <span>{t("editor.export")}</span>
              </button>
              <button
                onClick={handlePublish}
                className="bg-blue-600 hover:bg-blue-700 dark:text-white text-gray-900 px-4 py-1.5 rounded text-sm font-medium transition-colors"
              >
                {t("editor.publish")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGlobalSettings && (
          <GlobalSettingsModal onClose={() => setShowGlobalSettings(false)} />
        )}
      </AnimatePresence>
    </>
  );
};
