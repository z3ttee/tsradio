import express from 'express'

const router = express.Router()

//console.log(__dirname)

router.get('/api', (req, res) => {
    console.log(req.originalUrl)
    res.json({
        status: "ok"
    })
})
router.get('*', (req, res) => {
    res.send('Content soon...')
    res.end()
})

export default router