const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const lyricsFinder = require('lyrics-finder');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config()

const app = express();
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken
    const spotifyApi = new SpotifyWebApi({
        redirectUri:'http://localhost:3000',
        clientId: `${process.env.SPOTIFY_CLIENTID}`,
        clientSecret:`${process.env.SPOTIFY_SECRETID}`,
        refreshToken
    })

    spotifyApi
    .refreshAccessToken()
    .then((data) => {
            res.json({
                accessToken: data.body.accessToken,
                expiresIn: data.body.expiresIn
            })
        }).catch(() => {
            res.sendStatus(400)
            console.log("failed refresh attempt.")
        })
})

app.post('/login', (req,res) => {
    const code = req.body.code
    const spotifyApi = new SpotifyWebApi({
        redirectUri:'http://localhost:3000',
        clientId:`${process.env.SPOTIFY_CLIENTID}`,
        clientSecret:`${process.env.SPOTIFY_SECRETID}`
    })

    spotifyApi.authorizationCodeGrant(code).then(data => {
        res.json({
            accessToken:data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in
        })
    })
    .catch(() => {
        res.sendStatus(400)
        console.log("failed login attempt.")
    })
})

app.get('/lyrics', async (req, res) => {
    const lyrics = 
    (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found"
    res.json({lyrics})

})

app.listen(3001);