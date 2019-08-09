import { Player, Enemy, Coin, Bullet } from "../javascript/sprite.js";
import User from "../javascript/user.js";

export default class Game {
    constructor() {
        this._user = new User();
        this._player;
        this._enemy;
        this.bulletImg = new Image();
        this._bulletCounter = 0;
        this.enemyArr = [];
        this.bulletArr = [];
        this.coinArr = [];
        this.coinsCurrent = 0;
        this.maxCoins = 4;
        this.difficulty = 2;
        this.score = 0;
        this._level = 0;
        this.lvlScoreCap = 1500;
        this.lvlWon = false;
        //inputs
        this.UP = false;
        this.LEFT = false;
        this.RIGHT = false;
        this.FIRE = false;
    }

    set up(bool) {
        this.UP = bool;
    }
    set left(bool) {
        this.LEFT = bool;
    }
    set right(bool) {
        this.RIGHT = bool;
    }
    set fire(bool) {
        this.FIRE = bool;
    }

    set bulletCounter(num) {
        this._bulletCounter = num;
    }

    set level(lvl) {
        this._level = lvl;
    }
    get level() {
        return this._level;
    }

    get player(){
        return this._player;
    }

    get enemy() {
        return this._enemy;
    }

    get coinArray() {
        return this.coinArr;
    }

    get enemyArray() {
        return this.enemyArr;
    }

    get bulletArray() {
        return this.bulletArr;
    }

    get bulletImage() {
        return this.bulletImg;
    }

    get spriteArray() {
        let arr = [];
        arr.push(this.player);
        arr = arr.concat(this.enemyArr);
        arr = arr.concat(this.coinArr);
        arr = arr.concat(this.bulletArr);
        return arr;
    }

    get user() {
        return this._user;
    }

    initSprites(canv) {
        console.log("initializing sprites");
        let center = canv.width/2;
        let playerWidth = 35,
            playerHeight = 42;
        let enemyWidth = 10,
            enemyHeight = 10;
    
        //initialize player sprite
        this._player = new Player(center, canv.height - canv.height/2, playerWidth, playerHeight);
        
        //initialize enemy sprite - to be implemented
        //this._enemy = new Enemy(center, -30, enemyWidth, enemyHeight);
        //this.getEnemies(this._level + 1, canv);

        //Initialize coins
        this.getCoins(this.maxCoins, canv);  
    }
    
    reset(ctx) {
        let canvHeight = ctx.canvas.clientHeight;
        let center = ctx.canvas.clientWidth/2;
    
        this.score = 1400;    
        this.difficulty = this._level * .10 + 2;

        if( this._level !== 0 ) {
            this.lvlScoreCap += this._level * 200;
        }
        else {
            this.lvlScoreCap = 1500;
            this._user.gold = 1000;
        }

        this._player.xPos = center;
        this._player.yPos = canvHeight - canvHeight/2;
        this._player.ang = 0;
        this._player.vel = [0, 0];
        this._player.boost = this._player.maxBoost;
    
        this.enemyArr = [];
        this.getEnemies(this._level + 1, ctx.canvas);
    
        this.coinArr = [];
        this.coinsCurrent = 0;
        this.getCoins(this.maxCoins, ctx.canvas);

        this.bulletArr = [];
    }

    getEnemies(numEnemies, canv) {
        //Enemies will spawn randomly in specific areas which are just outside the vicinity of the four corners of the game screen.
        //Thus there are four spawn points.
       
        let width = 10,
            height = 10;
        let spawnPoint = Math.floor(Math.random() * 4);
        
        for( let i = 0; i < numEnemies; i++ ) {
            switch(spawnPoint) {
                case 0:
                    this.enemyArr.push(new Enemy(0 - Math.floor(Math.random()*(canv.width/4 - width)), 
                    Math.floor(Math.random()*(canv.height/4 - height)), width, height));
                    break;
                case 1:
                    this.enemyArr.push(new Enemy(canv.width  + Math.floor(Math.random()*(canv.width/4 - width)), 
                    Math.floor(Math.random()*(canv.height/4 - height)), width, height));
                    break;
                case 2:
                    this.enemyArr.push(new Enemy(Math.floor(Math.random()*(canv.width/4 - width)), 
                    canv.height + Math.floor(Math.random()*(canv.height/4 - height)), width, height));
                    break;
                case 3:
                    this.enemyArr.push(new Enemy(canv.width + Math.floor(Math.random()*(canv.width/4 - width)), 
                    canv.height + Math.floor(Math.random()*(canv.height/4 - height)), width, height));
                    break;
                default:
                    console.log("Error: Non integer number passed for numEnemies in game.getEnemies");
                    break;
            }
        }
        console.log("updated enemy array");
        console.dir(this.enemyArr);
    }
    
    getCoins(numCoins, canv) {
        let width = 7,
            height = 7;
        for( let i = 0; i<numCoins; i++ ) {
            this.coinArr.push(new Coin(Math.floor(Math.random()*(canv.width - width)), 
                Math.floor(Math.random()*(canv.height - height)), width, height));
            this.coinsCurrent++;
        }
    }

    fireBullet() {
        let bulletWidth = 8;
        let bulletHeight = 8;
        let playerCenterX = this._player.x + this._player.width/2 - bulletWidth/2;
        let playerCenterY = this._player.y + this._player.height/2;
        this.bulletArr.unshift(new Bullet(playerCenterX, playerCenterY, bulletWidth,
                                bulletHeight, this._player.angle, this.bulletImg));
        //console.dir(this.bulletArr);
    }

    checkBoundaries(obj, canv) {
        if( obj.x < 0 ) {
            obj.x = 0;
            obj.velocity[0] = 0;
        }
        else if( obj.x > canv.width - obj.width ) {
            obj.x = canv.width - obj.width;
            obj.velocity[0] = 0;
        }
        if( obj.y < 0 ) {
            obj.y = 0;
            obj.velocity[1] = 0;
        }
        else if( obj.y > canv.height - obj.height ) {
            obj.y = canv.height - obj.height;
            obj.velocity[1] = 0;
        }
    }

    detectCollision(primary, secondary, padding) {
        if( secondary.x + secondary.width >= primary.x + padding && secondary.x + padding <= primary.x + primary.width && 
            secondary.y + secondary.height >= primary.y + padding && secondary.y + padding <= primary.y + primary.width  )  {
            return true;
            }
        else {
            return false;
        } 
    }

    update(delta, canv, state) {
    //Primary game logic
    //
        //if( this.paused === true || tutorial === true ) {
        //    return;
        //}

        /*Handle user input*/
        if( this.UP === true ) {
            this._player.accelerate(true);
        }
        else{
            this._player.accelerate(false);
        }
    
        if ( this.LEFT === true ) {
            this._player.left();
        }
        if ( this.RIGHT === true ) {
            this._player.right();
        }
        if ( this.FIRE === true ) {
            if(this._bulletCounter%this.player.fireRate.fireRate == 0){
                this.fireBullet();
            }
            this._bulletCounter++;
        }

        /*Update state for sprites*/
        ////////////
        //Player  //
        ////////////

        //Calculate direction and components of player velocity vector
        this._player.updateVelocity();
        
        //Ensure player remains in boundaries of gamespace
        this.checkBoundaries(this._player, canv);
        
        /////////////
        //Enemy    //
        /////////////

        //Randomly add new enemy to enemy array
        if ( Math.floor(Math.random() * 1000 <= (this._level + 5)/2 )) {
            this.getEnemies(1, canv);
        }
    
        //Calculate direction and components of enemy velocity vector
        for(let i=0; i<this.enemyArr.length; i++) {
            let playerCenterX = this._player.x + this._player.width/2;
            let playerCenterY = this._player.y + this._player.height/2;
            this.enemyArr[i].updateVelocity(playerCenterX, playerCenterY, this.difficulty);
        }

        //Ensure enemy remains in boundaries of gamespace
        for(let i =0; i<this.enemyArr.length; i++) {
            this.checkBoundaries(this.enemyArr[i], canv);
        }

        //enemy player collision detection
        for( let i=0; i<this.enemyArr.length; i++ ) {
            if( this.detectCollision( this._player, this.enemyArr[i], 0 )) {
                this._level = 0;
                this._player.fireRate.reset();
                state.gameOver();
            }
        }
        //////////////
        //Bullets   //
        //////////////

        //update bullet velocities
        for( let i = 0; i < this.bulletArr.length; i++ ) {
            this.bulletArr[i].updateVelocity();
        }

        //prevent bulletArr from becoming too large
        if( this.bulletArr.length > 30 ){
            this.bulletArr.splice(29, this.bulletArr.length - 29);
        }

        //enemy bullet collision detection
        for( let i=this.enemyArr.length - 1; i >= 0; i-- ) {
            for( let j = this.bulletArr.length - 1; j >= 0; j-- ) {
                if( this.detectCollision( this.bulletArr[j], this.enemyArr[i], 0 )) {
                    this.bulletArr.splice(j, 1);
                    this.enemyArr.splice(i, 1);
                    break;
                }
            }
        }
        
        //Coins
        //

        //update coins
        if(this.maxCoins - this.coinsCurrent !== 0) {
            this.getCoins(this.maxCoins - this.coinsCurrent, canv);
        }
        
        //coin player collision detection
        for(let i=0; i<this.coinArr.length; i++) {
            let coin = this.coinArr[i];
            if( this.detectCollision( this._player, coin, 0 )) {
                this.coinArr.splice(i,1);
                this.coinsCurrent--;
                this.score += 100;
                this._user.gold += 100;
                console.dir(this._user);
                this.difficulty += this.score/100000;
            }
        }
    
        /*Check for win condition*/
        if ( this.score >= this.lvlScoreCap ) {
            state.win(this.score);
            this._level++;
        }
    }
}