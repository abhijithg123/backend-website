var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exphbs= require('express-handlebars'); 
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var fileupload=require('express-fileupload')
var app = express();
var db= require('./config/connection')
var session=require('express-session')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine(
  'hbs', exphbs.engine({
    extname: 'hbs', // Extension for your handlebars templates
    defaultLayout: 'layout', // Default layout file (if not specified in the route)
    layoutsDir: __dirname + '/views/layout', // Directory for layout files
    partialsDir: __dirname + '/views/partials', // Directory for partial templates
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload())
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true ,maxAge:600000}
}))
db.connect((err)=>{
  if(err)
    console.log("connection error"+err);
  else
    console.log('databse connected to port');

})
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
