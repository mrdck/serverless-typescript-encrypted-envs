import 'reflect-metadata'

import { Container } from 'inversify'
import { Config } from './config'

let cache: Container | null = null

/**
 * Root Composite component that instantiate and hooks Inversion of Control container
 */
export const compositeRoot = (config: Config) => {
  if (!cache) {
    const container = new Container()

    container.bind<Config>(Config).toConstantValue(config)

    cache = container
  }

  return cache
}
