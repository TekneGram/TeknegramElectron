import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createAppDatabaseMock,
  getRuntimeDbPathMock,
  listApiProvidersRowsMock,
  loggerInfoMock,
  getApiKeyMock,
} = vi.hoisted(() => ({
  createAppDatabaseMock: vi.fn(),
  getRuntimeDbPathMock: vi.fn(),
  listApiProvidersRowsMock: vi.fn(),
  loggerInfoMock: vi.fn(),
  getApiKeyMock: vi.fn(),
}));

vi.mock("@electron/db/appDatabase", () => ({
  createAppDatabase: createAppDatabaseMock,
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
  getRuntimeDbPath: getRuntimeDbPathMock,
}));

vi.mock("@electron/db/repositories/apiRepositories", () => ({
  listApiProvidersRows: listApiProvidersRowsMock,
}));

vi.mock("@electron/services/logger", () => ({
  logger: {
    info: loggerInfoMock,
  },
}));

import { listApiProviders } from "../settings/listApiProviders";

describe("listApiProviders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRuntimeDbPathMock.mockReturnValue("/tmp/runtime.db");
  });

  it("masks stored API keys with a fixed five-star middle segment", async () => {
    const closeMock = vi.fn();
    const db = { kind: "db" };

    createAppDatabaseMock.mockReturnValue({ db, close: closeMock });
    listApiProvidersRowsMock.mockReturnValue([
      {
        provider: "openai",
        display_name: "OpenAI",
        has_stored_key: 1,
        is_default: 1,
        default_model: "gpt-4.1-mini",
      },
    ]);
    getApiKeyMock.mockResolvedValue("sk-abcdefghijklmnopqrstuvwxyz1234567890");

    const result = await listApiProviders(
      {
        correlationId: "cid-settings-1",
        sendEvent: vi.fn(),
      },
      {
        getApiKey: getApiKeyMock,
      }
    );

    expect(result).toEqual({
      providers: [
        {
          provider: "openai",
          displayName: "OpenAI",
          maskedApiKey: "sk*****90",
          hasStoredKey: true,
          isDefault: true,
          defaultModel: "gpt-4.1-mini",
        },
      ],
    });
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
