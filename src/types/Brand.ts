import { Some } from 'isntnt';

declare class BrandMark<T extends string> {
  private readonly __brand__: T
}

export type Brand<T extends string, U extends Some> = U & BrandMark<T>

export type BrandType<T extends Brand<any, any>> = T extends Brand<any, infer R>
  ? R
  : never
