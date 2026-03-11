import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

type FsModule = typeof import("node:fs");

async function loadBootstrapStorage(options?: { dbExists?: boolean }) {
  const mkdirSync = vi.fn();
  const existsSync = vi.fn(() => options?.dbExists ?? false);
  const copyFileSync = vi.fn();

  vi.doMock("node:fs", () => ({
    default: {
      mkdirSync,
      existsSync,
      copyFileSync,
    } satisfies Pick<FsModule, "mkdirSync" | "existsSync" | "copyFileSync">,
  }));

  vi.doMock("../runtimePaths", () => ({
    getRuntimeDbPath: vi.fn(() => "/runtime/db/app.sqlite"),
    getGeneratedDataRoot: vi.fn(() => "/runtime/generated-data"),
    getCorpusBinariesRoot: vi.fn(() => "/runtime/corpus-binaries"),
    getSeedDbPath: vi.fn(() => "/bundle/seed/app.sqlite"),
  }));

  const runtimeModule = await import("../runtimePaths");
  const bootstrapModule = await import("../bootstrapStorage");

  return {
    bootstrapStorage: bootstrapModule.bootstrapStorage,
    fs: { mkdirSync, existsSync, copyFileSync },
    runtimeModule,
  };
}

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.doUnmock("node:fs");
  vi.doUnmock("../runtimePaths");
});

describe("bootstrapStorage", () => {
  it("creates required runtime directories before checking the database", async () => {
    const { bootstrapStorage, fs } = await loadBootstrapStorage();

    bootstrapStorage();

    expect(fs.mkdirSync).toHaveBeenCalledTimes(3);
    expect(fs.mkdirSync).toHaveBeenNthCalledWith(1, path.dirname("/runtime/db/app.sqlite"), {
      recursive: true,
    });
    expect(fs.mkdirSync).toHaveBeenNthCalledWith(2, "/runtime/generated-data", {
      recursive: true,
    });
    expect(fs.mkdirSync).toHaveBeenNthCalledWith(3, "/runtime/corpus-binaries", {
      recursive: true,
    });
    expect(fs.existsSync).toHaveBeenCalledWith("/runtime/db/app.sqlite");
  });

  it("copies the seed database on first run", async () => {
    const { bootstrapStorage, fs } = await loadBootstrapStorage({ dbExists: false });

    bootstrapStorage();

    expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
    expect(fs.copyFileSync).toHaveBeenCalledWith("/bundle/seed/app.sqlite", "/runtime/db/app.sqlite");
  });

  it("does not copy the seed database when the runtime database already exists", async () => {
    const { bootstrapStorage, fs } = await loadBootstrapStorage({ dbExists: true });

    bootstrapStorage();

    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });
});
