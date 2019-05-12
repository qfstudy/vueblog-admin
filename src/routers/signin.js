const router = require('koa-router')();
const mysqlModel = require('../mysql/mysql.js')
const md5 = require('md5')

router.post('/signin', async (ctx, next) => {
  let {name,password} = ctx.request.body
  await mysqlModel.searchUserByName(name)
    .then(result => {
      let res = result
      console.log(res[0])
      if (res.length && name === res[0]['name'] && md5(password) === res[0]['password']) {
        ctx.session = {
          user: res[0]['name'],
          id: res[0]['id']
        }
        ctx.body = {
          code: 200,
          message: '登录成功'
        }
      } else {
        ctx.body = {
          code: 500,
          message: '用户名或密码错误'
        }
      }
    }).catch(err => {
      console.log('signin: ')
      console.log(err)
    })
})
module.exports = router