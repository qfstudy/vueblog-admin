const router = require('koa-router')()

router.post('/blog/signout', async (ctx) => {
  ctx.session = null
  ctx.cookies.set('USERS', '', {
    maxAge: 0
  })
  console.log('登出成功')
  ctx.body = {
    code: 200,
    message: '登出成功'
  }
})

module.exports = router