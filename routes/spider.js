const express = require('express')
const { runCrawl, getArticles } = require('../services/spider')
const router = express.Router()

/* GET users listing. */
router.get('/', (req, res) => {
  res.render('spider')
})

router.post('/crawl', (req, res) => {
  (async () => {
    const { count } = req.body
    const data = await runCrawl(count)
    return data
  })()
    .then(c => {
      // console.log(c)
      res.json(c)
    })
    .catch(e => {
      res.json({
        msg: '出错了',
        id: e.articleId,
        status: e.status
      })
      console.log(e)
    })
})

router.post('/get_articles', (req, res) => {
  (async () => {
    const list = await getArticles()
    return list
  })()
    .then(c => {
      res.json(c)
    })
    .catch(e => {
      res.json({
        msg: '出错了'
      })
    })
})

module.exports = router
