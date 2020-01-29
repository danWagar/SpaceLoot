export class Screen {
  constructor(ctx, name) {
    this.ctx = ctx;
    this.canv = ctx.canvas;
    this.buttonArray = [];
    this.spriteArray = [];
    this.textArray = [];
    this.imageArray = [];
    this.rectArray = [];
    this.bgImg = null;
    this.text = null;
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set backgroundImg(img) {
    this.bgImg = img;
  }

  drawBorder(obj, color, padding, thickness) {
    this.ctx.rect(obj.x - padding, obj.y - padding, obj.width + padding * 2, obj.height + padding * 2);
    this.ctx.lineWidth = thickness;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  addButton(img, x, y, name) {
    this.buttonArray.push(new Button(img, x, y, name));
  }

  addTextBox(str, x, y, color, size, font, bool, borderColor) {
    let text = {
      str: str,
      x: x,
      y: y,
      height: this.ctx.measureText(str).height,
      width: this.ctx.measureText(str).width,
      color: color,
      size: size,
      font: font,
      border: bool,
      borderColor: borderColor
    };
    this.textArray.push(text);
  }

  addRect(color, x, y, width, height, bool, borderColor) {
    let _rect = {
      color: color,
      x: x,
      y: y,
      width: width,
      height: height,
      border: bool,
      borderColor: borderColor
    };
    this.rectArray.push(_rect);
  }

  addImage(img, x, y, bool, color, name) {
    //console.log('adding image to imageArray');
    let _img = {
      img: img,
      x: x,
      y: y,
      width: img.width,
      height: img.height,
      border: bool,
      borderColor: color,
      name: name
    };
    this.imageArray.push(_img);
    //console.dir(this.imageArray);
  }

  draw(bgOpacity) {
    //console.log("drawing screen");
    //console.dir(this);

    this.ctx.save();
    if (typeof bgOpacity === 'undefined') {
      this.ctx.fillStyle = 'black';
    } else {
      this.ctx.fillStyle = bgOpacity;
    }
    this.ctx.fillRect(0, 0, this.canv.height, this.canv.width);

    if (this.bgImg !== null) {
      this.ctx.drawImage(this.bgImg, 0, 0, this.canv.width, this.canv.height);
    }

    //console.log("there are " + this.textArray.length + " text boxes to draw");
    if (this.textArray.length > 0) {
      for (let i = 0; i < this.textArray.length; ) {
        this.ctx.fillStyle = this.textArray[i].color;
        this.ctx.font = this.textArray[i].size + ' ' + this.textArray[i].font;
        this.ctx.fillText(this.textArray[i].str, this.textArray[i].x, this.textArray[i].y);
        this.textArray.shift();
      }
    }

    //console.log("there are " + this.buttonArray.length + " buttons");
    for (let i = 0; i < this.buttonArray.length; i++) {
      //console.dir(this.buttonArray[i]);
      let b = this.buttonArray[i];
      this.ctx.drawImage(b.img, b.x, b.y, b.width, b.height);
    }

    //draw images in image array
    for (let i = 0; i < this.imageArray.length; i++) {
      let img = this.imageArray[i];
      this.ctx.drawImage(img.img, img.x, img.y, img.width, img.height);
      if (img.border === true) {
        this.drawBorder(img, img.borderColor, 10, 5);
      }
    }

    //draw images in rect array
    for (let i = 0; i < this.rectArray.length; ) {
      let rect = this.rectArray[i];
      this.ctx.fillStyle = rect.color;
      this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      if (rect.border === true) {
        this.drawBorder(rect, rect.borderColor, 10, 5);
      }
      this.rectArray.shift();
    }
  }

  //https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
  getMouseCoords(e) {
    var rect = this.canv.getBoundingClientRect(), // abs. size of element
      scaleX = this.canv.width / rect.width, // relationship bitmap vs. element for X
      scaleY = this.canv.height / rect.height; // relationship bitmap vs. element for Y

    return {
      x: (e.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
      y: (e.clientY - rect.top) * scaleY // been adjusted to be relative to element
    };
  }

  checkButtonClick(event) {
    let coords = this.getMouseCoords(event);
    //console.log('there are ' + this.buttonArray.length + ' buttons');
    //console.dir(this);
    for (let i = 0; i < this.buttonArray.length; i++) {
      /*console.log(
        'Button ' +
          this.buttonArray[i].name +
          ' coords are ' +
          this.buttonArray[i].x +
          ',' +
          this.buttonArray[i].y
      );
      */
      if (this.buttonArray[i].within(coords)) {
        return this.buttonArray[i].name;
      }
    }
    return false;
  }
}

class Button {
  constructor(img, x, y, name) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.width = img.width;
    this.height = img.height;
    this.name = name;
  }

  within(coords) {
    //console.log("Button coords are " + this.x + ", " + this.y);
    if (
      coords.x <= this.x + this.width &&
      coords.x >= this.x &&
      coords.y <= this.y + this.height &&
      coords.y >= this.y
    ) {
      return true;
    } else {
      return false;
    }
  }
}

export class GameScreen extends Screen {
  constructor(ctx) {
    super(ctx);
  }

  draw(spriteArray) {
    this.ctx.save();
    super.draw();

    for (var i = 0; i < spriteArray.length; ) {
      spriteArray[i].draw(this.ctx);
      spriteArray.shift();
    }
  }
}

export class UpgradeScreen extends Screen {
  constructor(ctx) {
    super(ctx);
    //array of object img: img, name: 'string'
    this.upgradeImages = [];
    this._plusButton;
    this._minusButton;
    this.init = false;
  }

  set minusButton(btn) {
    this._minusButton = btn;
  }
  set plusButton(btn) {
    this._plusButton = btn;
  }

  addUpgradeImage(img, name) {
    let x = 0;
    let y = 0;
    this.upgradeImages.push({ img, x, y, name });
  }

  drawUpgradeImages(numCols, startHeight, vertPadding, border, color) {
    if (this.init === true) return;
    //console.log('canv width is ' + this.ctx.canvas.width);
    let padding = (this.ctx.canvas.width - this.upgradeImages[0].img.width * numCols) / (numCols + 1);
    let currRow = 0;
    let currCol = 0;
    let y = startHeight;
    let x = padding;
    for (let i = 0; i < this.upgradeImages.length; i++) {
      let img = this.upgradeImages[i];
      if (i !== 0) x += (img.img.width + padding) * 1;
      img.x = x;
      this.addImage(img.img, x, y, border, color, img.name);
      //add plus and minus buttons
      this.addButton(
        this._plusButton,
        x + 5,
        y + img.img.height - this._plusButton.height,
        `plus${img.name}`
      );
      this.addButton(
        this._minusButton,
        x + img.img.width - 5 - this._minusButton.width,
        y + img.img.height - this._minusButton.height,
        `minus${img.name}`
      );
      if ((i + 1) % numCols === 0) {
        currRow++;
        currCol = 0;
        y += (img.img.height + vertPadding) * currRow;
        img.y = y;
        x = padding;
        img.x = x;
      } else currCol++;
    }
    this.init = true;
  }

  upgradeDimensions(name) {
    //console.log('searching for upgrade dimensions');
    //console.log('length of upgradeImages is ' + this.imageArray.length);
    for (let i = 0; i < this.imageArray.length; i++) {
      //console.dir(this.imageArray);
      let img = this.imageArray[i];
      //console.dir(img);
      //console.log('searching for name ' + name);
      if (img.name === name) {
        let dimensions = {
          x: img.x,
          y: img.y,
          width: img.width,
          height: img.height
        };
        //console.dir(dimensions);
        //console.log('name found');
        return dimensions;
      }
    }
    return null;
  }
}
