import React, { useState, useEffect, useRef } from "react";
import { useEditor } from "../store/EditorContext";
import {
  Bot,
  User,
  Send,
  X,
  Settings2,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createNewElement } from "../utils/elements";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "../i18n/TranslationContext";

export const AiChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { state, dispatch } = useEditor();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("gemini_api_key") || "",
  );
  const [showSettings, setShowSettings] = useState(
    !localStorage.getItem("gemini_api_key"),
  );
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    base64: string;
  } | null>(null);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSaveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    setShowSettings(false);
    toast.success("API Key saved successfully!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        // The base64 string looks like data:image/png;base64,....
        setSelectedImage({
          url: URL.createObjectURL(file),
          base64: base64String,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const processAIResponse = (text: string) => {
    try {
      // Find JSON block with actions
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        const actions = JSON.parse(match[1]);
        actions.forEach((action: any) => {
          if (action.type === "ADD_ELEMENT") {
            const elType = action.payload.elementType;
            const newEl = createNewElement(elType);

            // Apply generated props/styles over default ones
            if (action.payload.props) {
              newEl.props = { ...newEl.props, ...action.payload.props };
            }
            if (action.payload.style) {
              newEl.props.style = {
                ...newEl.props.style,
                ...action.payload.style,
              };
            }

            dispatch({
              type: "ADD_ELEMENT",
              payload: {
                parentId: state.currentPageId, // or logic from payload
                element: newEl,
              },
            });
          } else if (action.type === "REMOVE_ELEMENT") {
            dispatch({
              type: "REMOVE_ELEMENT",
              payload: { id: action.payload.id },
            });
          } else if (action.type === "UPDATE_ELEMENT") {
            dispatch({
              type: "UPDATE_ELEMENT",
              payload: { id: action.payload.id, props: action.payload.props },
            });
          } else if (action.type === "UPDATE_STYLE") {
            dispatch({
              type: "UPDATE_STYLE",
              payload: { id: action.payload.id, style: action.payload.style },
            });
          } else if (action.type === "CREATE_PAGE") {
            const pageId = Math.random().toString(36).substr(2, 9);
            dispatch({
              type: "ADD_PAGE",
              payload: {
                id: pageId,
                name: action.payload.name,
                path:
                  action.payload.path ||
                  "/" + action.payload.name.toLowerCase(),
              },
            });
          }
        });
      }
    } catch (e: any) {
      console.error("Failed to parse AI action payload", e);
      toast.error("Failed to parse AI response: JSON is invalid!");
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || !apiKey) return;

    let parts: any[] = [{ text: input }];
    if (selectedImage) {
      const partsArr = selectedImage.base64.split(",");
      const mimeType = partsArr[0].match(/:(.*?);/)?.[1];
      const data = partsArr[1];

      parts.push({
        inlineData: {
          data,
          mimeType,
        },
      });
    }

    const newMessage = { role: "user", parts };
    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setInput("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          messages: newMessages,
          contextState: {
            pages: state.pages,
            elements: state.elements,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch AI response");

      setMessages([
        ...newMessages,
        { role: "model", parts: [{ text: data.text }] },
      ]);
      processAIResponse(data.text);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-[350px] h-full flex flex-col border-l dark:border-[#333] border-gray-300 dark:bg-[#1C1C1C] bg-white absolute right-0 z-40 shadow-xl"
        >
          <div className="p-4 border-b dark:border-[#333] border-gray-200 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <Bot size={20} className="text-blue-500" />
              <h2 className="font-semibold text-sm dark:text-white text-gray-900">
                {t("Gemini Assistant")}
              </h2>
              <span className="px-1.5 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                {t("Beta")}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 dark:text-gray-400 text-gray-500 hover:text-gray-200 transition-colors"
              >
                <Settings2 size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 dark:text-gray-400 text-gray-500 hover:text-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showSettings && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex flex-col space-y-3">
                <h3 className="text-xs font-semibold text-blue-400">
                  {t("Gemini API Configuration")}
                </h3>
                <input
                  type="password"
                  placeholder={t("Enter your Gemini API Key...")}
                  className="w-full bg-[#252525] border border-[#333] rounded p-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-white"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  onClick={handleSaveApiKey}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs transition-colors font-medium self-end"
                >
                  {t("Save Key")}
                </button>
              </div>
            )}

            {messages.length === 0 && !showSettings && (
              <div className="flex flex-col items-center justify-center text-center space-y-3 px-2 py-8 mt-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500 mb-1">
                  <Bot size={24} />
                </div>
                <h3 className="text-sm font-semibold dark:text-yellow-400 text-yellow-600">
                  {t("AI Assistant (Beta)")}
                </h3>
                <p className="text-xs dark:text-gray-400 text-gray-500 leading-relaxed px-2">
                  {t("The AI can generate screens and edit elements. It's currently in beta and might make mistakes or encounter errors.")}
                </p>
                <p className="text-xs dark:text-gray-400 text-gray-500 leading-relaxed px-2">
                  {t("If it gets stuck or an error occurs, try breaking down complex tasks into smaller, simpler instructions.")}
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col space-y-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`flex items-center space-x-2 text-xs dark:text-gray-400 text-gray-500 mb-1`}
                >
                  {msg.role === "model" ? (
                    <>
                      <Bot size={12} /> <span>Gemini</span>
                    </>
                  ) : (
                    <>
                      <User size={12} /> <span>{t("You")}</span>
                    </>
                  )}
                </div>
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "dark:bg-[#2A2A2A] bg-gray-100 dark:text-gray-200 text-gray-800"
                  }`}
                >
                  {msg.parts.map((part: any, i: number) => {
                    if (part.text) {
                      return (
                        <div
                          key={i}
                          className="whitespace-pre-wrap break-words"
                        >
                          {part.text.replace(
                            /```json[\s\S]*?```/g,
                            "[Action processed by builder]",
                          )}
                        </div>
                      );
                    }
                    if (part.inlineData) {
                      return (
                        <img
                          key={i}
                          src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                          alt="upload"
                          className="max-w-full rounded mt-2 border dark:border-white/10"
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-blue-400">
                <Loader2 size={12} className="animate-spin" />
                <span>{t("Gemini is thinking...")}</span>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="p-3 border-t dark:border-[#333] border-gray-200 bg-white dark:bg-[#1C1C1C]">
            {selectedImage && (
              <div className="mb-2 relative inline-block">
                <img
                  src={selectedImage.url}
                  className="h-16 rounded border dark:border-[#333] border-gray-200"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:scale-110 transition-transform"
                >
                  <X size={10} />
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <label className="p-2 dark:text-gray-400 text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-full cursor-pointer transition-colors">
                <ImageIcon size={18} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={t("Ask Gemini to add elements...")}
                className="flex-1 max-h-32 min-h-[40px] resize-none dark:bg-[#252525] bg-gray-100 border border-transparent dark:focus:border-[#444] focus:border-gray-300 rounded-xl px-3 py-2 text-sm outline-none dark:text-white text-gray-900 overflow-y-auto w-full"
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={(!input.trim() && !selectedImage) || loading}
                className="p-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-full transition-colors flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
