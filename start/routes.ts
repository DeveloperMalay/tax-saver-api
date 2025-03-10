/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import authRoutes from '../routes/auth_routes.js'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .group(() => {
    authRoutes()
  })
  .prefix('v1')
