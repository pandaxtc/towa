// fix type error for vite-plugin-svgr
// from https://github.com/pd4d10/vite-plugin-svgr/issues/3

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<React.SVGProps<
    SVGSVGElement
  > & { title?: string }>;
}