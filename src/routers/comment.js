const router = require('koa-router')();
const mysqlModel = require('../mysql/mysql.js')
const moment = require('moment')
const showdown  = require('showdown') 
const converter = new showdown.Converter()


// 发布评论
router.post('/blog/saveusercomment', async(ctx, next) => {
  // console.log('comment----------------')
  // console.log(ctx.request.body)
  // console.log('comment----------------')
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
  await mysqlModel.addArticleCommentCount(articleId)
  .catch((error)=>{
    ctx.body=error
  })
  await mysqlModel.addComment([name, converter.makeHtml(content), time, articleId, avatar])
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
router.post('/blog/getallcomment', async(ctx) => {
  let articleId = ctx.request.body.articleId
  await mysqlModel.searchCommentByArticleId(articleId)
    .then(result => {
      ctx.body= {
        code: 200,
        commentLength: result.length,//res[0].comments
        commentArray: result
      }
    })
})

// 删除评论
router.post('/blog/deleteusercomment', async(ctx) => {
  console.log('/blog/deleteusercomment++++++++++')
  console.log(ctx.request.body)
  console.log('/blog/deleteusercomment++++++++++')

  let articleId = ctx.request.body.articleId
  let commentId = ctx.request.body.commentId
 
  await mysqlModel.reduceArticleCommentCount(articleId)
  await mysqlModel.deleteComment(commentId)
    .then(() => {
      ctx.body = {
        code: 200,
        message: '删除评论成功'
      }
    }).catch((error) => {
      ctx.body = {
        code: 500,
        message: '删除评论失败',
        error:error
      }
    }) 
})

module.exports=router