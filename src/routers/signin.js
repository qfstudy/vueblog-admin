const router = require('koa-router')();
const mysqlModel = require('../mysql/mysql.js')
const md5 = require('md5')

router.post('/blog/signin', async (ctx) => {
  let {userName,password} = ctx.request.body
  await mysqlModel.searchUserByName(userName)
    .then(result => {
      if (result.length && userName === result[0]['name'] && md5(password) === result[0]['password']) {
        ctx.session = {
          user: result[0]['name'],
          id: result[0]['id']
        }
        console.log('signin: '+'登录成功')
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