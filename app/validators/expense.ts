import vine from '@vinejs/vine'

export const ExpenseValidator = vine.compile(
  vine.object({
    user_id: vine.number().exists({ table: 'users', column: 'id' }),
    description: vine.string().trim().maxLength(255),
    amount: vine.number(),
    category: vine.string().trim(),
  })
)
