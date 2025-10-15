import Client from 'ioredis'
import Redlock from 'redlock'
import envConfig from 'src/shared/config'

export const redis = new Client(envConfig.URL_REDIS)
export const redlock = new Redlock([redis], {
  retryCount: 3,
  retryDelay: 200, // time in ms
})