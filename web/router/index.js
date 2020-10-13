import express from 'express'

const router = express.Router()

router.get('*', (req, res) => {
    console.log(req.originalUrl)
    res.json({
        status: "ok"
    })
})

export default router