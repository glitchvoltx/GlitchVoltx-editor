import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { EditorElement, Page } from '../types';

const styleToCssString = (style: any): string => {
  const mergedStyle = { ...style };
  if (mergedStyle.animationName) {
    mergedStyle.animation = `${mergedStyle.animationName} ${mergedStyle.animationDuration || "1s"} ${mergedStyle.animationTimingFunction || "ease"} ${mergedStyle.animationDelay || "0s"} ${mergedStyle.animationIterationCount || "1"}`;
  }

  const unitlessProperties = new Set([
    'opacity', 'zIndex', 'flex', 'flexGrow', 'flexShrink', 'fontWeight', 'lineHeight',
    'zoom', 'scale', 'gridColumn', 'gridRow', 'order', 'strokeWidth', 'tabSize'
  ]);

  return Object.keys(mergedStyle).map(key => {
    let value = mergedStyle[key];
    if (value === undefined || value === null || value === '') return null;
    
    if (typeof value === 'number' && !unitlessProperties.has(key)) {
      value = `${value}px`;
    } else if (typeof value === 'string' && /^\d+$/.test(value) && !unitlessProperties.has(key)) {
      value = `${value}px`;
    }

    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `${cssKey}: ${value};`;
  }).filter(Boolean).join(' ');
};

const extractStyles = (elements: EditorElement[], classMap: Map<string, string>, cssRules: string[]) => {
   for (const el of elements) {
      const clsName = `el-${el.id.substring(0, 8)}`;
      classMap.set(el.id, clsName);
      const cssString = styleToCssString(el.props.style || {});
      if (cssString) {
         cssRules.push(`.${clsName} { ${cssString} }`);
      }
      if (el.children) {
         extractStyles(el.children, classMap, cssRules);
      }
   }
};

const getExportHref = (linkType: string | undefined, href: string | undefined, pages: Page[]): string => {
  if (!href) return '#';
  if (linkType === 'page') {
    const pageId = href.replace(/^\//, '');
    const foundPage = pages.find(p => p.id === pageId || p.path === href || p.path === '/' + pageId);
    if (foundPage) {
      const cleanPath = foundPage.path.replace(/^\//, '');
      return cleanPath === '' || cleanPath === 'home' ? 'index.html' : `${cleanPath}.html`;
    }
    return 'index.html';
  }
  if (linkType === 'email') {
    return href.startsWith('mailto:') ? href : `mailto:${href}`;
  }
  if (linkType === 'phone') {
    return href.startsWith('tel:') ? href : `tel:${href}`;
  }
  return href;
};

const renderElementToHtml = (element: EditorElement, classMap: Map<string, string>, pages: Page[] = []): string => {
  const { type, props, children } = element;
  const clsName = classMap.get(element.id) || '';
  const gsapAttr = props.gsap?.type ? ` data-gsap='${JSON.stringify(props.gsap).replace(/'/g, "&apos;")}'` : '';
  const clsAttr = ` class="${clsName}"${gsapAttr}`;

  let elementHtml = '';

  const isRoot = element.id === 'root';
  const isLink = !!(props.href && props.linkType && !isRoot);
  const targetAttr = isLink && props.target === '_blank' ? ' target="_blank"' : '';
  const exportHref = isLink ? getExportHref(props.linkType!, props.href!, pages) : '';
  const hrefAttr = isLink ? ` href="${exportHref}"${targetAttr}` : '';
  const linkStyle = isLink ? ' style="text-decoration: none; color: inherit;"' : '';

  switch (type) {
    case 'container': {
      const cTag = isLink ? 'a' : 'div';
      elementHtml = `<${cTag}${isLink ? hrefAttr + linkStyle : ''}${clsAttr}>\n  ${children?.map(c => renderElementToHtml(c, classMap, pages)).join('\n  ') || ''}\n</${cTag}>`;
      break;
    }
    case 'heading': {
      const hTag = isLink ? 'a' : 'h1';
      elementHtml = `<${hTag}${isLink ? hrefAttr + linkStyle : ''}${clsAttr}>${props.text || ''}</${hTag}>`;
      break;
    }
    case 'text': {
      const pTag = isLink ? 'a' : 'p';
      elementHtml = `<${pTag}${isLink ? hrefAttr + linkStyle : ''}${clsAttr}>${props.text || ''}</${pTag}>`;
      break;
    }
    case 'button': {
      const bTag = isLink ? 'a' : 'button';
      const bType = !isLink ? ' type="button"' : '';
      const bStl = isLink ? ' style="text-decoration: none; color: inherit;"' : '';
      elementHtml = `<${bTag}${isLink ? hrefAttr + bStl : bType}${clsAttr}>${props.text || ''}</${bTag}>`;
      break;
    }
    case 'image':
      if (isLink) {
        elementHtml = `<a${hrefAttr}${clsAttr} style="text-decoration: none; display: inline-block; padding: 0; overflow: hidden; line-height: 0;">\n  <img src="${props.src || ''}" alt="${props.alt || ''}" style="width: 100%; height: 100%; object-fit: ${props.style?.objectFit || 'cover'}; display: block; border-radius: inherit;" />\n</a>`;
      } else {
        elementHtml = `<img src="${props.src || ''}" alt="${props.alt || ''}"${clsAttr} />`;
      }
      break;
    case 'video': {
      const isYoutube = props.src?.includes('youtube.com') || props.src?.includes('youtu.be');
      const srcStr = props.src || '';
      let embedUrl = srcStr;
      if (isYoutube && !srcStr.includes('embed/')) {
         const videoIdMatch = srcStr.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
         if (videoIdMatch) {
            embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
         }
      }
      
      let innerHtml = '';
      if (isYoutube) {
        innerHtml = `<iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>`;
      } else {
        const controls = props.controls !== false ? ' controls' : '';
        const autoPlay = props.autoPlay ? ' autoplay muted' : '';
        const loop = props.loop ? ' loop' : '';
        innerHtml = `<video src="${srcStr}" style="width: 100%; height: 100%; object-fit: cover;"${controls}${autoPlay}${loop}></video>`;
      }
      
      if (isLink) {
         elementHtml = `<div${clsAttr} style="position: relative; display: block; overflow: hidden; padding: 0;">\n  ${innerHtml}\n  <a${hrefAttr} style="position: absolute; inset: 0; z-index: 10; text-decoration: none;"></a>\n</div>`;
      } else {
         elementHtml = `<div${clsAttr} style="position: relative; display: block; overflow: hidden; padding: 0;">\n  ${innerHtml}\n</div>`;
      }
      break;
    }
    case 'divider':
      elementHtml = `<hr${clsAttr} />`;
      break;
    case 'input':
      elementHtml = `<input type="${props.inputType || 'text'}" placeholder="${props.placeholder || ''}"${clsAttr} />`;
      break;
    case 'slider':
      elementHtml = `<input type="range" min="${props.min ?? 0}" max="${props.max ?? 100}" value="${props.value ?? 50}"${clsAttr} />`;
      break;
    case 'icon': {
      const iconName = (props.iconName || 'star').toLowerCase();
      if (isLink) {
        elementHtml = `<a${hrefAttr}${clsAttr} style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;"><i data-lucide="${iconName}" style="width: 100%; height: 100%; color: inherit;"></i></a>`;
      } else {
        elementHtml = `<div${clsAttr} style="display: inline-flex; align-items: center; justify-content: center;"><i data-lucide="${iconName}" style="width: 100%; height: 100%; color: inherit;"></i></div>`;
      }
      break;
    }
    case 'spacer':
      elementHtml = `<div${clsAttr}></div>`;
      break;
    case 'textarea':
      elementHtml = `<textarea${clsAttr} placeholder="${props.placeholder || ''}">${props.text || ''}</textarea>`;
      break;
    case 'checkbox':
      elementHtml = `<label${clsAttr} style="display: flex; align-items: center; gap: 8px;">\n  <input type="checkbox"${props.checked ? ' checked' : ''} />\n  <span>${props.label || ''}</span>\n</label>`;
      break;
    case 'audio':
      elementHtml = `<audio src="${props.src || ''}"${clsAttr} controls></audio>`;
      break;
    case 'map':
      const mapHtml = `<iframe src="${props.src || ''}" style="width: 100%; height: 100%; border: none;" allowfullscreen loading="lazy"></iframe>`;
      if (isLink) {
        elementHtml = `<div${clsAttr} style="position: relative; display: inline-block; overflow: hidden; padding: 0;">\n  ${mapHtml}\n  <a${hrefAttr} style="position: absolute; inset: 0; z-index: 10; text-decoration: none;"></a>\n</div>`;
      } else {
        elementHtml = `<div${clsAttr} style="position: relative; display: inline-block; overflow: hidden; padding: 0;">\n  ${mapHtml}\n</div>`;
      }
      break;
    case 'badge':
      elementHtml = `<span${clsAttr}>${props.text || ''}</span>`;
      break;
    case 'progress': {
      const pct = Math.min(100, Math.max(0, (Number(props.value || 0) / Number(props.max || 100)) * 100));
      elementHtml = `<div${clsAttr} style="position: relative; overflow: hidden;">\n  <div style="width: ${pct}%; height: 100%; background-color: ${element.props.style?.color || '#3b82f6'}; border-radius: inherit;"></div>\n</div>`;
      if (isLink) {
         elementHtml = elementHtml.replace('</div>\n</div>', `</div>\n  <a${hrefAttr} style="position: absolute; inset: 0; z-index: 10; text-decoration: none;"></a>\n</div>`);
      }
      break;
    }
    case 'slideshow': {
      const images = props.images || [];
      const autoPlayVal = props.autoPlay !== false;
      const loopVal = props.loop !== false;
      const intervalVal = Number(props.interval) || 3000;
      const showArrowsVal = props.showArrows !== false;
      const showDotsVal = props.showDots !== false;

      const imagesHtml = images.map((src: string, index: number) => 
        `<img src="${src}" alt="Slide ${index + 1}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: ${element.props.style?.objectFit || 'cover'}; opacity: ${index === 0 ? '1' : '0'}; transition: opacity 0.5s ease-in-out; pointer-events: none;" class="slide-${index}" />`
      ).join('\n    ');
      
      const dotsHtml = showDotsVal && images.length > 1 ? `<div style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 10;">
    ${images.map((_: any, index: number) => 
      `<div class="slide-dot" style="width: 8px; height: 8px; border-radius: 50%; background-color: ${index === 0 ? '#fff' : 'rgba(255,255,255,0.4)'}; cursor: pointer; transition: all 0.2s;" onclick="setSlide('${element.id}', ${index})"></div>`
    ).join('\n    ')}
  </div>` : '';

      const arrowsHtml = showArrowsVal && images.length > 1 ? `
  <button type="button" onclick="moveSlide('${element.id}', -1)" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); border: none; background: rgba(0,0,0,0.4); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.6)'" onmouseout="this.style.background='rgba(0,0,0,0.4)'">&#10094;</button>
  <button type="button" onclick="moveSlide('${element.id}', 1)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: none; background: rgba(0,0,0,0.4); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.6)'" onmouseout="this.style.background='rgba(0,0,0,0.4)'">&#10095;</button>` : '';

      elementHtml = `<div${clsAttr} id="slideshow-${element.id}" data-autoplay="${autoPlayVal}" data-loop="${loopVal}" data-interval="${intervalVal}" style="position: relative; overflow: hidden;">\n  ${imagesHtml}\n  ${arrowsHtml}\n  ${dotsHtml}\n`;
      if (isLink) {
         elementHtml += `  <a${hrefAttr} style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 9; text-decoration: none;"></a>\n`;
      }
      elementHtml += `</div>`;
      break;
    }
    case 'customCode':
      if (isLink) {
        elementHtml = `<a${hrefAttr}${clsAttr} style="text-decoration: none; display: block; color: inherit;">${props.code || ''}</a>`;
      } else {
        elementHtml = `<div${clsAttr}>${props.code || ''}</div>`;
      }
      break;
    default:
      elementHtml = '';
  }

  return elementHtml;
};

const findFirstImageUrl = (elements: EditorElement[]): string => {
  for (const el of elements) {
    if (el.type === 'image' && el.props?.src) {
      return el.props.src;
    }
    if (el.children && el.children.length > 0) {
      const subUrl = findFirstImageUrl(el.children);
      if (subUrl) return subUrl;
    }
  }
  return "";
};

const getAllUsedFonts = (pages: Page[]): Set<string> => {
  const fonts = new Set<string>();
  
  const scanElements = (elements: EditorElement[]) => {
    for (const el of elements) {
      if (el.props?.style?.fontFamily) {
        const fontFam = el.props.style.fontFamily;
        const cleanFont = fontFam.split(',')[0].replace(/['"]/g, '').trim();
        if (cleanFont && !['Arial', 'Times New Roman', 'Courier New', 'Georgia'].includes(cleanFont)) {
          fonts.add(cleanFont);
        }
      }
      if (el.children && el.children.length > 0) {
        scanElements(el.children);
      }
    }
  };

  for (const page of pages) {
    if (page.elements) {
      scanElements(page.elements);
    }
  }

  return fonts;
};

const getGoogleFontsHref = (pages: Page[]): string => {
  const usedFonts = getAllUsedFonts(pages);
  // Always include standard defaults so simple pages are preloaded perfectly
  usedFonts.add("Inter");
  usedFonts.add("JetBrains Mono");

  const fontParams = Array.from(usedFonts).map(font => {
    const encodedFont = font.replace(/\s+/g, '+');
    if (font === 'Pacifico' || font === 'Abril Fatface') {
      return `family=${encodedFont}`;
    }
    return `family=${encodedFont}:wght@300;400;500;600;700;800`;
  }).join('&');

  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
};

export const exportProjectToZip = async (pages: Page[], globalSettings?: any) => {
  const zip = new JSZip();
  const classMap = new Map<string, string>();
  const cssRules: string[] = [];
  
  const googleFontsHref = getGoogleFontsHref(pages);

  for (const page of pages) {
    if (page.elements && page.elements.length > 0) {
      extractStyles(page.elements, classMap, cssRules);
    }
  }

  for (const page of pages) {
    const rootElement = page.elements[0];
    if (!rootElement) continue;

    const htmlBody = renderElementToHtml(rootElement, classMap, pages);
    const pageTitle = page.seo?.title || page.name || "Exported Project";
    const pageDesc = page.seo?.description || "";
    const ogImg = page.seo?.ogImage || findFirstImageUrl(page.elements) || "";
    const faviconUrl = page.seo?.favicon || ogImg || "";

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    ${pageDesc ? `<meta name="description" content="${pageDesc}">` : ''}
    ${faviconUrl ? `<link rel="icon" href="${faviconUrl}">` : ''}
    ${globalSettings?.googleSiteVerification ? `\n    ${globalSettings.googleSiteVerification}` : ''}
    ${globalSettings?.customHeadCode ? `\n    ${globalSettings.customHeadCode}` : ''}
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${pageTitle}">
    ${pageDesc ? `<meta property="og:description" content="${pageDesc}">` : ''}
    ${ogImg ? `<meta property="og:image" content="${ogImg}">` : ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${pageTitle}">
    ${pageDesc ? `<meta name="twitter:description" content="${pageDesc}">` : ''}
    ${ogImg ? `<meta name="twitter:image" content="${ogImg}">` : ''}

    <link rel="stylesheet" href="styles.css">
    <link href="${googleFontsHref}" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Draggable.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/TextPlugin.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/MotionPathPlugin.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js"></script>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif;">
${htmlBody}
<script>
document.addEventListener("DOMContentLoaded", function() {
  if (typeof gsap !== "undefined") {
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
    if (typeof Draggable !== "undefined") gsap.registerPlugin(Draggable);
    if (typeof TextPlugin !== "undefined") gsap.registerPlugin(TextPlugin);
    if (typeof MotionPathPlugin !== "undefined") gsap.registerPlugin(MotionPathPlugin);
    if (typeof Flip !== "undefined") gsap.registerPlugin(Flip);

    document.querySelectorAll("[data-gsap]").forEach(function(el) {
      try {
        var config = JSON.parse(el.getAttribute("data-gsap"));
        var type = config.type;
        var duration = config.duration !== undefined ? config.duration : 1;
        var delay = config.delay !== undefined ? config.delay : 0;
        var ease = config.ease || "power2.out";
        var trigger = config.trigger || "load";
        var start = config.start || "top 80%";
        var end = config.end || "bottom 20%";
        var scrub = config.scrub || false;
        var pin = config.pin || false;
        var markers = config.markers || false;
        var draggable = config.draggable || "none";
        var text = config.text;
        var stagger = config.stagger || 0;

        if (draggable !== "none" && typeof Draggable !== "undefined") {
           Draggable.create(el, {
             type: draggable,
             bounds: "body",
             inertia: false
           });
        }

        if (!type) return;
        
        var vars = { duration: duration, delay: delay, ease: ease };
        if (stagger > 0) vars.stagger = stagger;

        var fromVars = {};
        var isToAnim = false;

        switch (type) {
          case "fade": fromVars = { opacity: 0 }; break;
          case "slideUp": fromVars = { opacity: 0, y: 50 }; break;
          case "slideDown": fromVars = { opacity: 0, y: -50 }; break;
          case "slideLeft": fromVars = { opacity: 0, x: -50 }; break;
          case "slideRight": fromVars = { opacity: 0, x: 50 }; break;
          case "zoomIn": fromVars = { opacity: 0, scale: 0.5 }; break;
          case "zoomOut": fromVars = { opacity: 0, scale: 1.5 }; break;
          case "rotate": fromVars = { opacity: 0, rotation: -180 }; break;
          case "flip": fromVars = { opacity: 0, rotationX: -180 }; break;
          case "typewriter":
            fromVars = { text: "" };
            break;
          default: fromVars = { opacity: 0 };
        }

        if (trigger === "hover") {
          var hoverVars = Object.assign({}, vars);
          var toVars = type === 'zoomIn' ? { scale: 1.1 } : 
                       type === 'slideUp' ? { y: -10 } : 
                       type === 'rotate' ? { rotation: 10 } : 
                       { opacity: 0.5 };
          var targetHover = (stagger > 0 && el.children.length > 0) ? Array.from(el.children) : el;

          var anim = gsap.to(targetHover, Object.assign({}, toVars, hoverVars, { paused: true }));
          el.addEventListener("mouseenter", function() { anim.play(); });
          el.addEventListener("mouseleave", function() { anim.reverse(); });
        } else if (trigger === "scroll") {
          var stVars = {
            scrollTrigger: {
              trigger: el,
              start: start,
              end: end,
              scrub: scrub,
              pin: pin,
              markers: markers
            }
          };
          var targetScroll = (stagger > 0 && el.children.length > 0) ? Array.from(el.children) : el;
          if (isToAnim) {
            gsap.to(targetScroll, Object.assign({}, fromVars, vars, stVars));
          } else {
            gsap.from(targetScroll, Object.assign({}, fromVars, vars, stVars));
          }
        } else if (trigger === "click") {
          var animVars = Object.assign({}, fromVars, vars, { paused: true });
          var targetClick = (stagger > 0 && el.children.length > 0) ? Array.from(el.children) : el;
          var anim = isToAnim ? gsap.to(targetClick, animVars) : gsap.from(targetClick, animVars);
          el.addEventListener("click", function() { anim.restart(); });
        } else {
          var targetLoad = (stagger > 0 && el.children.length > 0) ? Array.from(el.children) : el;
          if (isToAnim) {
            gsap.to(targetLoad, Object.assign({}, fromVars, vars));
          } else {
            gsap.from(targetLoad, Object.assign({}, fromVars, vars));
          }
        }
      } catch (e) {
        console.error("GSAP parse error", e);
      }
    });
  }
});

function setSlide(elementId, slideIndex) {
  var container = document.getElementById("slideshow-" + elementId);
  if (!container) return;
  var imgs = container.querySelectorAll("img");
  var dots = container.querySelectorAll(".slide-dot");
  if (slideIndex < 0) slideIndex = imgs.length - 1;
  if (slideIndex >= imgs.length) slideIndex = 0;
  
  container.setAttribute("data-current-index", slideIndex);

  for (var i = 0; i < imgs.length; i++) {
    imgs[i].style.opacity = (i === slideIndex) ? "1" : "0";
  }
  for (var j = 0; j < dots.length; j++) {
    dots[j].style.backgroundColor = (j === slideIndex) ? "#fff" : "rgba(255,255,255,0.4)";
  }
}

function moveSlide(elementId, step) {
  var container = document.getElementById("slideshow-" + elementId);
  if (!container) return;
  var imgs = container.querySelectorAll("img");
  if (imgs.length <= 1) return;
  
  var currentIndex = parseInt(container.getAttribute("data-current-index") || "0");
  var loop = container.getAttribute("data-loop") !== "false";
  
  var nextIndex = currentIndex + step;
  if (nextIndex < 0) {
    if (!loop) return;
    nextIndex = imgs.length - 1;
  } else if (nextIndex >= imgs.length) {
    if (!loop) return;
    nextIndex = 0;
  }
  setSlide(elementId, nextIndex);
}

document.addEventListener("DOMContentLoaded", function() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  var slideshows = document.querySelectorAll("[id^='slideshow-']");
  slideshows.forEach(function(s) {
    var elementId = s.id.replace("slideshow-", "");
    var imgs = s.querySelectorAll("img");
    if (imgs.length <= 1) return;
    
    s.setAttribute("data-current-index", "0");
    var autoplay = s.getAttribute("data-autoplay") !== "false";
    var loop = s.getAttribute("data-loop") !== "false";
    var interval = parseInt(s.getAttribute("data-interval") || "3000");
    
    if (autoplay) {
      setInterval(function() {
        var currentIndex = parseInt(s.getAttribute("data-current-index") || "0");
        if (currentIndex === imgs.length - 1 && !loop) return;
        var nextIndex = (currentIndex + 1) % imgs.length;
        setSlide(elementId, nextIndex);
      }, interval);
    }
  });
});
</script>
</body>
</html>`;

    const cleanPath = page.path.replace(/^\//, '');
    const filename = cleanPath === '' || cleanPath === 'home' ? 'index.html' : `${cleanPath}.html`;
    zip.file(filename, htmlContent);
  }

  const animationKeyframes = `
/* Animation Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

  const cssContent = `/* Global Styles */
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    overflow-x: hidden;
}

/* Ensure all project elements map cleanly to the Canvas layout coordinate modes */
[class^="el-"] {
    position: relative;
}

/* Ensure Lucide SVGs scale to fill their container bounds appropriately */
.lucide, svg {
    display: inline-block;
    vertical-align: middle;
    width: 100%;
    height: 100%;
}

/* Ensure all images and videos are responsive and constrained to their parent layout bounds, matching Tailwind preflight behavior */
img, video {
    max-width: 100%;
    max-height: 100%;
}

/* Element Styles */
${cssRules.join('\n')}

${animationKeyframes}
`;

  zip.file("styles.css", cssContent);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "project.zip");
};
