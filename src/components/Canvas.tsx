import React, { useState, useRef, useEffect } from "react";
import { useEditor } from "../store/EditorContext";
import * as LucideIcons from "lucide-react";
import { EditorElement, ElementType } from "../types";
import { createNewElement, createTemplate } from "../utils/elements";
import { useTranslation } from "../i18n/TranslationContext";

interface RenderNodeProps {
  element: EditorElement;
}

const SlideshowRenderer: React.FC<{
  element: EditorElement;
  commonProps: any;
  isPreview: boolean;
}> = ({ element, commonProps, isPreview }) => {
  const { t } = useTranslation();
  const images = element.props.images || [];
  const autoPlay = element.props.autoPlay !== false;
  const loop = element.props.loop !== false;
  const interval = Number(element.props.interval) || 3000;
  const showArrows = element.props.showArrows !== false;
  const showDots = element.props.showDots !== false;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isPreview || !autoPlay || images.length <= 1) return;
    const val = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev === images.length - 1) {
          return loop ? 0 : prev;
        }
        return prev + 1;
      });
    }, interval);
    return () => clearInterval(val);
  }, [isPreview, autoPlay, loop, interval, images.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return loop ? images.length - 1 : prev;
      }
      return prev - 1;
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIndex((prev) => {
      if (prev === images.length - 1) {
        return loop ? 0 : prev;
      }
      return prev + 1;
    });
  };

  return (
    <div
      {...commonProps}
      style={{ ...commonProps.style, position: "relative", overflow: "hidden" }}
      className={`${commonProps.className || ""} group`}
    >
      {images.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-[#1e1e1e] text-gray-400 p-4">
          <LucideIcons.Images size={32} className="mb-2 opacity-50" />
          <span className="text-xs">{t("No images added in Slideshow")}</span>
        </div>
      ) : (
        images.map((src: string, index: number) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index + 1}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: element.props.style.objectFit || "cover",
              opacity: index === currentIndex ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              pointerEvents: "none",
            }}
          />
        ))
      )}

      {/* Nav Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            style={{ pointerEvents: "auto" }}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 focus:outline-none cursor-pointer"
          >
            <LucideIcons.ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            style={{ pointerEvents: "auto" }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 focus:outline-none cursor-pointer"
          >
            <LucideIcons.ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Navigation Dot Indicators */}
      {showDots && images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "6px",
            zIndex: 20,
          }}
        >
          {images.map((_: any, index: number) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  index === currentIndex ? "#ffffff" : "rgba(255,255,255,0.4)",
                border: "none",
                cursor: "pointer",
                pointerEvents: "auto",
              }}
              className="hover:scale-125 hover:bg-white transition-all focus:outline-none"
              title={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { TextPlugin } from "gsap/TextPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(ScrollTrigger, Draggable, TextPlugin, MotionPathPlugin, Flip);

// ... existing code ...
const RenderNode: React.FC<RenderNodeProps> = ({ element }) => {
  const { state, dispatch } = useEditor();
  const { t } = useTranslation();
  const isSelected = state.selectedId === element.id;
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(element.props.text || "");
  const elementRef = useRef<any>(null);

  useGSAP(() => {
    const el = elementRef.current;
    if (!el) return;

    // if in editor mode or no gsap config, do nothing else
    if (!state.previewMode || !element.props.gsap) return;

    const { 
      type, duration = 1, delay = 0, ease = "power2.out", trigger = "load",
      start = "top 80%", end = "bottom 20%", scrub = false, pin = false, markers = false,
      draggable = "none", text, stagger = 0
    } = element.props.gsap;

    // Draggable
    if (draggable !== "none") {
       Draggable.create(el, {
         type: draggable as any,
         bounds: "body",
         inertia: false,
       });
    }

    if (!type) return;

    let vars: any = { duration, delay, ease, stagger: stagger > 0 ? stagger : undefined };
    let fromVars: any = {};
    let isToAnim = false;

    switch (type) {
      case "fade":
        fromVars = { opacity: 0 };
        break;
      case "slideUp":
        fromVars = { opacity: 0, y: 50 };
        break;
      case "slideDown":
        fromVars = { opacity: 0, y: -50 };
        break;
      case "slideLeft":
        fromVars = { opacity: 0, x: -50 };
        break;
      case "slideRight":
        fromVars = { opacity: 0, x: 50 };
        break;
      case "zoomIn":
        fromVars = { opacity: 0, scale: 0.5 };
        break;
      case "zoomOut":
        fromVars = { opacity: 0, scale: 1.5 };
        break;
      case "rotate":
        fromVars = { opacity: 0, rotation: -180 };
        break;
      case "flip":
        fromVars = { opacity: 0, rotationX: -180 };
        break;
      case "typewriter":
        fromVars = { text: "" };
        break;
      default:
        fromVars = { opacity: 0 };
    }

    if (trigger === "hover") {
      // For hover, we create an interaction instead of a from() animation
      const hoverVars = { ...vars };
      const toVars = type === 'zoomIn' ? { scale: 1.1 } : 
                     type === 'slideUp' ? { y: -10 } : 
                     type === 'rotate' ? { rotation: 10 } : 
                     { opacity: 0.5 };
                     
      const anim = gsap.to(el, { ...toVars, ...hoverVars, paused: true });
      const applyHover = () => anim.play();
      const removeHover = () => anim.reverse();
      el.addEventListener("mouseenter", applyHover);
      el.addEventListener("mouseleave", removeHover);
      return () => {
        el.removeEventListener("mouseenter", applyHover);
        el.removeEventListener("mouseleave", removeHover);
      };
    } else if (trigger === "scroll") {
      const stVars = {
        scrollTrigger: { 
          trigger: el, 
          start, 
          end, 
          scrub, 
          pin, 
          markers 
        }
      };
      const childrenArr = el.children ? gsap.utils.toArray(Array.from(el.children)) : [];
      const target = (stagger > 0 && childrenArr.length > 0) ? childrenArr : el;

      if (isToAnim) {
        gsap.to(target, { ...fromVars, ...vars, ...stVars });
      } else {
        gsap.from(target, { ...fromVars, ...vars, ...stVars });
      }
    } else if (trigger === "click") {
      const childrenArr = el.children ? gsap.utils.toArray(Array.from(el.children)) : [];
      const target = (stagger > 0 && childrenArr.length > 0) ? childrenArr : el;
      const animVars = { ...fromVars, ...vars, paused: true };
      const anim = isToAnim ? gsap.to(target, animVars) : gsap.from(target, animVars);
      const playAnim = () => anim.restart();
      el.addEventListener("click", playAnim);
      return () => {
        el.removeEventListener("click", playAnim);
      };
    } else {
      // load
      const childrenArr = el.children ? gsap.utils.toArray(Array.from(el.children)) : [];
      const target = (stagger > 0 && childrenArr.length > 0) ? childrenArr : el;
      if (isToAnim) {
        gsap.to(target, { ...fromVars, ...vars });
      } else {
        gsap.from(target, { ...fromVars, ...vars });
      }
    }
  }, { dependencies: [state.previewMode, element.props.gsap, elementRef], scope: elementRef });

  useEffect(() => {
    if (isEditing && elementRef.current) {
      elementRef.current.focus();
      // Select all text
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(elementRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "SELECT_ELEMENT", payload: { id: element.id } });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (["text", "heading", "button"].includes(element.type)) {
      setIsEditing(true);
      setEditValue(element.props.text || "");
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== element.props.text) {
      dispatch({
        type: "UPDATE_ELEMENT",
        payload: { id: element.id, props: { text: editValue } },
      });
    }
  };

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    setEditValue(e.currentTarget.innerText);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData("sourceId", element.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const sourceId = e.dataTransfer.getData("sourceId");
    const newElementType = e.dataTransfer.getData("newElementType");
    const newTemplateType = e.dataTransfer.getData("newTemplateType");

    if (newElementType) {
      const newElement = createNewElement(newElementType as ElementType);
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          parentId: element.type === "container" ? element.id : "root",
          element: newElement,
        },
      });
    } else if (newTemplateType) {
      const newTemplate = createTemplate(newTemplateType);
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          parentId: element.type === "container" ? element.id : "root",
          element: newTemplate,
        },
      });
    } else if (sourceId && sourceId !== element.id) {
      dispatch({
        type: "MOVE_ELEMENT",
        payload: {
          sourceId,
          targetId: element.id,
          position: element.type === "container" ? "inside" : "after",
        },
      });
    }
  };

  const getCommonProps = () => {
    const baseStyle = { ...element.props.style };

    // Default resets
    if (element.type !== "image") {
      baseStyle.margin = baseStyle.margin || "0";
    }

    if (baseStyle.animationName) {
      baseStyle.animation = `${baseStyle.animationName} ${baseStyle.animationDuration || "1s"} ${baseStyle.animationTimingFunction || "ease"} ${baseStyle.animationDelay || "0s"} ${baseStyle.animationIterationCount || "1"}`;
    }

    return {
      id: element.id,
      ref: elementRef,
      onClick: (e: React.MouseEvent) => {
        if (state.previewMode) {
          if (element.props.linkType && element.props.href) {
            e.stopPropagation();
            if (element.props.linkType === "page") {
              dispatch({
                type: "SWITCH_PAGE",
                payload: element.props.href.replace("/", ""),
              });
            } else if (element.props.target === "_blank") {
              window.open(element.props.href, "_blank");
            } else {
              window.location.href = element.props.href;
            }
          }
        } else {
          handleClick(e);
        }
      },
      onDoubleClick: handleDoubleClick,
      draggable: element.id !== "root" && !isEditing,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      className: `relative group transition-all duration-200 outline-none ${
        state.previewMode
          ? ""
          : isSelected
            ? "ring-2 ring-blue-500 ring-offset-2 z-10"
            : "hover:ring-2 hover:ring-blue-300 hover:ring-offset-1 hover:z-10"
      } ${isDragOver && !state.previewMode ? "ring-2 ring-green-500 ring-offset-2 z-10 bg-green-50/10" : ""} ${element.props.linkType && state.previewMode ? "cursor-pointer" : ""}`,
      style: baseStyle,
    };
  };

  const renderInlineEditor = (Tag: any) => {
    if (isEditing) {
      return (
        <Tag
          {...getCommonProps()}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onInput={handleInput}
          onClick={(e: any) => e.stopPropagation()}
          className={`${getCommonProps().className} cursor-text`}
        >
          {element.props.text}
        </Tag>
      );
    }
    return <Tag {...getCommonProps()}>{element.props.text}</Tag>;
  };

  switch (element.type) {
    case "container":
      return (
        <div {...getCommonProps()}>
          {element.children &&
            element.children.map((child) => (
              <RenderNode key={child.id} element={child} />
            ))}
          {(!element.children || element.children.length === 0) && (
            <span className="dark:text-gray-400 text-gray-500 text-sm select-none pointer-events-none opacity-50 absolute inset-0 flex items-center justify-center">
              {t("Empty Container")}
            </span>
          )}
        </div>
      );
    case "text":
    case "heading": {
      const Tag = element.type === "heading" ? "h1" : "p";
      return renderInlineEditor(Tag);
    }
    case "button":
      return renderInlineEditor("button");
    case "image":
      return (
        <div
          {...getCommonProps()}
          style={{
            ...getCommonProps().style,
            position: "relative",
            display: "inline-block",
          }}
          className={getCommonProps().className}
        >
          <img
            src={element.props.src}
            alt={element.props.alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: element.props.style.objectFit as any,
              borderRadius: element.props.style.borderRadius,
            }}
          />
        </div>
      );
    case "video": {
      const isYoutube =
        element.props.src?.includes("youtube.com") ||
        element.props.src?.includes("youtu.be");
      const srcStr = element.props.src || "";

      let embedUrl = srcStr;
      if (isYoutube && !srcStr.includes("embed/")) {
        // Auto convert to embed URL if it's a standard watch URL
        const videoIdMatch = srcStr.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
        if (videoIdMatch) {
          embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
      }

      return (
        <div
          {...getCommonProps()}
          style={{
            ...getCommonProps().style,
            position: "relative",
            display: "inline-block",
          }}
          className={getCommonProps().className}
        >
          {isYoutube ? (
            <iframe
              src={embedUrl}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: element.props.style.borderRadius,
                border: "none",
                pointerEvents: state.previewMode ? "auto" : "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={srcStr}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: element.props.style.borderRadius,
                objectFit: "cover" as any,
              }}
              controls={element.props.controls !== false}
              autoPlay={element.props.autoPlay}
              loop={element.props.loop}
              muted={element.props.autoPlay}
            />
          )}
        </div>
      );
    }
    case "divider":
      return <div {...getCommonProps()} />;
    case "input":
      return (
        <input
          {...getCommonProps()}
          style={{
            ...getCommonProps().style,
            pointerEvents: state.previewMode ? "auto" : "none",
          }}
          type={element.props.inputType || "text"}
          placeholder={element.props.placeholder}
        />
      );
    case "slider":
      return (
        <input
          {...getCommonProps()}
          style={{
            ...getCommonProps().style,
            pointerEvents: state.previewMode ? "auto" : "none",
          }}
          type="range"
          min={element.props.min ?? 0}
          max={element.props.max ?? 100}
          value={element.props.value ?? 50}
          readOnly
        />
      );
    case "icon": {
      const IconComponent =
        (LucideIcons as any)[element.props.iconName || "Star"] ||
        LucideIcons.HelpCircle;
      return (
        <div
          {...getCommonProps()}
          style={{
            ...getCommonProps().style,
            display: "inline-flex",
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          <IconComponent
            style={{
              width: "100%",
              height: "100%",
              color: element.props.style.color || "currentColor",
            }}
          />
        </div>
      );
    }
    case "spacer":
      return <div {...getCommonProps()} />;
    case "textarea":
      return (
        <textarea
          {...getCommonProps()}
          style={{
            ...getCommonProps().style,
            pointerEvents: state.previewMode ? "auto" : "none",
          }}
          placeholder={element.props.placeholder}
          defaultValue={element.props.text}
        />
      );
    case "checkbox":
      return (
        <label
          {...getCommonProps()}
          style={{
            ...getCommonProps().style,
            pointerEvents: state.previewMode ? "auto" : "none",
          }}
        >
          <input type="checkbox" checked={element.props.checked} readOnly />
          <span>{element.props.label}</span>
        </label>
      );
    case "audio":
      return (
        <audio
          {...getCommonProps()}
          style={{
            ...getCommonProps().style,
            pointerEvents: state.previewMode ? "auto" : "none",
          }}
          src={element.props.src}
          controls
        />
      );
    case "map":
      return (
        <div
          {...getCommonProps()}
          style={{
            ...getCommonProps().style,
            position: "relative",
            display: "inline-block",
          }}
          className={getCommonProps().className}
        >
          <iframe
            src={element.props.src}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: element.props.style.borderRadius,
              border: "none",
              pointerEvents: state.previewMode ? "auto" : "none",
            }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    case "badge":
      return renderInlineEditor("span");
    case "progress":
      return (
        <div {...getCommonProps()}>
          <div
            style={{
              width: `${Math.min(100, Math.max(0, (Number(element.props.value) / Number(element.props.max)) * 100))}%`,
              height: "100%",
              backgroundColor: element.props.style.color || "#3b82f6",
              borderRadius: "inherit",
            }}
          />
        </div>
      );
    case "slideshow":
      return (
        <SlideshowRenderer
          element={element}
          commonProps={getCommonProps()}
          isPreview={state.previewMode}
        />
      );
    case "customCode":
      return (
        <div
          {...getCommonProps()}
          dangerouslySetInnerHTML={{ __html: element.props.code || "" }}
          style={{
            ...getCommonProps().style,
            pointerEvents: state.previewMode ? "auto" : "none",
          }}
        />
      );
    default:
      return null;
  }
};

export const Canvas: React.FC = () => {
  const { state, dispatch } = useEditor();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selectedId && state.selectedId !== "root") {
          dispatch({
            type: "REMOVE_ELEMENT",
            payload: { id: state.selectedId },
          });
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        if (state.selectedId && state.selectedId !== "root") {
          dispatch({
            type: "DUPLICATE_ELEMENT",
            payload: { id: state.selectedId },
          });
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        if (state.selectedId && state.selectedId !== "root") {
          e.preventDefault();
          dispatch({
            type: "COPY_ELEMENT",
            payload: { id: state.selectedId },
          });
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        dispatch({
          type: "PASTE_ELEMENT",
          payload: { targetId: state.selectedId || "root"},
        });
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          dispatch({ type: "REDO" });
        } else {
          dispatch({ type: "UNDO" });
        }
      }

      if (!state.previewMode && (e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        dispatch({ type: "REDO" });
      }

      if (e.key === "p" || e.key === "P") {
        // Optionally check for mod keys, but requested says "Toggle with P key"
        dispatch({ type: "SET_PREVIEW_MODE", payload: !state.previewMode });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.selectedId, state.previewMode, dispatch]);

  const handleCanvasClick = () => {
    dispatch({ type: "SELECT_ELEMENT", payload: { id: null } });
  };

  const getDeviceWidth = () => {
    switch (state.deviceView) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "desktop":
      default:
        return "100%"; // Or '1920px' if strictly fixed, let's use 100% with max-width or just 1920px. The prompt says 1920px.
    }
  };

  const getCanvasStyle = () => {
    const widthStyles =
      state.deviceView === "desktop"
        ? { width: "100%", maxWidth: "1920px" }
        : { width: getDeviceWidth(), maxWidth: getDeviceWidth() };
    return {
      ...widthStyles,
      minHeight: "100%",
      backgroundColor: state.previewMode ? "white" : "#ffffff",
      transition: "width 0.3s ease, max-width 0.3s ease",
      margin: "0 auto",
      containerType: "inline-size",
    };
  };

  return (
    <div
      className={`flex-1 overflow-auto p-4 md:p-12 h-full flex items-start justify-center transition-colors ${state.previewMode ? "bg-white p-0 md:p-0" : "bg-[#111111]"}`}
      onClick={handleCanvasClick}
    >
      <div
        className={`relative shadow-2xl ${state.previewMode ? "shadow-none" : ""}`}
        style={getCanvasStyle()}
      >
        {state.showGrid && (
          <div className="absolute inset-x-0 inset-y-0 pointer-events-none grid grid-cols-12 gap-4 px-4 z-50 opacity-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-full bg-blue-500 w-full" />
            ))}
          </div>
        )}
        {state.elements.map((element) => (
          <RenderNode key={element.id} element={element} />
        ))}
      </div>
    </div>
  );
};
