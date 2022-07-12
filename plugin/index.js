const { KMSClient, EncryptCommand } = require('@aws-sdk/client-kms')

class Encrypter {
  constructor(serverless, options, v3Utils) {
    this.kms = new KMSClient({
      region: 'us-east-1',
    })

    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider('aws')

    this.v3Utils = v3Utils
    this.hooks = {
      'before:deploy:functions':                this.override.bind(this),
      'before:deploy:function:packageFunction': this.override.bind(this),
      'package:createDeploymentArtifacts':      this.override.bind(this),
    }
  }

  async override() {
    const config = this.serverless.service.provider.environment

    for (const key of Object.keys(config)) {
      const plain = config[key]

      config[key] = await this.encrypt(plain)
    }

    this.serverless.service.provider.environment = config
  }

  async encrypt(plain) {
    const encoder = new TextEncoder()

    const command = new EncryptCommand({
      KeyId:     'eeee',
      Plaintext: encoder.encode(plain),
    })

    const response = await this.kms.send(command)
    const buffer = Buffer.from(response.CiphertextBlob)

    return buffer.toString('base64')
  }
}

module.exports = Encrypter
