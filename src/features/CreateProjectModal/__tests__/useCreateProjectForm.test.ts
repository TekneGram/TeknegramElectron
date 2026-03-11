import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useCreateProjectForm from "../hooks/useCreateProjectForm";

describe("useCreateProjectForm", () => {
  it("starts with empty values and cannot submit", () => {
    const { result } = renderHook(() => useCreateProjectForm());

    expect(result.current.values).toEqual({
      projectName: "",
      corpusName: "",
      folderPath: "",
      semanticsRulesPath: "",
    });
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.errors.projectName).toBe("Project name is required.");
    expect(result.current.errors.corpusName).toBe("Corpus name is required");
    expect(result.current.errors.folderPath).toBe("Corpus folder is required");
    expect(result.current.errors.semanticsRulesPath).toBe("");
  });

  it("allows submit when required fields are present and semantics rules path is empty", () => {
    const { result } = renderHook(() => useCreateProjectForm());

    act(() => {
      result.current.setters.setProjectName(" Project ");
      result.current.setters.setCorpusName(" Corpus ");
      result.current.setters.setFolderPath(" /tmp/corpus ");
    });

    expect(result.current.canSubmit).toBe(true);
    expect(result.current.errors.projectName).toBe("");
    expect(result.current.errors.corpusName).toBe("");
    expect(result.current.errors.folderPath).toBe("");
  });

  it("rejects a non-tsv semantics rules path", () => {
    const { result } = renderHook(() => useCreateProjectForm());

    act(() => {
      result.current.setters.setProjectName("Project");
      result.current.setters.setCorpusName("Corpus");
      result.current.setters.setFolderPath("/tmp/corpus");
      result.current.setters.setSemanticsRulesPath("/tmp/rules.txt");
    });

    expect(result.current.canSubmit).toBe(false);
    expect(result.current.errors.semanticsRulesPath).toBe("Semantic rules file must be a TSV file.");
  });

  it("accepts a .tsv semantics rules path case-insensitively", () => {
    const { result } = renderHook(() => useCreateProjectForm());

    act(() => {
      result.current.setters.setProjectName("Project");
      result.current.setters.setCorpusName("Corpus");
      result.current.setters.setFolderPath("/tmp/corpus");
      result.current.setters.setSemanticsRulesPath("/tmp/rules.TSV");
    });

    expect(result.current.canSubmit).toBe(true);
    expect(result.current.errors.semanticsRulesPath).toBe("");
  });

  it("resetForm clears all values", () => {
    const { result } = renderHook(() => useCreateProjectForm());

    act(() => {
      result.current.setters.setProjectName("Project");
      result.current.setters.setCorpusName("Corpus");
      result.current.setters.setFolderPath("/tmp/corpus");
      result.current.setters.setSemanticsRulesPath("/tmp/rules.tsv");
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual({
      projectName: "",
      corpusName: "",
      folderPath: "",
      semanticsRulesPath: "",
    });
  });
});
