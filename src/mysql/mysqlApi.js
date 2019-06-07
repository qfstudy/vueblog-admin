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
      userName VARCHAR(50) NOT NULL COMMENT '用户名',
      password VARCHAR(50) NOT NULL COMMENT '密码',
      avatar VARCHAR(100) NOT NULL DEFAULT '' COMMENT '头像',
      time VARCHAR(20) NOT NULL DEFAULT '' COMMENT '注册时间',
      introduction VARCHAR(1000) DEFAULT '' COMMENT '个人简介',
      github VARCHAR(100) DEFAULT '' COMMENT 'github网址',
      blog VARCHAR(100) DEFAULT '' COMMENT '博客网址',
      email VARCHAR(100) DEFAULT '' COMMENT '电子邮箱',
      PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`,

    articles: `create table if not exists articles(
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(60) NOT NULL COMMENT '文章作者',
      title TEXT(0) NOT NULL COMMENT '文章标题',
      content TEXT(0) NOT NULL COMMENT '文章内容',
      md TEXT(0) NOT NULL COMMENT 'markdown格式',
      userid INT(40) UNSIGNED NOT NULL COMMENT '用户id',
      date VARCHAR(40) NOT NULL COMMENT '发布日期',
      avatar VARCHAR(100) NOT NULL DEFAULT '' COMMENT '用户头像',
      comments INT(100) UNSIGNED NOT NULL DEFAULT '0' COMMENT '文章评论数',
      pv INT(100) UNSIGNED NOT NULL DEFAULT '0' COMMENT '浏览量',
      collection INT(100) UNSIGNED NOT NULL DEFAULT '0' COMMENT '收藏数',
      likenum INT(100) UNSIGNED NOT NULL DEFAULT '0' COMMENT '点赞数',
      PRIMARY KEY(id)
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`,

    comments:`create table if not exists comments(
      id INT NOT NULL AUTO_INCREMENT,
      userName VARCHAR(60) NOT NULL COMMENT '用户名称',
      content TEXT(0) NOT NULL COMMENT '评论内容',
      date VARCHAR(40) NOT NULL COMMENT '评论时间',
      articleid INT(100) UNSIGNED NOT NULL COMMENT '文章id',
      avatar VARCHAR(100) NOT NULL DEFAULT '' COMMENT '用户头像',
      PRIMARY KEY(id) 
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`,

    likes:`create table if not exists likes(
      id INT NOT NULL AUTO_INCREMENT,
      userName VARCHAR(50) NOT NULL COMMENT '用户名',
      articleid INT(100) UNSIGNED NOT NULL COMMENT '文章id',
      PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;`,

    collections:`create table if not exists collections(
      id INT NOT NULL AUTO_INCREMENT,
      userName VARCHAR(50) NOT NULL COMMENT '用户名',
      articleid INT(100) UNSIGNED NOT NULL COMMENT '文章id',
      PRIMARY KEY ( id )
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
  tableToObj.tables.likes,
  tableToObj.tables.collections
]

// 创建表
if(!tableToObj.isCreateTable){
  tableToArray.forEach((item)=>{
    createTable(item)
  })
  tableToObj.isCreateTable=true
}

//查找session验证cookie
let findSession = ( sessionId ) => {
  let _sql=`select data from _mysql_session_store where id="${sessionId}";`
  return query( _sql )
}

// 添加用户 
let addUser = (userName, password, time) => {
  let _sql = `insert into users set userName="${userName}",password="${password}",time="${time}";`
  return query(_sql,)
}

//通过名字查找用户 判断是否已经存在 
let findUserByName = ( userName ) => {
  let _sql = `select * from users where userName="${userName}";`
  return query( _sql )
}

// 获取所有文章  
let getAllArticle = () => {
  let _sql = `select * from articles;`
  return query( _sql)
}

//　发布文章  
let addArticle = ( value ) => {
  let _sql = "insert into articles set name=?,title=?,content=?,md=?,userid=?,date=?,avatar=?;"
  return query( _sql, value )
}

// 通过文章id查找  
let findArticleById =  ( id ) => {
  let _sql = `select * from articles where id="${id}";`
  return query( _sql)
}

// 更新浏览数 
let updateArticlePv = ( value ) => {
  let _sql = "update articles set pv= pv + 1 where id=?"
  return query( _sql, value )
}

// 更新浏览数 
let reduceArticlePv = ( value ) => {
  let _sql = "update articles set pv= pv - 1 where id=?"
  return query( _sql, value )
}

// 删除文章  
let deleteArticle = (id) => {
  let _sql = `delete from articles where id = ${id}`
  return query(_sql)
}

// 删除文章所有评论  
let deleteArticleComment = (id) => {
  let _sql = `delete from comments where articleid=${id}`
  return query(_sql)
}

// 发表评论  
let addComment = ( value ) => {
  let _sql = "insert into comments set userName=?,content=?,date=?,articleid=?,avatar=?;"
  return query( _sql, value )
}

// 增加文章评论数  
let addArticleCommentCount = ( value ) => {
  let _sql = "update articles set comments = comments + 1 where id=?"
  return query( _sql, value )
}
// 减少文章评论数  
let reduceArticleCommentCount = ( value ) => {
  let _sql = "update articles set comments = comments - 1 where id=?"
  return query( _sql, value )
}

// 通过articleid查找
let findCommentByArticleId =  ( id ) => { 
  let _sql = `select * from comments where articleid="${id}" order by id desc;`
  return query( _sql)
}

// 删除评论  
let deleteComment = (id) => {
  let _sql = `delete from comments where id=${id}`
  return query(_sql)
}

// 通过文章id查找  
let findByArticleId =  ( id ) => {
  let _sql = `select * from articles where id="${id}";`
  return query( _sql)
}

// 更新修改文章  
let updateArticle = (values) => {
  let _sql = `update articles set title=?,content=?,md=? where id=?`
  return query(_sql,values)
}

// 上传头像 
let uploadAvatar = ( value ) => {
  var _sql = `update users set avatar=? where userName=?;`
  return query( _sql , value)
}

// 更新评论头像 
let uploadCommentAvatar = ( value ) => {
  let _sql = "update comments set avatar=? where userName=?"
  return query( _sql, value )
}

// 上传文章头像 
let uploadArticleAvatar = ( value ) => {
  let _sql = "update articles set avatar=? where name=?"
  return query( _sql, value )
}

// 点赞 
let addLike = ( value ) => {
  let _sql = "insert into likes set userName=?,articleid=?;"
  return query( _sql, value )
}

let findLikeByUserAid=(userName,articleId)=>{
  var _sql = `select * from likes where articleid="${articleId}" and userName="${userName}";`
  return query( _sql )
}

let findLikeByUser=(userName)=>{
  var _sql = `select * from likes where userName="${userName}";`
  return query( _sql )
}

// 删除点赞
let deleteLike=(userName,articleId)=>{
  let _sql = `delete from likes where userName="${userName}" and articleid="${articleId}";`
  return query( _sql )
}

// 删除文章时删除点赞
let deleteLikeById=(articleId)=>{
  let _sql = `delete from likes where articleid="${articleId}";`
  return query( _sql )
}

// 增加点赞数
let increaseLikeNum=(articleId)=>{
  let _sql = `update articles set likenum = likenum + 1 where id="${articleId}"`
  return query( _sql)
}
// 减少点赞数
let reduceLikeNum=(articleId)=>{
  let _sql = `update articles set likenum = likenum - 1 where id="${articleId}"`
  return query( _sql)
}

// 收藏 
let addCollection = ( value ) => {
  let _sql = "insert into collections set userName=?,articleid=?;"
  return query( _sql, value )
}

let findCollectionByUserAid=(userName,articleId)=>{
  var _sql = `select * from collections where articleid="${articleId}" and userName="${userName}";`
  return query( _sql )
}

let findCollectionByUser=(userName)=>{
  var _sql = `select * from collections where userName="${userName}";`
  return query( _sql )
}

// 删除收藏
let deleteCollection=(userName,articleId)=>{
  let _sql = `delete from collections where userName="${userName}" and articleid="${articleId}";`
  return query( _sql )
}

// 删除文章时删除收藏
let deleteCollectionById=(articleId)=>{
  let _sql = `delete from collections where articleid="${articleId}";`
  return query( _sql )
}

// 增加收藏数
let increaseCollectionNum=(articleId)=>{
  let _sql = `update articles set collection = collection + 1 where id="${articleId}"`
  return query( _sql)
}
// 减少收藏数
let reduceCollectionNum=(articleId)=>{
  let _sql = `update articles set collection = collection - 1 where id="${articleId}"`
  return query( _sql)
}

let getNewArticle=(userName)=>{
  let _sql=`select * from articles where name="${userName}" limit 0,5 `
  return query(_sql)
}

// 通过用户的名字查找文章 
let findArticleByUser =  ( userName ) => {
  let _sql = `select * from articles where name="${userName}";`
  return query( _sql)
}

// 保存用户个人信息
let updateUser= (values) => {
  let _sql = `update users set avatar=?,github=?,blog=?,email=? where userName=?`
  return query(_sql,values)
}

// 搜索文章
let searchArticle=(title)=>{
  let _sql=`select * from articles where title like "%${title}%";`
  return query(_sql)
}


module.exports = {
  findUserByName,
  addUser,
  findUserByName,
  getAllArticle,
  findSession,
  addArticle,
  findArticleById,
  updateArticlePv,
  reduceArticlePv,
  deleteArticle,
  deleteArticleComment,
  addComment,
  addArticleCommentCount,
  reduceArticleCommentCount,
  findCommentByArticleId,
  deleteComment,
  findByArticleId,
  updateArticle,
  uploadAvatar,
  uploadCommentAvatar,
  uploadArticleAvatar,
  addLike,
  deleteLike,
  findLikeByUserAid,
  findLikeByUser,
  addCollection,
  findCollectionByUserAid,
  findCollectionByUser,
  deleteCollection,
  increaseLikeNum,
  reduceLikeNum,
  increaseCollectionNum,
  reduceCollectionNum,
  getNewArticle,
  findArticleByUser,
  updateUser,
  deleteCollectionById,
  deleteLikeById,
  searchArticle
}