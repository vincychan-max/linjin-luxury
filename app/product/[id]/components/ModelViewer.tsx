'use client';
import { useEffect } from 'react';

export default function ModelViewer({ src, iosSrc, alt }: any) {
  useEffect(() => {
    import('@google/model-viewer');
  }, []);

  const ModelViewerTag = 'model-viewer' as any;

  return (
    <ModelViewerTag
      src={src}
      ios-src={iosSrc}
      alt={alt}
      camera-controls
      ar
      ar-modes="scene-viewer quick-look webxr"
      ar-scale="auto"
      auto-rotate
      className="w-full h-full"
    >
      <button
        slot="ar-button"
        className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full"
      >
        View in AR
      </button>
    </ModelViewerTag>
  );
}
