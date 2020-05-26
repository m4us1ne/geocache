const express = require('express');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
const db = require('better-sqlite3')('./db/geocache.db');

let secrets = ["1JA-9NS-3NI","IS8-XZ1-ON9","CM0-9WW-R01","CSK-IV4-03M","4GS-SVT-QND","H9I-DZK-YJN","LRM-6A9-USK","O3H-2TA-T8R","WR3-8KZ-AK7","909-4HN-EUF","K8Q-XV2-6W6","Z9Q-M82-L2Q","4ES-9OF-JRD","2ME-1MZ-1HC","DN0-9VR-1AJ"];
const app = express();

app.use(morgan('short'));
app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname);
app.use(express.static('public'));


app.get('/', function (req, res) {
  const stmt = db.prepare("Select * from stages");
  stagedata = stmt.all();
  const userstmt = db.prepare("SELECT users.username, count(records.userID) as points from users left join records on (users.userID = records.userID) group by users.userID order by points DESC");
  userdata = userstmt.all();  
    return res.render("index", {stagedata:stagedata, userdata:userdata});
  });

app.get('/stage', function (req,res){
  
    stageNumber = parseInt(req.query.n,10);
    if(!Number.isInteger(stageNumber)){
      return res.redirect("/");
    }
    const row = db.prepare('SELECT * FROM stages WHERE stageId = ?').get(stageNumber);
    secret = req.query.secret;      return res.render("index", {stagedata:stagedata, userdata:userdata});
    number = secrets.indexOf(secret);
    if(number==-1){
      solved = false;
    }else{
      solved = true;
    }


    return res.render("stage", { stageNumber: stageNumber, solved: solved, stageName:row.name });

});


app.get('/secret', function (req,res){
  secret = req.query.secret;
  number = secrets.indexOf(secret);
  if(number==-1){
    return res.redirect("/");
  }
  return res.redirect("/stage?n="+number+"&secret="+req.query.secret);
});

app.get('/register', function (req,res){
  const stmt = db.prepare('INSERT INTO users VALUES (null, @username)');
  try {
    stmt.run({username:req.query.name});
  } catch (err) {
    //duplicate User TODO
    console.log("Duplicate Entryuesrs")
  }

  return res.redirect("/");
});

app.listen(3000, function () {
    console.log("Listening on port 3000");
  });