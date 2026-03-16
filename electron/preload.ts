import { ipcRenderer, contextBridge } from 'electron';
import { 
  PROJECTS_CREATE_PROGRESS_CHANNEL,
  PROJECTS_CORPUS_METADATA_PROGRESS_CHANNEL,
  type ProjectCreationProgressEvent,
  type ProjectCorpusMetadataProgressEvent,
} from "./ipc/contracts/progress.event.contracts";

type Unsubscribe = () => void;

contextBridge.exposeInMainWorld("api", {
  invoke<T>(channel: string, payload?: unknown): Promise<T> {
    return ipcRenderer.invoke(channel, payload) as Promise<T>;
  },

  onProjectCreationProgress(
    listener: (event: ProjectCreationProgressEvent) => void
  ): Unsubscribe {
    const wrapped = (_event: Electron.IpcRendererEvent, payload: ProjectCreationProgressEvent) => {
      listener(payload);
    }

    ipcRenderer.on(PROJECTS_CREATE_PROGRESS_CHANNEL, wrapped);

    return () => {
      ipcRenderer.off(PROJECTS_CREATE_PROGRESS_CHANNEL, wrapped);
    };
  },

  onProjectCorpusMetadataProgress(
    listener: (event: ProjectCorpusMetadataProgressEvent) => void
  ): Unsubscribe {
    const wrapped = (_event: Electron.IpcRendererEvent, payload: ProjectCorpusMetadataProgressEvent) => {
      listener(payload);
    };

    ipcRenderer.on(PROJECTS_CORPUS_METADATA_PROGRESS_CHANNEL, wrapped);

    return () => {
      ipcRenderer.off(PROJECTS_CORPUS_METADATA_PROGRESS_CHANNEL, wrapped);
    };
  },
});
