export class BaseError extends Error {
  code?: string;
  httpStatus?: number;
}

export class InitConfigError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = 'InitConfigError';
  }
}
