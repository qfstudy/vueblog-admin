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
      avatar VARCHAR(100) NOT NULL DEFAULT '0' COMMENT '用户头像',
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
  let _sql = "insert into articles set name=?,title=?,content=?,md=?,userid=?,date=?;"
  return query( _sql, value )
}

module.exports = {
  findUserByName,
  addUser,
  findUserByName,
  getAllArticle,
  findSession,
  addArticle
}