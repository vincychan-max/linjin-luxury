/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        'ios-src'?: string;
        alt?: string;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'shadow-intensity'?: string;
        'camera-controls'?: boolean;
        ar?: boolean;
        'auto-rotate'?: boolean;
        'xr-environment'?: boolean;
      };
    }
  }
}

export {};
