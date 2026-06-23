import React, { useState } from "react";
import {
  LayoutPanelTop,
  Type,
  Heading1,
  MousePointerClick,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  Youtube,
  Minus,
  TextCursorInput,
  SlidersHorizontal,
  Component,
  Star,
  FileText,
  Plus,
  Trash2,
  Settings,
  Space,
  AlignLeft,
  CheckSquare,
  Music,
  Map,
  Badge as BadgeIcon,
  Activity,
  Images,
  CodeXml,
} from "lucide-react";
import { useEditor } from "../store/EditorContext";
import { ElementType, EditorElement } from "../types";
import {
  createNewElement,
  createTemplate,
  initialRootElement,
} from "../utils/elements";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "../i18n/TranslationContext";

const ELEMENTS: { type: ElementType; label: string; icon: React.ReactNode }[] =
  [
    {
      type: "container",
      label: "Container",
      icon: <LayoutPanelTop size={18} />,
    },
    { type: "heading", label: "Heading", icon: <Heading1 size={18} /> },
    { type: "text", label: "Text Block", icon: <Type size={18} /> },
    { type: "button", label: "Button", icon: <MousePointerClick size={18} /> },
    { type: "image", label: "Image", icon: <ImageIcon size={18} /> },
    { type: "video", label: "Video", icon: <Youtube size={18} /> },
    { type: "icon", label: "Icon", icon: <Star size={18} /> },
    { type: "divider", label: "Divider", icon: <Minus size={18} /> },
    { type: "input", label: "Input", icon: <TextCursorInput size={18} /> },
    { type: "slider", label: "Slider", icon: <SlidersHorizontal size={18} /> },
    { type: "spacer", label: "Spacer", icon: <Space size={18} /> },
    { type: "textarea", label: "Text Area", icon: <AlignLeft size={18} /> },
    { type: "checkbox", label: "Checkbox", icon: <CheckSquare size={18} /> },
    { type: "audio", label: "Audio", icon: <Music size={18} /> },
    { type: "map", label: "Map", icon: <Map size={18} /> },
    { type: "badge", label: "Badge", icon: <BadgeIcon size={18} /> },
    { type: "progress", label: "Progress bar", icon: <Activity size={18} /> },
    { type: "slideshow", label: "Slideshow", icon: <Images size={18} /> },
    { type: "customCode", label: "Custom Code", icon: <CodeXml size={18} /> },
  ];

const LayerNode: React.FC<{ element: EditorElement; depth: number }> = ({
  element,
  depth,
}) => {
  const { state, dispatch } = useEditor();
  const [expanded, setExpanded] = useState(true);
  const isSelected = state.selectedId === element.id;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "SELECT_ELEMENT", payload: { id: element.id } });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData("sourceId", element.id);
  };

  const handleDrop = (
    e: React.DragEvent,
    position: "before" | "after" | "inside",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData("sourceId");
    if (sourceId && sourceId !== element.id) {
      dispatch({
        type: "MOVE_ELEMENT",
        payload: { sourceId, targetId: element.id, position },
      });
    }
  };

  const hasChildren = element.children && element.children.length > 0;

  return (
    <div>
      <div
        draggable={element.id !== "root"}
        onDragStart={handleDragStart}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) =>
          handleDrop(e, element.type === "container" ? "inside" : "after")
        }
        onClick={handleSelect}
        className={`flex items-center space-x-2 text-xs py-1.5 px-2 cursor-pointer transition-colors ${
          isSelected
            ? "bg-blue-500/10 text-blue-400"
            : "dark:text-gray-300 text-gray-700 hover:bg-white/5 opacity-80 hover:opacity-100"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <span
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              setExpanded(!expanded);
            }
          }}
          className={`w-4 h-4 flex items-center justify-center ${hasChildren ? "cursor-pointer hover:bg-white/10 rounded" : "opacity-0"}`}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        <span className="capitalize">{element.type}</span>
      </div>

      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-l dark:border-[#333] border-gray-300 ml-[14px] overflow-hidden"
          >
            {element.children.map((child) => (
              <LayerNode key={child.id} element={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LeftSidebar: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "add" | "templates" | "layers" | "pages"
  >("add");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const selectedId = state.selectedId || "root";

  const handleAddElement = (type: ElementType) => {
    let targetId = selectedId;

    const findType = (nodes: any[], id: string): string | null => {
      for (const n of nodes) {
        if (n.id === id) return n.type;
        if (n.children) {
          const sub = findType(n.children, id);
          if (sub) return sub;
        }
      }
      return null;
    };

    const targetType = findType(state.elements, targetId);
    if (targetType !== "container") {
      targetId = "root";
    }

    const newElement = createNewElement(type);
    dispatch({
      type: "ADD_ELEMENT",
      payload: { parentId: targetId, element: newElement },
    });
  };

  const handleAddTemplate = (templateName: string) => {
    let targetId = selectedId;

    const findType = (nodes: any[], id: string): string | null => {
      for (const n of nodes) {
        if (n.id === id) return n.type;
        if (n.children) {
          const sub = findType(n.children, id);
          if (sub) return sub;
        }
      }
      return null;
    };

    const targetType = findType(state.elements, targetId);
    if (targetType !== "container") {
      targetId = "root";
    }

    const newTemplate = createTemplate(templateName);
    dispatch({
      type: "ADD_ELEMENT",
      payload: { parentId: targetId, element: newTemplate },
    });
  };

  const handleCreatePage = () => {
    const newId = `page-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({
      type: "ADD_PAGE",
      payload: {
        id: newId,
        name: "New Page",
        path: `/${newId}`,
        seo: { title: "New Page", description: "", ogImage: "", favicon: "" },
        elements: [initialRootElement],
      },
    });
  };

  const editingPage = state.pages?.find((p) => p.id === editingPageId);

  return (
    <div className="w-64 dark:bg-[#181818] bg-gray-50 border-r dark:border-[#2A2A2A] border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="flex border-b dark:border-[#2A2A2A] border-gray-200 shrink-0">
        <div
          className={`flex-1 py-3 text-center text-xs flex justify-center items-center cursor-pointer ${activeTab === "add" ? "border-b-2 border-blue-500 dark:text-white text-gray-900" : "opacity-50 dark:text-white text-gray-900 hover:opacity-80"}`}
          onClick={() => setActiveTab("add")}
          title="Add Elements"
        >
          <Plus size={16} />
        </div>
        <div
          className={`flex-1 py-3 text-center text-xs flex justify-center items-center cursor-pointer ${activeTab === "templates" ? "border-b-2 border-blue-500 dark:text-white text-gray-900" : "opacity-50 dark:text-white text-gray-900 hover:opacity-80"}`}
          onClick={() => setActiveTab("templates")}
          title={t("sidebar.components")}
        >
          <Component size={16} />
        </div>
        <div
          className={`flex-1 py-3 text-center text-xs flex justify-center items-center cursor-pointer ${activeTab === "layers" ? "border-b-2 border-blue-500 dark:text-white text-gray-900" : "opacity-50 dark:text-white text-gray-900 hover:opacity-80"}`}
          onClick={() => setActiveTab("layers")}
          title="Layers"
        >
          <LayoutPanelTop size={16} />
        </div>
        <div
          className={`flex-1 py-3 text-center text-xs flex justify-center items-center cursor-pointer ${activeTab === "pages" ? "border-b-2 border-blue-500 dark:text-white text-gray-900" : "opacity-50 dark:text-white text-gray-900 hover:opacity-80"}`}
          onClick={() => {
            setActiveTab("pages");
            setEditingPageId(null);
          }}
          title={t("sidebar.pages")}
        >
          <FileText size={16} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full relative">
        <AnimatePresence mode="wait">
          {activeTab === "add" && (
            <motion.div
              key="add"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
            <h2 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-3">
              {t("sidebar.addElements") || "Add Elements"}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {ELEMENTS.map((el) => (
                <button
                  key={el.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("newElementType", el.type);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => handleAddElement(el.type)}
                  className="flex flex-col items-center justify-center p-3 border dark:border-[#333] border-gray-300 rounded-lg hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-400 transition-colors dark:bg-[#252525] bg-white cursor-grab active:cursor-grabbing"
                >
                  <div className="mb-2 dark:text-gray-400 text-gray-500">
                    {el.icon}
                  </div>
                  <span className="text-[11px] font-medium dark:text-gray-300 text-gray-700">
                    {t(`element.${el.type}`) !== `element.${el.type}` ? t(`element.${el.type}`) : el.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] dark:text-gray-400 text-gray-500 opacity-60 mt-4">
              {t("sidebar.addHelper") || "Click an element above to add it to the selected container. If no container is selected, it will be added to the main page."}
            </p>
            </motion.div>
          )}

          {activeTab === "templates" && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <h2 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-3">
                Pre-made Blocks
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {["hero", "faq", "pricing", "navbar", "footer"].map((t) => (
                  <button
                    key={t}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("newTemplateType", t);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => handleAddTemplate(t)}
                    className="flex items-center space-x-3 p-3 border dark:border-[#333] border-gray-300 rounded-lg hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-400 transition-colors dark:bg-[#252525] bg-white cursor-pointer"
                  >
                    <Component
                      size={18}
                      className="dark:text-gray-400 text-gray-500"
                    />
                    <span className="text-xs font-medium dark:text-gray-300 text-gray-700 capitalize">
                      {t} Section
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "layers" && (
            <motion.div
              key="layers"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="py-2"
            >
              {state.elements.map((el) => (
                <LayerNode key={el.id} element={el} depth={0} />
              ))}
            </motion.div>
          )}

          {activeTab === "pages" && (
            <motion.div
              key="pages"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="p-4 flex flex-col h-full"
            >
              {!editingPageId ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider">
                      {t("sidebar.pages")}
                    </h2>
                    <button
                      onClick={handleCreatePage}
                      className="p-1 hover:bg-white/10 rounded cursor-pointer dark:text-white text-gray-900"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {(state.pages || []).map((page) => (
                      <div
                        key={page.id}
                        onClick={() =>
                          dispatch({ type: "SWITCH_PAGE", payload: page.id })
                        }
                        className={`flex items-center justify-between p-2 rounded cursor-pointer text-xs transition-colors ${state.currentPageId === page.id ? "bg-blue-500/10 text-blue-400" : "dark:text-gray-300 text-gray-700 hover:bg-white/5"}`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText size={14} className="shrink-0" />
                          <span className="truncate">{page.name}</span>
                        </div>
                        <div className="flex space-x-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPageId(page.id);
                            }}
                            className="p-1 hover:bg-white/10 dark:text-gray-400 text-gray-500 rounded"
                          >
                            <Settings size={12} />
                          </button>
                          {(state.pages || []).length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch({
                                  type: "DELETE_PAGE",
                                  payload: page.id,
                                });
                              }}
                              className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4 text-xs dark:text-gray-300 text-gray-700"
                  >
                    <button
                      onClick={() => setEditingPageId(null)}
                      className="text-blue-400 hover:text-blue-300 mb-2 flex items-center"
                    >
                      <ChevronRight size={12} className="rotate-180 mr-1" />{" "}
                      Back
                    </button>
                    <h3 className="font-bold text-sm dark:text-white text-gray-900 mb-2">
                      Page Settings
                    </h3>

                    {editingPage && (
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-1 opacity-70">
                            Page Name
                          </label>
                          <input
                            type="text"
                            className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 dark:text-white text-gray-900 outline-none transition-colors"
                            value={editingPage.name}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_PAGE",
                                  payload: {
                                    id: editingPage.id,
                                    updates: { name: e.target.value },
                                  },
                                })
                              }
                            />
                        </div>
                        <div>
                          <label className="block mb-1 opacity-70">
                            URL Path
                          </label>
                          <input
                            type="text"
                            className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 dark:text-white text-gray-900 outline-none transition-colors"
                            value={editingPage.path}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_PAGE",
                                payload: {
                                  id: editingPage.id,
                                  updates: { path: e.target.value },
                                },
                              })
                            }
                          />
                        </div>

                        <div className="pt-4 border-t dark:border-[#333] border-gray-300">
                          <h4 className="font-semibold mb-2 dark:text-white text-gray-900">
                            SEO Meta
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block mb-1 opacity-70">
                                Title (Tab Title)
                              </label>
                              <input
                                type="text"
                                className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 dark:text-white text-gray-900 outline-none transition-colors"
                                value={editingPage?.seo?.title || ""}
                                onChange={(e) =>
                                  dispatch({
                                    type: "UPDATE_PAGE",
                                    payload: {
                                      id: editingPage.id,
                                      updates: {
                                        seo: {
                                          ...(editingPage.seo || {}),
                                          title: e.target.value,
                                        },
                                      },
                                    },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block mb-1 opacity-70">
                                Description
                              </label>
                              <textarea
                                rows={2}
                                className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 dark:text-white text-gray-900 outline-none resize-none transition-colors"
                                value={editingPage?.seo?.description || ""}
                                onChange={(e) =>
                                  dispatch({
                                    type: "UPDATE_PAGE",
                                    payload: {
                                      id: editingPage.id,
                                      updates: {
                                        seo: {
                                          ...(editingPage.seo || {}),
                                          description: e.target.value,
                                        },
                                      },
                                    },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block mb-1 opacity-70">
                                Favicon URL (Tab Icon)
                              </label>
                              <input
                                type="text"
                                className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 dark:text-white text-gray-900 outline-none transition-colors"
                                placeholder="https://example.com/favicon.png"
                                value={editingPage?.seo?.favicon || ""}
                                onChange={(e) =>
                                  dispatch({
                                    type: "UPDATE_PAGE",
                                    payload: {
                                      id: editingPage.id,
                                      updates: {
                                        seo: {
                                          ...(editingPage.seo || {}),
                                          favicon: e.target.value,
                                        },
                                      },
                                    },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block mb-1 opacity-70">
                                OG Image URL
                              </label>
                              <input
                                type="text"
                                className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 dark:text-white text-gray-900 outline-none transition-colors"
                                value={editingPage?.seo?.ogImage || ""}
                                onChange={(e) =>
                                  dispatch({
                                    type: "UPDATE_PAGE",
                                    payload: {
                                      id: editingPage.id,
                                      updates: {
                                        seo: {
                                          ...(editingPage.seo || {}),
                                          ogImage: e.target.value,
                                        },
                                      },
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
