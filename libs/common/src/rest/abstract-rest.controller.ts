import { HttpException, HttpStatus, Logger } from "@nestjs/common";
export abstract class AbstractRestController {
    protected constructor(protected readonly logger: Logger) {}

    protected _handleError(
        error: Error,
        message: string,
        status: HttpStatus = HttpStatus.FORBIDDEN,
      ): void {
        this.logger.error(message, error);
        throw new HttpException(message, status, {
          cause: error,
        });
      }
}