/**
 * Backward-compatible bridge for older imports.
 * Prefer using `nativeProcessRunner.ts` for new features.
 */
import NativeProcessRunner, {
    type NativeRunCallback as RunCallback,
    type NativeRunParams as RunParams,
    type NativeRunResult as RunResult,
} from "./nativeProcessRunner";

export type { RunCallback, RunParams, RunResult };
export default NativeProcessRunner;
