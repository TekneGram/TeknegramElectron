/// <reference types="vite-plugin-electron/electron-env" />

import {
  ProjectCreationProgressEvent,
  ProjectCorpusMetadataProgressEvent,
} from "./ipc/contracts/progress.event.contracts";
type Unsubscribe = () => void;

declare global {
  declare namespace NodeJS {
    interface ProcessEnv {
      /**
       * The built directory structure
       *
       * ```tree
       * ├─┬─┬ dist
       * │ │ └── index.html
       * │ │
       * │ ├─┬ dist-electron
       * │ │ ├── main.js
       * │ │ └── preload.js
       * │
       * ```
       */
      APP_ROOT: string
      /** /dist/ or /public/ */
      VITE_PUBLIC: string
    }
  }

  // Used in Renderer process, expose in `preload.ts`
  interface Window {
    api: {
      invoke<T>(channel: string, payload?: unknown): Promise<T>;
      onProjectCreationProgress(
        listener: (event: ProjectCreationProgressEvent) => void
      ): Unsubscribe;
      onProjectCorpusMetadataProgress(
        listener: (event: ProjectCorpusMetadataProgressEvent) => void
      ): Unsubscribe;
    };
  }
}

