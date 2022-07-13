const express = require('express')

const router = require('./router.js')

const app = express()

const PORT = 5000

app.use(express.json())
app.use('/bitcoin', router)

app.listen(PORT, console.log(`App listening on PORT ${PORT}`))