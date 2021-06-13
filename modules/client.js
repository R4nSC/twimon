/*
流れ
アカウント認証
↓
1.フォロワー選択画面（フォロワーから100人程度抜粋して表示？）
↓
1.3人選択
↓
↓
1.マッチング
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
var fs = require("fs");

module.exports = class client {
  //twitObj;
  //followers = { followersList: [] };

  // hp
  // atack
  // defence
  // speed
  // luck

  /*
  取得ツイートは直近10件
  HP :フォロワー数
  ATK:ツイート数
  DEF:文字数
  SPD:アカウントの作成日時
  回避:時刻から生成

  技
  技名:複数ツイートから単語抽出
  PP:威力からてきとーに
  威力:いいね&RT数
  命中:威力から
  */

  constructor(twitObj) {
    this.twitObj = twitObj;
    this.followers = { followersList: [] };
    this.monsters = [];
  }

  setUserInfo(id) {
    this.userId = id;
    this.fileName = "./list/" + this.userId + ".js";
  }

  setMonsters(monsters){
    this.monsters = monsters;
  }

  setFollowers(followers) {
    this.followers = followers;
  }

  setOpponent(opponent){
    this.opponent = opponent;
  }

  getUserId(){
    return this.userId;
  }

  getMonsters(){
    return this.monsters;
  }
  
  getTwitObj() {
    return this.twitObj;
  }

  getFollowers() {
    var data = fs.readFileSync(this.fileName, "utf8");

    return JSON.parse(data).followersList;
  }

  getOpponent(){
    return this.opponent;
  }

  addMonster(monster){
    this.monsters.push(monster);
  }

  storeFollowers(callback) {
    var followers = this.followers;
    var fileName = this.fileName;
    this.twitObj.get("followers/list", function(err, users, response) {
      if (err) {
        console.log(err);
      } else {
        users.users.forEach(function(user, callback) {
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

          jsonData.HP = jsonData.followersCount;
          jsonData.ATK = jsonData.statusesCount;
          jsonData.DEF = jsonData.description.length;
          jsonData.SPD = 2020 - parseInt(jsonData.created_at.split(' ')[5]);
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
  }
};
