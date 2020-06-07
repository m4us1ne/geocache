const express = require('express');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
const db = require('better-sqlite3')('./db/geocache.db');

let secrets = ["1JA-9NS-3NI","IS8-XZ1-ON9","CM0-9WW-R01","CSK-IV4-03M","4GS-SVT-QND","H9I-DZK-YJN","LRM-6A9-USK","O3H-2TA-T8R","WR3-8KZ-AK7","909-4HN-EUF","K8Q-XV2-6W6","Z9Q-M82-L2Q","4ES-9OF-JRD","2ME-1MZ-1HC","DN0-9VR-1AJ"];
toprint = [];

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
    secret = req.query.secret;
    const usersstmt = db.prepare('SELECT * FROM users');
    users = usersstmt.all();
    const usersolved = db.prepare("SELECT users.username,records.sqltime from users left join records on (users.userID = records.userID) WHERE records.userID IS NOT NULL AND records.stageID = ? ORDER BY records.sqltime ASC").all(stageNumber); 
    console.log(row.clues);

    return res.render("stage", { stageNumber: stageNumber, stageName:row.name, stageClue:row.clues.replace(/\n/g,"<br>"), users:users, usersolved:usersolved});

});


app.get('/secret', function (req,res){
  const result= db.prepare('SELECT * FROM stages WHERE secret = ?').get(req.query.secret);
  stageNumber = result.stageID;
  secret = req.query.secret;
  const usersstmt = db.prepare('SELECT * FROM users');
  users = usersstmt.all();
  return res.render("solve",{stageNumber:stageNumber, secret:secret ,users:users });
});


app.get('/solve', function (req,res){
  if(req.query.n && req.query.secret && req.query.name){
    number = req.query.n;
    checkSecret = db.prepare('SELECT stageID FROM stages WHERE secret= ? AND stageID= ?').get(req.query.secret,req.query.n);
    if(checkSecret  == null){
      return res.redirect("/");
    }
    users = db.prepare('SELECT * FROM users WHERE username= ?').get(req.query.name);
    const stmt = db.prepare('INSERT INTO records (userID,stageID) VALUES (?,?)');
    try {
      stmt.run(users.userID,checkSecret.stageID);
    } catch (err) {
      //duplicate User TODO
      console.log("Duplicate Record")
    }

    console.log(req.query.name +" solved rätsel nr. "+ req.query.n)
  }else{
    return res.redirect("/");
  }

  return res.redirect("/stage?n="+number);
});

app.get('/register', function (req,res){
  const stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
  try {
    stmt.run(req.query.name);
  } catch (err) {
    //duplicate User TODO
    console.log("Duplicate Entryusers")
  }

  return res.redirect("/");
});

app.listen(3000, function () {
    console.log("Listening on port 3000");
  });