import { expressjwt } from 'express-jwt'

export function jwtMiddleware() {
  const jwtSecret = process.env.AUTH_JWT_SECRET
  if (!jwtSecret) {
    throw 'Missing AUTH_JWT_SECRET'
  }

  return expressjwt({
    algorithms: ['HS256'],
    secret: jwtSecret,
  })
}
