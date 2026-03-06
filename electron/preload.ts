import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld("api", {
  invoke<T>(channel: string, payload?: unknown): Promise<T> {
    return ipcRenderer.invoke(channel, payload) as Promise<T>;
  },
});
