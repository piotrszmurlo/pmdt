export class PmdtError extends Error {
  constructor(
    public override message: string,
    public exitCode: number = 1
  ) {
    super(message);
    this.name = 'PmdtError';
  }
}

export class NotFoundError extends PmdtError {
  constructor(id: string) {
    super(`Task not found: ${id}`, 2);
    this.name = 'NotFoundError';
  }
}

export class NotInProjectError extends PmdtError {
  constructor() {
    super('Not a pmdt project. Run `pmdt init` first.', 1);
    this.name = 'NotInProjectError';
  }
}

export class ValidationError extends PmdtError {
  constructor(message: string) {
    super(message, 1);
    this.name = 'ValidationError';
  }
}
