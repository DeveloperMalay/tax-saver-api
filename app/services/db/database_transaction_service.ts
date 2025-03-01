import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { inject } from '@adonisjs/core'

@inject()
export class DatabaseTransactionService {
  async start(): Promise<TransactionClientContract> {
    return await db.transaction()
  }
}
