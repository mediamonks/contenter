import type { Request, Response } from 'express';

export function helloWorld(request: Request, response: Response): void {
  response.send('Hello World');
}
