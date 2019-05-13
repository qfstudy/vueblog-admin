const router = require('koa-router')()
const mysqlModel = require('../mysql/mysql.js')

router.get('/user',async(ctx,next)=>{
  let res
  let name=ctx.request.query.userName
  await mysqlModel.searchArticleByUser(name)
    .then(result => {
      res = result
    })
  res.forEach((item)=>{
    item.content=item.content.split('<pre>')[0].replace(/<[^>]+>/g,"").trim()
  })
  ctx.body = {
    // session: ctx.session,
    articles: res
  }
})

router.get('/userinfo',async(ctx,next)=>{
  let name=ctx.request.query.userName
  let res
  await mysqlModel.searchUser(name)
    .then(result => {
      res = result
    })
  ctx.body = {
    userInfo: res
  }
})

module.exports=router