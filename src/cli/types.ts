export interface Ctx {
  name: string;
  rest: string[];
  usageError(message: string): void;
  errorCode: number;
}
