// Declaração local para morgan — dispensa @types/morgan em produção
declare module 'morgan' {
  import type { RequestHandler } from 'express'
  type Format = 'combined' | 'common' | 'dev' | 'short' | 'tiny' | string
  function morgan(format: Format, options?: Record<string, unknown>): RequestHandler
  export = morgan
}
