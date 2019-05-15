const mysqlModel = require('../mysql/mysql.js')

module.exports ={
  checkSessionValue:async (ctx)=>{
    let cookie=ctx.cookies.get('USERS')
    let sessionId=`USERS:${cookie}`
    let result

    await mysqlModel.searchSession(sessionId).then((res)=>{
      result=res
    }).catch((error)=>{
      console.log('checkSessionValue:没有seesion')
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
      let name=resultData.user
      if(name){
          resolve ({
            code: 200,
            message: '验证成功',
            userName: name
          })
      }else{
        reject ({
          code: 400,
          message: '验证失败'
        })
      }
    })
  }
}
