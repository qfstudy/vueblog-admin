let mysql=require('mysql')
let config=require('../config/config.js')

let pool=mysql.createPool({
  host: config.database.HOST,
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE,
  port: config.database.PORT
})

let query=(sql,values)=>{
  return new Promise((resolve,reject)=>{
    pool.getConnection((err,connection)=>{
      if(err){
        reject(err)
      }else{
        connection.query(sql,values,(err,rows)=>{
          if(err){
            reject(err)
          }else{
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
}

let tableToObj={
  isCreateTable: false,
  tables: {
    users: `create table if not exists users(
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(60) NOT NULL COMMENT '用户名',
      password VARCHAR(60) NOT NULL COMMENT '密码',
      avatar VARCHAR(100) NOT NULL COMMENT '头像',
      moment VARCHAR(40) NOT NULL COMMENT '注册时间',
      PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`,

    usersinfo: `create table if not exists usersinfo(
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(20) NOT NULL COMMENT '用户名',
      school VARCHAR(20) NOT NULL COMMENT '毕业学校',
      userweb VARCHAR(10) NOT NULL COMMENT '个人主网站',
      blog VARCHAR(20) NOT NULL COMMENT '个人博客',
      github VARCHAR(10) NOT NULL COMMENT 'Github',
      PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`,

    articles: `create table if not exists articles(
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(60) NOT NULL COMMENT '文章作者',
      title TEXT(0) NOT NULL COMMENT '评论题目',
      content TEXT(0) NOT NULL COMMENT '评论内容',
      md TEXT(0) NOT NULL COMMENT 'markdown格式',
      userid INT(40) UNSIGNED NOT NULL COMMENT '用户id',
      moment VARCHAR(40) NOT NULL COMMENT '发表时间',
      comments INT(100) UNSIGNED NOT NULL DEFAULT '0' COMMENT '文章评论数',
      pv INT(100) UNSIGNED NOT NULL DEFAULT '0' COMMENT '浏览量',
      avatar VARCHAR(100) NOT NULL COMMENT '用户头像',
      PRIMARY KEY(id)
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`,

    comments:`create table if not exists comments(
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(60) NOT NULL COMMENT '用户名称',
      content TEXT(0) NOT NULL COMMENT '评论内容',
      moment VARCHAR(40) NOT NULL COMMENT '评论时间',
      articleid INT(100) UNSIGNED NOT NULL COMMENT '文章id',
      avatar VARCHAR(100) NOT NULL COMMENT '用户头像',
      PRIMARY KEY(id) 
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`
  }
}

let createTable = ( sql ) => {
  return query( sql, [] )
}

let tableToArray = [
  tableToObj.tables.users,
  tableToObj.tables.articles,
  tableToObj.tables.comments,
  tableToObj.tables.usersinfo
]

// 创建表
if(!tableToObj.isCreateTable){
  tableToArray.forEach((item)=>{
    createTable(item)
  })
  tableToObj.isCreateTable=true
}

//保存用户个人信息
exports.addUserInfo = ( value ) => {
  let _sql = "insert into usersinfo set name=?,school=?,userweb=?,blog=?,github=?;"
  return query( _sql, value )
}
//查询用户个人信息
exports.searchUserInfo = ( name ) => {
  let _sql=`select * from usersinfo where name="${name}";`
  return query( _sql )
}

//查找session验证cookie
exports.searchSession = ( sessionId ) => {
  let _sql=`select data from _mysql_session_store where id="${sessionId}";`
  return query( _sql )
}

// 添加用户 
exports.addUser = ( value ) => {
  let _sql = "insert into users set name=?,password=?,avatar=?,moment=?;"
  return query( _sql, value )
}

// 查找用户  
exports.searchUser = ( name ) => {
  let _sql = `select * from users where name="${name}";`
  return query( _sql )
}
//　发布文章  
exports.addArticle = ( value ) => {
  let _sql = "insert into articles set name=?,title=?,content=?,md=?,userid=?,moment=?,avatar=?;"
  return query( _sql, value )
}
// 增加文章评论数  
exports.addArticleCommentCount = ( value ) => {
  let _sql = "update articles set comments = comments + 1 where id=?"
  return query( _sql, value )
}
// 减少文章评论数  
exports.reduceArticleCommentCount = ( value ) => {
  let _sql = "update articles set comments = comments - 1 where id=?"
  return query( _sql, value )
}

// 更新浏览数 
exports.updateArticlePv = ( value ) => {
  let _sql = "update articles set pv= pv + 1 where id=?"
  return query( _sql, value )
}

// 发表评论  
exports.addComment = ( value ) => {
  let _sql = "insert into comments set name=?,content=?,moment=?,articleid=?,avatar=?;"
  return query( _sql, value )
}
// 通过名字查找用户 判断是否已经存在 
exports.searchUserByName =  ( name ) => {
  let _sql = `select * from users where name="${name}";`
  return query( _sql)
}

// 通过用户的名字查找文章 
exports.searchArticleByUser =  ( name ) => {
  let _sql = `select * from articles where name="${name}";`
  return query( _sql)
}
// 通过文章id查找  
exports.searchByArticleId =  ( id ) => {
  let _sql = `select * from articles where id="${id}";`
  return query( _sql)
}
// 通过articleid查找
exports.searchCommentByArticleId =  ( id ) => { 
  let _sql = `select * from comments where articleid="${id}" order by id desc;`
  return query( _sql)
}

// 通过文章id查找评论数  
exports.searchCommentCountById =  ( id ) => {
  let _sql = `select count(articleid) as count from comments where articleid="${id}";`
  return query( _sql)
}

// 通过评论id查找  
exports.searchComment = ( id ) => {
  let _sql = `select * from comments where id="${id}";`
  return query( _sql)
}
// 查询所有文章  
exports.searchAllArticle = () => {
  let _sql = `select * from articles;`
  return query( _sql)
}
// 查询所有文章数量
exports.searchAllArticleCount = () => {
  let _sql = `select count(*) as count from articles;`
  return query( _sql)
}

// 查询所有个人用户文章数量
exports.searchArticleCountByName = (name) => {
  let _sql = `select count(*) as count from articles where name="${name}";`
  return query( _sql)
}
// 更新修改文章  
exports.updateArticle = (values) => {
  let _sql = `update articles set title=?,content=?,md=? where id=?`
  return query(_sql,values)
}
// 删除文章  
exports.deleteArticle = (id) => {
  let _sql = `delete from articles where id = ${id}`
  return query(_sql)
}
// 删除评论  
exports.deleteComment = (id) => {
  let _sql = `delete from comments where id=${id}`
  return query(_sql)
}
// 删除所有评论  
exports.deleteAllArticleComment = (id) => {
  let _sql = `delete from comments where articleid=${id}`
  return query(_sql)
}
