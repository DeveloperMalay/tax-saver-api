import { UserService } from '#services/users_service'
import { loginValidator, registerValidator } from '#validators/user'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UserController {
  constructor(protected authService: UserService) {}

  public async register({ request, response }: HttpContext) {
    const payload = await registerValidator.validate(request.all())
    const result = await this.authService.register(payload)
    return response.ok(result)
  }

  public async login({ request, response }: HttpContext) {
    const payload = await loginValidator.validate(request.all())
    const user = await this.authService.login(payload)
    return response.ok(user)
  }
}
