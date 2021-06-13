'use strict';

const socket = io();
var canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const playerImage = $('#player-image')[0];
const backgroundImage= $('#background-image')[0];

function gameStart(){
    socket.emit('game-start', {nickname: $("#nickname").val() });
    $("#start-screen").hide();
    $("#select-screen").hide();
    $("#select-character").show();
}
$("#start-button").on('click', gameStart);

function selectChara(id_value){
    var select=id_value;
    socket.emit('select-character',{monster:$(select)});
    $("#select-character").hide();
    $("#select-screen").show();
}
$("#radiocheck").on('click',selectChara);

function battleStart(){
    socket.emit('battle-start', {message: 0},socket.id);
}

function battleStart2(){
    socket.emit('battle-start', {message: 1},socket.id);
}

function battleStart3(){
    socket.emit('battle-start', {message: 2},socket.id);
}

function battleStart4(){
    socket.emit('battle-start', {message: 3},socket.id);
}

socket.on('state', function(players) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.lineWidth = 10;
    context.beginPath();
    context.strokeStyle = 'rgb(0, 0, 0)';
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();

    context.drawImage(backgroundImage,5,5,canvas.width-10,canvas.height-10);

    Object.values(players).forEach((player) => {
        if(player.socketId == socket.id){
            context.save();

            context.beginPath();
            context.lineWidth = 1;
            context.strokeStyle = 'rgb(0,0,0)';
            var x = 530;
            var y = 380;
            var h = 20;
            var w = 410;
            var r = 10;
            context.moveTo(x,y + r);
            context.arc(x+r,y+h-r,r,Math.PI,Math.PI*0.5,true);
            context.arc(x+w-r,y+h-r,r,Math.PI*0.5,0,1);
            context.arc(x+w-r,y+r,r,0,Math.PI*1.5,1);
            context.arc(x+r,y+r,r,Math.PI*1.5,Math.PI,1);
            context.stroke();

            context.beginPath();
            context.lineWidth = 1;
            context.fillStyle = 'rgb(1,223,58)';
            var x = 530;
            var y = 380;
            var h = 20;
            var w = 410*(player.monster.health/player.monster.maxHealth);
            var r = 10;
            context.moveTo(x,y + r);
            context.arc(x+r,y+h-r,r,Math.PI,Math.PI*0.5,true);
            context.arc(x+w-r,y+h-r,r,Math.PI*0.5,0,1); 
            context.arc(x+w-r,y+r,r,0,Math.PI*1.5,1);
            context.arc(x+r,y+r,r,Math.PI*1.5,Math.PI,1);
            context.fill();

            context.fillStyle = 'rgb(0,0,0)';
            context.font = '20px Bold Arial';
            context.fillText('Player: ', player.px+150, player.py+30);
            context.font = '40px Bold Arial';
            context.fillText(player.nickname, player.px+150, player.py+80);
            var playerImg = new Image();
            playerImg.src = player.img;
            playerImg.onload = function(){
                context.drawImage(playerImg,player.px+2,player.py,player.width,player.height);
            }

            context.font = '30px Bold Arial';
            context.fillText(player.monster.name,560,350);
            context.fillText(player.monster.health,640,445);
            context.fillText('/',730,445);
            context.fillText(player.monster.maxHealth,800,445);
            var monsterImg = new Image();
            monsterImg.src = player.monster.img;
            monsterImg.onload = function(){
                context.drawImage(monsterImg,player.monster.px+2,player.monster.py,player.monster.width,player.monster.height);
            }

            context.font = '30px Bold Arial';
            context.fillText(player.monster.name + ' に指示を出そう!',60,540);
            context.font = '20px Bold Arial';
            context.fillText('1: ' + player.monster.attack[0].name,60,580);
            context.fillText('威力 ' + player.monster.attack[0].damage + ' 命中 ' + player.monster.attack[0].hitRate + ' 残り使用回数 ' + player.monster.attack[0].pp,60,600);
            context.fillText('2: ' + player.monster.attack[1].name,60,630);
            context.fillText('威力 ' + player.monster.attack[1].damage + ' 命中 ' + player.monster.attack[1].hitRate + ' 残り使用回数 ' + player.monster.attack[1].pp,60,650);
            context.fillText('3: ' + player.monster.attack[2].name,60,680);
            context.fillText('威力 ' + player.monster.attack[2].damage + ' 命中 ' + player.monster.attack[2].hitRate + ' 残り使用回数 ' + player.monster.attack[2].pp,60,700);
            context.fillText('4: ' + player.monster.attack[3].name,60,730);
            context.fillText('威力 ' + player.monster.attack[3].damage + ' 命中 ' + player.monster.attack[3].hitRate + ' 残り使用回数 ' + player.monster.attack[3].pp,60,750);

            if(player.monster.attack[0].pp > 0) {
                button(560,680,50,50,'1');
            }
            if(player.monster.attack[1].pp > 0) {
                button(665,680,50,50,'2');
            }
            if(player.monster.attack[2].pp > 0) {
                button(775,680,50,50,'3');
            }
            if(player.monster.attack[3].pp > 0) {
                button(880,680,50,50,'4');
            }

            context.restore();
        } else {
            context.save();

            context.beginPath();
            context.lineWidth = 1;
            context.strokeStyle = 'rgb(0,0,0)';
            var x = 50;
            var y = 110;
            var h = 20;
            var w = 410;
            var r = 10;
            context.moveTo(x,y + r);  //←①
            context.arc(x+r,y+h-r,r,Math.PI,Math.PI*0.5,true);  //←②
            context.arc(x+w-r,y+h-r,r,Math.PI*0.5,0,1);  //←③
            context.arc(x+w-r,y+r,r,0,Math.PI*1.5,1);  //←④
            context.arc(x+r,y+r,r,Math.PI*1.5,Math.PI,1);  //←⑤
            context.stroke();

            context.beginPath();
            context.lineWidth = 1;
            context.fillStyle = 'rgb(1,223,58)';
            var x = 50;
            var y = 110;
            var h = 20;
            var w = 410*(player.monster.health/player.monster.maxHealth);
            var r = 10;
            context.moveTo(x,y + r);  //←①
            context.arc(x+r,y+h-r,r,Math.PI,Math.PI*0.5,true);  //←②
            context.arc(x+w-r,y+h-r,r,Math.PI*0.5,0,1);  //←③
            context.arc(x+w-r,y+r,r,0,Math.PI*1.5,1);  //←④
            context.arc(x+r,y+r,r,Math.PI*1.5,Math.PI,1);  //←⑤
            context.fill();

            context.fillStyle = 'rgb(0,0,0)';
            context.font = '15px Bold Arial';
            context.fillText('Player:', player.ex-80, player.ey+20);
            context.fillText(player.nickname, player.ex-80, player.ey+40);
            var playerImg = new Image();
            playerImg.src = player.img;
            playerImg.onload = function(){
                context.drawImage(playerImg,player.ex+2,player.ey,player.width/2,player.height/2);
            }

            context.font = '30px Bold Arial';
            context.fillText(player.monster.name,60,80);
            context.fillText(player.monster.health,140,175);
            context.fillText('/',230,175);
            context.fillText(player.monster.maxHealth,300,175);

            var monsterImg = new Image();
            monsterImg.src = player.monster.img;
            monsterImg.onload = function(){
                context.drawImage(monsterImg,player.monster.ex+2,player.monster.ey,player.monster.width,player.monster.height);
            }
            context.restore();
        }
    });
});

socket.on('attack', function(players,attackplayer,receivedplayer) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();

    context.lineWidth = 10;
    context.beginPath();
    context.strokeStyle = 'rgb(0, 0, 0)';
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();

    context.drawImage(backgroundImage,5,5,canvas.width-10,canvas.height-10);

    context.font = '30px Bold Arial';
    context.fillText(attackplayer.monster.name + 'の' + attackplayer.monster.techniqueName +'!!!',60,550);
    if(receivedplayer.monster.beforedamage == 0){
        context.fillText("攻撃は外れた!", 60, 600);
    }else{
        context.fillText(receivedplayer.monster.name + 'に' + receivedplayer.monster.beforedamage + 'ダメージ!',60,600);
    }

    context.restore();

    Object.values(players).forEach((player) => {
        if(player.socketId == socket.id){
            context.save();

            context.beginPath();
            context.lineWidth = 1;
            context.strokeStyle = 'rgb(0,0,0)';
            var x = 530;
            var y = 380;
            var h = 20;
            var w = 410;
            var r = 10;
            context.moveTo(x,y + r);
            context.arc(x+r,y+h-r,r,Math.PI,Math.PI*0.5,true);
            context.arc(x+w-r,y+h-r,r,Math.PI*0.5,0,1);
            context.arc(x+w-r,y+r,r,0,Math.PI*1.5,1);
            context.arc(x+r,y+r,r,Math.PI*1.5,Math.PI,1);
            context.stroke();

            if(player.monster.health > 0){
                context.beginPath();
                context.lineWidth = 1;
                context.fillStyle = 'rgb(1,223,58)';
                var x = 530;
                var y = 380;
                var h = 20;
                var w = 410*(player.monster.health/player.monster.maxHealth);
                var r = 10;
                context.moveTo(x,y + r);
                context.arc(x+r,y+h-r,r,Math.PI,Math.PI*0.5,true);
                context.arc(x+w-r,y+h-r,r,Math.PI*0.5,0,1); 
                context.arc(x+w-r,y+r,r,0,Math.PI*1.5,1);
                context.arc(x+r,y+r,r,Math.PI*1.5,Math.PI,1);
                context.fill();
            }

            context.fillStyle = 'rgb(0,0,0)';
            context.font = '20px Bold Arial';
            context.fillText('Player: ', player.px+150, player.py+30);
            context.font = '40px Bold Arial';
            context.fillText(player.nickname, player.px+150, player.py+80);
            var playerImg = new Image();
            playerImg.src = player.img;
            playerImg.onload = function(){
                context.drawImage(playerImg,player.px+2,player.py,player.width,player.height);
            }

            context.font = '30px Bold Arial';
            context.fillText(player.monster.name,560,350);
            context.fillText(player.monster.health,640,445);
            context.fillText('/',730,445);
            context.fillText(player.monster.maxHealth,800,445);
            var monsterImg = new Image();
            monsterImg.src = player.monster.img;
            monsterImg.onload = function(){
                context.drawImage(monsterImg,player.monster.px+2,player.monster.py,player.monster.width,player.monster.height);
            }

            context.restore();
        } else {
            context.save();

            context.beginPath();
            context.lineWidth = 1;
            context.strokeStyle = 'rgb(0,0,0)';
            var x = 50;
            var y = 110;
            var h = 20;
            var w = 410;
            var r = 10;
            context.moveTo(x,y + r);  //←①
            context.arc(x+r,y+h-r,r,Math.PI,Math.PI*0.5,true);  //←②
            context.arc(x+w-r,y+h-r,r,Math.PI*0.5,0,1);  //←③
            context.arc(x+w-r,y+r,r,0,Math.PI*1.5,1);  //←④
            context.arc(x+r,y+r,r,Math.PI*1.5,Math.PI,1);  //←⑤
            context.stroke();

            if(player.monster.health > 0){
                context.beginPath();
                context.lineWidth = 1;
                context.fillStyle = 'rgb(1,223,58)';
                var x = 50;
                var y = 110;
                var h = 20;
                var w = 410*(player.monster.health/player.monster.maxHealth);
                var r = 10;
                context.moveTo(x,y + r);  //←①
                context.arc(x+r,y+h-r,r,Math.PI,Math.PI*0.5,true);  //←②
                context.arc(x+w-r,y+h-r,r,Math.PI*0.5,0,1);  //←③
                context.arc(x+w-r,y+r,r,0,Math.PI*1.5,1);  //←④
                context.arc(x+r,y+r,r,Math.PI*1.5,Math.PI,1);  //←⑤
                context.fill();
            }

            context.fillStyle = 'rgb(0,0,0)';
            context.font = '15px Bold Arial';
            context.fillText('Player:', player.ex-80, player.ey+20);
            context.fillText(player.nickname, player.ex-80, player.ey+40);
            var playerImg = new Image();
            playerImg.src = player.img;
            playerImg.onload = function(){
                context.drawImage(playerImg,player.ex+2,player.ey,player.width/2,player.height/2);
            }

            context.font = '30px Bold Arial';
            context.fillText(player.monster.name,60,80);
            context.fillText(player.monster.health,140,175);
            context.fillText('/',230,175);
            context.fillText(player.monster.maxHealth,300,175);

            var monsterImg = new Image();
            monsterImg.src = player.monster.img;
            monsterImg.onload = function(){
                context.drawImage(monsterImg,player.monster.ex+2,player.monster.ey,player.monster.width,player.monster.height);
            }
            context.restore();
        }
    });
});

function button(x, y, width, height, num){
    context.beginPath();
    context.lineWidth = 1;
    context.rect(x, y, width, height);
    context.fillStyle = 'rgb(38, 64, 255)';
    context.stroke();
    context.fillStyle = 'rgb(0,0,0)';
    context.font = '20px Bold Arial';
    context.fillText(num,x+18,y+32);
    canvas.addEventListener('click',buttonClick,false);
}

function buttonClick(e){
    var button = e.target.getBoundingClientRect();
    var mouseX = (e.clientX - button.left);
    var mouseY = (e.clientY - button.top);

    if(680 < mouseY && mouseY < 680 + 50){
        if(560 < mouseX && mouseX < 560 + 50){
            battleStart();
            context.clearRect(550, 670, 400, 65);
            canvas.removeEventListener('click',buttonClick,false);
        } else if(665 < mouseX && mouseX < 665 + 50){
            battleStart2();
            context.clearRect(550, 670, 400, 65);
            canvas.removeEventListener('click',buttonClick,false);
        } else if(775 < mouseX && mouseX < 775 + 50){
            battleStart3();
            context.clearRect(550, 670, 400, 65);
            canvas.removeEventListener('click',buttonClick,false);
        } else if(880 < mouseX && mouseX < 880 + 50){
            battleStart4();
            context.clearRect(550, 670, 400, 65);
            canvas.removeEventListener('click',buttonClick,false);
        }
    }
}

socket.on('win',function(uri){
    setTimeout(()=>{
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.lineWidth = 10;
        context.beginPath();
        context.strokeStyle = 'rgb(0, 0, 0)';
        context.rect(0, 0, canvas.width, canvas.height);
        context.stroke();

        context.font = '70px Bold Arial';
        context.fillText('You win!!!',320,340);

        setTimeout(()=>{
            window.location.href = uri;
        }, 1000);
    },3000);
});

socket.on('lose',function(uri){
    setTimeout(()=>{
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.lineWidth = 10;
        context.beginPath();
        context.strokeStyle = 'rgb(0, 0, 0)';
        context.rect(0, 0, canvas.width, canvas.height);
        context.stroke();

        context.font = '70px Bold Arial';
        context.fillText('You lose!!!',320,340);

        setTimeout(()=>{
            window.location.href = uri;
        }, 1000);
    },3000);
});

socket.on('battle wait',()=>{
	$(function() {
		$("#loading").fadeIn();
        $("#container").fadeOut();
	});
});
socket.on('ready',()=>{
    $(function() {
		$("#loading").fadeOut();
		$("#container").fadeIn();
	});
});
