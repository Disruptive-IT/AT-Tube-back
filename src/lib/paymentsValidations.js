import crypto from 'node:crypto'

export const ValidateSignaturePayment = (key, signature, payload) => {
  const firstPartSignatue = crypto.createHmac('sha256', key)
  const secondPartSignatue = firstPartSignatue.update(payload, 'utf-8').digest('base64')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(secondPartSignatue))
}
