import { inject } from '@adonisjs/core'
import { DatabaseTransactionService } from './db/database_transaction_service.js'
import Expense from '#models/expense'
import fs from 'node:fs'
import csvParser from 'fast-csv'

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

  async processCsv(filePath: string) {
    const trx = await this.db.start()
    const expenses: Partial<Expense>[] = []

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser.parse({ headers: true }))
        .on('error', async (error) => {
          await trx.rollback()
          reject({ success: false, message: 'Error reading CSV file', error })
        })
        .on('data', (row) => {
          console.log('data', row)
          expenses.push({
            description: row.description,
            amount: Number.parseFloat(row.amount),
            category: row.category,
          })
        })
        .on('end', async () => {
          try {
            await Expense.createMany(expenses, { client: trx })
            await trx.commit()
            resolve({ success: true, message: 'CSV processed successfully', data: expenses })
          } catch (error) {
            await trx.rollback()
            reject({ success: false, message: 'Failed to process CSV', error })
          }
        })
    })
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
