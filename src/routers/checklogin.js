const router = require('koa-router')();
const checkSession = require('../check/check.js').checkSession

router.post('/checklogin', async (ctx) => {
  await checkSession(ctx).then((res) => {
    console.log('checklogin========')
    console.log(res)
    console.log('========')
    ctx.body = res
  }, (err) => {
    console.log('checklogin==----===')
    console.log(err)
    console.log('==----===')
    ctx.body = err
  })
})

module.exports = router