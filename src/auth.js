/*
アカウント認証
*/

var setting = require("./setting");
var express = require("express");
var session = require("express-session");
var passport = require("passport");
var ejs = require("ejs");
var fs = require("fs");
var loginTemplate = fs.readFileSync("./Views/view.ejs", "utf-8");
var gameTemplate = fs.readFileSync("./Views/game.ejs", "utf-8");
var TwitterStrategy = require("passport-twitter").Strategy;

const app = express();

// セッション初期化
app.use(
  session({
    secret: "secret-key",
    resave: true,
    saveUninitialized: true
  })
);
// passport自体の初期化
app.use(passport.initialize());
app.use(passport.session());

// passport-twitterの設定
passport.use(
  new TwitterStrategy(
    {
      consumerKey: setting.consumerKey,
      consumerSecret: setting.consumerSecret,
      callbackURL: setting.callbackURL
    },
    // 認証後の処理
    function(token, tokenSecret, profile, callback) {
      return callback(null, profile);
    }
  )
);
// セッションに保存
passport.serializeUser(function(user, done) {
  done(null, user);
});
// セッションから復元 routerのreq.userから利用可能
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// 各種ルーティング
app.get("/", function(req, res){
  var page = ejs.render(loginTemplate, {title: 'アカウント認証'});
  res.write(page);
  res.end();
});
app.get("/auth/twitter", passport.authenticate("twitter"));
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/?auth_failed" }),
  function(req, res) {
    res.redirect("/success");
  }
);
app.get("/success", function(req, res){
  console.log("session:" + req.session);
  var page = ejs.render(gameTemplate, {title: 'TwitMonster'});
  res.write(page);
  res.end();

  //res.render('view', {title: 'アカウント認証'});
});

// サーバーの起動
var server = app.listen(setting.port, setting.host, function(){
  console.log("Listening...");
});

/*
参考文献
TwitterAPI:https://qiita.com/y_ishihara/items/501bb6fddc785a56780e
Nodejs+Twitter:https://qiita.com/c_tyo/items/e2364187265890318361
*/
