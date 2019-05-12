const router = require('koa-router')();
const mysqlModel = require('../mysql/mysql.js')
const moment = require('moment')
const showdown  = require('showdown') 
const converter = new showdown.Converter()


// 发布评论
router.post('/article/comment', async(ctx, next) => {
  console.log('comment----------------')
  console.log(ctx.request.body)
  console.log('comment----------------')
  let name = ctx.request.body.userName
  let content = ctx.request.body.content
  let articleId = ctx.request.body.articleId
  let time = moment().format('YYYY-MM-DD HH:mm:ss')
  let avatar
  // console.log('发布评论')
  await mysqlModel.searchUser(name)
    .then(res => {
      avatar = res[0]['avatar']
    })
  await mysqlModel.addComment([name, converter.makeHtml(content), time, articleId, avatar])
  await mysqlModel.addArticleCommentCount(articleId)
    .then(() => {
      ctx.body = {
        code:200,
        message:'发送成功'
      }
    }).catch(() => {
      ctx.body = {
        code: 500,
        message: '发送失败'
      }
    })
})

// 获取评论
router.get('/article/comment', async(ctx, next) => {
  let articleId = ctx.request.query.articleId
  let commentArray
  await mysqlModel.searchCommentByArticleId(articleId)
    .then(result => {
      commentArray = result
    })
  ctx.body= {
    commentLength: commentArray.length,//res[0].comments
    commentArray
  }
})

// 删除评论
router.post('/article/comment/remove', async(ctx, next) => {
  let articleId = ctx.request.body.articleId
  let commentId = ctx.request.body.id
  let userName = ctx.request.body.userName
  let allow
  await mysqlModel.searchComment(commentId)
    .then(res => {
      if (res[0].name !== userName) {
        allow = false
      } else {
        allow = true
      }
    })
    if (allow) {
      await mysqlModel.reduceArticleCommentCount(articleId)
      await mysqlModel.deleteComment(commentId)
        .then(() => {
          ctx.body = {
            code: 200,
            message: '删除评论成功'
          }
        }).catch(() => {
          ctx.body = {
            code: 500,
            message: '删除评论失败'
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