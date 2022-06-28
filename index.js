//initializing environment variables
require('dotenv').config();

//Initializing other variables
const override = require('koa-methodoverride');
const parser = require('koa-bodyparser');

//connect to the database
const mongoose = require('mongoose');
const db = mongoose.connection;
const host = process.env.DBURI;
const dbupdate = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose.connect(host, dbupdate);

db.on('error', (err) => console.log("Error, DB not connected"));
db.on('connected', () => console.log("Connected to the DB"));
db.on('disconnected', () => console.log("DB is disconnected"));
db.on('open', () => console.log("Connection made. Ready to use"));

//model Schema
const Blog = require('./model/blog');

//create server object
const koa = require('koa');
const server = new koa();

//create static folder
const static = require("koa-static");


//create the router
const Router = require('koa-router');
const route = new Router();


//initializing views
const views = require('koa-views');
const nunj = require('nunjucks');
nunj.configure('./views', {autoescape: true});


//routes
//router.get, router.post, router.patch, router.put, router.delete
route.get('/', (ctx, next) => ctx.body = "Hello World");
route.get('/second', (ctx, next) => ctx.body = "This is the second route");
route.get('/first', (ctx, next) => {
    return ctx.render('./index.njk', {
        name: "Maneesha Lakshani"
    })
});
route.get('/third/:name/:age/:address', (ctx, next) => {
    return ctx.render('./index.njk', {
        name: ctx.params.name,
        age: ctx.params.age,
        address: ctx.params.address
    })
});
route.get('/fourth', (ctx, next) => {
    return ctx.render('./index.njk', {
        name: process.env.NAME,
    })
});
route.get('/blog', (ctx, next) => {
    console.log("connected to the blog root route");
    return Blog.find({}, (error, result) => {
        console.log(result);
        ctx.render('./first.njk', {
            posts: result,
        });   
    }).clone();
});

//show route
route.get('/view/:id', (ctx, next) => {
    console.log("Connected to the show route...");
    return Blog.findById(ctx.params.id, (error, result) => {
        console.log(result);
        ctx.render('show.njk', {
            post: result,
        });
    }).clone();
});

//admin route
route.get('/admin', (ctx, next) => {
    console.log("Connected to the admin route");
    return Blog.find({}, (error, result) => {
        console.log(result);
        ctx.render('admin.njk', {
            posts: result
        });
    }).clone();
});

//delete route
route.delete('/delete/:id', (ctx, next) => {
    console.log("Connected to the delete route");
    console.log(ctx.request.body);
    if(ctx.request.body.pw === process.env.PW){
        Blog.findByIdAndRemove(ctx.params.id, (error, result) => {
            console.log("Blog deleted");
        });
    }else{
        console.log("Wrong Password");
    }
    return ctx.render('complete.njk');
});

//create route
route.get('/create', (ctx, next) => {
    console.log("Connected to the create-get route");
    return ctx.render('create.njk');
});

route.post('/create', (ctx, next) => {
    console.log("Connected to the create-post route");
    console.log(ctx.request.body);
    if(ctx.request.body.pw === process.env.PW){
        Blog.create(ctx.request.body, (error, result) => {
            console.log("Post Created");
            console.log(result);
        });
    }else{
        console.log("Wrong Password");
    }
    return ctx.render('complete.njk');
});

//edit route
route.get('/edit/:id', (ctx, next) => {
    console.log("Connected to the edit-get route");
    return Blog.findById(ctx.params.id, (error, result) => {
        console.log(result);
        ctx.render('edit.njk', {
            post: result
        });
    }).clone();
});

route.put('/edit/:id', (ctx, next) => {
    console.log("Connected to the edit-put route");
    console.log(ctx.request.body);
    if(ctx.request.body.pw === process.env.PW){
        Blog.findByIdAndUpdate(ctx.params.id, ctx.request.body, {new: true}, (error, result) => {
            console.log(result);
        });
    }else{
        console.log("Wrong Password");
    }
    return ctx.render('complete.njk');
});

//middleware
server.use(override('_method'));
server.use(parser());
//server.use(views('./views', {map: {html: 'nunjucks'}}));
server.use(views('./views', {map: {njk: 'nunjucks'}}));
server.use(route.routes());
server.use(static('./public'));

server.listen(3500, 'localhost', () => console.log("Listen to port 3500"));