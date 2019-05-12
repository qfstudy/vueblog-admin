const router = require('koa-router')()
const mysqlModel = require('../mysql/mysql.js')

router.post('/signout', async (ctx) => {
  ctx.session = null
  ctx.cookies.set('USERS_ID', '', {
    maxAge: 0
  })
  console.log('登出成功')
  ctx.body = {
    code: 200,
    message: '登出成功'
  }
})
// searchUser
router.get('/signout', async (ctx) => {
  let res
  let name = ctx.request.query.userName
  await mysqlModel.searchUser(name)
    .then(result => {
      res = result
    })
  ctx.body = {
    // session: ctx.session,
    code: 200,
    userInfo: res
  }
})


module.exports = router