const router = require('koa-router')();
const mysqlModel = require('../mysql/mysql.js')

// 文章页
router.get('/blog/allarticles',async(ctx)=>{
  await mysqlModel.searchAllArticle()
    .then(result=>{
      result.forEach((item)=>{
        item.content=item.content.split('<pre>')[0].replace(/<[^>]+>/g,"").trim()
      })
      ctx.body={
        code: 200,
        articles: result
      }
    })  
    .catch((error)=>{
      console.log('allarticle error+++++++++++++')
      console.log(error)
      ctx.body=error
    })
})

module.exports=router