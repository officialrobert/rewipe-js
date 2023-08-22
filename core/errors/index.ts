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

export class FeatureError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = 'FeatureError';
  }
}

export class TestIterationError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = 'TestIterationError';
  }
}

export class RewipeUnsupportedError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = 'RewipeUnsupportedError';
  }
}
