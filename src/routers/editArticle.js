const router = require('koa-router')();
const mysqlModel = require('../mysql/mysql.js')
const  showdown  = require('showdown') 
const converter = new showdown.Converter()
const checkSessionValue = require('../check/check.js').checkSessionValue

// 编辑单篇文章页面
router.post('/blog/getedit', async (ctx) => {
  let articleId = ctx.request.body.articleId
  await checkSessionValue(ctx).then(async (res)=>{
    await mysqlModel.searchByArticleId(articleId)
      .then(result => {
        let res = result[0]
        ctx.body = {
          code: 200,
          // session: ctx.session,
          article: res
        }
      })
  }).catch((error)=>{
    ctx.body={
      code: 400,
      message: error
    }
  })
})

// 保存编辑单篇文章
router.post('/blog/saveeditarticle', async (ctx) => {
  let title = ctx.request.body.title
  let content = ctx.request.body.content
  let articleId = ctx.request.body.articleId
  let newContent=converter.makeHtml(content).replace(/\n/gi,"<br/>")
  await checkSessionValue(ctx).then(async (res)=>{
    await mysqlModel.updateArticle([title, newContent, content, articleId])
    .then((res) => {
      ctx.body = {
        code: 200,
        message: '编辑成功'
      }
    })
  }).catch((error) => {
    ctx.body = {
      code: 500,
      message: error
    }
  })  
})

module.exports = router