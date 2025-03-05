import { inject } from '@adonisjs/core'
import { DatabaseTransactionService } from './db/database_transaction_service.js'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import mail from '@adonisjs/mail/services/main'
import { v4 as uuidv4 } from 'uuid'

interface RegisterPayload {
  username: string
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

@inject()
export class UserService {
  constructor(protected db: DatabaseTransactionService) {}

  public async register(payload: RegisterPayload) {
    const trx = await this.db.start()
    try {
      const user = new User()
      user.username = payload.username
      user.email = payload.email
      user.password = await hash.make(payload.password)
      user.verificationToken = uuidv4()
      user.isVerified = false

      await user.useTransaction(trx).save()
      await trx.commit()

      await this.sendVerificationEmail(user)

      return { success: true, message: 'User registered successfully. Please verify your email.' }
    } catch (error) {
      await trx.rollback()
      return { success: false, message: 'Registration failed', error }
    }
  }

  async verifyEmail(token: string) {
    const trx = await this.db.start()
    try {
      const user = await User.findBy('verificationToken', token)
      if (!user) {
        return { success: false, message: 'Invalid or expired token' }
      }

      user.isVerified = true
      //   user.verificationToken = null
      await user.useTransaction(trx).save()
      await trx.commit()

      return { success: true, message: 'Email verified successfully' }
    } catch (error) {
      await trx.rollback()
      return { success: false, message: 'Email verification failed', error }
    }
  }

  async login(payload: LoginPayload) {
    try {
      const user = await User.findBy('email', payload.email)
      if (!user) {
        return { success: false, message: 'Invalid credentials' }
      }

      if (!user.isVerified) {
        return { success: false, message: 'Please verify your email before logging in' }
      }

      const passwordValid = await hash.verify(user.password, payload.password)
      if (!passwordValid) {
        return { success: false, message: 'Invalid credentials' }
      }

      const token = await User.accessTokens.create(user)

      return { success: true, message: 'Login successful', token }
    } catch (error) {
      return { success: false, message: 'Login failed', error }
    }
  }

  private async sendVerificationEmail(user: User) {
    await mail.send((message) => {
      message
        .to(user.email)
        .subject('Verify Your Email')
        .htmlView('emails/verify_email', { token: user.verificationToken })
    })
  }
}
