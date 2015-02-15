var Engine = (function(global) {
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        container = doc.getElementById('container'),
		ctx = canvas.getContext('2d'),
        lastTime;
	var	requestID, menuRequestID;

    canvas.width = 707;
    canvas.height = 665;
    container.appendChild(canvas);
	//main game loop
   	function main() {
		if (!game.theEnd) {		//if game is not finished
			if (game.dead) {	//if player is dead
				stopGame();		//stop game
				game.setupHighscore();	//setup highscore
				game.gameOver('Game Over! Restart = Enter', 120000);	//write game dead message
				document.addEventListener('keyup', gameRestartEnter, false);	//listen for restart request
			}
			else {	//if player isn't dead
				var now = Date.now(),
				dt = (now - lastTime) / 1000.0;
				update(dt);
				render();
				lastTime = now;
				requestID = setTimeout(win.requestAnimationFrame(main), 10);
			}
		}
		else {				//if game is finished
			stopGame();		//stop game
			game.setupHighscore();	//setup highscore
			game.gameOver('Congratulations! Restart = Enter', 120000);	//write win message
			document.addEventListener('keyup', gameRestartEnter, false);	//listen for restart request
		}
	};
	//remove listeners and start main function
	function startGame() {
		document.removeEventListener('keyup', quitMenuEnter);
		document.removeEventListener('keyup', menuBackEnter);
		mainMenu = undefined;
		game.showGamePanel();
		lastTime = Date.now();
		if (!requestID) {
		   main();
		}
	}
	//stop animation
	function stopGame() {
		if (requestID) {
		   win.cancelAnimationFrame(requestID);
		   requestID = undefined;
		}
	}
	//remove Enter listeners and call menu function	
    function init() {
      document.removeEventListener('keyup', menuBackEnter);
	  document.removeEventListener('keyup', gameRestartEnter);
	  document.addEventListener('keyup', quitMenuEnter, false);
	  setTimeout(menu(), 1000);
    }
	//menu function is called from init function
	function menu() {
		game.hideGamePanel();
		setupMenu();
		drawMenu();			
		return;
	}
	//draw menu loop
	function drawMenu() {
		if (mainMenu) {
			mainMenu.render();
			mainMenu.update();
		}
		menuRequestID = win.requestAnimationFrame(drawMenu);
		document.addEventListener('keyup', quitMenuEnter, false);
	}
	//draw credits section of menu
	function drawCredits() {
		document.removeEventListener('keyup', quitMenuEnter);
		mainMenu.showCredits();
		menuRequestID = win.requestAnimationFrame(drawCredits);
		document.addEventListener('keyup', menuBackEnter, false);
	}
	//game restart event listener function
	function gameRestartEnter(event) {
		if (event.keyCode === 13) {
			game.clearMessage();
			game.reset();
			init();
		}
	}
	//exit to main menu event listener function
	function menuBackEnter(event) {
		if (event.keyCode === 13) {
			win.cancelAnimationFrame(menuRequestID);
			menuRequestID = undefined;
			init();
		}
	}
	//menu navigation function
	function quitMenuEnter(event) {
		if (event.keyCode === 13) {
			if (mainMenu) {
				switch(mainMenu.selectedItem) {
					case 0:
						win.cancelAnimationFrame(menuRequestID);
						menuRequestID = undefined;
						startGame();
						break;
					case 1:
						drawCredits();
						break;
				}
			}
		}
	}

    function update(dt) {
        updateEntities(dt);
    }
		
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
		//update randomly loaded prize if possible
		if (prize) 
			prize.update();
    }

    function render() {
        var rowImagesLevel1 = [
                'images/backgrounds/water-block.png',   // Top row is water
                'images/backgrounds/sand-block.png',	// Row 1 of 2 of sand
				'images/backgrounds/sand-block.png',	// Row 2 of 2 of sand
				'images/backgrounds/stone-block.png',   // Row 1 of 3 of stone
                'images/backgrounds/stone-block.png',   // Row 2 of 3 of stone
                'images/backgrounds/stone-block.png',   // Row 3 of 3 of stone
                'images/backgrounds/grass-block.png',   // Row 1 of 2 of grass
                'images/backgrounds/grass-block.png',    // Row 2 of 2 of grass
				'images/backgrounds/roots-block.png'     // roots block
            ],
			rowImagesLevel2 = [
                'images/backgrounds/water-block.png',   // Top row is water
                'images/backgrounds/dirt-block.png',	// Row 1 of 2 of sand
				'images/backgrounds/dirt-block.png',	// Row 2 of 2 of sand
				'images/backgrounds/road-block.png',   // Row 1 of 3 of road
                'images/backgrounds/road-block.png',   // Row 2 of 3 of road
                'images/backgrounds/road-block.png',   // Row 3 of 3 of road
                'images/backgrounds/leaves-block.png',   // Row 1 of 2 of grass
                'images/backgrounds/leaves-block.png',    // Row 2 of 2 of grass
				'images/backgrounds/roots-block.png'     // roots block
            ],
			rowImagesLevel3 = [
                'images/backgrounds/water-block.png',   // Top row is water
                'images/backgrounds/brick-block.png',	// Row 1 of 2 of sand
				'images/backgrounds/brick-block.png',	// Row 2 of 2 of sand
				'images/backgrounds/stone-block2.png',   // Row 1 of 3 of road
                'images/backgrounds/stone-block2.png',   // Row 2 of 3 of road
                'images/backgrounds/stone-block2.png',   // Row 3 of 3 of road
                'images/backgrounds/ice-block.png',   // Row 1 of 2 of grass
                'images/backgrounds/ice-block.png',    // Row 2 of 2 of grass
				'images/backgrounds/ice-block.png'     // roots block
            ],
            numRows = 9,
            numCols = 7,
            row, col;
			//load game background depending on level
			switch (game.level) {
				case 1: 
					for (row = 0; row < numRows; row++) {
						for (col = 0; col < numCols; col++) {
							if (row > 5 && row < 8)
								ctx.drawImage(Resources.get(rowImagesLevel1[row]), col * 101, row * 76);
							else
								ctx.drawImage(Resources.get(rowImagesLevel1[row]), col * 101, row * 78);
						}			
					}; break;
				case 2: 
					for (row = 0; row < numRows; row++) {
						for (col = 0; col < numCols; col++) {
								ctx.drawImage(Resources.get(rowImagesLevel2[row]), col * 101, row * 78);
						}			
					}; break;
				case 3: 
					for (row = 0; row < numRows; row++) {
						for (col = 0; col < numCols; col++) {
								ctx.drawImage(Resources.get(rowImagesLevel3[row]), col * 101, row * 78);
						}			
					}; break;
				default:
					break;
			}		
		
			renderEntities();
			//render finish lines
			renderFinishLines();
			//load new level if victory 
			if (game.checkVictory())
				game.nextLevel();
			//load prize if not loaded
			game.checkPrize();
			  
   }
	
	function renderEntities() {
		if (prize) 
			prize.render();
		allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }
	//change water block image if this finish line was crossed
	function renderFinishLines() {
        for (var columnNum in game.finishLines) {
			if (game.finishLines[columnNum])
				ctx.drawImage(Resources.get('images/backgrounds/finish-line.png'), columnNum * 101, 0);
		}
    }
	
	Resources.load([
        'images/backgrounds/stone-block.png',
		'images/backgrounds/stone-block2.png',
        'images/backgrounds/water-block.png',
        'images/backgrounds/grass-block.png',
		'images/backgrounds/sand-block.png',
		'images/backgrounds/roots-block.png',
        'images/backgrounds/finish-line.png',
		'images/backgrounds/road-block.png',
		'images/backgrounds/brick-block.png',
		'images/backgrounds/dirt-block.png',
		'images/backgrounds/leaves-block.png',
		'images/backgrounds/ice-block.png',
		'images/enemies/enemy-bug.png',
		'images/enemies/enemy-bug2.png',
		'images/enemies/enemy-bug3.png',
		'images/enemies/enemy-bug4.png',
		'images/enemies/enemy-bug-left.png',
		'images/enemies/enemy-bug2-left.png',
		'images/enemies/enemy-bug3-left.png',
		'images/enemies/enemy-bug4-left.png',
		'images/collectables/GemBlue.png',
		'images/collectables/GemGreen.png',
		'images/collectables/GemOrange.png',
		'images/collectables/Heart.png',
		'images/char-boy.png'		
    ]);
    Resources.onReady(init);

    global.ctx = ctx;
})(this);
