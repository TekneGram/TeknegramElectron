import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useModalControl } from "../useModalControl";

describe("useModalControl", () => {
  it("starts closed, opens, and closes again", () => {
    const { result } = renderHook(() => useModalControl());

    expect(result.current.modalIsOpen).toBe(false);

    act(() => {
      result.current.openModal();
    });

    expect(result.current.modalIsOpen).toBe(true);

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.modalIsOpen).toBe(false);
  });
});
