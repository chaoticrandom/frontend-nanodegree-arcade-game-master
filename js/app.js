/*-----------------------------------------------------------------------------------------------------------------*/
/*											Game variables
-------------------------------------------------------------------------------------------------------------------*/

//pool of messages to display when player is dead
var deadMessages = ['Oops!', 'You were eaten!', 'Damn you, insect!', 'Too slow to live!', 'Sorry!', 'Ouch!', 'Hmmm..'];

//collectables sprites
var collectables = ['images/collectables/GemBlue.png', 'images/collectables/GemGreen.png', 
				   'images/collectables/GemOrange.png', 'images/collectables/Heart.png'];

				   //collectables possible X and Y positions
var collectablesX = [28, 128, 228, 326, 428, 528, 628];
var collectablesY = [475, 398, 321, 244, 167, 90];

var enemiesRowsY = [82, 162, 240, 316, 394];
var enemiesStartPos = [-2, 900];	
var directions = ['right', 'left'];

/*-----------------------------------------------------------------------------------------------------------------*/
/*											Menu class
-------------------------------------------------------------------------------------------------------------------*/
//menu class
Menu = function () {
    this.items = ['Start', 'About']; //define menu items 
	this.selectedItem = 0;	//currently selected item
	this.startY = 350;		//start y position
	this.y = 350;			//current y position
	this.fontSize = 70;		// fon size
}
//reset menu
Menu.prototype.reset = function() {
	this.selectedItem = 0;
	this.startY = 350;
	this.y = 350;
	this.fontSize = 70;
}
//draw menu
Menu.prototype.render = function() {
	ctx.font = this.fontSize.toString() + "px Gloria Hallelujah";
	ctx.clearRect(0, 0, 707, 665);
	
	for (var i = 0; i < this.items.length; ++i)	{		//define styles for each menu item
		if (i == this.selectedItem) {					//depending on selectedItem flag
			ctx.fillStyle = "rgba(255,255,255,255)";
			ctx.font = (this.fontSize + 5).toString() + "px Gloria Hallelujah";
			if (this.y >= 460) 
				this.y -= this.fontSize*this.items.length;
			ctx.fillText('-> ' + this.items[i], 130, this.startY + i*this.fontSize);			
		}
		else {
			ctx.fillStyle = "rgba(62,115,0,255)";
			ctx.font = this.fontSize.toString() + "px Gloria Hallelujah";
			if (this.y >= 460) 
				this.y -= this.fontSize*this.items.length;
			ctx.fillText(this.items[i], 240, this.startY + i*this.fontSize);
		}
	}
}	
//update menu function
Menu.prototype.update = function() {
	if(this.passedKey === 'up' && this.selectedItem > 0) {  //if not first menu item and 'up' is pressed
		this.selectedItem--;								// decrement selected item num  	
		this.y -= this.fontSize;							// count y position
	}
	else if (this.passedKey === 'up' && this.selectedItem <= 0) {		//if first menu item 'up' is pressed
		this.selectedItem = this.items.length-1;						//the last item is selected
		this.y = this.startY + (this.items.length-1)*this.fontSize;		//y position of last item
	}
	if (this.passedKey === 'down' && this.selectedItem < this.items.length-1){	//if not last menu item and 'down' is pressed
		this.selectedItem++;													//increment selected item num
		this.y += this.fontSize;												//count y position
	}
	else if (this.passedKey === 'down' && this.selectedItem >= this.items.length-1){	//if last menu item and 'down' is pressed												
		this.selectedItem = 0;													//first item is selected
		this.y = this.startY;													//y position equals to start position
	}
	this.passedKey = null;
}
//menu handleInput function
Menu.prototype.handleInput = function(e){
	this.passedKey = e;    
}
//show credits function
Menu.prototype.showCredits = function(){
	ctx.font = (this.fontSize/2).toString() + "px Gloria Hallelujah";
	ctx.clearRect(0, 0, 707, 665);
	ctx.fillStyle = "rgba(22,82,255,255)";
	ctx.fillText('Udacity Project #3', 200, 350);
	ctx.fillText('made by Vladimir Yussupov', 140, 400);
	ctx.fillStyle = "rgba(255,255,255,255)";
	ctx.fillText('press Enter to return', 160, 500);
}


/*-----------------------------------------------------------------------------------------------------------------*/
/*											Game class
-------------------------------------------------------------------------------------------------------------------*/

//Game class
Game = function() {
    this.lives = 3; 
    this.score = 0;
	this.highscore = 0;
	this.currentPos = 0;	// abstract increment value of player's Y position, used to add extra score 
	this.highestPos = 0;	// highest Y position attained, player will be given extra score if he moves closer to water
	this.level = 1;
	this.levelWon = 0;
	this.theEnd = 0;	//game finish flag, 1 if finished
    this.dead = 0;	//player dead flag, 1 if dead
	this.prizeIsLoaded = 0;	//prize load flag, 1 if loaded
	this.lifePrizeLimitFlag = 0;	//only one collectable life per level
	this.columns = 7;	
	this.columnSize = 101;	
	this.finishLines = [];	//each water block is a finish line, level is completed when all finishLines elements are true
}
//game reset function
Game.prototype.reset = function() {	 
        this.currentPos = 0;
        this.highestPos = 0;
        this.dead = 0;
		this.theEnd = 0;
		this.level = 1;
		this.lives = 3;
		this.score = 0;
		this.prizeIsLoaded = 0;
		this.lifePrizeLimitFlag = 0;
		this.setupLives();
		this.setupScore();
		this.setupLevel();
		this.setupFinishLines();
		reloadEnemies();
}

Game.prototype.checkVictory = function() {			// check if all finishLines elements are true
		var sum = 0;							// in this case the sum of all elements  
		for (var num in this.finishLines) {		// would be equal to finishLines array length
			sum += this.finishLines[num];		// function returns levelWon flag value
		}
		if (sum === this.finishLines.length) {
			this.levelWon = 1;
			for (var num in this.finishLines) {
				this.finishLines[num] = false;
			}
		}
		return this.levelWon;
}
// function to check if prize is loaded
Game.prototype.checkPrize = function() {	
	if (!this.prizeIsLoaded) {	
		setupPrize();
		this.prizeIsLoaded = 1;
	}
}
	
Game.prototype.nextLevel = function() {				// game has 3 levels
			this.levelWon = 0;					// function will load new level
			if (this.level <=2) {				// if game level <= 2 
				this.level++;					// otherwise the game will be ended
				this.lifePrizeLimitFlag = 0;
				this.setupMessage();
				this.showMessage('Level ' + this.level, 2000);
				this.setupLevel();
				reloadEnemies();
			}
			else game.theEnd = 1; 
}
// fill finishLines array with false values
Game.prototype.setupFinishLines = function() {			
	for (var i = 0; i < this.columns; i++) {
		this.finishLines[i] = false;
	}
}
// display lives on the div#game-info panel	
Game.prototype.setupLives = function() {						
	var lifeBox = document.getElementById("lives");
	lifeBox.innerHTML = '';
	lifeBox.innerHTML += this.lives;
}
// display level on the div#game-info panel
Game.prototype.setupLevel = function() {						
	var level = document.getElementById("level");
	level.innerHTML = '';
	level.innerHTML += 'Level: ' + this.level;
}
// display score on the div#game-info panel
Game.prototype.setupScore = function() {						
	var curScore = document.getElementById("score");
	curScore.innerHTML = '';
	curScore.innerHTML += 'Score: ' + this.score;
}
// display highscore at div#game-info panel	
Game.prototype.setupHighscore = function() {					
	var highScore = document.getElementById("highscore");
	if (this.score > this.highscore) {
		this.highscore = this.score;
		highScore.innerHTML = '';
		highScore.innerHTML += 'Highscore: ' + this.highscore;
	}
}
// place message window	
Game.prototype.setupMessage = function() {					 
	this.message = document.getElementById("message");
	this.message.style.top = window.innerHeight/2 - 80 + "px";
	this.message.style.left = window.innerWidth/2 - 150 + "px";
}
// show game messages	
Game.prototype.showMessage = function(message,duration) {		// could only be used after setupMessage()
	this.message.innerHTML = message;				
	this.message.style.display = "block";
	setTimeout(function(){
	  var msg = document.getElementById("message");
	  msg.style.display = "none";
	}, duration)
}
// show game over message	
Game.prototype.gameOver = function(message,duration) {			// is used in both - win and death cases		
	this.message = document.getElementById("gameover");			
	this.message.style.top = window.innerHeight/2 - 80 + "px";
	this.message.style.left = window.innerWidth/2 - 150 + "px";
	this.message.innerHTML = message;
	this.message.style.display = "block";
	setTimeout(function(){
	  var msg = document.getElementById("gameover");
	  msg.style.display = "none";
	}, duration)
}
// clear message window	
Game.prototype.clearMessage = function() {			
	this.message.innerHTML = '';
	this.message.style.display = "none";
}
// hide div#game-info panel	
Game.prototype.hideGamePanel = function() {			
	this.gameInfo = document.getElementById("game-info");
	this.gameInfo.style.visibility = "hidden";
}
// show div#game-info panel
Game.prototype.showGamePanel = function() {			
	this.gameInfo = document.getElementById("game-info");
	this.gameInfo.style.visibility = "visible";
}

/*-----------------------------------------------------------------------------------------------------------------*/
/*											Collectable class
-------------------------------------------------------------------------------------------------------------------*/

// Collectable class
Collectable = function(x,y,model) {
    this.sprite = '';
	this.x = x;
	this.y = y;
	this.model = model; //model of collectable: 0,1,2 - gems; 3 - life
	this.width = 90;
	this.height = 70;
	this.price = 0; 	// price will be added to score if collides with player
	this.initTime = 0;	// prize object creation time
	this.appearanceTime = 15000;	// time of prize object appearance, after this time object will disappear
}
// definig prices of each collectale, life is priceless =)
Collectable.prototype.definePrice = function() {	
		switch (this.model) {
			case 0: this.price = 100; break;
			case 1: this.price = 200; break;
			case 2: this.price = 300; break;
			case 3: this.price = 0; break;
		}
}
// render collectable depending on model
Collectable.prototype.render = function() {		
	switch (this.model) {
		case 0: this.sprite = collectables[0]; break;
		case 1: this.sprite = collectables[1]; break;
		case 2: this.sprite = collectables[2]; break;
		case 3: this.sprite = collectables[3]; break;
	}
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}
// update collectable
Collectable.prototype.update = function() {		
	var curTime = (new Date()).getTime();					// if (current time - object creation) time 
	if (curTime - this.initTime > this.appearanceTime) {	// is bigger than appearance time, prize object		
		prize = undefined;									// will disappear and game.prizeIsLoaded will be set to 0
		game.prizeIsLoaded = 0;										
	}			
	if (isCollide(this, player) && this.model < 3) {		// increase game score if player collides with gems
		game.score += this.price;
		game.setupScore();
		prize = undefined;
		game.prizeIsLoaded = 0;
	}
	else if (isCollide(this, player) && this.model === 3) { // increase lives if player collides with life
		game.lives++;
		game.setupLives();
		prize = undefined;
		game.prizeIsLoaded = 0;
	}
}

/*-----------------------------------------------------------------------------------------------------------------*/
/*											Enemy class
-------------------------------------------------------------------------------------------------------------------*/

// Enemy class
Enemy = function(x,y,model, direction) {
    this.sprite = '';
	this.width = 90;	//sprite's width
	this.height = 70;	//sprite's height
	this.x = x;
    this.y = y;
	this.model = model;
	this.direction = direction;
    this.speed = randomIntFromInterval(200,350); // enemy's speed is a random number between 200 and 350
}
//enemy update function
Enemy.prototype.update = function(dt) {
	if (this.direction == 'right') { 		//if enemy is moving from left to right
		if(this.x <= 800){					//move enemy if enemy is on the canvas
			this.x += this.speed * dt;
		}else{
			this.x = -2;					//change enemy's x position to initial value
		}
	}
	if (this.direction == 'left') {			//the same idea if enemy is moving from right to left 
		if(this.x >= -80){
			this.x -= this.speed * dt;
		} else {
			this.x = 900;
		}
	}
	if (isCollide(this, player)) {			//if enemy collides with player
		player.initialPos();				// return player to initial position
		if (game.lives > 1){				// if player still has lives to continue
			game.setupMessage();			// randomly show dead message and decrement player's lives
			game.showMessage(deadMessages[randomIntFromInterval(0,deadMessages.length-1)], 1500);
			game.lives--;
			game.setupLives();
		}
		else {								//else plyer is dead
			game.lives--;						
			game.setupLives();
			game.dead = 1;
		}
	}
}
//enemy render function
Enemy.prototype.render = function() {
	if (this.direction === 'right'){		//sprites are loaded according to enemy's direction
		if (this.model === 0) this.sprite = 'images/enemies/enemy-bug.png';		//model 0 - red ladybug
		if (this.model === 1) this.sprite = 'images/enemies/enemy-bug2.png';	//model 1 - green ladybug
		if (this.model === 2) this.sprite = 'images/enemies/enemy-bug3.png';	//model 2 - yellow ladybug
		if (this.model === 3) this.sprite = 'images/enemies/enemy-bug4.png';	//model 3 - brown ladybug
	}
	if (this.direction === 'left'){
		if (this.model === 0) this.sprite = 'images/enemies/enemy-bug-left.png';
		if (this.model === 1) this.sprite = 'images/enemies/enemy-bug2-left.png';
		if (this.model === 2) this.sprite = 'images/enemies/enemy-bug3-left.png';
		if (this.model === 3) this.sprite = 'images/enemies/enemy-bug4-left.png';
	}
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

/*-----------------------------------------------------------------------------------------------------------------*/
/*											Player class
-------------------------------------------------------------------------------------------------------------------*/
//player class		
Player = function() {
    this.sprite = 'images/char-boy.png';
    this.width = 60;	//sprite's width
	this.height = 74;	//sprite's height
	this.x = 323;	//initial x coordinate
    this.y = 550;	//initial y coordinate
}
//player update function
Player.prototype.update = function(){
	if(this.passedKey === 'left' && this.x > 50){ 
		this.x = this.x - 100;
	}
	else if(this.passedKey === 'right' && this.x < 600){
		this.x = this.x + 100;
	}
	else if(this.passedKey === 'up'){
		this.y = this.y - 77;
		game.currentPos++;									//increment current position value
		if (game.currentPos > game.highestPos){				//if player is closer to the finish line than he was
			game.score +=1;									//increase player's score by 1 point
			game.highestPos++;								//increment highest position value
			game.setupScore();								//update score
		}
	}
	else if (this.passedKey === 'down' && this.y != 550){	//player cannot move lower than last line
		this.y = this.y + 77;
		game.currentPos--;									//decrement player's current position if he goes down			
	}
	this.passedKey = null;
	
	//crossing finish line
	if(this.y < 40){										//if player collides with finish lines
		for (var j = 0; j < game.columns; j++) {			//we need to check, which column it was 
			if (this.x < (j+1)*game.columnSize) {			//if player is within bounds of j column 
				if (!game.finishLines[j]) {					//if finish line wasn't crossed
					game.finishLines[j] = true;				//mark this finish line as crossed
					game.score +=100;						//increase player's score by 100
					game.setupScore();						//update player's score
				}
				break;										//break the cycle, player cannot cross 
			}												//more than 1 finishline at the same time
		}
		this.initialPos();									//return player to initial position
	}
}
//hadleInput function
Player.prototype.handleInput = function(e){
	this.passedKey = e;    
}
//player render function
Player.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}
//set player's x and y to initial values
Player.prototype.initialPos = function() {
	player.x = 323;
	player.y = 550;
}

/*-----------------------------------------------------------------------------------------------------------------*/
/*											Initialization section
-------------------------------------------------------------------------------------------------------------------*/
var mainMenu = undefined;

var game = new Game();
game.setupLives();
game.setupFinishLines();
game.setupLevel();

var player = new Player(); 

var allEnemies = [];
setupEnemies();
var prize = undefined;

/*-----------------------------------------------------------------------------------------------------------------*/
/*											Functions section
-------------------------------------------------------------------------------------------------------------------*/
//initialize menu
function setupMenu() {
	mainMenu = new Menu();
}

//fill allEnemies array with random enemies, 1 enemy per line (random model, random direction)
function setupEnemies() {
	for (var count in enemiesRowsY) {
		var dir = randomIntFromInterval(0,1);
		var enemy = new Enemy(enemiesStartPos[dir], enemiesRowsY[count], randomIntFromInterval(0,3), directions[dir]);
		allEnemies.push(enemy);
		dir = randomIntFromInterval(0,1);
	}
}
//reload allEnemies with new enemies
function reloadEnemies() {
	allEnemies = [];
	setupEnemies();
}
//collectable initialize
function setupPrize() {		//create 1 prize in random interval between 2000ms and 8500ms
	setTimeout(function() {
		var xPos = collectablesX[randomIntFromInterval(0, 5)];	//generate random x position
		var yPos = collectablesY[randomIntFromInterval(0, 5)];	//generate random y position
		if (!game.lifePrizeLimitFlag) {		//if life prize wasn't loaded yet 
			prize = new Collectable(xPos, yPos, randomIntFromInterval(0,3)); 	//load randomly 1 of 4 possible models 
			if (prize.model === 3)				//if life was loaded
				game.lifePrizeLimitFlag = 1;	//set life limit flag to 1 
		}
		else {
			prize = new Collectable(xPos, yPos, randomIntFromInterval(0,2));	//exclude life model from random list
		}
		prize.definePrice();						//define collectable's price 
		prize.initTime = (new Date()).getTime();	//save collectable's initialization time
		game.prizeIsLoaded = 1;						//set prizeIsLoaded flag to 1
	}, randomIntFromInterval(2000, 8500));
}

//Function to generate random value between min and max
function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}
//Axis-Aligned Bounding Box collision detection function
function isCollide(enemy, player) {
	 if (enemy.x < player.x + player.width &&
        enemy.x + enemy.width > player.x &&
        enemy.y < player.y + player.height &&
        enemy.y + enemy.height > player.y) return true;
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
	
    player.handleInput(allowedKeys[e.keyCode]);
	if (mainMenu)
		mainMenu.handleInput(allowedKeys[e.keyCode]);
}, false);
