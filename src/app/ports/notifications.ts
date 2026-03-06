export interface NotifierPort {
    error(message: string, opts?: { id?: string }): void;
    success(message: string, opts?: { id?: string }): void;
}