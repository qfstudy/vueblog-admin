const router = require('koa-router')();
const mysqlModel = require('../mysql/mysql.js')

// 文章页
router.get('/allarticles',async(ctx,next)=>{
  let res
  await mysqlModel.searchAllArticle()
    .then(result=>{
      res = result
    })  
  
  res.forEach((item)=>{
    item.content=item.content.split('<pre>')[0].replace(/<[^>]+>/g,"").trim()
  })
  ctx.body={
    articles: res
  }
})

module.exports=router