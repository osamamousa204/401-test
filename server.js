// requer
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const cors = require('cors');

//main variables
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;

//uses
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(cors());

//listen to port
client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`);
        })
    })

//====================================================================\\

//==========(routs)=============\\

app.get('/', homeHamdler);
app.get('/add',addHandler);
app.get('/myNews',myNewsHandler)
app.get('/detail/:news_id',detailHandler)
app.put('/update/:update_id',updateHandler)
app.delete('/delete/:delete_id' , deleteHandler)


//=============================(routs Handlers)=============================\\


//**********homeHamdler*************\\

function homeHamdler (req,res){
//key
const key = process.env.NEWS_KEY;
const url = `http://newsapi.org/v2/everything?q=covid19&sortBy=publishedAt&apiKey=${key}`;
superagent.get(url)
.then(data=>{
    let newsArray = data.body.articles.map(val=>{
      return new News(val);
    });
    res.render('./index', {newsMajd : newsArray})
})
}

function News (val){
    this.title = val.title;
    this.auther = val.author;
    this.img_url = val.urlToImage;
    this.description = val.description
}

//**********addHandler*************\\

function addHandler (req,res){
//collect
let {title,auther,img_url,description} = req.query
//insert
let sql = `INSERT INTO news_corona (title,auther,img_url,description) VALUES ($1,$2,$3,$4);`;
let safeValues = [title,auther,img_url,description];
//redirect
client.query(sql,safeValues)
.then(result=>{
    res.redirect('/myNews')
})
}

//**********myNewsHandler*************\\
function myNewsHandler (req,res){
    let sql = `SELECT * FROM news_corona;`;
    client.query(sql)
    .then(result=>{
        res.render('./pages/mynews',{Raghad : result.rows})
    })
}

//**********detailHandler*************\\

function detailHandler (req,res){
//get params value
let param = req.params.news_id;
//select where id = param
let sql = `SELECT * FROM news_corona WHERE id=$1;`;
let safeValues = [param];
client.query(sql,safeValues)
.then(result=>{

    res.render('./pages/details',{data : result.rows[0]})
})
}

//**********updateHandler*************\\

function updateHandler (req,res){
// get params value
let param = req.params.update_id;
// collect the updated data
let  {title,auther,img_url,description} = req.body;
// update the data
let sql = `UPDATE news_corona set title=$1, auther=$2 ,img_url=$3, description=$4 WHERE id=$5;`;
let safeValues = [title,auther,img_url,description,param];
//redirect to the same page
client.query(sql,safeValues)
.then(result=>{
    res.redirect(`/detail/${param}`)
})
}

//**********deleteHandler*************\\

function deleteHandler (req,res){

    // get param value
    let param = req.params.delete_id;
    // delete from database
    let sql = `DELETE FROM news_corona WHERE id=$1;`;
    let safeValues = [param]
    //redirect to my list news
    client.query(sql,safeValues)
    .then(()=>{
        res.redirect('/myNews')
    })


}

//====================================================================\\
//error handlers
function notFoundHandler (req,res){
    res.status(404).send('page not found')
}
function errorHandler (error,req,res){
    res.status(500).send(error)
}



