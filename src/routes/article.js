const router = require('koa-router')();
const mysqlModel = require('../mysql/mysql.js')
const checkSessionValue = require('../check/check.js').checkSessionValue

// // 文章详情页
// router.post('/blog/getanarticle', async(ctx) => {
//   let articleId = ctx.request.body.articleId
//   await mysqlModel.updateArticlePv(articleId)
//   .catch((error)=>{
//     ctx.body=error
//   })
//   await mysqlModel.searchByArticleId(articleId)
//     .then(async (result) => {
//       //如果登录就返回userName
//       await checkSessionValue(ctx).then((res)=>{
//         ctx.body= {
//           code: 200,
//           articles: result[0],
//           userName: res.userName
//         }
//       },(res)=>{
//         ctx.body= {
//           code: 200,
//           articles: result[0],
//         }
//       }) 
//     })
//     .catch((error)=>{
//       ctx.body=error
//     })
// })

// // 删除文章
// router.post('/blog/deleteanarticle', async(ctx) => {
//   let articleId = ctx.request.body.articleId
//   await checkSessionValue(ctx).then(async (res)=>{
//     await mysqlModel.deleteAllArticleComment(articleId)
//     await mysqlModel.deleteArticle(articleId)
//       .then(() => {
//         ctx.body = {
//           code: 200,
//           message: '删除成功'
//         }
//       })
//   }).catch((error)=>{
//     ctx.body=error
//   })
// })
module.exports=router