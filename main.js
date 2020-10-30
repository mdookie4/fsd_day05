//load libraries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default

//configure env
const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000
const API_KEY = '9dd16da57f5042cbb27cc421862ac2dd'

//configure variables
const END_POINT = 'https://newsapi.org/v2/top-headlines'
const headerMeta = {'X-Api-Key': API_KEY}
const headers = new fetch.Headers(headerMeta)

//load handlebar
const app = express()
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

//mount resources
app.use(express.static(__dirname+'/static'))

//landing page
app.get('/', (req,resp) => {
    resp.status(200)
    resp.type('text/html')
    resp.render('index')
})

//news api get query
app.get('/search', async (req,resp) =>{
    let searchString = req.query['searchQuery']
    let searchCountry = req.query.country
    let searchCategory = req.query.category
    //var searchCategory = 

    const url = withQuery(
        END_POINT, {
            q: searchString,
            country: searchCountry,
            category: searchCategory,
            //apiKey: API_KEY
        }
    )
    console.info(url)
    const result = await fetch(url, {
        headers
    })
    //console.info('results: ', await result.json())
    
    //parse json result into array object
    const newsResult = await result.json()
    const newsArray = newsResult.articles.map(   d=> {
                return { title: d.title, urlLink: d.url, image: d.urlToImage, summary: d.description, timestamp: d.publishedAt}
            }
        )
    
    //return response
    resp.status(200)
    resp.type('text/html')
    resp.render('result', {
        news: newsArray, 
        hasContent: newsArray.length > 0
    })

})



//start server
app.listen(PORT, ()=> {
    console.info(`Application started on port ${PORT} at ${new Date()}`)
})