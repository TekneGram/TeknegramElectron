export type LlmToolLoop = {
    run(): Promise<void>;
};

export const noOpLlmToolLoop: LlmToolLoop = {
    async run(): Promise<void> {
        return;
    },
 }