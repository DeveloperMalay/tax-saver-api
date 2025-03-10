import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    username: vine.string().trim().maxLength(255),
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(8),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim().normalizeEmail(),
    password: vine.string().minLength(8).maxLength(32),
  })
)
