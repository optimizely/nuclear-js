export const BASE_URI = '/nuclear-js'

export const BASE_HOST = process.env.NODE_ENV === 'production'
  ? 'http://developers.optimizely.com/nuclear-js/'
  : 'http://localhost:4000/'
