import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ProviderRow from "../ProviderRow";

describe("ProviderRow", () => {
  const baseProps = {
    provider: {
      provider: "openai" as const,
      displayName: "OpenAI",
      maskedApiKey: "sk*****UA",
      hasStoredKey: true,
      isDefault: true,
      defaultModel: "gpt-4.1-mini",
    },
    models: [
      {
        provider: "openai" as const,
        modelId: "gpt-4.1-mini",
        displayName: "GPT-4.1 Mini",
      },
    ],
    apiKeyDraft: "",
    isSaving: false,
    isDeleting: false,
    isUpdatingModel: false,
    isSettingDefault: false,
    onApiKeyDraftChange: vi.fn(),
    onSaveKey: vi.fn().mockResolvedValue(undefined),
    onDeleteKey: vi.fn().mockResolvedValue(undefined),
    onSetDefault: vi.fn().mockResolvedValue(undefined),
    onModelChange: vi.fn().mockResolvedValue(undefined),
  };

  it("shows the masked key first and reveals the input when clicked", () => {
    render(
      <table>
        <tbody>
          <ProviderRow {...baseProps} />
        </tbody>
      </table>
    );

    expect(screen.getByRole("button", { name: /stored key: sk\*{5}ua/i })).toBeTruthy();
    expect(screen.queryByPlaceholderText("Replace saved API key")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /stored key: sk\*{5}ua/i }));

    expect(screen.getByPlaceholderText("Replace saved API key")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Update key" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
  });
});
