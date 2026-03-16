import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppException } from "@electron/core/appException";

const { spawnMock, existsSyncMock, getExecutablePathMock } = vi.hoisted(() => ({
  spawnMock: vi.fn(),
  existsSyncMock: vi.fn(),
  getExecutablePathMock: vi.fn(),
}));

vi.mock("child_process", () => ({
  spawn: spawnMock,
  default: {
    spawn: spawnMock,
  },
}));

vi.mock("node:fs", () => ({
  default: {
    existsSync: existsSyncMock,
  },
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
  getExecutablePath: getExecutablePathMock,
}));

import NativeProcessRunner from "../nativeProcessFactory";

class FakeReadable extends EventEmitter {
  emitData(value: string): void {
    this.emit("data", Buffer.from(value, "utf8"));
  }
}

class FakeChildProcess extends EventEmitter {
  stdout = new FakeReadable();
  stderr = new FakeReadable();
  stdin = {
    write: vi.fn(),
    end: vi.fn(),
  };
  killed = false;
  exitCode: number | null = null;
  kill = vi.fn((signal?: string) => {
    this.killed = true;
    if (signal === "SIGTERM") {
      this.exitCode = null;
    }
    return true;
  });
}

describe("NativeProcessRunner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getExecutablePathMock.mockReturnValue("/tmp/native/corpus_build_pipeline");
    existsSyncMock.mockReturnValue(true);
  });

  it("throws when the executable path does not exist", () => {
    existsSyncMock.mockReturnValue(false);

    expect(() =>
      NativeProcessRunner.create({
        executable: "corpus_build_pipeline",
      })
    ).toThrow(AppException);
  });

  it("collects stdout and stderr for a successful non-JSON process", async () => {
    const child = new FakeChildProcess();
    spawnMock.mockReturnValue(child);

    const runner = NativeProcessRunner.create({
      executable: "corpus_build_pipeline",
    });
    const promise = runner.runProcess('{"command":"build"}');

    child.stdout.emitData("hello");
    child.stderr.emitData("warn");
    child.exitCode = 0;
    child.emit("close", 0);

    await expect(promise).resolves.toEqual({
      stdout: "hello",
      stderr: "warn",
      exitCode: 0,
      messages: [],
      result: undefined,
    });
    expect(child.stdin.write).toHaveBeenCalledWith('{"command":"build"}\n', "utf8");
    expect(child.stdin.end).toHaveBeenCalledTimes(1);
  });

  it("parses JSON lines, emits progress callbacks, and returns the final result", async () => {
    const child = new FakeChildProcess();
    const onProgress = vi.fn();
    spawnMock.mockReturnValue(child);

    const runner = NativeProcessRunner.create<{ outputDir: string }>({
      executable: "corpus_build_pipeline",
      expectJsonLines: true,
      onProgress,
    });
    const promise = runner.runProcess();

    child.stdout.emitData('{"type":"progress","message":"Starting","percent":10}\n');
    child.stdout.emitData("non-json-line\n");
    child.stdout.emitData('{"type":"result","data":{"outputDir":"/tmp/out"}}\n');
    child.exitCode = 0;
    child.emit("close", 0);

    await expect(promise).resolves.toMatchObject({
      stdout:
        '{"type":"progress","message":"Starting","percent":10}\n' +
        "non-json-line\n" +
        '{"type":"result","data":{"outputDir":"/tmp/out"}}\n',
      stderr: "",
      exitCode: 0,
      messages: [
        { type: "progress", message: "Starting", percent: 10 },
        { type: "result", data: { outputDir: "/tmp/out" } },
      ],
      result: { outputDir: "/tmp/out" },
    });
    expect(onProgress).toHaveBeenCalledWith({
      type: "progress",
      message: "Starting",
      percent: 10,
    });
  });

  it("rejects when the child process emits an error event", async () => {
    const child = new FakeChildProcess();
    spawnMock.mockReturnValue(child);

    const runner = NativeProcessRunner.create({
      executable: "corpus_build_pipeline",
    });
    const promise = runner.runProcess();

    child.emit("error", new Error("spawn failed"));

    await expect(promise).rejects.toMatchObject({
      code: "CPP_PROCESS_SPAWN_FAILED",
      message: "spawn failed",
    });
  });

  it("rejects when the native process reports a JSON error message", async () => {
    const child = new FakeChildProcess();
    spawnMock.mockReturnValue(child);

    const runner = NativeProcessRunner.create({
      executable: "corpus_build_pipeline",
      expectJsonLines: true,
    });
    const promise = runner.runProcess();

    child.stdout.emitData(
      '{"type":"error","message":"Native validation failed","details":"bad input"}\n'
    );
    child.exitCode = 1;
    child.emit("close", 1);

    await expect(promise).rejects.toMatchObject({
      code: "CPP_PROCESS_NON_ZERO_EXIT",
      message: "Native validation failed",
      details: "bad input",
    });
  });

  it("rejects on a non-zero exit without a JSON error payload", async () => {
    const child = new FakeChildProcess();
    spawnMock.mockReturnValue(child);

    const runner = NativeProcessRunner.create({
      executable: "corpus_build_pipeline",
    });
    const promise = runner.runProcess();

    child.stderr.emitData("segmentation fault");
    child.exitCode = 2;
    child.emit("close", 2);

    await expect(promise).rejects.toMatchObject({
      code: "CPP_PROCESS_NON_ZERO_EXIT",
      message: "Native process failed",
      details: "segmentation fault",
    });
  });

  it("rejects in JSON mode when no result message is produced", async () => {
    const child = new FakeChildProcess();
    spawnMock.mockReturnValue(child);

    const runner = NativeProcessRunner.create({
      executable: "corpus_build_pipeline",
      expectJsonLines: true,
    });
    const promise = runner.runProcess();

    child.stdout.emitData('{"type":"progress","message":"still working"}\n');
    child.exitCode = 0;
    child.emit("close", 0);

    await expect(promise).rejects.toMatchObject({
      code: "CPP_PROCESS_NON_ZERO_EXIT",
      message: "Native process completed without a result message",
    });
  });

  it("cancels a running process with SIGTERM and rejects as cancelled", async () => {
    const child = new FakeChildProcess();
    spawnMock.mockReturnValue(child);

    const runner = NativeProcessRunner.create({
      executable: "corpus_build_pipeline",
    });
    const promise = runner.runProcess();

    runner.cancelProcess();
    child.emit("close", 0);

    expect(child.kill).toHaveBeenCalledWith("SIGTERM");
    await expect(promise).rejects.toMatchObject({
      code: "CPP_PROCESS_CANCELLED",
      message: "Native process was cancelled",
    });
  });

  it("ignores repeated cancel requests after the process has already exited", () => {
    const child = new FakeChildProcess();
    child.exitCode = 0;
    spawnMock.mockReturnValue(child);

    const runner = NativeProcessRunner.create({
      executable: "corpus_build_pipeline",
    });

    runner.cancelProcess();

    expect(child.kill).not.toHaveBeenCalled();
  });
});
