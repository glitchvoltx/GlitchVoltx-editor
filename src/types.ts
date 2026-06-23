export type ElementType =
  | "container"
  | "text"
  | "button"
  | "image"
  | "heading"
  | "video"
  | "divider"
  | "input"
  | "slider"
  | "icon"
  | "spacer"
  | "textarea"
  | "checkbox"
  | "audio"
  | "map"
  | "badge"
  | "progress"
  | "slideshow"
  | "customCode";

export interface ElementStyle {
  backgroundColor?: string;
  color?: string;
  padding?: string;
  margin?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  fontFamily?: string;
  textDecoration?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  borderBottomWidth?: string;
  borderBottomStyle?: string;
  borderBottomColor?: string;
  boxShadow?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: string;
  display?: "block" | "flex" | "grid" | "inline-block" | "inline";
  flexDirection?: "row" | "column";
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  gap?: string;
  cursor?: string;
  objectFit?: "fill" | "contain" | "cover" | "none" | "scale-down";
  overflow?: string;
  resize?: string;

  // Animation properties
  animationName?: string;
  animationDuration?: string;
  animationDelay?: string;
  animationTimingFunction?: string;
  animationIterationCount?: string;
}

export interface GsapProps {
  type?: string;
  duration?: number;
  delay?: number;
  ease?: string;
  trigger?: "load" | "scroll" | "hover" | "click";
  
  // ScrollTrigger specific
  start?: string;
  end?: string;
  scrub?: boolean;
  pin?: boolean;
  markers?: boolean;

  // Draggable
  draggable?: "none" | "x" | "y" | "x,y" | "rotation";
  
  // Advanced
  stagger?: number;
  text?: string;
}

export interface EditorElement {
  id: string;
  type: ElementType;
  props: {
    text?: string;
    src?: string;
    href?: string;
    linkType?: "url" | "page" | "email" | "phone";
    target?: string;
    alt?: string;
    style: ElementStyle;
    gsap?: GsapProps;
    [key: string]: any;
  };
  children: EditorElement[];
}

export interface PageSettings {
  title: string;
  description: string;
  ogImage: string;
  favicon?: string;
}

export interface Page {
  id: string;
  name: string;
  path: string;
  seo: PageSettings;
  elements: EditorElement[];
}

export type Action =
  | {
      type: "ADD_ELEMENT";
      payload: { parentId: string; element: EditorElement };
    }
  | {
      type: "UPDATE_ELEMENT";
      payload: { id: string; props: Partial<EditorElement["props"]> };
    }
  | {
      type: "UPDATE_STYLE";
      payload: { id: string; style: Partial<ElementStyle> };
    }
  | { type: "REMOVE_ELEMENT"; payload: { id: string } }
  | { type: "SELECT_ELEMENT"; payload: { id: string | null } }
  | {
      type: "MOVE_ELEMENT";
      payload: {
        sourceId: string;
        targetId: string;
        position: "before" | "after" | "inside";
      };
    }
  | { type: "DUPLICATE_ELEMENT"; payload: { id: string } }
  | {
      type: "PASTE_STYLE";
      payload: { id: string; style: Partial<ElementStyle> };
    }
  | { type: "SET_PREVIEW_MODE"; payload: boolean }
  | { type: "SET_DEVICE_VIEW"; payload: "desktop" | "tablet" | "mobile" }
  | { type: "TOGGLE_GRID"; payload: boolean }
  | { type: "TOGGLE_THEME" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "LOAD_STATE"; payload: any }
  | { type: "COPY_ELEMENT"; payload: { id: string } }
  | { type: "PASTE_ELEMENT"; payload: { targetId?: string } }
  | { type: "ADD_PAGE"; payload: Page }
  | { type: "UPDATE_PAGE"; payload: { id: string; updates: Partial<Page> } }
  | { type: "DELETE_PAGE"; payload: string }
  | { type: "SWITCH_PAGE"; payload: string }
  | { type: "UPDATE_GLOBAL_SETTINGS"; payload: Partial<GlobalSettings> };

export interface GlobalSettings {
  googleSiteVerification?: string;
  customHeadCode?: string;
}

export interface EditorState {
  pages: Page[];
  currentPageId: string;
  elements: EditorElement[];
  selectedId: string | null;
  past: { elements: EditorElement[]; selectedId: string | null }[];
  future: { elements: EditorElement[]; selectedId: string | null }[];
  previewMode: boolean;
  deviceView: "desktop" | "tablet" | "mobile";
  showGrid: boolean;
  theme: "dark" | "light";
  globalSettings: GlobalSettings;
  copiedElement?: EditorElement | null;
}
