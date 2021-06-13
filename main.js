/*
流れ
アカウント認証
↓
フォロワー選択画面（フォロワーから100人程度抜粋して表示？）
↓
1.パラメータ計算
↓
1.3人選択
↓
1.マッチング
↓
1.1人選択
↓
2.戦闘
↓
2.終了判定
↓
1.フォロワー選択画面
*/

/*
id
name
userid
followers_count:follower
friends_count:follow
created_at
facourites_count
statuses_count
profile_image_url

*/
var setting = require("./setting");
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var passport = require("passport");
var twitter = require("twit");
var ejs = require("ejs");
var fs = require("fs");
var path = require("path");
var MeCab = new require("mecab-async"),
  mecab = new MeCab();
var loginTemplate = fs.readFileSync("./Views/view.ejs", "utf-8");
var selectTemplate = fs.readFileSync("./Views/select.ejs", "utf-8");
var TwitterStrategy = require("passport-twitter").Strategy;
var client = require("./modules/client");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

class GameObject {
  constructor(obj = {}) {
    this.id = Math.floor(Math.random() * 1000000000);
    this.x = obj.x;
    this.y = obj.y;
    this.width = obj.width;
    this.height = obj.height;
    this.angle = obj.angle;
  }

  toJSON() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      angle: this.angle
    };
  }
}

class Player extends GameObject {
  constructor(obj = {}) {
    super(obj);
    this.twitObj = obj.twitObj;
    this.nickname = obj.profile.displayName;
    this.id = obj.profile.id;
    this.cursor = -1;
    console.log(obj.profile._json.profile_image_url);
    this.img = obj.profile._json.profile_image_url;
    this.followers = { followersList: [] };

    this.width = 100;
    this.height = 100;
    this.ex = 940;
    this.ey = 10;
    this.px = 550;
    this.py = 530;
  }

  getId() {
    return this.id;
  }

  getMonster() {
    return this.monster;
  }

  getFollowers() {
    var data = fs.readFileSync(this.fileName, "utf8");

    return JSON.parse(data).followersList;
  }

  setSocketId(socketId) {
    this.socketId = socketId;
  }

  setUserInfo(id) {
    this.id = id;
    this.fileName = "./list/" + this.id + ".js";
  }

  setOpponent(opponent) {
    this.opponent = opponent;
  }

  addMonster(monster) {
    this.monster = new Monster({
      socketId: this.socketId,
      account: monster,
      parent: this
    });
  }

  storeFollowers(callback) {
    var followers = this.followers;
    var fileName = this.fileName;
    var preCursor = -1;

    var params = {
      cursor: this.cursor,
      count: 20,
      skip_status: true
    }

    this.twitObj.get("followers/list", params ,function(err, users, response) {
      console.log("nextCursor:" + users.next_cursor);
      preCursor = users.next_cursor;

      if (err) {
        console.log(err);
      } else {
        users.users.forEach(function(user, callback) {
          var hitclass = 0;
          var hp;
          var atk;
          var def;
          var jsonData = {};
          jsonData.id = user.id;
          jsonData.name = user.name;
          jsonData.screen_name = user.screen_name;
          jsonData.description = user.description;
          jsonData.followersCount = user.followers_count;
          jsonData.followsCount = user.friends_count;
          jsonData.created_at = user.created_at;
          jsonData.fav_count = user.favourites_count;
          jsonData.statusesCount = user.statuses_count;
          jsonData.icon = user.profile_image_url;

          if (jsonData.followersCount >= 500) {
            hp = 400 + 100 * (jsonData.followersCount / 500);
            atk = 300 * Math.random() * (1.2 + 1 - 0.8) + 0.8;
            def = 300 - 200 * Math.random() * (1 + 1 - 0.6) + 0.6;
            hitclass++;
          }
          if (jsonData.statusesCount >= 5000) {
            var ran = 0;
            if (hitclass >= 1) {
              ran = Math.random() * (1 + 1 - 0) + 0;
            }
            if (hitclass == 0 || ran > 0.5) {
              hp = 400 - 300 * (Math.random() * (1 - 0.5) + 0.5);
              atk = 300 + 100 * (jsonData.statusesCount / 5000);
              def = 300 + 100 * (Math.random() * (2 - 0.5) + 0.5);
              hitclass++;
            }
          }
          if (jsonData.description.length >= 40) {
            var ran = 0;
            if (hitclass >= 1) {
              ran = Math.random() * (1 + 1 - 0) + 0;
            }
            if (hitclass == 0 || ran > 0.5) {
              hp = 400 + 100 * (Math.random() * (1 - 0.5) + 0.5);
              atk = 300 - 200 * (Math.random() * (1 - 0.6) + 0.6);
              def = 300 + 100 * (jsonData.description.length / 40);
              hitclass++;
            }
          }
          if (hitclass == 0) {
            hp = 400 * (Math.random() * (1.2 - 0.8) + 0.8);
            atk = 300 * (Math.random() * (1.2 - 0.8) + 0.8);
            def = 300 * (Math.random() * (1.2 - 0.8) + 0.8);
            console.log("4" + jsonData.name + "," + hp + "," + atk + "," + def);
          }
          jsonData.HP = Math.floor(hp);
          jsonData.ATK = Math.floor(atk);
          jsonData.DEF = Math.floor(def);
          jsonData.SPD = 2020 - parseInt(jsonData.created_at.split(" ")[5]);

          followers.followersList.push(jsonData);
        });

        fs.writeFile(fileName, JSON.stringify(followers), function(err) {
          if (err) {
            throw err;
          }

          callback();
        });
      }
    });

    setTimeout(()=>{
      console.log("preCursor:" + preCursor);
      this.cursor = preCursor;
    }, 500);
  }

  toJSON() {
    return Object.assign(super.toJSON(), {
      socketId: this.socketId,
      px: this.px,
      py: this.py,
      ex: this.ex,
      ey: this.ey,
      monster: this.monster,
      nickname: this.nickname,
      img: this.img
    });
  }
}

class Monster extends GameObject {
  constructor(obj = {}) {
    super(obj);
    this.socketId = obj.socketId;
    //this.command = attacks[attack.id];
    this.name = obj.account.name;
    this.screen_name = obj.account.screen_name;
    this.width = 160;
    this.height = 160;
    this.health = obj.account.HP;
    this.maxHealth = this.health;
    this.atk = obj.account.ATK;
    this.block = obj.account.DEF;
    this.speed = obj.account.SPD;
    this.avoid = 0;
    this.attack = Array(4);
    this.deadcount = 0;
    this.ex = 680;
    this.ey = 30;
    this.px = 170;
    this.py = 300;
    this.parent = obj.parent;
    this.img = obj.account.icon;

    this.techniqueId = 0;
    this.tweetsNum = 0;
    this.techniqueNames = [];
    this.makeTechnique();
  }

  setTechniqueId(techniqueId){
    this.techniqueId = techniqueId;
  }

  getTweetsNum(){
    return this.tweetsNum;
  }

  getTechniqueNames() {
    return this.techniqueNames;
  }

  makeTechnique() {
    console.log("get Techniques");
    const tweets_count = 10;
    var words = [];
    const params = { screen_name: this.screen_name, count: tweets_count };
    this.parent.twitObj.get("statuses/user_timeline", params, function(
      error,
      tweets,
      response
    ) {
      if (!error) {
        tweets.forEach(function(tweet) {
          mecab.parse(tweet.text, function(error, result) {
            if (!error) {
              if (result[0][0] != "RT" && result[0][0] != "@") {
                words = words.concat(result);
              }
            } else {
              throw error;
            }
          });
        });
      } else {
        throw error;
      }
    });

    setTimeout(() => {
      var rand_max = words.length - 0.1;
      var techniqueName = "";
      var techniqueNames = [];
      var preWordType = "";

      this.tweetsNum = words.length;
      if (words.length != 0) {
        do {
          var index = Math.floor(Math.random() * rand_max);
          var isAdded = 0;
          console.log(words[index]);
          if (
            words[index][1] == "感動詞" ||
            words[index][1] == "形容詞" ||
            words[index][1] == "副詞" ||
            words[index][1] == "名詞" ||
            words[index][1] == "動詞"
          ) {
            if (preWordType == "形容詞") {
              isAdded = 1;
            } else if (preWordType == "副詞") {
              if (words[index][1] == "動詞") {
                isAdded = 1;
              }
            } else if (
              !(words[index][1] == "名詞" && words[index][2] == "非自立")
            ) {
              isAdded = 1;
            }

            if (isAdded) {
              if (words[index].length >= 10) {
                techniqueName += words[index][9];
              }
            }
          }

          if (techniqueName.length > 5) {
            if (techniqueName.length > 10) {
              techniqueNames.push(techniqueName.slice(0, 10));
            } else {
              techniqueNames.push(techniqueName);
            }
            techniqueName = "";
          }
        } while (techniqueNames.length < 4);

        console.log(techniqueNames);

        for (var i = 0; i < 4; i++) {
          this.attack[i] = new Technique({
            num: i,
            name: techniqueNames[i]
          });
        }
      }
    }, 800);
  }

  damage(val) {
    console.log(val);
    this.avoid = Math.random() * (100 - 0) + 0;
    this.hit = Math.random() * (100 - 0) + 0;

    // TODO: 技の命中率計算
    var techniqueHitRate = this.attack[this.techniqueId].getHitRate();

    if (0 <= this.avoid && this.avoid <= 100-this.speed && 0 <= this.hit && this.hit <= techniqueHitRate) {
      this.beforedamage = Math.floor((this.atk * val.damage) / this.block);
      if (this.beforedamage <= 0) {
        this.beforedamage = 0;
      }
      this.health = this.health - this.beforedamage;
      if (this.health < 0) this.health = 0;
    }else{
      this.beforedamage = 0;
    }

    console.log("damage", this.health);
  }

  toJSON() {
    console.log(this.attack[this.techniqueId]);

    return Object.assign(super.toJSON(), {
      socketId: this.socketId,
      command: this.command,
      name: this.name,
      px: this.px,
      py: this.py,
      ex: this.ex,
      ey: this.ey,
      health: this.health,
      attack: this.attack,
      speed: this.speed,
      block: this.block,
      avoid: this.avoid,
      beforedamage: this.beforedamage,
      maxHealth: this.maxHealth,
      deadcount: this.deadcount,
      img: this.img,
      techniqueName: this.attack[this.techniqueId].name
    });
  }
}

class Technique extends GameObject {
  constructor(obj = {}) {
    super(obj);
    // 技名の設定
    this.name = obj.name;
    this.hitRate = 100;

    // ダメージ量・技回数の設定
    if (obj.num == 0) {
      this.damage = (Math.floor(Math.random() * 3) + 8) * 10;
      this.hitRate = 70;
      this.pp = 1;
    } else if (obj.num == 1) {
      this.damage = (Math.floor(Math.random() * 4) + 5) * 10;
      this.hitRate = 80;
      this.pp = 5;
    } else if (obj.num == 2) {
      this.damage = (Math.floor(Math.random() * 4) + 2) * 10;
      this.hitRate = 90;
      this.pp = 10;
    } else if (obj.num == 3) {
      this.damage = (Math.floor(Math.random() * 3) + 1) * 10;
      this.HitRate = 100;
      this.pp = 50;
    }
  }

  getHitRate(){
    return this.hitRate;
  }

  toJSON() {
    return Object.assign(super.toJSON(), {
      name: this.name,
      damage: this.damage,
      pp: this.pp,
      hitRate: this.hitRate
    });
  }
}

async function damageExec() {
  var p = Array(2);
  var i = 0;

  Object.values(players).forEach(player => {
    p[i] = player;
    i++;
  });

  if (p[0].monster.speed >= p[1].monster.speed) {
    console.log(p[0].id);
    console.log(attacks[p[0].id]);
    p[1].monster.damage(p[0].monster.attack[attacks[p[0].id]]);
    p[0].monster.attack[attacks[p[0].id]].pp--;
    io.to(p[0].socketId).emit("attack", players, p[0], p[1]);
    io.to(p[1].socketId).emit("attack", players, p[0], p[1]);
  } else {
    console.log(p[1].id);
    console.log(attacks[p[1].id]);
    p[0].monster.damage(p[1].monster.attack[attacks[p[1].id]]);
    p[1].monster.attack[attacks[p[1].id]].pp--;
    io.to(p[0].socketId).emit("attack", players, p[1], p[0]);
    io.to(p[1].socketId).emit("attack", players, p[1], p[0]);
  }

  await attackLatter(p);

  //await timer();
}

async function attackLatter(p) {
  return new Promise((resolve, reject) => {
    setTimeout(async function() {
      var uri = "http://" + setting.host + ":" + setting.port + "/select";
      if (p[0].monster.speed >= p[1].monster.speed) {
        if (p[1].monster.health > 0) {
          p[0].monster.damage(p[1].monster.attack[attacks[p[1].id]]);
          p[1].monster.attack[attacks[p[1].id]].pp--;
          io.to(p[0].socketId).emit("attack", players, p[1], p[0]);
          io.to(p[1].socketId).emit("attack", players, p[1], p[0]);

          if (p[0].monster.health == 0) {
            await winlose(p[1], p[0]);
          }
        } else {
          io.to(p[0].socketId).emit("win", uri);
          io.to(p[1].socketId).emit("lose", uri);
        }
      } else {
        if (p[0].monster.health > 0) {
          p[1].monster.damage(p[0].monster.attack[attacks[p[0].id]]);
          p[0].monster.attack[attacks[p[0].id]].pp--;
          io.to(p[0].socketId).emit("attack", players, p[0], p[1]);
          io.to(p[1].socketId).emit("attack", players, p[0], p[1]);
          if (p[1].monster.health == 0) {
            await winlose(p[0], p[1]);
          }
        } else {
          io.to(p[0].socketId).emit("lose", uri);
          io.to(p[1].socketId).emit("win", uri);
        }
      }
    }, 2000);
  });
}

function winlose(winplayer, loseplayer) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      io.to(winplayer.socketId).emit("win", uri);
      io.to(loseplayer.socketId).emit("lose", uri);
    }, 2000);
  });
}

let players = [];
var playercount = 0;
var actioncount = 0;
var attacks = {};

// urlencodedとjsonは別々に初期化する
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

// セッション初期化
var sessionMiddleware = session({
  secret: "secret-key",
  resave: true,
  saveUninitialized: true
});
app.use(sessionMiddleware);
// passport自体の初期化
app.use(passport.initialize());
app.use(passport.session());

io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

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
      var twitObj = new twitter({
        consumer_key: setting.consumerKey,
        consumer_secret: setting.consumerSecret,
        access_token: token,
        access_token_secret: tokenSecret
      });
      var c = new Player({
        twitObj: twitObj,
        profile: profile
      });
      players.push(c);

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

app.use(express.static(__dirname + "/Views"));
app.use("/static", express.static(__dirname + "/static"));

// 各種ルーティング
app.get("/", function(req, res) {
  //  res.sendFile(path.join(__dirname + "/Views/game.html"));

  var page = ejs.render(loginTemplate, { title: "アカウント認証" });
  res.write(page);
  res.end();
});

// Twitter認証
app.get("/auth/twitter", passport.authenticate("twitter"));

// 認証からコールバック
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/?auth_failed" }),
  function(req, res) {
    res.redirect("/success");
  }
);

/// 認証成功時の処理
app.get("/success", function(req, res) {
  players[players.length - 1].setUserInfo(req.user.id);
  res.redirect("/select");
});

// フォロワー選択
app.get("/select", function(req, res) {
  players.forEach(function(cli) {
    if (cli.twitObj.config.access_token.startsWith(req.user.id)) {
      cli.storeFollowers(function() {
        var followers = cli.getFollowers();
        var page = ejs.render(selectTemplate, {
          title: "キャラクター選択",
          users: followers
        });
        res.write(page, function(err) {
          res.end();
        });
      });
    }
  });
});

// マッチング処理
app.post("/store", function(req, res) {
  var monstersid = req.body.c;
  var monster;
  var myClient;

  players.forEach(function(cli) {
    if (cli.twitObj.config.access_token.startsWith(req.user.id)) {
      var followers = cli.getFollowers();

      for (var j = 0; j < followers.length; j++) {
        if (monstersid == followers[j].id) {
          monster = followers[j];

          myClient = cli;
          myClient.addMonster(monster);
        }
      }
    }
  });

  setTimeout(() => {
    console.log(myClient.getMonster().getTweetsNum());
    if (myClient.getMonster().getTweetsNum() > 0) {
      res.redirect("/TwiMon");
    }else{
      res.redirect("/select");
    }
  }, 1500);
});

app.get("/TwiMon", function(req, res) {
  players.forEach(function(cli) {
    if (cli.twitObj.config.access_token.startsWith(req.user.id)) {
      cli.setOpponent(0);
    }
  });

  res.sendFile(path.join(__dirname, "/Views/game.html"));
  /*
  var page = ejs.render(gameTemplate, {
    userId: myClient.getUserId()
  });
  */
});

io.on("connection", function(socket) {
  console.log("connected");
  var playerId = socket.request.session.passport.user.id;
  let player = null;

  console.log("game-start");
  players.forEach(function(client) {
    if (client.getId() == playerId) {
      player = client;
      player.setSocketId(socket.id);
    }
  });
  playercount++;
  console.log("start nickname", player.nickname);
  if (playercount === 1) {
    socket.emit("battle wait");
  }
  if (playercount === 2) {
    io.emit("ready");
    Object.values(players).forEach(player => {
      io.to(player.socketId).emit("state", players);
    });
  }

  socket.on("battle-start", function(attack, socketId) {
    actioncount += 1;
    console.log(actioncount);

    Object.values(players).forEach(player => {
      console.log("start block", player.id);
      if (player.socketId == socketId) {
        if (player.monster.attack[attack.message].pp <= 0) {
          actioncount--;
          io.to(player.socketId).emit("state", players);
        } else {
          attacks[player.id] = attack.message;
          player.getMonster().setTechniqueId(attack.message);
          console.log("select attack", attacks[player.id]);
        }
      }
    });

    if (actioncount == 2) {
      damageExec();
      setTimeout(() => {
        actioncount = 0;

        var deadflg = 0;
        Object.values(players).forEach(player => {
          if (player.monster.health == 0) {
            deadflg = 1;
          }
        });

        if (deadflg == 0) {
          Object.values(players).forEach(player => {
            io.to(player.socketId).emit("state", players);
          });
        }
      }, 4000);
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
    if (!player) {
      return;
    }
    delete players[player.id];
    player = null;
    playercount--;
  });

  /*
  socket.on("connect", function(msg) {
    console.log("User " + socket.req.user.id + " connected.");

    players.forEach(function(cli) {
      if (cli.getUserId == socket.req.user.id) {
        socket.client = cli;
      }
    });
  });
  */

  //socket.emit('init', )

  socket.on("", function(msg) {});
});

// サーバーの起動
http.listen(setting.port, setting.host, function() {
  console.log("Listening...");
});

/*
参考文献
TwitterAPI:https://qiita.com/y_ishihara/items/501bb6fddc785a56780e
Nodejs+Twitter:https://qiita.com/c_tyo/items/e2364187265890318361
*/
