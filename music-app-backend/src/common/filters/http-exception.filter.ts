import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = '服务器内部错误'
    let error = 'Internal Server Error'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as {
          message?: string | string[]
          error?: string
        }
        message =
          (Array.isArray(responseObj.message)
            ? responseObj.message.join(', ')
            : responseObj.message) ||
          responseObj.error ||
          message
        error = responseObj.error || error
      }
    } else if (exception instanceof Error) {
      message = exception.message
    }

    // 记录错误日志
    // eslint-disable-next-line no-console
    console.error(`[${new Date().toISOString()}] ${request.method} ${request.url}`, {
      status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    })

    response.status(status).json({
      success: false,
      message,
      error,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
