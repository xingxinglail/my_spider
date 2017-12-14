const { goCrawl, getList } = require('../models/spider')

async function runCrawl (count) {
  const data = await goCrawl(count)
  return data
}

async function getArticles () {
  const list = await getList()
  return list
}

module.exports = {
  runCrawl,
  getArticles
}