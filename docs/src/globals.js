const IS_PROD = process.env.NODE_ENV === 'production'

export const BASE_URI = IS_PROD ? '/nuclear-js' : '/'

export const BASE_HOST = (IS_PROD)
  ? 'http://developers.optimizely.com/nuclear-js/'
  : 'http://localhost:4000/'
