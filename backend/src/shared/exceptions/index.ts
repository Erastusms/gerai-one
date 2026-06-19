export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors: any[] = []
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationException extends HttpException {
  constructor(errors: { field: string; message: string }[]) {
    super(400, "Validation error", errors);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized access") {
    super(401, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = "Forbidden access") {
    super(403, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Conflict in resource state") {
    super(409, message);
  }
}

export class InternalServerException extends HttpException {
  constructor(message = "Internal server error") {
    super(500, message);
  }
}
