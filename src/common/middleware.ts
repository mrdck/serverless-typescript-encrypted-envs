import middy from '@middy/core'
import bodyParser from '@middy/http-json-body-parser'
import errorHandler from '@middy/http-error-handler'

import type { Handler } from 'aws-lambda'

import { compositeRoot } from './container'
import { loadConfig } from './config'

/**
 * No Operation logger
 */
const nullLogger = () => null

/**
 * Base middleware
 */
export const middleware = <Event, Context>(handler: Handler<Event, Context>) => {
  return middy(handler)
    .use(bodyParser())
    .use(errorHandler({ logger: nullLogger }))
    .before(async request => {
      const config = await loadConfig()
      const container = compositeRoot(config)

      // decorate context with container
      Reflect.set(request.context, 'container', container)
    })
}
