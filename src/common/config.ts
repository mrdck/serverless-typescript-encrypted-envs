import * as env from 'env-var'
import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms'

export interface Config {
  foo: string
  secret: string
}

export const Config = Symbol('Config')

const resolve = (): Config => ({
  foo:    env.get('FOO').required().asString(),
  secret: env.get('SOME_SECRET').required().asString(),
})

const client = new KMSClient({})

const decrypt = async (value: string) => {
  const blob = Buffer.from(value, 'base64').toString('binary')

  const command = new DecryptCommand({
    CiphertextBlob: Uint8Array.from(blob, (v) => v.charCodeAt(0)),
  })

  const response = await client.send(command)

  return Buffer.from(response.Plaintext!).toString()
}

let cache: Config | null = null

export const loadConfig = async () => {
  if (!cache) {
    const config = resolve()

    for (const key of Object.keys(config)) {
      const encrypted = config[key as keyof Config]

      config[key as keyof Config] = await decrypt(encrypted)
    }

    cache = config
  }

  return cache
}
