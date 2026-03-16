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
  beforeEach(() => {
    vi.clearAllMocks();
    getRuntimeDbPathMock.mockReturnValue("/tmp/runtime.db");
    getCorpusMetadataOperationMock.mockReturnValue(undefined);
  });

  it("logs the normalized LLM message and details when falling back", async () => {
    const closeMock = vi.fn();
    const db = { kind: "db" };
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

    createAppDatabaseMock.mockReturnValue({ db, close: closeMock });
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
        requestId: "req-1",
        projectUuid: "11111111-1111-4111-8111-111111111111",
      },
      {
        correlationId: "cid-1",
        sendEvent: vi.fn(),
      }
    );

    expect(result).toEqual({
      projectUuid: "11111111-1111-4111-8111-111111111111",
      summary: "This corpus has 10 documents, 20 lemmas, 30 types and 40 words.",
      source: "fallback",
    });
    expect(loggerWarnMock).toHaveBeenCalledWith("Falling back to deterministic corpus metadata summary", {
      correlationId: "cid-1",
      projectUuid: "11111111-1111-4111-8111-111111111111",
      corpusUuid: "corpus-1",
      llmCode: "LLM_REQUEST_INVALID",
      llmMessage: "OpenAI request invalid (status 400): Invalid schema.",
      llmDetails: "provider=openai, model=gpt-4.1-mini",
    });
    expect(summarizeCorpusMetadataControllerMock).toHaveBeenCalledWith(
      {
        metadata: {
          corpus_name: "BAWE",
          docs: 10,
          lemmas: 20,
          types: 30,
          words: 40,
          subcorpora: [],
        },
        preferredProvider: "openai",
        preferredModel: "gpt-5-mini",
      },
      expect.any(Object)
    );
    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(upsertCorpusMetadataMock).not.toHaveBeenCalled();
  });
});
