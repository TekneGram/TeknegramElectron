import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createAppDatabaseMock,
  getRuntimeDbPathMock,
  getDefaultApiProviderMock,
  findProjectCorpusRowMock,
  findCorpusMetadataRowMock,
  upsertCorpusMetadataMock,
  createRunnerMock,
  summarizeCorpusMetadataControllerMock,
  loggerInfoMock,
  loggerWarnMock,
  getCorpusMetadataOperationMock,
  addCorpusMetadataListenerMock,
  registerCorpusMetadataOperationMock,
  removeCorpusMetadataListenerMock,
  removeCorpusMetadataOperationMock,
  emitCorpusMetadataProgressMock,
  createCredentialProviderMock,
  createLlmProviderRegistryMock,
} = vi.hoisted(() => ({
  createAppDatabaseMock: vi.fn(),
  getRuntimeDbPathMock: vi.fn(),
  getDefaultApiProviderMock: vi.fn(),
  findProjectCorpusRowMock: vi.fn(),
  findCorpusMetadataRowMock: vi.fn(),
  upsertCorpusMetadataMock: vi.fn(),
  createRunnerMock: vi.fn(),
  summarizeCorpusMetadataControllerMock: vi.fn(),
  loggerInfoMock: vi.fn(),
  loggerWarnMock: vi.fn(),
  getCorpusMetadataOperationMock: vi.fn(),
  addCorpusMetadataListenerMock: vi.fn(),
  registerCorpusMetadataOperationMock: vi.fn(),
  removeCorpusMetadataListenerMock: vi.fn(),
  removeCorpusMetadataOperationMock: vi.fn(),
  emitCorpusMetadataProgressMock: vi.fn(),
  createCredentialProviderMock: vi.fn(() => ({ kind: "credential-provider" })),
  createLlmProviderRegistryMock: vi.fn(() => ({ kind: "provider-registry" })),
}));

vi.mock("@electron/db/appDatabase", () => ({
  createAppDatabase: createAppDatabaseMock,
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
  getRuntimeDbPath: getRuntimeDbPathMock,
}));

vi.mock("@electron/db/repositories/projectRepositories", () => ({
  findProjectCorpusRow: findProjectCorpusRowMock,
  findCorpusMetadataRow: findCorpusMetadataRowMock,
  upsertCorpusMetadata: upsertCorpusMetadataMock,
}));

vi.mock("@electron/db/repositories/apiRepositories", () => ({
  getDefaultApiProvider: getDefaultApiProviderMock,
}));

vi.mock("@electron/services/nativeProcessFactory", () => ({
  default: {
    create: createRunnerMock,
  },
}));

vi.mock("@electron/llm/controllers/summarizeCorpusMetadataController", () => ({
  summarizeCorpusMetadataController: summarizeCorpusMetadataControllerMock,
}));

vi.mock("@electron/llm/createCredentialProvider", () => ({
  createCredentialProvider: createCredentialProviderMock,
}));

vi.mock("@electron/llm/providers/providerRegistry", () => ({
  createLlmProviderRegistry: createLlmProviderRegistryMock,
}));

vi.mock("@electron/services/logger", () => ({
  logger: {
    info: loggerInfoMock,
    warn: loggerWarnMock,
    error: vi.fn(),
  },
}));

vi.mock("@electron/services/projectServiceRegistry", () => ({
  projectServiceRegistry: {
    getCorpusMetadataOperation: getCorpusMetadataOperationMock,
    addCorpusMetadataListener: addCorpusMetadataListenerMock,
    registerCorpusMetadataOperation: registerCorpusMetadataOperationMock,
    removeCorpusMetadataListener: removeCorpusMetadataListenerMock,
    removeCorpusMetadataOperation: removeCorpusMetadataOperationMock,
    emitCorpusMetadataProgress: emitCorpusMetadataProgressMock,
  },
}));

import { getCorpusMetadata } from "../projects/getCorpusMetadata";

describe("getCorpusMetadata", () => {
  const readCloseMock = vi.fn();
  const writeCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    getRuntimeDbPathMock.mockReturnValue("/tmp/runtime.db");
    getCorpusMetadataOperationMock.mockReturnValue(undefined);
    createAppDatabaseMock.mockReset();
    createAppDatabaseMock
      .mockReturnValueOnce({ db: { kind: "read-db" }, close: readCloseMock })
      .mockReturnValueOnce({ db: { kind: "write-db" }, close: writeCloseMock });
    findProjectCorpusRowMock.mockReturnValue({
      project_uuid: "project-1",
      corpus_uuid: "corpus-1",
      corpus_name: "BAWE",
      binary_files_path: "/tmp/corpus-binaries/bawe",
    });
    getDefaultApiProviderMock.mockReturnValue({
      provider: "openai",
      display_name: "OpenAI",
      default_model: "gpt-5-mini",
      is_default: 1,
      has_stored_key: 1,
      created_at: "2026-03-11T00:00:00.000Z",
      updated_at: "2026-03-11T00:00:00.000Z",
    });
  });

  it("returns cached corpus metadata without invoking the native pipeline", async () => {
    findCorpusMetadataRowMock.mockReturnValue({
      corpus_uuid: "corpus-1",
      metadata_json: "{\"docs\":10}",
      summary_text: "Cached summary",
      llm_provider: "openai",
      llm_model: "gpt-5-mini",
      created_at: "2026-03-11T00:00:00.000Z",
      updated_at: "2026-03-11T00:00:00.000Z",
    });

    const result = await getCorpusMetadata(
      {
        requestId: "req-1",
        projectUuid: "11111111-1111-4111-8111-111111111111",
      },
      {
        correlationId: "cid-1",
        sendEvent: vi.fn(),
      },
    );

    expect(result).toEqual({
      projectUuid: "11111111-1111-4111-8111-111111111111",
      summary: "Cached summary",
      source: "cache",
    });
    expect(createRunnerMock).not.toHaveBeenCalled();
    expect(summarizeCorpusMetadataControllerMock).not.toHaveBeenCalled();
    expect(upsertCorpusMetadataMock).not.toHaveBeenCalled();
    expect(emitCorpusMetadataProgressMock).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      expect.objectContaining({
        stage: "complete",
        message: "Using cached corpus metadata summary.",
        percent: 100,
      }),
    );
    expect(emitCorpusMetadataProgressMock).toHaveBeenCalledTimes(2);
    expect(readCloseMock).toHaveBeenCalledTimes(1);
    expect(writeCloseMock).not.toHaveBeenCalled();
  });

  it("persists generated metadata summaries and emits a single complete event", async () => {
    const runner = {
      runProcess: vi.fn().mockResolvedValue({
        result: {
          corpus_name: "BAWE",
          docs: 10,
          lemmas: 20,
          types: 30,
          words: 40,
          subcorpora: [],
        },
      }),
    };
    findCorpusMetadataRowMock.mockReturnValue(undefined);
    createRunnerMock.mockReturnValue(runner);
    summarizeCorpusMetadataControllerMock.mockResolvedValue({
      ok: true,
      data: {
        summary: "Generated summary",
        provider: "openai",
        model: "gpt-5-mini",
      },
    });

    const result = await getCorpusMetadata(
      {
        requestId: "req-2",
        projectUuid: "11111111-1111-4111-8111-111111111111",
      },
      {
        correlationId: "cid-2",
        sendEvent: vi.fn(),
      },
    );

    expect(result).toEqual({
      projectUuid: "11111111-1111-4111-8111-111111111111",
      summary: "Generated summary",
      source: "generated",
    });
    expect(upsertCorpusMetadataMock).toHaveBeenCalledWith(
      { kind: "write-db" },
      expect.objectContaining({
        corpus_uuid: "corpus-1",
        metadata_json: JSON.stringify({
          corpus_name: "BAWE",
          docs: 10,
          lemmas: 20,
          types: 30,
          words: 40,
          subcorpora: [],
        }),
        summary_text: "Generated summary",
        llm_provider: "openai",
        llm_model: "gpt-5-mini",
      }),
    );
    expect(emitCorpusMetadataProgressMock.mock.calls.filter(([, event]) => event.stage === "complete")).toHaveLength(1);
    expect(removeCorpusMetadataOperationMock).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111");
    expect(readCloseMock).toHaveBeenCalledTimes(1);
    expect(writeCloseMock).toHaveBeenCalledTimes(1);
  });

  it("logs the normalized LLM message and persists metadata when falling back", async () => {
    const runner = {
      runProcess: vi.fn().mockResolvedValue({
        result: {
          corpus_name: "BAWE",
          docs: 10,
          lemmas: 20,
          types: 30,
          words: 40,
          subcorpora: [],
        },
      }),
    };

    findCorpusMetadataRowMock.mockReturnValue(undefined);
    createRunnerMock.mockReturnValue(runner);
    summarizeCorpusMetadataControllerMock.mockResolvedValue({
      ok: false,
      error: {
        code: "LLM_REQUEST_INVALID",
        message: "OpenAI request invalid (status 400): Invalid schema.",
        details: "provider=openai, model=gpt-4.1-mini",
      },
    });

    const result = await getCorpusMetadata(
      {
        requestId: "req-3",
        projectUuid: "11111111-1111-4111-8111-111111111111",
      },
      {
        correlationId: "cid-3",
        sendEvent: vi.fn(),
      },
    );

    expect(result).toEqual({
      projectUuid: "11111111-1111-4111-8111-111111111111",
      summary: "This corpus has 10 documents, 20 lemmas, 30 types and 40 words.",
      source: "fallback",
    });
    expect(loggerWarnMock).toHaveBeenCalledWith("Falling back to deterministic corpus metadata summary", {
      correlationId: "cid-3",
      projectUuid: "11111111-1111-4111-8111-111111111111",
      corpusUuid: "corpus-1",
      llmCode: "LLM_REQUEST_INVALID",
      llmMessage: "OpenAI request invalid (status 400): Invalid schema.",
      llmDetails: "provider=openai, model=gpt-4.1-mini",
    });
    expect(upsertCorpusMetadataMock).toHaveBeenCalledWith(
      { kind: "write-db" },
      expect.objectContaining({
        metadata_json: JSON.stringify({
          corpus_name: "BAWE",
          docs: 10,
          lemmas: 20,
          types: 30,
          words: 40,
          subcorpora: [],
        }),
        summary_text: "This corpus has 10 documents, 20 lemmas, 30 types and 40 words.",
        llm_provider: null,
        llm_model: null,
      }),
    );
  });

  it("reuses an active metadata operation and wires listener events to the current request", async () => {
    const activePromise = Promise.resolve({
      projectUuid: "11111111-1111-4111-8111-111111111111",
      summary: "Shared summary",
      source: "generated" as const,
    });
    const sendEvent = vi.fn();

    getCorpusMetadataOperationMock.mockReturnValue({
      projectUuid: "11111111-1111-4111-8111-111111111111",
      promise: activePromise,
      listeners: new Map(),
    });

    const resultPromise = getCorpusMetadata(
      {
        requestId: "req-4",
        projectUuid: "11111111-1111-4111-8111-111111111111",
      },
      {
        correlationId: "cid-4",
        sendEvent,
      },
    );

    const listener = addCorpusMetadataListenerMock.mock.calls[0]?.[2];

    if (!listener) {
      throw new Error("expected listener to be registered");
    }

    listener({
      requestId: "old-request",
      projectUuid: "11111111-1111-4111-8111-111111111111",
      correlationId: "old-correlation",
      stage: "complete",
      message: "Corpus metadata is ready.",
      percent: 100,
    });

    const result = await resultPromise;

    expect(result).toEqual({
      projectUuid: "11111111-1111-4111-8111-111111111111",
      summary: "Shared summary",
      source: "generated",
    });
    expect(registerCorpusMetadataOperationMock).not.toHaveBeenCalled();
    expect(removeCorpusMetadataOperationMock).not.toHaveBeenCalled();
    expect(addCorpusMetadataListenerMock).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "req-4",
      expect.any(Function),
    );
    expect(sendEvent).toHaveBeenCalledWith(
      "projects:corpus-metadata:progress",
      expect.objectContaining({
        requestId: "req-4",
        correlationId: "cid-4",
        stage: "complete",
        message: "Corpus metadata is ready.",
        percent: 100,
      }),
    );
    expect(removeCorpusMetadataListenerMock).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "req-4",
    );
  });
});
