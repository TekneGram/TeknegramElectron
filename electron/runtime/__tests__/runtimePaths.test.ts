import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const originalPlatform = process.platform;
const originalResourcesPath = process.resourcesPath;

function setPlatform(platform: NodeJS.Platform | string): void {
  Object.defineProperty(process, "platform", {
    configurable: true,
    value: platform,
  });
}

function setResourcesPath(resourcesPath: string): void {
  Object.defineProperty(process, "resourcesPath", {
    configurable: true,
    value: resourcesPath,
  });
}

async function loadRuntimePaths(options: {
  isPackaged: boolean;
  userDataPath?: string;
}): Promise<typeof import("../runtimePaths")> {
  const getPath = vi.fn((name: string) => {
    if (name === "userData") {
      return options.userDataPath ?? "/user-data";
    }

    throw new Error(`Unexpected app path request: ${name}`);
  });

  vi.doMock("electron", () => ({
    app: {
      getPath,
      isPackaged: options.isPackaged,
    },
  }));

  return import("../runtimePaths");
}

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.doUnmock("electron");
  setPlatform(originalPlatform);
  setResourcesPath(originalResourcesPath);
});

describe("runtimePaths", () => {
  it("returns development paths from the repository when not packaged", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/repo");
    setPlatform("darwin");

    const runtimePaths = await loadRuntimePaths({ isPackaged: false });

    expect(runtimePaths.getUserDataRoot()).toBe("/user-data");
    expect(runtimePaths.getRuntimeDbPath()).toBe("/repo/electron/db/dev-app.sqlite");
    expect(runtimePaths.getGeneratedDataRoot()).toBe("/repo/electron/bin/generated-data");
    expect(runtimePaths.getCorpusBinariesRoot()).toBe("/repo/electron/bin/corpus-binaries");
    expect(runtimePaths.getUdpipeModelPath()).toBe(
      "/repo/electron/assets/models/english-partut-ud-2.5-191206.udpipe"
    );
    expect(runtimePaths.getSeedDbPath()).toBe("/repo/electron/assets/seed/app.sqlite");
    expect(runtimePaths.getExecutablePath("corpus-builder")).toBe(
      "/repo/electron/bin/executables/mac/corpus-builder"
    );
  });

  it("returns packaged paths from user data and bundled resources", async () => {
    setPlatform("linux");
    setResourcesPath("/bundle/resources");

    const runtimePaths = await loadRuntimePaths({
      isPackaged: true,
      userDataPath: "/app/user-data",
    });

    expect(runtimePaths.getRuntimeDbPath()).toBe("/app/user-data/db/app.sqlite");
    expect(runtimePaths.getGeneratedDataRoot()).toBe("/app/user-data/generated-data");
    expect(runtimePaths.getCorpusBinariesRoot()).toBe("/app/user-data/corpus-binaries");
    expect(runtimePaths.getUdpipeModelPath()).toBe(
      "/bundle/resources/models/english-partut-ud-2.5-191206.udpipe"
    );
    expect(runtimePaths.getSeedDbPath()).toBe("/bundle/resources/seed/app.sqlite");
    expect(runtimePaths.getExecutablePath("corpus-builder")).toBe(
      "/bundle/resources/bin/executables/linux/corpus-builder"
    );
  });

  it("appends .exe for Windows executables", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/repo");
    setPlatform("win32");

    const runtimePaths = await loadRuntimePaths({ isPackaged: false });

    expect(runtimePaths.getExecutablePath("corpus-builder")).toBe(
      "/repo/electron/bin/executables/windows/corpus-builder.exe"
    );
  });

  it("sanitizes generated output and corpus binary directory names", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/repo");
    setPlatform("linux");

    const runtimePaths = await loadRuntimePaths({ isPackaged: false });

    expect(runtimePaths.getGeneratedOutputDir("  corpus 01 / alpha  ")).toBe(
      path.join("/repo/electron/bin/generated-data", "corpus_01_alpha")
    );
    expect(runtimePaths.getCorpusBinariesDir("%%%sample---name%%%")).toBe(
      path.join("/repo/electron/bin/corpus-binaries", "sample---name")
    );
  });

  it("rejects empty and fully invalid resource ids", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/repo");
    setPlatform("linux");

    const runtimePaths = await loadRuntimePaths({ isPackaged: false });

    expect(() => runtimePaths.getGeneratedOutputDir("   ")).toThrow("Resource id cannot be empty.");
    expect(() => runtimePaths.getCorpusBinariesDir("!!!")).toThrow(
      "Resource id is invalid after sanitization."
    );
  });

  it("throws for unsupported platforms when resolving executables", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/repo");
    setPlatform("sunos");

    const runtimePaths = await loadRuntimePaths({ isPackaged: false });

    expect(() => runtimePaths.getExecutablePath("corpus-builder")).toThrow(
      "Unsupported platform: sunos"
    );
  });
});
