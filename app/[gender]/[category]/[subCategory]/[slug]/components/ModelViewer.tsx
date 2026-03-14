'use client';

import { useEffect } from 'react';

interface ModelViewerProps {
  src: string;
  iosSrc?: string;
  alt: string;
}

export function ModelViewer({ src, iosSrc = '', alt }: ModelViewerProps) {
  useEffect(() => {
    // 动态加载并注册 web component
    import('@google/model-viewer');
  }, []);

  // 用 any 绕过 React 对自定义标签的类型检查（常见做法）
  const ModelViewerTag = 'model-viewer' as any;

  return (
    <ModelViewerTag
      src={src}
      ios-src={iosSrc}
      alt={alt}
      auto-rotate
      camera-controls
      ar
      ar-modes="webxr scene-viewer quick-look"  // 推荐顺序（iOS 优先 quick-look）
      ar-scale="auto"
      shadow-intensity="1"
      exposure="1"
      style={{ width: '100%', height: '100%' }}  // 推荐用 style 确保填满
    >
      <button
        slot="ar-button"
        className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-full uppercase tracking-widest font-semibold shadow-lg"
      >
        View in Your Space
      </button>
    </ModelViewerTag>
  );
}