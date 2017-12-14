const mongoose = require('mongoose')

const { START, COUNT } = require('../config/spider')

const { autoIncrement, runCrawl } = require('../util/spider')

const { Schema } = mongoose

const articleSchema = new Schema({
  articleId: { // 文章id
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  crawlTime: { // 抓取时间
    type: Date
  },
  title: { // 文章标题
    type: String
  },
  createTime: { // 文章创建时间
    type: Date
  },
  source: { // 来源
    type: String
  },
  editor: { // 编辑
    type: String
  },
  tag: { // 标签
    type: String
  },
  writer_name: { // 作者姓名
    type: String
  },
  writer_company: { // 作者公司
    type: String
  },
  writer_avatar_url: { // 作者头像url
    type: String
  },
  content: { // 文章内容
    type: Array
  }
})

const articleModel = mongoose.model('article', articleSchema)

// 获取50个文章
async function getList () {
  const list = await articleModel.find({}, {content: false, _id: false, __v: false}).limit(50)
  return list
}

// 写入或更新抓取的文章
async function insetOrUpdateArticle (articleId, articleObj) {
  articleId = Number(articleId)
  const findArticle = await articleModel.findOne({articleId})
  let article = null
  if (findArticle) {
    article = await articleModel.update({articleId}, articleObj)
  } else {
    article = await articleModel.create(articleObj)
  }
  return article
}

// 获取数据条数
async function getArticleCount () {
  const count = await articleModel.count()
  return count
}

// 生成要抓取内容id
async function getCrawlIds (newcount) {
  const ct = await articleModel.count()
  let ids = []
  let crawlCount = COUNT
  if (newcount) crawlCount = newcount
  if (ct === 0) {
    ids = autoIncrement(START, crawlCount)
  } else {
    const lastId = await getLastId()
    ids = autoIncrement(lastId, crawlCount)
  }
  return ids
}

// 抓取
async function goCrawl (count) {
  let articles = []
  const ids = await getCrawlIds(count)
  const dataList = await runCrawl(ids)

  for (let i = 0; i < dataList.length; i++) {
    if (dataList[i].status) {
      articles.push(dataList[i])
    } else {
      const article = await insetOrUpdateArticle(dataList[i].articleId, dataList[i])
      articles.push(article)
    }
  }

  return articles
}

// 取出最后一条的id
async function getLastId () {
  const article = await articleModel.findOne({}, {articleId: true}).sort({articleId: 'desc'}).limit(1)
  return article.articleId
}

module.exports = {
  goCrawl,
  getList
}
