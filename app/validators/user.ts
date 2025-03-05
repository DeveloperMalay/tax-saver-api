import vine from '@vinejs/vine'

export const UserValidator = vine.compile(
  vine.object({
    username: vine.string().trim().maxLength(255),
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(8),
  })
)
