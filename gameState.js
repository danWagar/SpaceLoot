import { Screen, GameScreen, UpgradeScreen } from './screen.js';

export default class GameState {
  constructor(game) {
    this.game = game;
    this._context;
    this.gameScreen;
    this.startScreen;
    this.gameOverScreen;
    this.winScreen;
    this.pauseScreen;
    this.upgradeScreen;
    this.stopped = true;
    this.started = false;
    this.first = true;
    this._atHome = false;
    this.frameID = false;
    this.currentScreen;
  }

  set context(ctx) {
    this._context = ctx;
  }

  set atHome(bool) {
    this._atHome = bool;
  }

  get atHome() {
    return this._atHome;
  }

  //Screen helper functions
  //

  addScore() {
    this.currentScreen.addTextBox(
      'score: ' + this.game.score,
      this._context.canvas.width - 150,
      15,
      'yellow',
      '18px',
      'Georgia'
    );
  }

  addGold() {
    this.currentScreen.addTextBox(
      'GOLD: ' + this.game.user.gold,
      this._context.canvas.width - 150,
      15,
      'yellow',
      '18px',
      'Georgia'
    );
  }

  initScreens() {
    try {
      //console.log('initializing screens');
      this.gameScreen = new GameScreen(this._context, 'Game');
      this.startScreen = new Screen(this._context, 'Start');
      this.gameOverScreen = new Screen(this._context, 'Game Over');
      this.winScreen = new Screen(this._context, 'Win');
      this.pauseScreen = new Screen(this._context, 'Pause');
      this.upgradeScreen = new UpgradeScreen(this._context, 'Upgrade');
      //console.dir(this.upgradeScreen);
    } catch {
      if (this._context === null) {
        //console.log('context has not been defined');
      } else {
        //console.log('Error initializing sceens: unknown error');
      }
    }
  }

  //Engine helper functions
  //

  start() {
    //console.log('starting animation');
    this.game.reset(this._context);
    this.started = true;
    this.stopped = false;
    this._atHome = false;
    this.currentScreen = this.gameScreen;
    let _this = this;
    this.frameID = requestAnimationFrame(function(timestamp) {
      _this.run(timestamp, 0, 0, 1000 / 60, 60);
    });
  }

  stop() {
    this.started = false;
    this.stopped = true;
    this.first = true;
    cancelAnimationFrame(this.frameID);
  }

  //
  // States: Gameplay states - pause, run
  //         Non gameplay states for home screen, win screen, gameover screen, and upgrade screen
  //

  //Gameplay States
  pause() {
    if (this.currentScreen === this.pauseScreen) {
      //console.log('unpausing game');
      this.currentScreen = this.gameScreen;
      this.first = true;
      let _this = this;
      this.frameID = requestAnimationFrame(function(timestamp) {
        _this.run(timestamp, 0, 0, 1000 / 60, 60);
      });
      return;
    } else if (this.currentScreen === this.gameScreen) {
      //console.log('pausing game');
      this.currentScreen = this.pauseScreen;
      let txt = 'PAUSE';
      let txtWidth = this._context.measureText(txt).width;
      this.pauseScreen.addTextBox(
        txt,
        this._context.canvas.width / 2 - txtWidth / 2,
        this._context.canvas.height / 2,
        'red',
        '45px',
        'Georgia'
      );
      this.gameScreen.draw;
      this.pauseScreen.draw('rgba(0,0,0,.65)');
    }
  }

  run(timestamp, delta, lastFrameTimeMs, timestep, maxFPS) {
    //The Animation Engine: It must handle frame timing and it also must retrieve
    //frame data for the state of the game world and draw the frame
    //

    //Break from loop when game is stopped
    if (this.stopped === true) {
      return;
    }

    //Synchronize lastFrameTimeMs and timestamp on first frame
    if (this.first === true) {
      lastFrameTimeMs = timestamp;
      this.first = false;
    }

    if (timestamp < lastFrameTimeMs + 1000 / maxFPS) {
      let _this = this;
      this.frameID = requestAnimationFrame(function(timestamp) {
        _this.run(timestamp, delta, lastFrameTimeMs, timestep, maxFPS);
      });
      return;
    }
    // Track the accumulated time that hasn't been simulated yet
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

    // Simulate the total elapsed time in fixed-size chunks
    while (delta >= timestep) {
      if (this.currentScreen !== this.pauseScreen) {
        this.game.update(timestep, this._context.canvas, this);
      } else return;

      if (this.currentScreen === this.gameOverScreen || this.currentScreen === this.winScreen) {
        return;
      }

      delta -= timestep;
    }

    //Retrieving game data
    let sprites = this.game.spriteArray;

    //Drawing game world
    this.addScore();
    this.gameScreen.draw(sprites);
    let _this = this;

    this.frameID = requestAnimationFrame(function(timestamp) {
      _this.run(timestamp, delta, lastFrameTimeMs, timestep, maxFPS);
    });
  }

  //Non Gameplay states
  //
  home() {
    this._atHome = true;
    this.game.level = 0;
    this.game.reset(this._context);
    this.currentScreen = this.startScreen;
    this.startScreen.draw(this._context);
  }

  win(score) {
    this.stop();
    this.currentScreen = this.winScreen;
    let txt = 'Level ' + this.game.level + ' Passed!';
    this.winScreen.addTextBox(
      txt,
      this._context.canvas.width / 2 - 98,
      this._context.canvas.height / 2,
      'red',
      '30px',
      'Georgia'
    );
    this.addScore();
    this.winScreen.draw();
  }

  upgrade() {
    this.currentScreen = this.upgradeScreen;
    this.addGold();
    //console.log('upgrade screen images:');
    //console.dir(this.upgradeScreen.upgradeImages);
    this.upgradeScreen.drawUpgradeImages(3, 100, 20, true, 'purple');
    for (let i = 0; i < this.upgradeScreen.upgradeImages.length; i++) {
      let j = 0;
      let rectHeight = 15;
      let rectWidth = 15;
      let padding = 0;
      let offset = 0;
      let dim = this.upgradeScreen.upgradeDimensions(`${this.upgradeScreen.upgradeImages[i].name}`);
      //console.dir(dim);
      //console.log(
      //  `${this.upgradeScreen.upgradeImages[i].name} currentLvl is ` +
      //    this.game.player.upgradeables[i].currentLvl
      //);
      while (j < this.game.player.upgradeables[i].currentLevel) {
        padding = j * 4;
        offset = (4 * this.game.player.upgradeables[i].maxLevel) / 2;
        this.upgradeScreen.addRect(
          'yellow',
          dim.x + dim.width / 4 + rectWidth * j + padding - offset,
          dim.y + dim.height - rectHeight,
          rectWidth,
          rectHeight
        );
        //console.dir(this.upgradeScreen);
        j++;
      }
      //console.dir(this.game.player.upgradeables[i]);
      //console.log(
      //  `${this.upgradeScreen.upgradeImages[i].name} maxLevel is ` + this.game.player.upgradeables[i].maxLevel
      //);
      while (j < this.game.player.upgradeables[i].maxLevel) {
        padding = j * 4;
        offset = (4 * this.game.player.upgradeables[i].maxLevel) / 2;
        this.upgradeScreen.addRect(
          'gray',
          dim.x + dim.width / 4 + rectWidth * j + padding - offset,
          dim.y + dim.height - rectHeight,
          rectWidth,
          rectHeight
        );
        j++;
      }
    }
    //this.upgradeScreen.addRect();
    this.upgradeScreen.draw();
  }

  gameOver() {
    this.stop();
    this.currentScreen = this.gameOverScreen;
    this.gameOverScreen.addTextBox(
      'GAME OVER',
      this._context.canvas.width / 2 - 175,
      this._context.canvas.height / 2 - 10,
      'red',
      '60px',
      'Georgia'
    );
    this.addScore();
    this.game.reset(this._context);
    this.gameOverScreen.draw();
  }
}
