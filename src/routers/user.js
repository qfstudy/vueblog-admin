const router = require('koa-router')()
const mysqlModel = require('../mysql/mysql.js')
const checkSessionValue = require('../check/check.js').checkSessionValue

router.post('/blog/userallarticle',async(ctx)=>{
  let name=ctx.request.body.userName
  await mysqlModel.searchArticleByUser(name)
    .then(result => {
      result.forEach((item)=>{
        item.content=item.content.split('<pre>')[0].replace(/<[^>]+>/g,"").trim()
      })
      ctx.body = {
        code: 200,
        articles: result
      }
    })    
    .catch((error)=>{
      ctx.body={
        code: 400,
        message: error
      }
    })
})

router.get('/blog/getuserinfo',async (ctx)=>{
  await checkSessionValue(ctx).then(async res=>{
    let name=res.userName
    await mysqlModel.searchUser(name)
      .then(result => {
        let res=result[0]
        ctx.body = {
          code: 200,
          userInfo: {
            userName: res.name,
            avatar: res.avatar
          }
        }
      })
  }).catch((error)=>{
    console.log('getuserinfo error')
    console.log(error)
    console.log('getuserinfo error')
    ctx.body=error
  }) 
})

module.exports=router