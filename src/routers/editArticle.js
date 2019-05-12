const router = require('koa-router')();
const mysqlModel = require('../mysql/mysql.js')
const  showdown  = require('showdown') 
const converter = new showdown.Converter()

// 编辑单篇文章页面
router.get('/edit', async (ctx, next) => {
  let articleId = ctx.request.query.articleId
  let res
  await mysqlModel.searchByArticleId(articleId)
    .then(result => {
      res = result[0]
    })
  ctx.body = {
    session: ctx.session,
    article: res
  }
})

// post 编辑单篇文章
router.post('/edit', async (ctx, next) => {
  let title = ctx.request.body.title
  let content = ctx.request.body.content
  let articleId = ctx.request.body.articleId
  let allowEdit = true
  await mysqlModel.searchByArticleId(articleId)
    .then(res => {
      if (res[0].name != ctx.session.user) {
        allowEdit = false
      } else {
        allowEdit = true
      }
    })
  let newContent=converter.makeHtml(content).replace(/\n/gi,"<br/>")
  if (allowEdit) {
    await mysqlModel.updateArticle([title, newContent, content, articleId])
      .then(() => {
        ctx.body = {
          code: 200,
          message: '编辑成功'
        }
      }).catch(() => {
        ctx.body = {
          code: 500,
          message: '编辑失败'
        }
      })
  } else {
    ctx.body = {
      code: 404,
      message: '没有权限修改'
    }
  }
})

module.exports = router