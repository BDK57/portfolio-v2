"use client";
/*
 * Mac Keyboard — from Componentry (componentry.dev/docs/components/mac-keyboard), types stripped.
 * Site change: `hintKeys` prop + data-active / data-hint attributes on keys so the intro can colour
 * pressed keys and pulse the next key to type.
 */
import { cn } from "../../../lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ChevronUp,
  Command,
  Globe,
  LayoutGrid,
  Lock,
  Mic,
  Moon,
  Option,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Sun,
  Volume1,
  Volume2,
  VolumeX
} from "lucide-react";
import * as React from "react";
const NO_KEYS = /* @__PURE__ */ new Set();
const KeyboardContext = React.createContext({
  activeKeys: NO_KEYS,
  hintKeys: NO_KEYS
});
function MacKeyboard({ className, soundSrc = "/audio/key-press.wav", hintKeys = NO_KEYS, ...props }) {
  const [activeKeys, setActiveKeys] = React.useState(/* @__PURE__ */ new Set());
  const audioCtxRef = React.useRef(null);
  const audioBufferRef = React.useRef(null);
  React.useEffect(() => {
    if (!soundSrc) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    fetch(soundSrc).then((res) => res.arrayBuffer()).then((buf) => ctx.decodeAudioData(buf)).then((decoded) => {
      audioBufferRef.current = decoded;
    }).catch(() => {
    });
    return () => {
      ctx.close().catch(() => {
      });
    };
  }, [soundSrc]);
  const playClick = React.useCallback(() => {
    const ctx = audioCtxRef.current;
    const buffer = audioBufferRef.current;
    if (!ctx || !buffer) return;
    const play = () => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = 0.15;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    };
    if (ctx.state === "suspended") {
      ctx.resume().then(play).catch(() => {
      });
    } else {
      play();
    }
  }, []);
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        newSet.add(e.code);
        return newSet;
      });
      playClick();
    };
    const handleKeyUp = (e) => {
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(e.code);
        return newSet;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playClick]);
  return <KeyboardContext.Provider value={{ activeKeys, hintKeys }}>
      {props.children ? <div
    className={cn(
      "inline-flex items-center gap-1.5 rounded-[1.5rem] bg-neutral-200 p-3 shadow-2xl dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800",
      className
    )}
    {...props}
  >
          {props.children}
        </div> : <div
    className={cn(
      "flex w-full min-w-[800px] max-w-5xl shrink-0 flex-col gap-2 rounded-[1.5rem] bg-neutral-200 p-3 shadow-2xl dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800",
      className
    )}
    style={{ minWidth: "800px" }}
    {...props}
  >
          {
    /* Row 1: Esc, F1-F12, Touch ID */
  }
          <Row>
            <MacKey width={1.5} keyCode="Escape" className="text-[10px] items-start pl-3">esc</MacKey>
            <MacKey width={1} keyCode="F1" icon={<Sun className="h-4 w-4" />} iconLabel="F1" />
            <MacKey width={1} keyCode="F2" icon={<Sun className="h-4 w-4" />} iconLabel="F2" />
            <MacKey width={1} keyCode="F3" icon={<LayoutGrid className="h-4 w-4" />} iconLabel="F3" />
            <MacKey width={1} keyCode="F4" icon={<Search className="h-4 w-4" />} iconLabel="F4" />
            <MacKey width={1} keyCode="F5" icon={<Mic className="h-4 w-4" />} iconLabel="F5" />
            <MacKey width={1} keyCode="F6" icon={<Moon className="h-4 w-4" />} iconLabel="F6" />
            <MacKey width={1} keyCode="F7" icon={<SkipBack className="h-4 w-4 fill-current" />} iconLabel="F7" />
            <MacKey width={1} keyCode="F8" icon={<Play className="h-4 w-4 fill-current" />} iconLabel="F8" />
            <MacKey width={1} keyCode="F9" icon={<SkipForward className="h-4 w-4 fill-current" />} iconLabel="F9" />
            <MacKey width={1} keyCode="F10" icon={<VolumeX className="h-4 w-4" />} iconLabel="F10" />
            <MacKey width={1} keyCode="F11" icon={<Volume1 className="h-4 w-4" />} iconLabel="F11" />
            <MacKey width={1} keyCode="F12" icon={<Volume2 className="h-4 w-4" />} iconLabel="F12" />
            <MacKey width={1} icon={<Lock className="h-4 w-4" />} />
          </Row>

      {
    /* Row 2: Numbers */
  }
      <Row>
        <MacKey width={1} label="`" subLabel="~" />
        <MacKey width={1} label="1" subLabel="!" />
        <MacKey width={1} label="2" subLabel="@" />
        <MacKey width={1} label="3" subLabel="#" />
        <MacKey width={1} label="4" subLabel="$" />
        <MacKey width={1} label="5" subLabel="%" />
        <MacKey width={1} label="6" subLabel="^" />
        <MacKey width={1} label="7" subLabel="&" />
        <MacKey width={1} label="8" subLabel="*" />
        <MacKey width={1} label="9" subLabel="(" />
        <MacKey width={1} label="0" subLabel=")" />
        <MacKey width={1} label="-" subLabel="_" />
        <MacKey width={1} label="=" subLabel="+" />
        <MacKey width={1.5} className="items-end pr-2 text-xs" label="delete" />
      </Row>

      {
    /* Row 3: Tab */
  }
      <Row>
        <MacKey width={1.5} className="items-start pl-3 text-xs" label="tab" />
        <MacKey width={1} label="Q" />
        <MacKey width={1} label="W" />
        <MacKey width={1} label="E" />
        <MacKey width={1} label="R" />
        <MacKey width={1} label="T" />
        <MacKey width={1} label="Y" />
        <MacKey width={1} label="U" />
        <MacKey width={1} label="I" />
        <MacKey width={1} label="O" />
        <MacKey width={1} label="P" />
        <MacKey width={1} label="[" subLabel="{" />
        <MacKey width={1} label="]" subLabel="}" />
        <MacKey width={1} label="\" subLabel="|" />
      </Row>

      {
    /* Row 4: Caps */
  }
      <Row>
        <MacKey width={1.75} className="items-start pl-3 text-xs relative group" label="">
           <span className="z-10 mt-0.5">caps lock</span>
           <div className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-neutral-900/20 group-active:bg-green-500 transition-colors dark:bg-white/20" />
        </MacKey>
        <MacKey width={1} label="A" />
        <MacKey width={1} label="S" />
        <MacKey width={1} label="D" />
        <MacKey width={1} label="F" />
        <MacKey width={1} label="G" />
        <MacKey width={1} label="H" />
        <MacKey width={1} label="J" />
        <MacKey width={1} label="K" />
        <MacKey width={1} label="L" />
        <MacKey width={1} label=";" subLabel=":" />
        <MacKey width={1} label="'" subLabel='"' />
        <MacKey width={1.75} className="items-end pr-2 text-xs" label="return" />
      </Row>

      {
    /* Row 5: Shift */
  }
      <Row>
        <MacKey width={2.25} keyCode="ShiftLeft" className="items-start pl-3 text-xs" label="shift" />
        <MacKey width={1} label="Z" />
        <MacKey width={1} label="X" />
        <MacKey width={1} label="C" />
        <MacKey width={1} label="V" />
        <MacKey width={1} label="B" />
        <MacKey width={1} label="N" />
        <MacKey width={1} label="M" />
        <MacKey width={1} label="," subLabel="<" />
        <MacKey width={1} label="." subLabel=">" />
        <MacKey width={1} label="/" subLabel="?" />
        <MacKey width={2.25} keyCode="ShiftRight" className="items-end pr-2 text-xs" label="shift" />
      </Row>

      {
    /* Row 6: Bottom */
  }
      <Row>
        <MacKey
    width={1}
    className="items-end pr-1 pb-1"
    label={<span className="text-[10px] font-normal">fn</span>}
  >
          <Globe className="absolute top-2 left-2 h-4 w-4" />
        </MacKey>
        <MacKey
    width={1}
    keyCode="ControlLeft"
    className="items-end pr-1 pb-1"
    label={<span className="text-[10px] font-normal">control</span>}
  >
          <ChevronUp className="absolute top-2 left-2 h-4 w-4" />
        </MacKey>
        <MacKey
    width={1.25}
    keyCode="AltLeft"
    className="items-end pr-1 pb-1"
    label={<span className="text-[10px] font-normal">option</span>}
  >
          <Option className="absolute top-2 left-2 h-4 w-4" />
        </MacKey>
        <MacKey
    width={1.5}
    keyCode="MetaLeft"
    className="items-end pr-1 pb-1"
    label={<span className="text-[10px] font-bold">command</span>}
  >
          <Command className="absolute top-2 left-2 h-4 w-4" />
        </MacKey>
        {
    /* Spacebar */
  }
        <MacKey width={4} keyCode="Space" /> 
        <MacKey
    width={1.5}
    keyCode="MetaRight"
    className="items-end pl-1 pb-1"
    label={<span className="text-[10px] font-bold">command</span>}
  >
           <Command className="absolute top-2 right-2 h-4 w-4" />
        </MacKey>
        <MacKey
    width={1.25}
    keyCode="AltRight"
    className="items-end pl-1 pb-1"
    label={<span className="text-[10px] font-normal">option</span>}
  >
           <Option className="absolute top-2 right-2 h-4 w-4" />
        </MacKey>
        
        {
    /* Arrow keys */
  }
        <div style={{ flex: 3 }} className="grid h-full grid-cols-3 items-end gap-1.5 pl-0.5">
          <MacKey width={1} keyCode="ArrowLeft" className="h-full">
            <ArrowLeft className="h-4 w-4" />
          </MacKey>
          <div className="flex h-full min-h-0 flex-col gap-1.5">
            <MacKey
    width={1}
    noAspectRatio
    keyCode="ArrowUp"
    style={{ flex: 1 }}
    className="!min-h-0 items-center justify-center p-0 !rounded-[4px] shadow-[0_1px_0_1px_rgba(0,0,0,0.1)]"
  >
              <ArrowUp className="h-3 w-3" />
            </MacKey>
            <MacKey
    width={1}
    noAspectRatio
    keyCode="ArrowDown"
    style={{ flex: 1 }}
    className="!min-h-0 items-center justify-center p-0 !rounded-[4px] shadow-[0_1px_0_1px_rgba(0,0,0,0.1)]"
  >
              <ArrowDown className="h-3 w-3" />
            </MacKey>
          </div>
          <MacKey width={1} keyCode="ArrowRight" className="h-full">
            <ArrowRight className="h-4 w-4" />
          </MacKey>
        </div>
      </Row>
        </div>}
    </KeyboardContext.Provider>;
}
function Row({ children }) {
  return <div className="flex w-full gap-1.5">{children}</div>;
}
function MacKey({
  className,
  label,
  subLabel,
  icon,
  iconLabel,
  width = 1,
  children,
  keyCode,
  noAspectRatio,
  ...props
}) {
  const { activeKeys, hintKeys } = React.useContext(KeyboardContext);
  const matches = React.useCallback((activeKeys) => {
    if (keyCode) {
      if (Array.isArray(keyCode)) {
        return keyCode.some((code) => activeKeys.has(code));
      }
      return activeKeys.has(keyCode);
    }
    if (typeof label === "string") {
      const l = label.toLowerCase();
      if (/^[0-9]$/.test(l)) return activeKeys.has(`Digit${l}`);
      if (/^[a-z]$/.test(l)) return activeKeys.has(`Key${l.toUpperCase()}`);
      const symbolMap = {
        "-": "Minus",
        "=": "Equal",
        "[": "BracketLeft",
        "]": "BracketRight",
        "\\": "Backslash",
        ";": "Semicolon",
        "'": "Quote",
        ",": "Comma",
        ".": "Period",
        "/": "Slash",
        "`": "Backquote",
        "delete": "Backspace",
        "tab": "Tab",
        "caps lock": "CapsLock",
        "return": "Enter",
        "space": "Space"
      };
      if (symbolMap[l]) return activeKeys.has(symbolMap[l]);
    }
    return false;
  }, [keyCode, label]);
  const isActive = React.useMemo(() => matches(activeKeys), [matches, activeKeys]);
  const isHint = React.useMemo(() => matches(hintKeys), [matches, hintKeys]);
  const applyAspectRatio = !noAspectRatio;
  return <div
    style={{
      flex: width,
      ...applyAspectRatio ? { aspectRatio: `${width}/1` } : {}
    }}
    className="min-w-0 self-stretch"
  >
      <div
    className={cn(
      "group relative flex h-full w-full min-w-0 select-none flex-col items-center justify-center overflow-hidden rounded-lg bg-white",
      // Light mode shadows
      "shadow-[inset_0_-2px_1px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,1),0_1px_1px_rgba(0,0,0,0.1)]",
      // Dark mode overrides
      "dark:bg-neutral-800 dark:shadow-[inset_0_-2px_1px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05),0_1px_1px_rgba(0,0,0,0.5)]",
      // Active state styles - mimicking the active: pseudo-class but triggered by state
      isActive && "translate-y-[1px] shadow-none scale-[0.98]",
      "active:translate-y-[1px] active:shadow-none transition-all duration-100 active:scale-[0.98]",
      className
    )}
    data-active={isActive || void 0}
    data-hint={isHint || void 0}
    {...props}
  >
        {
    /* Icon only keys (F-keys) */
  }
        {icon && !label && !subLabel && !children && <div className="flex flex-col items-center justify-between h-full py-2">
              <span className="text-[15px]">{icon}</span>
              {iconLabel && <span className="text-[7px] leading-none opacity-60 font-medium">{iconLabel}</span>}
           </div>}

        {
    /* Number/Symbol keys */
  }
        {subLabel && <div className="flex flex-col items-center justify-between h-full py-2">
             <span className="text-xs font-normal opacity-60">{subLabel}</span>
             <span className="text-sm font-medium">{label}</span>
          </div>}
        
        {
    /* Letter keys */
  }
        {!subLabel && !icon && typeof label === "string" && label.length === 1 && <span className="text-lg font-medium">{label}</span>}

        {
    /* Modifier keys with text label */
  }
        {!subLabel && !icon && (typeof label !== "string" || label.length > 1) && !children && <span className="font-medium text-xs">{label}</span>}
        
        {children}
      </div>
    </div>;
}
export {
  MacKey,
  MacKeyboard
};
