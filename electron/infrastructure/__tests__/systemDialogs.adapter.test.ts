import { beforeEach, describe, expect, it, vi } from "vitest";

const { getFocusedWindowMock, showOpenDialogMock } = vi.hoisted(() => ({
  getFocusedWindowMock: vi.fn(),
  showOpenDialogMock: vi.fn(),
}));

vi.mock("electron", () => ({
  BrowserWindow: {
    getFocusedWindow: getFocusedWindowMock,
  },
  dialog: {
    showOpenDialog: showOpenDialogMock,
  },
}));

import { systemDialogsAdapter } from "../adapters/systemDialogs.adapter";

describe("systemDialogsAdapter.openCorpusFolderDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the focused window when present", async () => {
    const focusedWindow = { id: 1 };
    getFocusedWindowMock.mockReturnValue(focusedWindow);
    showOpenDialogMock.mockResolvedValue({
      canceled: false,
      filePaths: ["/tmp/corpus"],
    });

    const result = await systemDialogsAdapter.openCorpusFolderDialog();

    expect(showOpenDialogMock).toHaveBeenCalledWith(focusedWindow, {
      properties: ["openDirectory"],
      title: "Select Corpus Folder",
      buttonLabel: "Choose Folder",
    });
    expect(result).toEqual({ folderPath: "/tmp/corpus" });
  });

  it("opens without a window when none is focused", async () => {
    getFocusedWindowMock.mockReturnValue(undefined);
    showOpenDialogMock.mockResolvedValue({
      canceled: false,
      filePaths: ["/tmp/corpus"],
    });

    const result = await systemDialogsAdapter.openCorpusFolderDialog();

    expect(showOpenDialogMock).toHaveBeenCalledWith({
      properties: ["openDirectory"],
      title: "Select Corpus Folder",
      buttonLabel: "Choose Folder",
    });
    expect(result).toEqual({ folderPath: "/tmp/corpus" });
  });

  it("returns null when the dialog is canceled", async () => {
    getFocusedWindowMock.mockReturnValue(undefined);
    showOpenDialogMock.mockResolvedValue({
      canceled: true,
      filePaths: ["/tmp/corpus"],
    });

    const result = await systemDialogsAdapter.openCorpusFolderDialog();

    expect(result).toEqual({ folderPath: null });
  });

  it("returns null when no folder paths are selected", async () => {
    getFocusedWindowMock.mockReturnValue(undefined);
    showOpenDialogMock.mockResolvedValue({
      canceled: false,
      filePaths: [],
    });

    const result = await systemDialogsAdapter.openCorpusFolderDialog();

    expect(result).toEqual({ folderPath: null });
  });

  it("returns only the first selected folder path", async () => {
    getFocusedWindowMock.mockReturnValue(undefined);
    showOpenDialogMock.mockResolvedValue({
      canceled: false,
      filePaths: ["/tmp/corpus-a", "/tmp/corpus-b"],
    });

    const result = await systemDialogsAdapter.openCorpusFolderDialog();

    expect(result).toEqual({ folderPath: "/tmp/corpus-a" });
  });
});

describe("systemDialogsAdapter.openSemanticsRulesFileDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the focused window when present", async () => {
    const focusedWindow = { id: 2 };
    getFocusedWindowMock.mockReturnValue(focusedWindow);
    showOpenDialogMock.mockResolvedValue({
      canceled: false,
      filePaths: ["/tmp/rules.tsv"],
    });

    const result = await systemDialogsAdapter.openSemanticsRulesFileDialog();

    expect(showOpenDialogMock).toHaveBeenCalledWith(focusedWindow, {
      properties: ["openFile"],
      title: "Select semantics rules tsv files",
      buttonLabel: "Choose Semantics Rules TSV file",
      filters: [{ name: "TSV Files", extensions: ["tsv"] }],
    });
    expect(result).toEqual({ filePath: "/tmp/rules.tsv" });
  });

  it("opens without a window when none is focused", async () => {
    getFocusedWindowMock.mockReturnValue(undefined);
    showOpenDialogMock.mockResolvedValue({
      canceled: false,
      filePaths: ["/tmp/rules.tsv"],
    });

    const result = await systemDialogsAdapter.openSemanticsRulesFileDialog();

    expect(showOpenDialogMock).toHaveBeenCalledWith({
      properties: ["openFile"],
      title: "Select semantics rules tsv file",
      buttonLabel: "Choose Semantics Rules TSV file",
      filters: [{ name: "TSV Files", extensions: ["tsv"] }],
    });
    expect(result).toEqual({ filePath: "/tmp/rules.tsv" });
  });

  it("returns null when the dialog is canceled", async () => {
    getFocusedWindowMock.mockReturnValue(undefined);
    showOpenDialogMock.mockResolvedValue({
      canceled: true,
      filePaths: ["/tmp/rules.tsv"],
    });

    const result = await systemDialogsAdapter.openSemanticsRulesFileDialog();

    expect(result).toEqual({ filePath: null });
  });

  it("returns null when no file paths are selected", async () => {
    getFocusedWindowMock.mockReturnValue(undefined);
    showOpenDialogMock.mockResolvedValue({
      canceled: false,
      filePaths: [],
    });

    const result = await systemDialogsAdapter.openSemanticsRulesFileDialog();

    expect(result).toEqual({ filePath: null });
  });

  it("returns only the first selected file path", async () => {
    getFocusedWindowMock.mockReturnValue(undefined);
    showOpenDialogMock.mockResolvedValue({
      canceled: false,
      filePaths: ["/tmp/rules-a.tsv", "/tmp/rules-b.tsv"],
    });

    const result = await systemDialogsAdapter.openSemanticsRulesFileDialog();

    expect(result).toEqual({ filePath: "/tmp/rules-a.tsv" });
  });
});
