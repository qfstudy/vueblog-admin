const router = require('koa-router')();
const mysqlModel = require('../mysql/mysql.js')

// 文章详情页
router.get('/article', async(ctx, next) => {
  let articleId = ctx.request.query.articleId
  let res
  let commentRes
  await mysqlModel.searchByArticleId(articleId)
    .then(result => {
      res = result
    })
  await mysqlModel.updateArticlePv(articleId)

  ctx.body= {
    session: ctx.session,
    articles: res[0]
  }
})

// 删除文章
router.post('/article/remove', async(ctx, next) => {
  let articleId = ctx.request.body.articleId
  let allow
  await mysqlModel.searchByArticleId(articleId)
    .then(res => {
      if (res[0].name !== ctx.session.user) {
        allow = false
      } else {
        allow = true
      }
    })
  if (allow) {
    await mysqlModel.deleteAllArticleComment(articleId)
    await mysqlModel.deleteArticle(articleId)
      .then(() => {
        ctx.body = {
          code: 200,
          message: '删除成功'
        }
      }).catch(() => {
        ctx.body = {
          code: 500,
          message: '删除失败'
        }
      })
  } else {
    ctx.body = {
      code: 404,
      message: '没有权限'
    }
  }
})
module.exports=router