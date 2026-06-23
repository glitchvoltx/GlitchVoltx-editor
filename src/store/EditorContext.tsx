import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { EditorState, Action, EditorElement, Page } from '../types';
import { initialRootElement } from '../utils/elements';

const defaultPageId = 'page-1';

const defaultPage: Page = {
  id: defaultPageId,
  name: 'Home',
  path: '/',
  seo: { title: 'Home', description: '', ogImage: '', favicon: '' },
  elements: [initialRootElement],
};

export const initialState: EditorState = {
  pages: [defaultPage],
  currentPageId: defaultPageId,
  elements: [initialRootElement],
  selectedId: null,
  past: [],
  future: [],
  previewMode: false,
  deviceView: 'desktop',
  showGrid: false,
  theme: 'dark',
  globalSettings: {},
};

const findNodeAndPerform = (
  nodes: EditorElement[],
  id: string,
  callback: (node: EditorElement, parentNodes: EditorElement[], index: number) => void
): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      callback(nodes[i], nodes, i);
      return true;
    }
    if (nodes[i].children && nodes[i].children.length > 0) {
      if (findNodeAndPerform(nodes[i].children, id, callback)) {
        return true;
      }
    }
  }
  return false;
};

const editorReducer = (state: EditorState, action: Action): EditorState => {
  if (action.type === 'UNDO') {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);
    const newState = {
      ...state,
      elements: previous.elements,
      selectedId: previous.selectedId,
      past: newPast,
      future: [{ elements: state.elements, selectedId: state.selectedId }, ...state.future],
    };
    newState.pages = newState.pages.map(p => p.id === newState.currentPageId ? { ...p, elements: newState.elements } : p);
    return newState;
  }

  if (action.type === 'REDO') {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    const newState = {
      ...state,
      elements: next.elements,
      selectedId: next.selectedId,
      past: [...state.past, { elements: state.elements, selectedId: state.selectedId }],
      future: newFuture,
    };
    newState.pages = newState.pages.map(p => p.id === newState.currentPageId ? { ...p, elements: newState.elements } : p);
    return newState;
  }

  let newState = state;

  switch (action.type) {
    case 'SELECT_ELEMENT':
      newState = { ...state, selectedId: action.payload.id };
      break;

    case 'ADD_ELEMENT': {
      const newElements = JSON.parse(JSON.stringify(state.elements)); // Deep clone
      findNodeAndPerform(newElements, action.payload.parentId, (node) => {
        if (!node.children) node.children = [];
        node.children.push(action.payload.element);
      });
      newState = { ...state, elements: newElements, selectedId: action.payload.element.id };
      break;
    }

    case 'UPDATE_ELEMENT': {
      const newElements = JSON.parse(JSON.stringify(state.elements));
      findNodeAndPerform(newElements, action.payload.id, (node) => {
        node.props = { ...node.props, ...action.payload.props };
      });
      newState = { ...state, elements: newElements };
      break;
    }

    case 'UPDATE_STYLE': {
      const newElements = JSON.parse(JSON.stringify(state.elements));
      findNodeAndPerform(newElements, action.payload.id, (node) => {
        node.props.style = { ...node.props.style, ...action.payload.style };
      });
      newState = { ...state, elements: newElements };
      break;
    }

    case 'REMOVE_ELEMENT': {
      if (action.payload.id === 'root') { newState = state; break; }
      const newElements = JSON.parse(JSON.stringify(state.elements));
      findNodeAndPerform(newElements, action.payload.id, (node, parentNodes, index) => {
        parentNodes.splice(index, 1);
      });
      newState = { 
        ...state, 
        elements: newElements,
        selectedId: state.selectedId === action.payload.id ? null : state.selectedId
      };
      break;
    }

    case 'MOVE_ELEMENT': {
      const { sourceId, targetId, position } = action.payload;
      if (sourceId === targetId || sourceId === 'root') {
        newState = state;
        break;
      }

      const newElements = JSON.parse(JSON.stringify(state.elements));
      let sourceNodeToMove: EditorElement | null = null;

      // Find and remove the source node
      findNodeAndPerform(newElements, sourceId, (node, parentNodes, index) => {
        sourceNodeToMove = node;
        parentNodes.splice(index, 1);
      });

      if (!sourceNodeToMove) {
        newState = state;
        break;
      }

      // Check to prevent moving a parent into its own child
      let isInvalidMove = false;
      findNodeAndPerform([sourceNodeToMove], targetId, () => {
        isInvalidMove = true;
      });
      if (isInvalidMove) {
        newState = state; // Cannot move into a child!
        break;
      }

      // Insert into the new position
      if (position === 'inside') {
        findNodeAndPerform(newElements, targetId, (node) => {
          if (!node.children) node.children = [];
          node.children.push(sourceNodeToMove!);
        });
      } else {
        findNodeAndPerform(newElements, targetId, (node, parentNodes, index) => {
          if (position === 'before') {
            parentNodes.splice(index, 0, sourceNodeToMove!);
          } else {
            parentNodes.splice(index + 1, 0, sourceNodeToMove!);
          }
        });
      }

      newState = { ...state, elements: newElements };
      break;
    }

    case 'DUPLICATE_ELEMENT': {
      if (action.payload.id === 'root') { newState = state; break; }
      const newElements = JSON.parse(JSON.stringify(state.elements));
      let duplicatedNode: EditorElement | null = null;
      
      const generateNewIds = (node: EditorElement): EditorElement => {
        const newNode = { ...node, id: Math.random().toString(36).substr(2, 9) };
        if (newNode.children) {
          newNode.children = newNode.children.map(generateNewIds);
        }
        return newNode;
      };

      findNodeAndPerform(newElements, action.payload.id, (node, parentNodes, index) => {
        duplicatedNode = generateNewIds(JSON.parse(JSON.stringify(node)));
        parentNodes.splice(index + 1, 0, duplicatedNode);
      });

      if (duplicatedNode) {
        newState = { ...state, elements: newElements, selectedId: duplicatedNode.id };
      }
      break;
    }

    case 'COPY_ELEMENT': {
      if (action.payload.id === 'root') { newState = state; break; }
      let nodeToCopy: EditorElement | null = null;
      findNodeAndPerform(state.elements, action.payload.id, (node) => {
        nodeToCopy = JSON.parse(JSON.stringify(node));
      });
      if (nodeToCopy) {
        newState = { ...state, copiedElement: nodeToCopy };
      } else {
        newState = state;
      }
      break;
    }

    case 'PASTE_ELEMENT': {
      if (!state.copiedElement) { newState = state; break; }
      const newElements = JSON.parse(JSON.stringify(state.elements));
      const targetId = action.payload.targetId || state.selectedId || 'root';
      
      const generateNewIds = (node: EditorElement): EditorElement => {
        const newNode = { ...node, id: Math.random().toString(36).substr(2, 9) };
        if (newNode.children) {
          newNode.children = newNode.children.map(generateNewIds);
        }
        return newNode;
      };

      const elementToPaste = generateNewIds(JSON.parse(JSON.stringify(state.copiedElement)));
      let pasted = false;

      findNodeAndPerform(newElements, targetId, (node, parentNodes, index) => {
        if (node.type === 'container' || node.type === 'slideshow') { // if it accepts children, append inside
          if (!node.children) node.children = [];
          node.children.push(elementToPaste);
          pasted = true;
        } else {
          // paste next to the target element
          if (parentNodes) {
             parentNodes.splice(index + 1, 0, elementToPaste);
             pasted = true;
          }
        }
      });

      if (pasted) {
         newState = { ...state, elements: newElements, selectedId: elementToPaste.id };
      } else {
         newState = state;
      }
      break;
    }

    case 'PASTE_STYLE': {
      const newElements = JSON.parse(JSON.stringify(state.elements));
      findNodeAndPerform(newElements, action.payload.id, (node) => {
        node.props.style = { ...node.props.style, ...action.payload.style };
      });
      newState = { ...state, elements: newElements };
      break;
    }

    case 'LOAD_STATE': {
      if (Array.isArray(action.payload)) {
        newState = {
          ...state,
          elements: action.payload,
          pages: [{...defaultPage, elements: action.payload}],
          currentPageId: defaultPageId,
          selectedId: null
        };
      } else if (action.payload.pages) {
        const sanitizedPages = action.payload.pages.map((p: any) => ({
          ...p,
          seo: {
            title: p.seo?.title || p.name || "Page",
            description: p.seo?.description || "",
            ogImage: p.seo?.ogImage || "",
            favicon: p.seo?.favicon || ""
          }
        }));
        newState = {
          ...state,
          ...action.payload,
          pages: sanitizedPages,
          selectedId: null
        };
      }
      break;
    }

    case 'SET_PREVIEW_MODE':
      newState = { ...state, previewMode: action.payload };
      break;

    case 'SET_DEVICE_VIEW':
      newState = { ...state, deviceView: action.payload };
      break;

    case 'TOGGLE_GRID':
      newState = { ...state, showGrid: action.payload };
      break;

    case 'TOGGLE_THEME':
      newState = { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
      break;

    case 'ADD_PAGE':
      newState = {
        ...state,
        pages: [...state.pages, action.payload],
        currentPageId: action.payload.id,
        elements: action.payload.elements,
        selectedId: null
      };
      break;

    case 'UPDATE_PAGE':
      newState = {
        ...state,
        pages: state.pages.map(p => p.id === action.payload.id ? { ...p, ...action.payload.updates } : p)
      };
      break;

    case 'DELETE_PAGE': {
      const remainingPages = state.pages.filter(p => p.id !== action.payload);
      if (remainingPages.length === 0) break;
      const newActivePage = remainingPages[0];
      newState = {
        ...state,
        pages: remainingPages,
        ...(state.currentPageId === action.payload 
          ? { currentPageId: newActivePage.id, elements: newActivePage.elements, selectedId: null } 
          : {})
      };
      break;
    }

    case 'SWITCH_PAGE': {
      const page = state.pages.find(p => p.id === action.payload);
      if (page) {
        newState = {
          ...state,
          currentPageId: page.id,
          elements: page.elements,
          selectedId: null,
          past: [],
          future: []
        };
      }
      break;
    }

    case 'UPDATE_GLOBAL_SETTINGS': {
      newState = {
        ...state,
        globalSettings: {
          ...state.globalSettings,
          ...action.payload
        }
      };
      break;
    }

    default:
      return state;
  }

  const isMutating = ['ADD_ELEMENT', 'UPDATE_ELEMENT', 'UPDATE_STYLE', 'REMOVE_ELEMENT', 'MOVE_ELEMENT', 'DUPLICATE_ELEMENT', 'PASTE_ELEMENT', 'PASTE_STYLE', 'LOAD_STATE'].includes(action.type);
  
  if (newState.elements !== state.elements) {
    newState.pages = newState.pages.map(p => 
      p.id === newState.currentPageId ? { ...p, elements: newState.elements } : p
    );
  }

  if (isMutating && newState.elements !== state.elements) {
    const newPast = [...state.past, { elements: state.elements, selectedId: state.selectedId }];
    if (newPast.length > 50) {
      newPast.shift();
    }
    newState.past = newPast;
    newState.future = [];
  }

  return newState;
};

interface EditorContextProps {
  state: EditorState;
  dispatch: React.Dispatch<Action>;
}

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
