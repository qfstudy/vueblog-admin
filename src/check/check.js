const mysqlModel = require('../mysql/mysql.js')

module.exports ={
  checkSessionValue:async (ctx)=>{
    let cookie=ctx.cookies.get('USERS_ID')
    let sessionId=`USERS_ID:${cookie}`
    let data=ctx.request.body
    let {userName}=data
    let result

    await mysqlModel.searchSession(sessionId).then((res)=>{
      result=res
    }).catch((error)=>{
      console.log('get check error:')
      console.log(error)
    })

    return new Promise((resolve,reject)=>{
      if(!cookie){
        reject ({
          code: 500,
          message: '无效的用户权限，请重新登录'
        })
      }
      if(result.length===0){
        reject ({
          code: 404,
          message: '用户权限过期，请重新登录'
        })
      }

      let resultData=JSON.parse(result[0].data)
      let user=resultData.user
      if(userName===user){
          resolve ({
            code: 200,
            message: '验证成功',
            userName: user
          })
      }else{
        reject ({
          code: 400,
          message: '用户身份不一致'
        })
      }
    })
  },

  checkSession:async (ctx)=>{
    let cookie=ctx.cookies.get('USERS_ID')
    let sessionId=`USERS_ID:${cookie}`
    let data=ctx.request.body
    let {cookieValue}=data
    let result

    await mysqlModel.searchSession(sessionId).then((res)=>{
      result=res
    }).catch((error)=>{
      console.log('check error:')
      console.log(error)
    })

    return new Promise((resolve,reject)=>{
      if(!cookie){
        reject ({
          code: 500,
          message: '无效的用户权限，请重新登录'
        })
      }
      if(result.length===0){
        reject ({
          code: 404,
          message: '用户权限过期，请重新登录'
        })
      }
 
      if(cookieValue !== cookie){
        reject ({
          code: 400,
          message: '用户身份不一致'
        })
      }
      let resultData=JSON.parse(result[0].data)
      let user=resultData.user

      if(result.length>0 && user){
        resolve ({
          code: 200,
          message: '验证成功',
          cookieValue: cookieValue,
          userName: user
        })
      }
    })
  }
}
