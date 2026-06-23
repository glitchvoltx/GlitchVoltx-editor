import React, { useState, useEffect } from "react";
import { useEditor } from "../store/EditorContext";
import { ElementStyle, EditorElement } from "../types";
import { Trash2, Plus, ArrowUp, ArrowDown, Sparkles, Settings2, Image as ImageIcon, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";

import { useTranslation } from "../i18n/TranslationContext";

const pxToNumber = (val?: string) =>
  val ? parseInt(val.replace("px", "")) : 0;
const addPx = (val: string | number) => (val ? `${val}px` : "0px");

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "";
};

const ColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div>
      <label className="block opacity-40 mb-1">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          className="w-8 h-8 rounded border dark:border-[#333] border-gray-300 dark:bg-[#252525] bg-white cursor-pointer p-0.5 shrink-0"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="text"
            className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-[11px]"
            value={value || ""}
            placeholder="#000000 or transparent"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="text-[9px] opacity-40 font-mono">
            RGB: {hexToRgb(value || "") || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
};

const BoxShadowEditor = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (val: string) => void;
}) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [blur, setBlur] = useState(0);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    if (value && value.includes("px")) {
      const parts = value.split(" ");
      if (parts.length >= 5) {
        setX(parseInt(parts[0]) || 0);
        setY(parseInt(parts[1]) || 0);
        setBlur(parseInt(parts[2]) || 0);
        setSpread(parseInt(parts[3]) || 0);
        setColor(parts[4] || "#000000");
      }
    }
  }, [value]);

  const handleChange = (
    nx: number,
    ny: number,
    nb: number,
    ns: number,
    nc: string,
  ) => {
    setX(nx);
    setY(ny);
    setBlur(nb);
    setSpread(ns);
    setColor(nc);
    onChange(`${nx}px ${ny}px ${nb}px ${ns}px ${nc}`);
  };

  return (
    <div className="space-y-2 dark:bg-[#0F0F0F] bg-gray-100 rounded-md border dark:border-[#2A2A2A] border-gray-200 p-2">
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          X{" "}
          <input
            type="number"
            value={x}
            onChange={(e) =>
              handleChange(
                parseInt(e.target.value) || 0,
                y,
                blur,
                spread,
                color,
              )
            }
            className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 p-1 mt-0.5 rounded"
          />
        </div>
        <div>
          Y{" "}
          <input
            type="number"
            value={y}
            onChange={(e) =>
              handleChange(
                x,
                parseInt(e.target.value) || 0,
                blur,
                spread,
                color,
              )
            }
            className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 p-1 mt-0.5 rounded"
          />
        </div>
        <div>
          Blur{" "}
          <input
            type="number"
            value={blur}
            onChange={(e) =>
              handleChange(x, y, parseInt(e.target.value) || 0, spread, color)
            }
            className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 p-1 mt-0.5 rounded"
          />
        </div>
        <div>
          Spread{" "}
          <input
            type="number"
            value={spread}
            onChange={(e) =>
              handleChange(x, y, blur, parseInt(e.target.value) || 0, color)
            }
            className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 p-1 mt-0.5 rounded"
          />
        </div>
      </div>
      <ColorPicker
        label="Shadow Color"
        value={color}
        onChange={(c) => handleChange(x, y, blur, spread, c)}
      />
    </div>
  );
};

const SpacingEditor = ({
  style,
  onChange,
  type,
}: {
  style: any;
  onChange: (key: any, val: any) => void;
  type: "padding" | "margin";
}) => {
  const t = style[`${type}Top`] ? parseInt(style[`${type}Top`]) : 0;
  const r = style[`${type}Right`] ? parseInt(style[`${type}Right`]) : 0;
  const b = style[`${type}Bottom`] ? parseInt(style[`${type}Bottom`]) : 0;
  const l = style[`${type}Left`] ? parseInt(style[`${type}Left`]) : 0;

  const update = (prop: string, val: string) => {
    onChange(`${type}${prop}`, val ? `${val}px` : "");
  };

  return (
    <div className="dark:bg-[#0F0F0F] bg-gray-100 rounded-md border dark:border-[#2A2A2A] border-gray-200 p-2 text-center text-[10px] relative mt-1">
      <div>
        <input
          type="number"
          className="w-10 dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 p-1 mx-auto text-center rounded block"
          placeholder="T"
          value={t || ""}
          onChange={(e) => update("Top", e.target.value)}
        />
      </div>
      <div className="flex justify-between my-1">
        <input
          type="number"
          className="w-10 dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 p-1 text-center rounded"
          placeholder="L"
          value={l || ""}
          onChange={(e) => update("Left", e.target.value)}
        />
        <span className="opacity-40 uppercase pt-1">{type}</span>
        <input
          type="number"
          className="w-10 dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 p-1 text-center rounded"
          placeholder="R"
          value={r || ""}
          onChange={(e) => update("Right", e.target.value)}
        />
      </div>
      <div>
        <input
          type="number"
          className="w-10 dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 p-1 mx-auto text-center rounded block"
          placeholder="B"
          value={b || ""}
          onChange={(e) => update("Bottom", e.target.value)}
        />
      </div>
    </div>
  );
};

const splitCommaSeparated = (str: string) => {
  const parts = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current) parts.push(current.trim());
  return parts;
};

const RepeatingOptions: React.FC<{
  isRepeating: boolean;
  repeatsCount: number;
  repeatingStyle: 'smooth' | 'sharp';
  onChange: (updates: any) => void;
}> = ({ isRepeating, repeatsCount, repeatingStyle, onChange }) => {
  return (
    <div className="pt-2.5 mt-2 border-t dark:border-zinc-800/60 border-gray-200/80 space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="grad-repeat-toggle" className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 cursor-pointer flex items-center gap-1.5 uppercase tracking-wider">
          🔁 Custom Repeat Pattern
        </label>
        <button
          type="button"
          id="grad-repeat-toggle"
          onClick={() => onChange({ isRepeating: !isRepeating })}
          className={`px-1.5 py-0.5 text-[9px] rounded font-bold cursor-pointer transition-all ${
            isRepeating 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'bg-gray-200/80 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:text-gray-770 dark:hover:text-gray-200'
          }`}
        >
          {isRepeating ? 'Active' : 'Disabled'}
        </button>
      </div>

      {isRepeating && (
        <div className="space-y-2 bg-white dark:bg-zinc-900 border dark:border-zinc-850 border-gray-200 rounded p-2 mt-1">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-gray-500 font-medium">Repeats Pattern:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{repeatsCount} times</span>
            </div>
            <input 
              type="range"
              min="1"
              max="30"
              value={repeatsCount}
              onChange={(e) => onChange({ repeatsCount: parseInt(e.target.value) })}
              className="w-full h-1 bg-gray-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="text-[8px] text-gray-400 dark:text-gray-500 leading-none">
              Repeats every {(100 / repeatsCount).toFixed(1)}% of the background.
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[8px] text-gray-400 uppercase font-semibold">Color Wave Style</label>
            <div className="grid grid-cols-2 gap-1 bg-gray-100 dark:bg-zinc-950/20 rounded p-0.5 border dark:border-zinc-800 border-gray-200">
              {(['smooth', 'sharp'] as const).map((styleOpt) => (
                <button
                  key={styleOpt}
                  type="button"
                  onClick={() => onChange({ repeatingStyle: styleOpt })}
                  className={`py-0.5 text-[8px] font-semibold rounded capitalize cursor-pointer transition-all ${
                    repeatingStyle === styleOpt 
                      ? 'bg-white dark:bg-zinc-900 text-indigo-650 dark:text-white shadow-xs' 
                      : 'text-gray-400 hover:text-gray-650 dark:hover:text-gray-300'
                  }`}
                >
                  {styleOpt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BackgroundStyleEditor: React.FC<{
  style: any;
  onChange: (keyOrStyles: keyof ElementStyle | Partial<ElementStyle>, value?: any) => void;
}> = ({ style, onChange }) => {
  const { t } = useTranslation();
  const [bgType, setBgType] = useState<'solid' | 'linear' | 'radial' | 'image'>('solid');
  const [color1, setColor1] = useState('#6a11cb');
  const [color2, setColor2] = useState('#2575fc');
  const [color3, setColor3] = useState('#fa709a');
  const [hasColor3, setHasColor3] = useState(false);
  const [direction, setDirection] = useState('to right');
  const [angle, setAngle] = useState(90);
  const [isCustomAngle, setIsCustomAngle] = useState(false);
  const [shape, setShape] = useState('circle');
  const [position, setPosition] = useState('center');
  const [imageUrl, setImageUrl] = useState('');
  const [bgSize, setBgSize] = useState('cover');
  const [bgSizeCustom, setBgSizeCustom] = useState('100%');
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [bgPositionX, setBgPositionX] = useState(50);
  const [bgPositionY, setBgPositionY] = useState(50);
  const [isCustomPosition, setIsCustomPosition] = useState(false);
  const [bgRepeat, setBgRepeat] = useState('no-repeat');
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatsCount, setRepeatsCount] = useState(5);
  const [repeatingStyle, setRepeatingStyle] = useState<'smooth' | 'sharp'>('smooth');

  useEffect(() => {
    const bg = style.backgroundImage || '';
    const size = style.backgroundSize || 'cover';
    const pos = style.backgroundPosition || 'center';
    const rep = style.backgroundRepeat || 'no-repeat';

    if (!bg) {
      setBgType('solid');
      setIsRepeating(false);
      return;
    }

    if (bg.startsWith('linear-gradient') || bg.startsWith('repeating-linear-gradient')) {
      setBgType('linear');
      const isRep = bg.startsWith('repeating-linear-gradient');
      setIsRepeating(isRep);
      const match = bg.match(/\((.*)\)/);
      if (match && match[1]) {
        const parts = splitCommaSeparated(match[1]);
        let first = parts[0];
        let colorStartIndex = 0;
        
        if (first && (first.includes('to ') || first.includes('deg') || /^\d+$/.test(first))) {
          colorStartIndex = 1;
          if (first.includes('deg')) {
            setIsCustomAngle(true);
            const degVal = parseInt(first) || 90;
            setAngle(degVal);
          } else {
            setIsCustomAngle(false);
            setDirection(first);
          }
        } else {
          setIsCustomAngle(false);
          setDirection('to right');
        }
        
        const colors = parts.slice(colorStartIndex);
        const cleanedColors = colors.map(c => {
          const firstWord = c.trim().split(/\s+/)[0];
          return firstWord;
        });

        if (cleanedColors[0]) setColor1(cleanedColors[0]);
        if (cleanedColors[1]) setColor2(cleanedColors[1]);
        if (cleanedColors[2]) {
          setColor3(cleanedColors[2]);
          setHasColor3(true);
        } else {
          setHasColor3(false);
        }

        if (isRep) {
          const lastPart = colors[colors.length - 1];
          const pctMatch = lastPart.match(/([\d\.]+)%/);
          if (pctMatch) {
            const pctVal = parseFloat(pctMatch[1]);
            if (pctVal > 0) {
              const count = Math.round(100 / pctVal);
              if (count >= 1 && count <= 30) {
                setRepeatsCount(count);
              }
            }
          }
          const hasDuplicates = colors.some((c, idx) => {
            const spl = c.trim().split(/\s+/);
            const nextSpl = colors[idx + 1]?.trim().split(/\s+/);
            return spl[0] === nextSpl?.[0];
          });
          setRepeatingStyle(hasDuplicates ? 'sharp' : 'smooth');
        }
      }
    } else if (bg.startsWith('radial-gradient') || bg.startsWith('repeating-radial-gradient')) {
      setBgType('radial');
      const isRep = bg.startsWith('repeating-radial-gradient');
      setIsRepeating(isRep);
      const match = bg.match(/\((.*)\)/);
      if (match && match[1]) {
        const parts = splitCommaSeparated(match[1]);
        let first = parts[0];
        let colorStartIndex = 0;
        
        if (first && (first.includes('circle') || first.includes('ellipse') || first.includes('at '))) {
          colorStartIndex = 1;
          if (first.includes('ellipse')) {
            setShape('ellipse');
          } else {
            setShape('circle');
          }
          const atIdx = first.indexOf('at ');
          if (atIdx !== -1) {
            const posPart = first.substring(atIdx + 3).trim();
            if (posPart.includes('%')) {
              setIsCustomPosition(true);
              const xy = posPart.split(/\s+/);
              if (xy[0]) setBgPositionX(parseInt(xy[0]) || 50);
              if (xy[1]) setBgPositionY(parseInt(xy[1]) || 50);
            } else {
              setIsCustomPosition(false);
              setPosition(posPart);
            }
          }
        }
        
        const colors = parts.slice(colorStartIndex);
        const cleanedColors = colors.map(c => {
          const firstWord = c.trim().split(/\s+/)[0];
          return firstWord;
        });

        if (cleanedColors[0]) setColor1(cleanedColors[0]);
        if (cleanedColors[1]) setColor2(cleanedColors[1]);
        if (cleanedColors[2]) {
          setColor3(cleanedColors[2]);
          setHasColor3(true);
        } else {
          setHasColor3(false);
        }

        if (isRep) {
          const lastPart = colors[colors.length - 1];
          const pctMatch = lastPart.match(/([\d\.]+)%/);
          if (pctMatch) {
            const pctVal = parseFloat(pctMatch[1]);
            if (pctVal > 0) {
              const count = Math.round(100 / pctVal);
              if (count >= 1 && count <= 30) {
                setRepeatsCount(count);
              }
            }
          }
          const hasDuplicates = colors.some((c, idx) => {
            const spl = c.trim().split(/\s+/);
            const nextSpl = colors[idx + 1]?.trim().split(/\s+/);
            return spl[0] === nextSpl?.[0];
          });
          setRepeatingStyle(hasDuplicates ? 'sharp' : 'smooth');
        }
      }
    } else if (bg.startsWith('url')) {
      setBgType('image');
      setIsRepeating(false);
      const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
      if (match && match[1]) {
        setImageUrl(match[1]);
      }
      
      if (size === 'cover' || size === 'contain' || size === 'auto') {
        setIsCustomSize(false);
        setBgSize(size);
      } else {
        setIsCustomSize(true);
        setBgSizeCustom(size);
      }
      
      if (pos.includes('%')) {
        setIsCustomPosition(true);
        const xy = pos.split(/\s+/);
        if (xy[0]) setBgPositionX(parseInt(xy[0]) || 50);
        if (xy[1]) setBgPositionY(parseInt(xy[1]) || 50);
      } else {
        setIsCustomPosition(false);
        setPosition(pos);
      }
      
      setBgRepeat(rep);
    }
  }, [style.backgroundImage, style.backgroundSize, style.backgroundPosition, style.backgroundRepeat]);

  const applyChanges = (updates: any) => {
    const config = {
      type: updates.bgType !== undefined ? updates.bgType : bgType,
      color1: updates.color1 !== undefined ? updates.color1 : color1,
      color2: updates.color2 !== undefined ? updates.color2 : color2,
      color3: updates.color3 !== undefined ? updates.color3 : color3,
      hasColor3: updates.hasColor3 !== undefined ? updates.hasColor3 : hasColor3,
      direction: updates.direction !== undefined ? updates.direction : direction,
      angle: updates.angle !== undefined ? updates.angle : angle,
      isCustomAngle: updates.isCustomAngle !== undefined ? updates.isCustomAngle : isCustomAngle,
      shape: updates.shape !== undefined ? updates.shape : shape,
      position: updates.position !== undefined ? updates.position : position,
      imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : imageUrl,
      bgSize: updates.bgSize !== undefined ? updates.bgSize : bgSize,
      bgSizeCustom: updates.bgSizeCustom !== undefined ? updates.bgSizeCustom : bgSizeCustom,
      isCustomSize: updates.isCustomSize !== undefined ? updates.isCustomSize : isCustomSize,
      bgPositionX: updates.bgPositionX !== undefined ? updates.bgPositionX : bgPositionX,
      bgPositionY: updates.bgPositionY !== undefined ? updates.bgPositionY : bgPositionY,
      isCustomPosition: updates.isCustomPosition !== undefined ? updates.isCustomPosition : isCustomPosition,
      bgRepeat: updates.bgRepeat !== undefined ? updates.bgRepeat : bgRepeat,
      isRepeating: updates.isRepeating !== undefined ? updates.isRepeating : isRepeating,
      repeatsCount: updates.repeatsCount !== undefined ? updates.repeatsCount : repeatsCount,
      repeatingStyle: updates.repeatingStyle !== undefined ? updates.repeatingStyle : repeatingStyle,
    };

    if (updates.bgType !== undefined) setBgType(updates.bgType);
    if (updates.color1 !== undefined) setColor1(updates.color1);
    if (updates.color2 !== undefined) setColor2(updates.color2);
    if (updates.color3 !== undefined) setColor3(updates.color3);
    if (updates.hasColor3 !== undefined) setHasColor3(updates.hasColor3);
    if (updates.direction !== undefined) setDirection(updates.direction);
    if (updates.angle !== undefined) setAngle(updates.angle);
    if (updates.isCustomAngle !== undefined) setIsCustomAngle(updates.isCustomAngle);
    if (updates.shape !== undefined) setShape(updates.shape);
    if (updates.position !== undefined) setPosition(updates.position);
    if (updates.imageUrl !== undefined) setImageUrl(updates.imageUrl);
    if (updates.bgSize !== undefined) setBgSize(updates.bgSize);
    if (updates.bgSizeCustom !== undefined) setBgSizeCustom(updates.bgSizeCustom);
    if (updates.isCustomSize !== undefined) setIsCustomSize(updates.isCustomSize);
    if (updates.bgPositionX !== undefined) setBgPositionX(updates.bgPositionX);
    if (updates.bgPositionY !== undefined) setBgPositionY(updates.bgPositionY);
    if (updates.isCustomPosition !== undefined) setIsCustomPosition(updates.isCustomPosition);
    if (updates.bgRepeat !== undefined) setBgRepeat(updates.bgRepeat);
    if (updates.isRepeating !== undefined) setIsRepeating(updates.isRepeating);
    if (updates.repeatsCount !== undefined) setRepeatsCount(updates.repeatsCount);
    if (updates.repeatingStyle !== undefined) setRepeatingStyle(updates.repeatingStyle);

    if (config.type === 'solid') {
      onChange({
        backgroundImage: '',
        backgroundSize: '',
        backgroundPosition: '',
        backgroundRepeat: ''
      });
    } else if (config.type === 'linear') {
      const dirStr = config.isCustomAngle ? `${config.angle}deg` : config.direction;
      let colorsStr = '';
      if (config.isRepeating) {
        const period = parseFloat((100 / config.repeatsCount).toFixed(2));
        if (config.repeatingStyle === 'sharp') {
          if (config.hasColor3 && config.color3) {
            const stop1 = parseFloat((period / 3).toFixed(2));
            const stop2 = parseFloat(((period * 2) / 3).toFixed(2));
            colorsStr = `${config.color1} 0%, ${config.color1} ${stop1}%, ${config.color3} ${stop1}%, ${config.color3} ${stop2}%, ${config.color2} ${stop2}%, ${config.color2} ${period}%`;
          } else {
            const stop1 = parseFloat((period / 2).toFixed(2));
            colorsStr = `${config.color1} 0%, ${config.color1} ${stop1}%, ${config.color2} ${stop1}%, ${config.color2} ${period}%`;
          }
        } else {
          if (config.hasColor3 && config.color3) {
            const stop1 = parseFloat((period / 2).toFixed(2));
            colorsStr = `${config.color1} 0%, ${config.color3} ${stop1}%, ${config.color2} ${period}%`;
          } else {
            colorsStr = `${config.color1} 0%, ${config.color2} ${period}%`;
          }
        }
      } else {
        colorsStr = config.hasColor3 && config.color3 ? `${config.color1}, ${config.color2}, ${config.color3}` : `${config.color1}, ${config.color2}`;
      }

      const gradFunc = config.isRepeating ? 'repeating-linear-gradient' : 'linear-gradient';
      onChange({
        backgroundImage: `${gradFunc}(${dirStr}, ${colorsStr})`,
        backgroundSize: '',
        backgroundPosition: '',
        backgroundRepeat: ''
      });
    } else if (config.type === 'radial') {
      const posStr = config.isCustomPosition ? `${config.bgPositionX}% ${config.bgPositionY}%` : config.position;
      let colorsStr = '';
      if (config.isRepeating) {
        const period = parseFloat((100 / config.repeatsCount).toFixed(2));
        if (config.repeatingStyle === 'sharp') {
          if (config.hasColor3 && config.color3) {
            const stop1 = parseFloat((period / 3).toFixed(2));
            const stop2 = parseFloat(((period * 2) / 3).toFixed(2));
            colorsStr = `${config.color1} 0%, ${config.color1} ${stop1}%, ${config.color3} ${stop1}%, ${config.color3} ${stop2}%, ${config.color2} ${stop2}%, ${config.color2} ${period}%`;
          } else {
            const stop1 = parseFloat((period / 2).toFixed(2));
            colorsStr = `${config.color1} 0%, ${config.color1} ${stop1}%, ${config.color2} ${stop1}%, ${config.color2} ${period}%`;
          }
        } else {
          if (config.hasColor3 && config.color3) {
            const stop1 = parseFloat((period / 2).toFixed(2));
            colorsStr = `${config.color1} 0%, ${config.color3} ${stop1}%, ${config.color2} ${period}%`;
          } else {
            colorsStr = `${config.color1} 0%, ${config.color2} ${period}%`;
          }
        }
      } else {
        colorsStr = config.hasColor3 && config.color3 ? `${config.color1}, ${config.color2}, ${config.color3}` : `${config.color1}, ${config.color2}`;
      }

      const gradFunc = config.isRepeating ? 'repeating-radial-gradient' : 'radial-gradient';
      onChange({
        backgroundImage: `${gradFunc}(${config.shape} at ${posStr}, ${colorsStr})`,
        backgroundSize: '',
        backgroundPosition: '',
        backgroundRepeat: ''
      });
    } else if (config.type === 'image') {
      const imgVal = config.imageUrl ? `url(${config.imageUrl})` : '';
      const sizeVal = config.isCustomSize ? config.bgSizeCustom : config.bgSize;
      const posVal = config.isCustomPosition ? `${config.bgPositionX}% ${config.bgPositionY}%` : config.position;
      onChange({
        backgroundImage: imgVal,
        backgroundSize: sizeVal,
        backgroundPosition: posVal,
        backgroundRepeat: config.bgRepeat
      });
    }
  };

  const gradientPresets = [
    { name: 'Sunset Glow', css: 'linear-gradient(to right, #ff7e5f, #feb47b)' },
    { name: 'Royal Indigo', css: 'linear-gradient(to right, #6a11cb, #2575fc)' },
    { name: 'Mint Forest', css: 'linear-gradient(to right, #43e97b, #38f9d7)' },
    { name: 'Cyberpunk', css: 'linear-gradient(to right, #fa709a, #fee140)' },
    { name: 'Radial Glow', css: 'radial-gradient(circle at center, #2e026d, #11001c)' },
  ];

  const imagePresets = [
    { name: 'Abstract Light', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop' },
    { name: 'Dark Nebula', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=800&auto=format&fit=crop' },
    { name: 'Warm Silk', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop' },
    { name: 'Nordic Forest', url: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=800&auto=format&fit=crop' },
  ];

  return (
    <div className="space-y-3 pt-2">
      <div>
        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">
          Background Pattern & Fills
        </label>
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-gray-100 dark:bg-zinc-900 rounded-lg">
          {(['solid', 'linear', 'radial', 'image'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => applyChanges({ bgType: t })}
              className={`py-1 text-[10px] font-semibold rounded capitalize cursor-pointer transition-all ${
                bgType === t 
                  ? 'bg-white dark:bg-[#1a1a1a] text-indigo-650 dark:text-white shadow-sm font-bold' 
                  : 'text-gray-500 hover:text-gray-750 dark:hover:text-gray-300'
              }`}
            >
              {t === 'solid' ? 'none' : t}
            </button>
          ))}
        </div>
      </div>

      {(bgType === 'linear' || bgType === 'radial') && (
        <div className="space-y-1">
          <label className="block text-[10px] opacity-50 font-medium">Gradient Presets</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {gradientPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange('backgroundImage', preset.css);
                  toast.success(`Applied ${preset.name}!`);
                }}
                className="w-10 h-8 rounded shrink-0 border border-black/10 dark:border-white/10 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                style={{ backgroundImage: preset.css }}
                title={preset.name}
              />
            ))}
          </div>
        </div>
      )}

      {bgType === 'image' && (
        <div className="space-y-1">
          <label className="block text-[10px] opacity-50 font-medium">Quick Textures</label>
          <div className="grid grid-cols-4 gap-1">
            {imagePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyChanges({ bgType: 'image', imageUrl: preset.url })}
                className="group relative h-7 rounded overflow-hidden border border-black/10 dark:border-white/10 hover:border-indigo-500 transition-all cursor-pointer shadow-sm"
                title={preset.name}
              >
                <img 
                  src={preset.url} 
                  alt={preset.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {bgType === 'solid' && (
        <div className="p-2 rounded-lg border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 text-[10px] text-gray-400 dark:text-gray-500 leading-normal">
          No image or gradient is active. Use the standalone colored background selector above to paint a solid background on this element.
        </div>
      )}

      {bgType === 'linear' && (
        <div className="space-y-3 bg-gray-50/50 dark:bg-zinc-950/15 p-2 rounded-lg border border-gray-200 dark:border-zinc-900">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] opacity-50 mb-1">Color 1</label>
              <div className="flex items-center gap-1">
                <input 
                  type="color" 
                  value={color1} 
                  onChange={(e) => applyChanges({ color1: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border dark:border-[#333] border-gray-300 dark:bg-[#252525] p-0 shrink-0"
                />
                <input 
                  type="text" 
                  value={color1} 
                  onChange={(e) => applyChanges({ color1: e.target.value })}
                  className="w-full min-w-0 dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded p-1 text-[9px] font-mono outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] opacity-50 mb-1">Color 2</label>
              <div className="flex items-center gap-1">
                <input 
                  type="color" 
                  value={color2} 
                  onChange={(e) => applyChanges({ color2: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border dark:border-[#333] border-gray-300 dark:bg-[#252525] p-0 shrink-0"
                />
                <input 
                  type="text" 
                  value={color2} 
                  onChange={(e) => applyChanges({ color2: e.target.value })}
                  className="w-full min-w-0 dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded p-1 text-[9px] font-mono outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <input 
              type="checkbox" 
              id="grad-3-col"
              checked={hasColor3} 
              onChange={(e) => applyChanges({ hasColor3: e.target.checked })}
              className="rounded dark:bg-zinc-900 border dark:border-[#333] border-gray-300"
            />
            <label htmlFor="grad-3-col" className="text-[10px] font-medium text-gray-500 dark:text-gray-400 cursor-pointer">
              Enable 3-color stop
            </label>
          </div>

          {hasColor3 && (
            <div className="p-1.5 bg-white dark:bg-zinc-900 border dark:border-zinc-850 border-gray-200 rounded">
              <label className="block text-[9px] opacity-50 mb-1">Color 3 (Center)</label>
              <div className="flex items-center gap-1">
                <input 
                  type="color" 
                  value={color3} 
                  onChange={(e) => applyChanges({ color3: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border dark:border-[#333] border-gray-300 p-0 shrink-0"
                />
                <input 
                  type="text" 
                  value={color3} 
                  onChange={(e) => applyChanges({ color3: e.target.value })}
                  className="w-full min-w-0 dark:bg-[#1a1a1a] border dark:border-[#333] border-gray-300 rounded p-1 text-[9px] font-mono outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-2 border-t dark:border-zinc-800/60 border-gray-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold">Direction Angle</span>
              <button
                type="button"
                onClick={() => applyChanges({ isCustomAngle: !isCustomAngle })}
                className="text-[9px] text-indigo-500 hover:underline"
              >
                {isCustomAngle ? 'Simple Presets' : 'Custom Slider'}
              </button>
            </div>

            {!isCustomAngle ? (
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                {[
                  { label: 'Left to Right', val: 'to right' },
                  { label: 'Top to Bottom', val: 'to bottom' },
                  { label: 'Diagonal Down', val: 'to bottom right' },
                  { label: 'Diagonal Up', val: 'to top right' }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => applyChanges({ direction: preset.val })}
                    className={`p-1 border dark:border-[#2a2a2a] border-gray-200 rounded text-[9px] cursor-pointer transition-all ${
                      direction === preset.val 
                        ? 'bg-indigo-50/70 border-indigo-400 text-indigo-750 dark:bg-indigo-950/20 dark:border-indigo-650 dark:text-indigo-300 font-bold' 
                        : 'dark:bg-zinc-950/10 bg-white text-gray-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[8px] font-mono">
                  <span className="opacity-50">Degree Rotation:</span>
                  <span className="text-indigo-500 font-bold">{angle}°</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => applyChanges({ angle: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            )}
          </div>

          <RepeatingOptions
            isRepeating={isRepeating}
            repeatsCount={repeatsCount}
            repeatingStyle={repeatingStyle}
            onChange={applyChanges}
          />
        </div>
      )}

      {bgType === 'radial' && (
        <div className="space-y-3 bg-gray-50/50 dark:bg-zinc-950/15 p-2 rounded-lg border border-gray-200 dark:border-zinc-900">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] opacity-50 mb-1">Color 1 (Inner)</label>
              <div className="flex items-center gap-1">
                <input 
                  type="color" 
                  value={color1} 
                  onChange={(e) => applyChanges({ color1: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border dark:border-[#333] border-gray-300 p-0 shrink-0"
                />
                <input 
                  type="text" 
                  value={color1} 
                  onChange={(e) => applyChanges({ color1: e.target.value })}
                  className="w-full min-w-0 dark:bg-[#1a1a1a] border dark:border-[#333] border-gray-300 rounded p-1 text-[9px] font-mono outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] opacity-50 mb-1">Color 2 (Outer)</label>
              <div className="flex items-center gap-1">
                <input 
                  type="color" 
                  value={color2} 
                  onChange={(e) => applyChanges({ color2: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border dark:border-[#333] border-gray-300 p-0 shrink-0"
                />
                <input 
                  type="text" 
                  value={color2} 
                  onChange={(e) => applyChanges({ color2: e.target.value })}
                  className="w-full min-w-0 dark:bg-[#1a1a1a] border dark:border-[#333] border-gray-300 rounded p-1 text-[9px] font-mono outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <input 
              type="checkbox" 
              id="rad-3-col"
              checked={hasColor3} 
              onChange={(e) => applyChanges({ hasColor3: e.target.checked })}
              className="rounded dark:bg-zinc-900 border dark:border-[#333] border-gray-300"
            />
            <label htmlFor="rad-3-col" className="text-[10px] font-medium text-gray-500 dark:text-gray-400 cursor-pointer">
              Enable 3-color stop
            </label>
          </div>

          {hasColor3 && (
            <div className="p-1.5 bg-white dark:bg-zinc-900 border dark:border-zinc-850 border-gray-200 rounded">
              <label className="block text-[9px] opacity-50 mb-1">Color 3 (Outer Rim)</label>
              <div className="flex items-center gap-1">
                <input 
                  type="color" 
                  value={color3} 
                  onChange={(e) => applyChanges({ color3: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border dark:border-[#333] border-gray-300 p-0 shrink-0"
                />
                <input 
                  type="text" 
                  value={color3} 
                  onChange={(e) => applyChanges({ color3: e.target.value })}
                  className="w-full min-w-0 dark:bg-[#1a1a1a] border dark:border-[#333] border-gray-300 rounded p-1 text-[9px] font-mono outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-2 border-t dark:border-zinc-800/60 border-gray-200 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] opacity-50 mb-1">Shape Pattern</label>
              <select
                value={shape}
                onChange={(e) => applyChanges({ shape: e.target.value })}
                className="w-full text-[10px] dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded p-1 outline-none"
              >
                <option value="circle">Perfect Circle</option>
                <option value="ellipse">Responsive Ellipse</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] opacity-50 mb-1">Focus Position</label>
              <select
                value={isCustomPosition ? 'custom' : position}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    applyChanges({ isCustomPosition: true });
                  } else {
                    applyChanges({ isCustomPosition: false, position: e.target.value });
                  }
                }}
                className="w-full text-[10px] dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded p-1 outline-none"
              >
                <option value="center">Dead Center</option>
                <option value="top">Top Center</option>
                <option value="bottom">Bottom Center</option>
                <option value="left">Left Edge</option>
                <option value="right">Right Edge</option>
                <option value="custom">🧭 Set Offset %</option>
              </select>
            </div>
          </div>

          {isCustomPosition && (
            <div className="space-y-2 p-2 bg-white dark:bg-zinc-900 border dark:border-zinc-850 border-gray-200 rounded">
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono">
                  <span>Horizontal Focal Center:</span>
                  <span>{bgPositionX}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={bgPositionX}
                  onChange={(e) => applyChanges({ bgPositionX: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono">
                  <span>Vertical Focal Center:</span>
                  <span>{bgPositionY}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={bgPositionY}
                  onChange={(e) => applyChanges({ bgPositionY: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          )}

          <RepeatingOptions
            isRepeating={isRepeating}
            repeatsCount={repeatsCount}
            repeatingStyle={repeatingStyle}
            onChange={applyChanges}
          />
        </div>
      )}

      {bgType === 'image' && (
        <div className="space-y-3 bg-gray-50/50 dark:bg-zinc-950/15 p-2 rounded-lg border border-gray-200 dark:border-zinc-900">
          <div>
            <label className="block text-[9px] opacity-50 mb-1">Image Address Link</label>
            <input 
              type="text"
              value={imageUrl}
              placeholder="Paste custom unsplash or web URL..."
              onChange={(e) => applyChanges({ imageUrl: e.target.value })}
              className="w-full text-[10px] dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded p-1 outline-none shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] opacity-50 mb-1">Image Scale</label>
              <select
                value={isCustomSize ? 'custom' : bgSize}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    applyChanges({ isCustomSize: true, bgSizeCustom: '100% 100%' });
                  } else {
                    applyChanges({ isCustomSize: false, bgSize: e.target.value });
                  }
                }}
                className="w-full text-[10px] dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded p-1 outline-none"
              >
                <option value="cover">Default Cover</option>
                <option value="contain">Contain (Full view)</option>
                <option value="auto">Original Size</option>
                <option value="custom">🔍 Custom Width %</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] opacity-50 mb-1">Tiling Loop</label>
              <select
                value={bgRepeat}
                onChange={(e) => applyChanges({ bgRepeat: e.target.value })}
                className="w-full text-[10px] dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded p-1 outline-none"
              >
                <option value="no-repeat">Disable Tiling</option>
                <option value="repeat">Tile Every Side</option>
                <option value="repeat-x">Repeat Horizontally</option>
                <option value="repeat-y">Repeat Vertically</option>
              </select>
            </div>
          </div>

          {isCustomSize && (
            <div className="space-y-1 p-2 bg-white dark:bg-zinc-900 border dark:border-zinc-850 border-gray-200 rounded">
              <div className="flex justify-between text-[8px] font-mono">
                <span>Scaling Value Width:</span>
                <span className="text-indigo-500 font-bold">{bgSizeCustom}</span>
              </div>
              <input 
                type="range"
                min="10"
                max="300"
                value={parseInt(bgSizeCustom) || 100}
                onChange={(e) => applyChanges({ bgSizeCustom: `${e.target.value}%` })}
                className="w-full h-1 bg-gray-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          )}

          <div>
            <label className="block text-[9px] opacity-50 mb-1">Image Align Focus</label>
            <select
              value={isCustomPosition ? 'custom' : position}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  applyChanges({ isCustomPosition: true });
                } else {
                  applyChanges({ isCustomPosition: false, position: e.target.value });
                }
              }}
              className="w-full text-[10px] dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded p-1 outline-none"
            >
              <option value="center">{t("Center")}</option>
              <option value="top">Top Anchored</option>
              <option value="bottom">Bottom Anchored</option>
              <option value="left">Left Anchored</option>
              <option value="right">Right Anchored</option>
              <option value="custom">🧭 Set Focal Offset %</option>
            </select>
          </div>

          {isCustomPosition && (
            <div className="space-y-2 p-2 bg-white dark:bg-zinc-900 border dark:border-zinc-850 border-gray-200 rounded">
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono">
                  <span>Horizontal Alignment:</span>
                  <span>{bgPositionX}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={bgPositionX}
                  onChange={(e) => applyChanges({ bgPositionX: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono">
                  <span>Vertical Alignment:</span>
                  <span>{bgPositionY}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={bgPositionY}
                  onChange={(e) => applyChanges({ bgPositionY: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

let copiedStyle: Partial<ElementStyle> | null = null;

export const RightSidebar: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { t } = useTranslation();
  const [newSlideUrl, setNewSlideUrl] = useState("");

  const getSelectedNode = (
    nodes: EditorElement[],
    id: string,
  ): EditorElement | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const sub = getSelectedNode(node.children, id);
        if (sub) return sub;
      }
    }
    return null;
  };

  const selectedNode = state.selectedId
    ? getSelectedNode(state.elements, state.selectedId)
    : null;

  if (!selectedNode) {
    return (
      <div className="w-80 dark:bg-[#181818] bg-gray-50 border-l dark:border-[#2A2A2A] border-gray-200 p-6 flex flex-col h-full items-center justify-center text-gray-500 text-center text-[11px]">
        <p>{t("sidebar.noElement") || "No element selected."}</p>
        <p className="opacity-60 mt-2">
          {t("sidebar.noElementDesc") || "Click on an element on the canvas to edit its properties."}
        </p>
      </div>
    );
  }

  const handleStyleChange = (keyOrStyles: keyof ElementStyle | Partial<ElementStyle>, value?: any) => {
    const styleUpdate =
      typeof keyOrStyles === "string" ? { [keyOrStyles]: value } : keyOrStyles;
    dispatch({
      type: "UPDATE_STYLE",
      payload: { id: selectedNode.id, style: styleUpdate },
    });
  };

  const handlePropChange = (key: string, value: any) => {
    dispatch({
      type: "UPDATE_ELEMENT",
      payload: { id: selectedNode.id, props: { [key]: value } },
    });
  };

  const handleGsapChange = (key: string, value: any) => {
    const currentGsap = selectedNode.props.gsap || {};
    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        id: selectedNode.id,
        props: { gsap: { ...currentGsap, [key]: value } },
      },
    });
  };

  const handleDelete = () => {
    dispatch({ type: "REMOVE_ELEMENT", payload: { id: selectedNode.id } });
  };

  const handleDuplicate = () => {
    dispatch({ type: "DUPLICATE_ELEMENT", payload: { id: selectedNode.id } });
  };

  const handleCopyElement = () => {
    dispatch({ type: "COPY_ELEMENT", payload: { id: selectedNode.id } });
  };

  const handlePasteElement = () => {
    dispatch({ type: "PASTE_ELEMENT", payload: { targetId: selectedNode.id } });
  };

  const handleCopyStyle = () => {
    copiedStyle = JSON.parse(JSON.stringify(selectedNode.props.style));
  };

  const handlePasteStyle = () => {
    if (copiedStyle) {
      dispatch({
        type: "PASTE_STYLE",
        payload: { id: selectedNode.id, style: copiedStyle },
      });
    }
  };

  const style = selectedNode.props.style;

  return (
    <div className="w-80 dark:bg-[#181818] bg-gray-50 border-l dark:border-[#2A2A2A] border-gray-200 flex flex-col h-full overflow-y-auto text-[11px] dark:text-gray-300 text-gray-700">
      <div className="p-3 border-b dark:border-[#2A2A2A] border-gray-200 flex items-center justify-between sticky top-0 dark:bg-[#181818] bg-gray-50 z-10 font-semibold gap-2">
        <div>
          <span className="dark:text-white text-gray-900 capitalize text-sm">
            {selectedNode.type}
          </span>
          <p className="text-[10px] opacity-40 font-mono mt-0.5">
            {selectedNode.id.substring(0, 8)}
          </p>
        </div>
        <div className="flex gap-1 flex-wrap justify-end max-w-[150px]">
          <button
            onClick={handleCopyStyle}
            title="Copy Style"
            className="px-1.5 py-1 dark:text-gray-400 text-gray-500 hover:dark:text-white text-gray-900 hover:bg-white/10 rounded border dark:border-[#333] border-gray-300 transition-colors"
          >
            CStyle
          </button>
          <button
            onClick={handlePasteStyle}
            title="Paste Style"
            className="px-1.5 py-1 dark:text-gray-400 text-gray-500 hover:dark:text-white text-gray-900 hover:bg-white/10 rounded border dark:border-[#333] border-gray-300 transition-colors"
          >
            PStyle
          </button>
          {selectedNode.id !== "root" && (
            <button
              onClick={handleCopyElement}
              title="Copy Element (Ctrl+C)"
              className="px-1.5 py-1 dark:text-gray-400 text-gray-500 hover:dark:text-white text-gray-900 hover:bg-white/10 rounded border dark:border-[#333] border-gray-300 transition-colors"
            >
              Cpy
            </button>
          )}
          <button
            onClick={handlePasteElement}
            title="Paste Element (Ctrl+V)"
            className="px-1.5 py-1 dark:text-gray-400 text-gray-500 hover:dark:text-white text-gray-900 hover:bg-white/10 rounded border dark:border-[#333] border-gray-300 transition-colors"
          >
            Pst
          </button>
          {selectedNode.id !== "root" && (
            <>
              <button
                onClick={handleDuplicate}
                title="Duplicate (Ctrl+D)"
                className="px-1.5 py-1 dark:text-gray-400 text-gray-500 hover:dark:text-white text-gray-900 hover:bg-white/10 rounded border dark:border-[#333] border-gray-300 transition-colors"
              >
                Dup
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-red-400 hover:text-red-500 hover:bg-white/5 rounded-md transition-colors"
                title="Delete element"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedNode.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="p-4 space-y-6"
        >
          {/* Content Properties */}
          {(selectedNode.type === "text" ||
            selectedNode.type === "heading" ||
            selectedNode.type === "button" ||
            selectedNode.type === "textarea" ||
            selectedNode.type === "badge") && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
                {t("Content")}
              </h3>
              <div>
                <label className="block opacity-40 mb-1">Text</label>
                {selectedNode.type === "text" ||
                selectedNode.type === "textarea" ? (
                  <textarea
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] outline-none"
                    value={selectedNode.props.text || ""}
                    onChange={(e) => handlePropChange("text", e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={selectedNode.props.text || ""}
                    onChange={(e) => handlePropChange("text", e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          {selectedNode.type === "customCode" && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
                {t("Custom Content")}
              </h3>
              <div>
                <label className="block opacity-40 mb-1">HTML Code</label>
                <textarea
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] outline-none font-mono text-xs"
                  value={selectedNode.props.code || ""}
                  onChange={(e) => handlePropChange("code", e.target.value)}
                  placeholder="<div>Hello</div>"
                />
              </div>
            </div>
          )}

          {selectedNode.type === "slideshow" && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Settings2 size={12} /> {t("Slideshow Settings")}
              </h3>

              {/* Behavior Section */}
              <div className="p-3 rounded-lg bg-gray-100/50 dark:bg-[#1a1a1a]/50 border dark:border-[#222] border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium dark:text-gray-300 text-gray-700 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
                      checked={selectedNode.props.autoPlay !== false}
                      onChange={(e) => handlePropChange("autoPlay", e.target.checked)}
                    />
                    Auto Play
                  </label>
                  <label className="text-xs font-medium dark:text-gray-300 text-gray-700 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
                      checked={selectedNode.props.loop !== false}
                      onChange={(e) => handlePropChange("loop", e.target.checked)}
                    />
                    Loop slides
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium dark:text-gray-300 text-gray-700 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
                      checked={selectedNode.props.showArrows !== false}
                      onChange={(e) => handlePropChange("showArrows", e.target.checked)}
                    />
                    Show Arrows
                  </label>
                  <label className="text-xs font-medium dark:text-gray-300 text-gray-700 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
                      checked={selectedNode.props.showDots !== false}
                      onChange={(e) => handlePropChange("showDots", e.target.checked)}
                    />
                    Show Dots
                  </label>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] opacity-60 mb-1">
                    <span>Transition Delay</span>
                    <span>{((selectedNode.props.interval || 3000) / 1000).toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="500"
                    className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    value={selectedNode.props.interval || 3000}
                    onChange={(e) => handlePropChange("interval", Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Manage Slides Section */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold opacity-50 uppercase tracking-widest flex items-center gap-1">
                  <ImageIcon size={11} /> Manage Slides ({ (selectedNode.props.images || []).length })
                </h4>

                {/* Slides list item manager */}
                { (selectedNode.props.images || []).length > 0 ? (
                  <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                    {(selectedNode.props.images || []).map((url: string, idx: number) => (
                      <div key={idx} className="flex gap-1.5 items-center bg-gray-50 dark:bg-[#202020] border dark:border-[#333] border-gray-200 rounded p-1.5">
                        <div className="w-10 h-10 shrink-0 rounded overflow-hidden bg-zinc-200 dark:bg-zinc-800 border dark:border-zinc-700 border-zinc-300 flex items-center justify-center">
                          <img src={url} className="w-full h-full object-cover" alt="" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1542241647-9cbb2225278b?w=100&q=40" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={url}
                            className="w-full bg-transparent border-none text-[11px] p-0.5 focus:ring-1 focus:ring-blue-500 rounded outline-none dark:text-gray-100 text-gray-800 break-all truncate"
                            onChange={(e) => {
                              const updated = [...(selectedNode.props.images || [])];
                              updated[idx] = e.target.value;
                              handlePropChange("images", updated);
                            }}
                          />
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            className="p-1 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-20 cursor-pointer"
                            onClick={() => {
                              const updated = [...(selectedNode.props.images || [])];
                              const temp = updated[idx];
                              updated[idx] = updated[idx - 1];
                              updated[idx - 1] = temp;
                              handlePropChange("images", updated);
                            }}
                            title="Move Up"
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (selectedNode.props.images || []).length - 1}
                            className="p-1 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-20 cursor-pointer"
                            onClick={() => {
                              const updated = [...(selectedNode.props.images || [])];
                              const temp = updated[idx];
                              updated[idx] = updated[idx + 1];
                              updated[idx + 1] = temp;
                              handlePropChange("images", updated);
                            }}
                            title="Move Down"
                          >
                            <ChevronDown size={13} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            onClick={() => {
                              const updated = (selectedNode.props.images || []).filter((_: any, i: number) => i !== idx);
                              handlePropChange("images", updated);
                              toast.success("Slide removed");
                            }}
                            title={t("Remove Slide")}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs opacity-40 italic bg-gray-50 dark:bg-[#1c1c1c] rounded-md border border-dashed dark:border-zinc-800 border-zinc-200">
                    No slides defined
                  </div>
                )}

                {/* Quickly Add New Slide */}
                <div className="pt-1.5">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      className="flex-1 placeholder-opacity-40 placeholder-gray-500 dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add slide URL..."
                      value={newSlideUrl}
                      onChange={(e) => setNewSlideUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newSlideUrl.trim()) {
                          const updated = [...(selectedNode.props.images || []), newSlideUrl.trim()];
                          handlePropChange("images", updated);
                          setNewSlideUrl("");
                          toast.success("Slide added successfully!");
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center justify-center cursor-pointer transition-colors"
                      onClick={() => {
                        if (newSlideUrl.trim()) {
                          const updated = [...(selectedNode.props.images || []), newSlideUrl.trim()];
                          handlePropChange("images", updated);
                          setNewSlideUrl("");
                          toast.success("Slide added successfully!");
                        } else {
                          toast.error("Please enter a valid Image URL");
                        }
                      }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                {/* Preset suggestions helper to quickly add stunning images */}
                <div className="bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded p-2 text-[11px] space-y-1.5">
                  <div className="flex items-center gap-1 text-blue-700 dark:text-blue-400 font-medium font-sans animate-pulse">
                    <Sparkles size={11} /> <span>Quick Unsplash Presets</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { label: "Cityscape", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80" },
                      { label: "Nature", url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80" },
                      { label: "Ocean", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" },
                      { label: "Workspace", url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80" }
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          const updated = [...(selectedNode.props.images || []), p.url];
                          handlePropChange("images", updated);
                          toast.success(`Added ${p.label} Unsplash preset`);
                        }}
                        className="px-1.5 py-0.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-[9px] font-sans font-medium transition-all active:scale-95 cursor-pointer"
                      >
                        + {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Textarea Fallback for Advanced bulk edits */}
              <div>
                <label className="block text-[9px] font-bold uppercase opacity-40 mb-1">
                  Bulk Paste Images (One URL per line)
                </label>
                <textarea
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[60px] outline-none text-xs break-all"
                  value={(selectedNode.props.images || []).join("\n")}
                  onChange={(e) =>
                    handlePropChange(
                      "images",
                      e.target.value
                        .split("\n")
                        .filter((url) => url.trim() !== ""),
                    )
                  }
                  placeholder="https://image1.jpg&#10;https://image2.jpg"
                />
              </div>
            </div>
          )}

          {(selectedNode.type === "image" || selectedNode.type === "video") && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
                {t("Media")}
              </h3>
              <div>
                <label className="block opacity-40 mb-1">Source URL</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedNode.props.src || ""}
                  onChange={(e) => handlePropChange("src", e.target.value)}
                />
              </div>
              <div>
                <label className="block opacity-40 mb-1 flex justify-between items-center">
                  <span>Or Upload File</span>
                  <span className="text-[9px] opacity-60">(Local URL)</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept={
                      selectedNode.type === "image"
                        ? "image/*"
                        : "video/mp4,video/webm"
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const loadingToast = toast.loading(
                          `Uploading ${selectedNode.type}...`,
                        );
                        // Simulate network upload
                        setTimeout(() => {
                          try {
                            const url = URL.createObjectURL(file);
                            handlePropChange("src", url);
                            toast.dismiss(loadingToast);
                            toast.success("Media uploaded successfully");
                          } catch (err) {
                            toast.dismiss(loadingToast);
                            toast.error("Upload failed");
                          }
                        }, 800);
                      }
                    }}
                  />
                  <div className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 border-dashed rounded p-2 text-center text-[11px] text-blue-400 font-medium">
                    Click to upload {selectedNode.type}
                  </div>
                </div>
              </div>
              {selectedNode.type === "image" && (
                <div>
                  <label className="block opacity-40 mb-1">Alt Text</label>
                  <input
                    type="text"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={selectedNode.props.alt || ""}
                    onChange={(e) => handlePropChange("alt", e.target.value)}
                  />
                </div>
              )}
              {selectedNode.type === "video" && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedNode.props.autoPlay || false}
                      onChange={(e) =>
                        handlePropChange("autoPlay", e.target.checked)
                      }
                    />
                    <span>Autoplay</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedNode.props.loop || false}
                      onChange={(e) =>
                        handlePropChange("loop", e.target.checked)
                      }
                    />
                    <span>Loop</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedNode.props.controls !== false}
                      onChange={(e) =>
                        handlePropChange("controls", e.target.checked)
                      }
                    />
                    <span>Controls</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {selectedNode.type === "icon" && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
                {t("Icon Properties")}
              </h3>
              <div>
                <label className="block opacity-40 mb-1">
                  Icon Name (Lucide)
                </label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedNode.props.iconName || "Star"}
                  placeholder="e.g. Star, Search, User"
                  onChange={(e) => handlePropChange("iconName", e.target.value)}
                />
                <p className="text-[9px] opacity-40 mt-1">
                  Visit{" "}
                  <a
                    href="https://lucide.dev/icons"
                    target="_blank"
                    className="text-blue-400"
                  >
                    lucide.dev
                  </a>{" "}
                  for names.
                </p>
              </div>
            </div>
          )}

          {selectedNode.type === "input" && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
                {t("Input Properties")}
              </h3>
              <div>
                <label className="block opacity-40 mb-1">Placeholder</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedNode.props.placeholder || ""}
                  onChange={(e) =>
                    handlePropChange("placeholder", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block opacity-40 mb-1">Input Type</label>
                <select
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedNode.props.inputType || "text"}
                  onChange={(e) =>
                    handlePropChange("inputType", e.target.value)
                  }
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="password">Password</option>
                  <option value="number">Number</option>
                </select>
              </div>
            </div>
          )}

          {selectedNode.type === "slider" && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
                {t("Slider Properties")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block opacity-40 mb-1">Min</label>
                  <input
                    type="number"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={selectedNode.props.min ?? 0}
                    onChange={(e) =>
                      handlePropChange("min", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="block opacity-40 mb-1">Max</label>
                  <input
                    type="number"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={selectedNode.props.max ?? 100}
                    onChange={(e) =>
                      handlePropChange("max", Number(e.target.value))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block opacity-40 mb-1">Value</label>
                <input
                  type="number"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedNode.props.value ?? 50}
                  onChange={(e) =>
                    handlePropChange("value", Number(e.target.value))
                  }
                />
              </div>
            </div>
          )}

          {selectedNode.type === "textarea" && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
                {t("Input Properties")}
              </h3>
              <div>
                <label className="block opacity-40 mb-1">Placeholder</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={selectedNode.props.placeholder || ""}
                  onChange={(e) =>
                    handlePropChange("placeholder", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {selectedNode.type === "checkbox" && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
                {t("Checkbox Properties")}
              </h3>
              <div>
                <label className="block opacity-40 mb-1">Label Text</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={selectedNode.props.label || ""}
                  onChange={(e) => handlePropChange("label", e.target.value)}
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedNode.props.checked || false}
                  onChange={(e) =>
                    handlePropChange("checked", e.target.checked)
                  }
                />
                <span>Checked by default</span>
              </label>
            </div>
          )}

          {selectedNode.type === "progress" && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
                {t("Progress Properties")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block opacity-40 mb-1">Max Value</label>
                  <input
                    type="number"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={selectedNode.props.max ?? 100}
                    onChange={(e) =>
                      handlePropChange("max", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="block opacity-40 mb-1">Current Value</label>
                  <input
                    type="number"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={selectedNode.props.value ?? 50}
                    onChange={(e) =>
                      handlePropChange("value", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {(selectedNode.type === "audio" || selectedNode.type === "map") && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
                {selectedNode.type} Properties
              </h3>
              <div>
                <label className="block opacity-40 mb-1">Source URL</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={selectedNode.props.src || ""}
                  onChange={(e) => handlePropChange("src", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Layout Properties */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
              {t("Layout & Size")}
            </h3>

            {/* Global Page Margin Presets (when Page/root is selected) */}
            {selectedNode.id === "root" && (
              <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-150 dark:border-indigo-900/20 rounded-lg space-y-2 mb-3">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} /> Global Page Margin Presets
                </span>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">
                  Control page-wide spacing. Toggle standard container bounds vs modern edge-to-edge section stacking.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({
                        type: "UPDATE_STYLE",
                        payload: {
                          id: "root",
                          style: {
                            paddingTop: "0px",
                            paddingBottom: "0px",
                            paddingLeft: "0px",
                            paddingRight: "0px",
                          }
                        }
                      });
                      toast.success("Removed page spacing (Enabled Edge-to-Edge)!");
                    }}
                    className="px-2 py-1.5 text-center dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded text-xs hover:border-indigo-500 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                  >
                    🚫 Zero Padding
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({
                        type: "UPDATE_STYLE",
                        payload: {
                          id: "root",
                          style: {
                            paddingTop: "24px",
                            paddingBottom: "24px",
                            paddingLeft: "24px",
                            paddingRight: "24px",
                          }
                        }
                      });
                      toast.success("Restored standard page margin spacing (24px)!");
                    }}
                    className="px-2 py-1.5 text-center dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded text-xs hover:border-indigo-500 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                  >
                    📐 Standard Padding
                  </button>
                </div>
              </div>
            )}

            {/* Breakout elements for nested direct-child containers */}
            {selectedNode.type === "container" && selectedNode.id !== "root" && (
              <div className="p-3 bg-blue-50/40 dark:bg-blue-950/15 border border-blue-100/60 dark:border-blue-900/20 rounded-lg space-y-2 mb-3">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} /> Container Layout Shortcuts
                </span>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">
                  Stretches this container to the full outer viewport lines. Useful for custom headers and footers.
                </p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({
                        type: "UPDATE_STYLE",
                        payload: {
                          id: selectedNode.id,
                          style: {
                            width: "100cqw",
                            marginLeft: "calc(50% - 50cqw)",
                            marginRight: "calc(50% - 50cqw)",
                            flexShrink: "0",
                          }
                        }
                      });
                      toast.success("Corrected container to stretch left-and-right edges!");
                    }}
                    className="w-full text-left px-2 py-1.5 dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded text-xs hover:border-blue-500 text-gray-700 dark:text-gray-200 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>↔️ Full Edge-to-Edge Width</span>
                    <span className="text-[9px] opacity-65 bg-gray-200 dark:bg-zinc-800 px-1 rounded">Stretch</span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({
                          type: "UPDATE_STYLE",
                          payload: {
                            id: selectedNode.id,
                            style: {
                              marginBottom: "-24px",
                            }
                          }
                        });
                        toast.success("Snapped section to bottom layout page edge!");
                      }}
                      className="px-2 py-1.5 dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded text-xs hover:border-blue-500 text-gray-700 dark:text-gray-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      ⬇️ Bottom Snap
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({
                          type: "UPDATE_STYLE",
                          payload: {
                            id: selectedNode.id,
                            style: {
                              marginTop: "-24px",
                            }
                          }
                        });
                        toast.success("Snapped section to top layout page edge!");
                      }}
                      className="px-2 py-1.5 dark:bg-[#1a1a1a] bg-white border dark:border-[#333] border-gray-300 rounded text-xs hover:border-blue-500 text-gray-700 dark:text-gray-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      ⬆️ Top Snap
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      dispatch({
                        type: "UPDATE_STYLE",
                        payload: {
                          id: selectedNode.id,
                          style: {
                            marginLeft: "",
                            marginRight: "",
                            marginTop: "",
                            marginBottom: "",
                            width: "100%",
                            flexShrink: "",
                          }
                        }
                      });
                      toast.info("Reset margins to fallback.");
                    }}
                    className="w-full text-center py-1 bg-transparent hover:bg-red-500/10 dark:hover:bg-red-955 hover:text-red-500 dark:text-red-400 rounded text-[9px] transition-colors cursor-pointer"
                  >
                    Reset Breakout Spacing
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block opacity-40 mb-1">{t("Width")}</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={style.width || ""}
                  placeholder="auto, 100%, 200px"
                  onChange={(e) => handleStyleChange("width", e.target.value)}
                />
              </div>
              <div>
                <label className="block opacity-40 mb-1">{t("Height")}</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={style.height || ""}
                  placeholder="auto, 100%, 200px"
                  onChange={(e) => handleStyleChange("height", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block opacity-40 mb-1">{t("Padding")}</label>
                <SpacingEditor
                  style={style}
                  onChange={handleStyleChange}
                  type="padding"
                />
              </div>
              <div>
                <label className="block opacity-40 mb-1">{t("Margin")}</label>
                <SpacingEditor
                  style={style}
                  onChange={handleStyleChange}
                  type="margin"
                />
              </div>
            </div>

            <div>
              <label className="block opacity-40 mb-1">{t("Display")}</label>
              <select
                className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={style.display || "block"}
                onChange={(e) => handleStyleChange("display", e.target.value)}
              >
                <option value="block">{t("Block")}</option>
                <option value="flex">{t("Flex")}</option>
                <option value="inline-block">Inline Block</option>
                <option value="inline">{t("Inline")}</option>
                <option value="grid">{t("Grid")}</option>
              </select>
            </div>

            <div>
              <label className="block opacity-40 mb-1">Position</label>
              <select
                className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={style.position || "static"}
                onChange={(e) => handleStyleChange("position", e.target.value)}
              >
                <option value="static">Static</option>
                <option value="relative">Relative</option>
                <option value="absolute">Absolute</option>
                <option value="fixed">Fixed</option>
                <option value="sticky">Sticky</option>
              </select>
            </div>

            {style.position && style.position !== "static" && (
              <div className="grid grid-cols-2 gap-3 p-3 dark:bg-[#0F0F0F] bg-gray-100 rounded-md border dark:border-[#2A2A2A] border-gray-200 mt-2">
                <div>
                  <label className="block opacity-40 mb-1">Top</label>
                  <input
                    type="text"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={style.top || ""}
                    placeholder="0px, auto"
                    onChange={(e) => handleStyleChange("top", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block opacity-40 mb-1">{t("Right")}</label>
                  <input
                    type="text"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={style.right || ""}
                    placeholder="0px, auto"
                    onChange={(e) => handleStyleChange("right", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block opacity-40 mb-1">Bottom</label>
                  <input
                    type="text"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={style.bottom || ""}
                    placeholder="0px, auto"
                    onChange={(e) =>
                      handleStyleChange("bottom", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block opacity-40 mb-1">{t("Left")}</label>
                  <input
                    type="text"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={style.left || ""}
                    placeholder="0px, auto"
                    onChange={(e) => handleStyleChange("left", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block opacity-40 mb-1">Z-Index</label>
                  <input
                    type="number"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={style.zIndex || ""}
                    onChange={(e) =>
                      handleStyleChange("zIndex", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {style.display === "flex" && (
              <div className="grid grid-cols-2 gap-3 p-3 dark:bg-[#0F0F0F] bg-gray-100 rounded-md border dark:border-[#2A2A2A] border-gray-200 mt-2">
                <div className="col-span-2">
                  <label className="block opacity-40 mb-1">{t("Direction")}</label>
                  <select
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={style.flexDirection || "row"}
                    onChange={(e) =>
                      handleStyleChange("flexDirection", e.target.value)
                    }
                  >
                    <option value="row">{t("Row")}</option>
                    <option value="column">{t("Column")}</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block opacity-40 mb-1">
                    {t("Justify Content")}
                  </label>
                  <select
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={style.justifyContent || "flex-start"}
                    onChange={(e) =>
                      handleStyleChange("justifyContent", e.target.value)
                    }
                  >
                    <option value="flex-start">Start</option>
                    <option value="center">{t("Center")}</option>
                    <option value="flex-end">End</option>
                    <option value="space-between">Space Between</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block opacity-40 mb-1">{t("Align Items")}</label>
                  <select
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={style.alignItems || "stretch"}
                    onChange={(e) =>
                      handleStyleChange("alignItems", e.target.value)
                    }
                  >
                    <option value="flex-start">Start</option>
                    <option value="center">{t("Center")}</option>
                    <option value="flex-end">End</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block opacity-40 mb-1">{t("Gap")}</label>
                  <input
                    type="text"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={style.gap || ""}
                    placeholder="16px"
                    onChange={(e) => handleStyleChange("gap", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
              {t("Typography")}
            </h3>
            <div>
              <label className="block opacity-40 mb-1">{t("Font Family")}</label>
              <select
                className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={style.fontFamily || ""}
                onChange={(e) =>
                  handleStyleChange("fontFamily", e.target.value)
                }
              >
                <option value="">Default (Inter)</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Georgia, serif">Georgia</option>
                
                {/* Google Fonts - Sans-Serif */}
                <option value="'Inter', sans-serif">Inter (Sans-Serif)</option>
                <option value="'Roboto', sans-serif">Roboto (Sans-Serif)</option>
                <option value="'Open Sans', sans-serif">Open Sans (Sans-Serif)</option>
                <option value="'Lato', sans-serif">Lato (Sans-Serif)</option>
                <option value="'Montserrat', sans-serif">Montserrat (Sans-Serif)</option>
                <option value="'Poppins', sans-serif">Poppins (Sans-Serif)</option>
                <option value="'Oswald', sans-serif">Oswald (Sans-Serif)</option>
                <option value="'Raleway', sans-serif">Raleway (Sans-Serif)</option>
                <option value="'Nunito', sans-serif">Nunito (Sans-Serif)</option>
                <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech/Modern)</option>
                <option value="'Outfit', sans-serif">Outfit (Tech/Geometric)</option>
                <option value="'Syne', sans-serif">Syne (Creative/Bold)</option>
                <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Modern)</option>
                <option value="'DM Sans', sans-serif">DM Sans (Clean)</option>
                
                {/* Google Fonts - Serif */}
                <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
                <option value="'Merriweather', serif">Merriweather (Serif)</option>
                <option value="'Lora', serif">Lora (Serif)</option>
                <option value="'Abril Fatface', serif">Abril Fatface (Serif)</option>
                
                {/* Google Fonts - Monospace / Display */}
                <option value="'JetBrains Mono', monospace">JetBrains Mono (Monospace)</option>
                <option value="'Fira Code', monospace">Fira Code (Monospace)</option>
                <option value="'Pacifico', cursive">Pacifico (Handwritten)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block opacity-40 mb-1">Font Size</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={style.fontSize || ""}
                  placeholder="16px, 2rem"
                  onChange={(e) =>
                    handleStyleChange("fontSize", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block opacity-40 mb-1">{t("Font Weight")}</label>
                <select
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={style.fontWeight || ""}
                  onChange={(e) =>
                    handleStyleChange("fontWeight", e.target.value)
                  }
                >
                  <option value="">{t("Normal")}</option>
                  <option value="bold">{t("Bold")}</option>
                  <option value="800">Extra Bold</option>
                  <option value="500">{t("Medium")}</option>
                  <option value="300">Light</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block opacity-40 mb-1">Line Height</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={style.lineHeight || ""}
                  placeholder="1.5, 24px"
                  onChange={(e) =>
                    handleStyleChange("lineHeight", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block opacity-40 mb-1">Letter Spacing</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={style.letterSpacing || ""}
                  placeholder="1px, 0.05em"
                  onChange={(e) =>
                    handleStyleChange("letterSpacing", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block opacity-40 mb-1">Decoration</label>
                <select
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={style.textDecoration || ""}
                  onChange={(e) =>
                    handleStyleChange("textDecoration", e.target.value)
                  }
                >
                  <option value="">{t("None")}</option>
                  <option value="underline">Underline</option>
                  <option value="line-through">Strikethrough</option>
                  <option value="overline">Overline</option>
                </select>
              </div>
              <div>
                <label className="block opacity-40 mb-1">{t("Alignment")}</label>
                <div className="flex border dark:border-[#333] border-gray-300 rounded overflow-hidden">
                  {["left", "center", "right", "justify"].map((align) => (
                    <button
                      key={align}
                      className={`flex-1 p-1 text-[11px] ${style.textAlign === align ? "bg-[#333] dark:text-white text-gray-900 font-medium" : "dark:bg-[#252525] bg-white hover:bg-[#2A2A2A]"}`}
                      onClick={() => handleStyleChange("textAlign", align)}
                    >
                      {align.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Link Properties */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
              {t("Click Action / Link")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block opacity-40 mb-1">On Click</label>
                <select
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedNode.props.linkType || ""}
                  onChange={(e) => {
                    handlePropChange("linkType", e.target.value);
                    if (!e.target.value) handlePropChange("href", "");
                  }}
                >
                  <option value="">None (Do nothing)</option>
                  <option value="url">Open External URL</option>
                  <option value="page">Go to Page</option>
                  <option value="email">Send Email</option>
                  <option value="phone">Call Phone</option>
                </select>
              </div>

              {selectedNode.props.linkType === "url" && (
                <>
                  <div className="col-span-2">
                    <label className="block opacity-40 mb-1">
                      URL (https://...)
                    </label>
                    <input
                      type="text"
                      className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                      value={selectedNode.props.href || ""}
                      onChange={(e) => handlePropChange("href", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedNode.props.target === "_blank"}
                        onChange={(e) =>
                          handlePropChange(
                            "target",
                            e.target.checked ? "_blank" : "",
                          )
                        }
                      />
                      <span>{t("Open in new tab")}</span>
                    </label>
                  </div>
                </>
              )}

              {selectedNode.props.linkType === "page" && (
                <div className="col-span-2">
                  <label className="block opacity-40 mb-1">Select Page</label>
                  <select
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={selectedNode.props.href || ""}
                    onChange={(e) => handlePropChange("href", e.target.value)}
                  >
                    <option value="">-- Choose Page --</option>
                    {(state.pages || []).map((p) => (
                      <option key={p.id} value={`/${p.id}`}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedNode.props.linkType === "email" && (
                <div className="col-span-2">
                  <label className="block opacity-40 mb-1">Email Address</label>
                  <input
                    type="email"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={(selectedNode.props.href || "").replace(
                      "mailto:",
                      "",
                    )}
                    onChange={(e) =>
                      handlePropChange(
                        "href",
                        e.target.value ? `mailto:${e.target.value}` : "",
                      )
                    }
                  />
                </div>
              )}

              {selectedNode.props.linkType === "phone" && (
                <div className="col-span-2">
                  <label className="block opacity-40 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={(selectedNode.props.href || "").replace("tel:", "")}
                    onChange={(e) =>
                      handlePropChange(
                        "href",
                        e.target.value ? `tel:${e.target.value}` : "",
                      )
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Borders & Shadows */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
              {t("Borders & Shadows")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block opacity-40 mb-1">Border Radius</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={style.borderRadius || ""}
                  placeholder="0px, 8px, 50%"
                  onChange={(e) =>
                    handleStyleChange("borderRadius", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block opacity-40 mb-1">Border Width</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={style.borderWidth || ""}
                  placeholder="1px"
                  onChange={(e) =>
                    handleStyleChange("borderWidth", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block opacity-40 mb-1">Border Style</label>
                <select
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={style.borderStyle || "solid"}
                  onChange={(e) =>
                    handleStyleChange("borderStyle", e.target.value)
                  }
                >
                  <option value="solid">{t("Solid")}</option>
                  <option value="dashed">{t("Dashed")}</option>
                  <option value="dotted">{t("Dotted")}</option>
                  <option value="none">{t("None")}</option>
                </select>
              </div>
              <div>
                <ColorPicker
                  label="Border Color"
                  value={style.borderColor || "#000000"}
                  onChange={(c) => handleStyleChange("borderColor", c)}
                />
              </div>
            </div>
            <div>
              <label className="block opacity-40 mb-1 mt-2">Box Shadow</label>
              <BoxShadowEditor
                value={style.boxShadow || ""}
                onChange={(s) => handleStyleChange("boxShadow", s)}
              />
            </div>
          </div>

          {/* Appearance & Backgrounds */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2">
              {t("Appearance")}
            </h3>
            <ColorPicker
              label="Text Color"
              value={style.color || ""}
              onChange={(c) => handleStyleChange("color", c)}
            />
            <ColorPicker
              label="Background Color"
              value={style.backgroundColor || ""}
              onChange={(c) => handleStyleChange("backgroundColor", c)}
            />

            <BackgroundStyleEditor
              style={style}
              onChange={handleStyleChange}
            />
          </div>

          {/* GSAP Animations */}
          <div className="space-y-3 pb-8">
            <h3 className="text-[11px] font-bold dark:text-white text-gray-900 opacity-50 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{t("Animations")}</span>
              <span className="text-[8px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded">{t("Powered by GSAP")}</span>
            </h3>
            <div>
              <label className="block opacity-40 mb-1">Animation Type</label>
              <select
                className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={selectedNode.props.gsap?.type || ""}
                onChange={(e) =>
                  handleGsapChange("type", e.target.value)
                }
              >
                <option value="">{t("None")}</option>
                <option value="fade">Fade In</option>
                <option value="slideUp">Slide Up</option>
                <option value="slideDown">Slide Down</option>
                <option value="slideLeft">Slide Left</option>
                <option value="slideRight">Slide Right</option>
                <option value="zoomIn">Zoom In</option>
                <option value="zoomOut">Zoom Out</option>
                <option value="rotate">Rotate</option>
                <option value="flip">Flip</option>
                <option value="typewriter">Typewriter (Text)</option>
              </select>
            </div>
            
            <div>
              <label className="block opacity-40 mb-1">Draggable</label>
              <select
                className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={selectedNode.props.gsap?.draggable || "none"}
                onChange={(e) =>
                  handleGsapChange("draggable", e.target.value)
                }
              >
                <option value="none">{t("None")}</option>
                <option value="x">X Axis</option>
                <option value="y">Y Axis</option>
                <option value="x,y">Both Axes (X, Y)</option>
                <option value="rotation">Rotation</option>
              </select>
            </div>

            {selectedNode.props.gsap?.type === "typewriter" && (
              <div>
                <label className="block opacity-40 mb-1">Text for Typewriter</label>
                <input
                  type="text"
                  className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={selectedNode.props.gsap?.text || ""}
                  placeholder="Hello World"
                  onChange={(e) =>
                    handleGsapChange("text", e.target.value)
                  }
                />
              </div>
            )}

            {selectedNode.props.gsap?.type && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block opacity-40 mb-1">Duration (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={selectedNode.props.gsap?.duration || ""}
                    placeholder="1"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      handleGsapChange("duration", isNaN(val) ? undefined : val);
                    }}
                  />
                </div>
                <div>
                  <label className="block opacity-40 mb-1">Delay (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={selectedNode.props.gsap?.delay || ""}
                    placeholder="0"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      handleGsapChange("delay", isNaN(val) ? undefined : val);
                    }}
                  />
                </div>
                <div>
                  <label className="block opacity-40 mb-1">Stagger (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={selectedNode.props.gsap?.stagger || ""}
                    placeholder="0"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      handleGsapChange("stagger", isNaN(val) ? undefined : val);
                    }}
                  />
                </div>
                <div>
                  <label className="block opacity-40 mb-1">Ease</label>
                  <select
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={selectedNode.props.gsap?.ease || "power2.out"}
                    onChange={(e) =>
                      handleGsapChange("ease", e.target.value)
                    }
                  >
                    <option value="power1.out">Power1 Out</option>
                    <option value="power2.out">Power2 Out</option>
                    <option value="power3.out">Power3 Out</option>
                    <option value="power4.out">Power4 Out</option>
                    <option value="back.out">Back Out</option>
                    <option value="elastic.out">Elastic Out</option>
                    <option value="bounce.out">Bounce Out</option>
                    <option value="linear">Linear</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block opacity-40 mb-1">Trigger</label>
                  <select
                    className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={selectedNode.props.gsap?.trigger || "load"}
                    onChange={(e) =>
                      handleGsapChange("trigger", e.target.value)
                    }
                  >
                    <option value="load">On Load</option>
                    <option value="scroll">On Scroll</option>
                    <option value="hover">On Hover</option>
                    <option value="click">On Click</option>
                  </select>
                </div>
              </div>
            )}

            {selectedNode.props.gsap?.type && selectedNode.props.gsap?.trigger === "scroll" && (
              <div className="mt-3 space-y-3 pt-3 border-t dark:border-[#333] border-gray-200">
                <h4 className="text-[10px] font-bold opacity-60 uppercase">ScrollTrigger Options</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block opacity-40 mb-1 text-[10px]">Start</label>
                    <input
                      type="text"
                      className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 outline-none text-[11px]"
                      value={selectedNode.props.gsap?.start || "top 80%"}
                      onChange={(e) => handleGsapChange("start", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block opacity-40 mb-1 text-[10px]">End</label>
                    <input
                      type="text"
                      className="w-full dark:bg-[#252525] bg-white border dark:border-[#333] border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 outline-none text-[11px]"
                      value={selectedNode.props.gsap?.end || "bottom 20%"}
                      onChange={(e) => handleGsapChange("end", e.target.value)}
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      className="rounded dark:bg-[#252525] border-gray-400"
                      checked={selectedNode.props.gsap?.scrub || false}
                      onChange={(e) => handleGsapChange("scrub", e.target.checked)}
                    />
                    Scrub
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      className="rounded dark:bg-[#252525] border-gray-400"
                      checked={selectedNode.props.gsap?.pin || false}
                      onChange={(e) => handleGsapChange("pin", e.target.checked)}
                    />
                    Pin
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      className="rounded dark:bg-[#252525] border-gray-400"
                      checked={selectedNode.props.gsap?.markers || false}
                      onChange={(e) => handleGsapChange("markers", e.target.checked)}
                    />
                    Markers
                  </label>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
