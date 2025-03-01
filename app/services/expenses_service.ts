import { inject } from '@adonisjs/core'
import { DatabaseTransactionService } from './db/database_transaction_service.js'
import Expense from '#models/expense'

interface CreateExpensesPayload {
  description: string
  amount: number
  category: string
}

interface UpdateExpensesPayload {
  id: number
  description: string
  amount: number
  category: string
}

@inject()
export class ExpenseService {
  constructor(protected db: DatabaseTransactionService) {}

  public async getAll() {
    try {
      const data = await Expense.all()
      return { success: true, message: 'Expenses fetched successfully', data: data }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch Expenses',
        error: error,
      }
    }
  }

  async createExpenses(payload: CreateExpensesPayload) {
    const trx = await this.db.start()
    try {
      const expense = new Expense()
      expense.description = payload.description
      expense.amount = payload.amount
      expense.category = payload.category

      await expense.useTransaction(trx).save()

      await trx.commit()

      return {
        success: true,
        message: 'Expenses added successfully',
        data: expense,
      }
    } catch (error) {
      await trx.rollback()

      return {
        success: false,
        message: 'Failed to add expenses',
        error: error,
      }
    }
  }

  async getExpensesById(id: number) {
    const trx = await this.db.start()

    try {
      const expense = await Expense.findOrFail(id)

      if (!expense) {
        return {
          success: false,
          message: 'Expenses not found',
        }
      }

      return {
        success: true,
        message: 'Expenses fetched successfully',
        data: expense,
      }
    } catch (error) {
      await trx.rollback()

      return {
        success: false,
        message: 'Failed to fetch expenses by id',
        error: error,
      }
    }
  }

  async updateExpenses(id: number, data: UpdateExpensesPayload) {
    const trx = await this.db.start()
    try {
      const expense = await Expense.findOrFail(id)

      if (!expense) {
        return {
          success: false,
          message: 'Expenses not found',
        }
      }

      expense.merge(data)

      await expense.useTransaction(trx).save()

      await trx.commit()

      return {
        success: true,
        message: 'Expenses updated successfully',
        data: expense,
      }
    } catch (error) {
      await trx.rollback()

      return {
        success: false,
        message: 'Failed to update expenses',
        error: error,
      }
    }
  }

  async deleteExpenses(id: number) {
    const trx = await this.db.start()
    try {
      const expense = await Expense.findOrFail(id)

      if (!expense) {
        return {
          success: false,
          message: 'Expenses not found',
        }
      }

      await expense.useTransaction(trx).delete()

      await trx.commit()

      return {
        success: true,
        message: 'Expenses removed successfully',
      }
    } catch (error) {
      await trx.rollback()

      return {
        success: false,
        message: 'Failed to remove expenses',
        error: error,
      }
    }
  }
}
