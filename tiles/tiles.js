import { createMainPanel, createSlider, createSelector } from "./settingsPanel2.js";

import {PERLIN} from "../perlinNoise.js";

window.addEventListener("load", function() { })

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    screenHalf = canvas.width < canvas.height ?
        canvas.width/2 : canvas.height/2;

})

// disable right-click menu
document.body.addEventListener("contextmenu", function(evt) {
    evt.preventDefault();
    return false;
});

window.addEventListener("keydown", function(e) {
    switch(e.key) {
        case " ":
            if (!running) {
                startOver()
            }
            break;
        case "x":
            this.cancelAnimationFrame(running);
            running = false;
            break;
        case "d":
            debug = !debug;
            break;
        case "s":
            //
            break;
        case "Tab":
            //
            break;
    }
})

window.addEventListener("mousedown", function(e) {
    if (e.target.id === "canvas1") {
        switch(e.which) {
            case 1:
                // start over
                startOver();
                break;
            case 3:
                // pause/start
                pauseGame();
                break;
        }
    }
})

createMainPanel();

let noLoop = false;
let loopOn = false;
let running = false;
let debug = false;
const fps = 20;
const int = 1000/fps;
let timer = 0;
let lastTime = 0;
let frames = 0;
const pie2 = Math.PI * 2;
const midX = canvas.width/2;
const midY = canvas.height/2;
let finishCount = 0;

let cols = 0;
let rows = 0;

let grid1D = [];
let grid2D = [];

ctx.strokeStyle = "royalblue";
ctx.fillStyle = "royalblue";

class Setting {
  constructor(name, value) {
      this.name = name;
      this.v = value;
      this.resetVal = value;
      this.rnd = false;
  }
  // requires settingsPanel2.js
  selector(options, separator) {
      this.options = [...options];
      createSelector(this.v, this.name, options, separator);
  }
  // requires settingsPanel2.js
  slider(min, max, step, separator) {
      this.min = min; this.max = max; this.step = step;

      this.possibilities = [];
      let item = this.min;
      let countDecimals = 0;
      if (Math.floor(this.step) === this.step) {
          countDecimals = 0;
      } else {
          countDecimals = this.step.toString().split(".")[1].length;
      }
      while (item <= this.max) {
          this.possibilities.push(item);
          item += this.step;
          if (countDecimals !== 0) {
              item = Number(item.toFixed(countDecimals));
          }
      }
      createSlider(this.v, this.name, min, max, step, separator)
  }
  get() {return this.v;}
  set(newVal) {this.v = newVal;}
  reset() {this.v = this.resetVal;}
  randomise() {
      // if it is a selector
      if (this.options) {
          this.v = randomArrayItem(this.options);
      }
      // if it is a slider
      else {
          // if the steps between min-max float numbers
          this.v = randomArrayItem(this.possibilities);
      }

      const el = document.querySelector(`#settingsPanel #${this.name}`);
      const display = el.querySelector(".display");
    
      if (el.classList.contains("slider")) {
        display.innerText = this.v;
        el.querySelector("input").value = this.v;
      }
      else if (el.classList.contains("selector")) {
        if (this.v === true) {display.innerHTML = "&#9745;";}
        else if (this.v === false) {display.innerHTML = "&#9744;";}
        else {display.innerText = this.v;}
        display.setAttribute("value", this.v);
      }






      return this.v;
  }

}

// variables to be used on the settingspanel and used for templates are to be put in here
export const S = new Object();

S["runSpeed"] = new Setting("runSpeed", 50);
S.runSpeed.slider(10, 100, 10);

S["connection"] = new Setting("connection", "middle");
S.connection.selector(["middle", "random"]);

S["curves"] = new Setting("curves", true);
S.curves.selector([true, false]);


S["tileSize"] = new Setting("tileSize", 20);
S.tileSize.slider(5, 50, 5, true);

S["lineWidth"] = new Setting("lineWidth", 5);
S.lineWidth.slider(1, 10, 1);

S["lineType"] = new Setting("lineType", "round");
S.lineType.selector(["round", "square"]);


S["tileBlank"] = new Setting("tileBlank", false);
S.tileBlank.selector([true, false], true);

S["tileTShape"] = new Setting("tileTShape", true);
S.tileTShape.selector([true, false]);

S["tileLine"] = new Setting("tileLine", false);
S.tileLine.selector([true, false], true);

S["lineCurve"] = new Setting("lineCurve", false);
S.lineCurve.selector([true, false]);

S["tileCross"] = new Setting("tileCross", false);
S.tileCross.selector([true, false], true);

S["crossCurve"] = new Setting("crossCurve", false);
S.crossCurve.selector([true, false]);

S["tileCorner"] = new Setting("tileCorner", false);
S.tileCorner.selector([true, false], true);

S["cornerCurve"] = new Setting("cornerCurve", false);
S.cornerCurve.selector([true, false]);


S["startHue"] = new Setting("startHue", 220);
S.startHue.slider(0, 360, 5, true);

S["startSat"] = new Setting("startSat", 90);
S.startSat.slider(0, 100, 5);

S["startLight"] = new Setting("startLight", 60);
S.startLight.slider(0, 100, 5);

S["hueMode"] = new Setting("hueMode", "random");
S.hueMode.selector(["random", "perlinNoise", "constant"], true);

S["satMode"] = new Setting("satMode", "constant");
S.satMode.selector(["random", "perlinNoise", "constant"]);

S["lightMode"] = new Setting("lightMode", "constant");
S.lightMode.selector(["random", "perlinNoise", "constant"]);

S["perlinInc"] = new Setting("perlinInc", 0.08, "Increment value for perlin noise");
S.perlinInc.slider(0.02, 1, 0.02, true);


let screenHalf = canvas.width < canvas.height ?
    canvas.width/2 : canvas.height/2;

const rules = {
    AA: [1, 1, 0, 1],
    AB: [1, 1, 1, 0],
    AC: [0, 1, 1, 1],
    AD: [1, 0, 1, 1],

    BA: [1, 0, 1, 0],
    BB: [0, 1, 0, 1],

    CA: [1, 1, 0, 0, 1],
    CB: [0, 1, 1, 0, 2],
    CC: [0, 0, 1, 1, 3],
    CD: [1, 0, 0, 1, 0],

    DA: [1, 1, 1, 1, 1],
    DB: [1, 1, 1, 1, 2],
    DC: [1, 1, 1, 1, 3],

    X: [0, 0, 0, 0],
}

const rulesAll = {
    AA: [1, 1, 0, 1],
    AB: [1, 1, 1, 0],
    AC: [0, 1, 1, 1],
    AD: [1, 0, 1, 1],

    BA: [1, 0, 1, 0],
    BB: [0, 1, 0, 1],

    CA: [1, 1, 0, 0, 1],
    CB: [0, 1, 1, 0, 2],
    CC: [0, 0, 1, 1, 3],
    CD: [1, 0, 0, 1, 0],

    DA: [1, 1, 1, 1, 1],
    DB: [1, 1, 1, 1, 2],
    DC: [1, 1, 1, 1, 3],

    X: [0, 0, 0, 0],

    ZA: [1, 0, 0, 0],
    ZB: [0, 1, 0, 0],
    ZC: [0, 0, 1, 0],
    ZD: [0, 0, 0, 1],
}

let tileNames;
let tileNamesAll = Object.keys(rulesAll);

function addRules() {
    tileNames = Object.keys(rules);

    const toRemove = [];
    tileNames.forEach(name => {
        switch(name[0]) {
            case "A":
                if (!S.tileTShape.v) {toRemove.push(name);}
                break;
            case "B":
                if (!S.tileLine.v) {toRemove.push(name);}
                break;
            case "C":
                if (!S.tileCorner.v) {toRemove.push(name);}
                break;
            case "D":
                if (!S.tileCross.v) {toRemove.push(name);}
                break;
            case "X":
                if (!S.tileBlank.v) {toRemove.push(name);}
                break;
        }
    })
    
    if (toRemove.length > 0) {
        removeArrayItems(tileNames, toRemove);
    }
}

class Tile {
    constructor(index, pos, size, hue, sat, light, width) {
        this.i = index;
        this.pos = pos;
        this.size = size;
        this.hue = hue;
        this.sat = sat;
        this.light = light;
        this.width = width;
        this.connectionType = S.connection.v;

        this.drawn = false;
        this.collapsed = false;
        this.options = [...tileNames];
        this.offsets = [0,0,0,0];
    }
    draw() {
        if (debug) {
            ctx.save();
                ctx.lineWidth = 1;
                ctx.strokeRect(this.pos.x, this.pos.y, this.size, this.size);
            ctx.restore();
        }

        if (this.collapsed && this.options[0] !== undefined) {
            chooseDrawPattern(this);
        }
    }

    collapse() {
        this.collapsed = true;
        let choice = randomArrayItem(this.options);

        this.offsets = getNearbyOffsets(choice, this.i);

        if (choice === undefined) {
            choice = getTileForGap(this.offsets);
        }
        this.options = [choice];

        for (let i = 0; i < 4; i++) { 
            if (rulesAll[choice][i] === 1 && 
                this.offsets[i] === 0) {
                if (this.connectionType === "random") {
                    this.offsets[i] = randomise(true, this.size-5, 5);
                }
                else if (this.connectionType === "middle") {
                    this.offsets[i] = this.size/2;
                }
            }
        }

        this.draw();
        
        finishCount++;
        grid1D.splice(grid1D.indexOf(this), 1);
        changeNearby(this);
    }

    reduceOptions(target, index) {
        if (!this.collapsed && target !== undefined) {
            const targetType = rulesAll[target][index];
            const i = (index + 2) % 4;
            
            this.options = this.options.filter(name => {
                const thisType = rulesAll[name][i];
                if (thisType === targetType) {return name;}
            })
        }
    }
}

function fillTiles() {
    let gridCopy = grid1D.slice();

    let len = 100;
    for (let i = 0; i < gridCopy.length; i++) { 
        // console.log("gridCopy[i].options", gridCopy[i].options)
        if (gridCopy[i].options.length < len) {
            len = gridCopy[i].options.length;
        }
    }
    let gridFilter = gridCopy.filter(tile => {
        if (!tile.collapsed && tile.options.length === len) {
            return tile;
        }
    });

    let rndTile = randomArrayItem(gridFilter);
    rndTile.collapse();
}

function changeNearby(tile) {
    const type = tile.options[0];
    const pos = createVector(tile.i.x, tile.i.y);
    
    // check tile above
    if (pos.y-1 >= 0) {
        grid2D[pos.x][pos.y-1].reduceOptions(type, 0);}
    else {
        grid2D[pos.x][rows-1].reduceOptions(type, 0);}

    // check tile to the right
    if (pos.x+1 < cols) {
        grid2D[pos.x+1][pos.y].reduceOptions(type, 1);}
    else {
        grid2D[0][pos.y].reduceOptions(type, 1);}

    // check tile below
    if (pos.y+1 < rows) {
        grid2D[pos.x][pos.y+1].reduceOptions(type, 2);}
    else {
        grid2D[pos.x][0].reduceOptions(type, 2);}

    // check tile to the left
    if (pos.x-1 >= 0) {
        grid2D[pos.x-1][pos.y].reduceOptions(type, 3);}
    else {
        grid2D[cols-1][pos.y].reduceOptions(type, 3);}

}

function getNearbyOffsets(type, pos) {
    const offsets = [0, 0, 0, 0];
    let offs;

    const target = rules[type] === undefined ? rules["DA"] : rules[type];

    let targetTile;

    // above
    if (target[0] === 1) {
        if (pos.y-1 >= 0) {
            targetTile = grid2D[pos.x][pos.y-1];
            offs = targetTile.offsets[2];
        } else {
            targetTile = grid2D[pos.x][rows-1];
            offs = targetTile.offsets[2];
        }
        if (offs !== 0) {offsets[0] = offs;}
    }
    // right
    if (target[1] === 1) {
        if (pos.x+1 < cols) {
            targetTile = grid2D[pos.x+1][pos.y];
            offs = targetTile.offsets[3];
        } else {
            targetTile = grid2D[0][pos.y];
            offs = targetTile.offsets[3];
        }
        if (offs !== 0) {offsets[1] = offs;}
    }
    // below
    if (target[2] === 1) {
        if (pos.y+1 < rows) {
            targetTile = grid2D[pos.x][pos.y+1];
            offs = targetTile.offsets[0];
        } else {
            targetTile = grid2D[pos.x][0];
            offs = targetTile.offsets[0];
        }
        if (offs !== 0) {offsets[2] = offs;}
    }
    // left
    if (target[3] === 1) {
        if (pos.x-1 >= 0) {
            targetTile = grid2D[pos.x-1][pos.y];
            offs = targetTile.offsets[1];
        } else {
            targetTile = grid2D[cols-1][pos.y];
            offs = targetTile.offsets[1];
        }
        if (offs !== 0) {offsets[3] = offs;}
    }

    return offsets;
}

function getTileForGap(offsets) {
    const matchNames = [];
    const count = [];

    offsets.forEach(num => {
        num > 0 ? count.push(1) : count.push(0);
    })

    for (let i = 0; i < tileNamesAll.length; i++) { 
        const targetArr = rulesAll[tileNamesAll[i]]; 
        let match = 0;

        for (let j = 0; j < 4; j++) { 
            if (targetArr[j] === count[j]) {match++;}
        }
        if (match === 4) {matchNames.push(tileNamesAll[i])}
    }

    const finalName = randomArrayItem(matchNames)
    return finalName;
}

function drawGrid() {
    for (let x = 0; x < grid2D.length; x++) { 
        for (let y = 0; y < grid2D[x].length; y++) { 
            if (!grid2D[x][y].collapsed) {
                grid2D[x][y].draw();
            }
        }
    }
}

function setStartingColors() {
    let h; let s; let l;
    
    if (S.hueMode.v === "constant") {h = S.startHue.v;}
    else if (S.hueMode.v === "perlinNoise") {h = S.startHue.v;}
    else if (S.hueMode.v === "random") {h = S.startHue.randomise();}

    if (S.satMode.v === "constant") {s = S.startSat.v;}
    else if (S.satMode.v === "perlinNoise") {s = S.startSat.v;}
    else if (S.satMode.v === "random") {s = S.startSat.randomise();}

    if (S.lightMode.v === "constant") {l = S.startLight.v;}
    else if (S.lightMode.v === "perlinNoise") {l = S.startLight.v;}
    else if (S.lightMode.v === "random") {l = S.startLight.randomise();}

    return [h,s,l];
}

function init() {
    addRules();
    ctx.lineCap = S.lineType.v;
    const tileSize = S.tileSize.v;
    const lineWidth = S.lineWidth.v;
    const inc = S.perlinInc.v;

    let [hue, sat, light] = setStartingColors();

    finishCount = 0;
    grid2D = [];
    grid1D = [];

    cols = Math.floor(canvas.width / tileSize);
    rows = Math.floor(canvas.height / tileSize);
    // cols = 3; rows = 3;

    const startX = Math.floor(midX - (cols/2 * tileSize));
    const startY = Math.floor(midY - (rows/2 * tileSize));

    let yoff = 0;
    const hueOffset = randomise(true, 360, 0);
    const satOffset = randomise(true, 20, 0);
    const lightOffset = randomise(true, 20, 0);

    for (let x = 0; x < cols; x++) { 
        grid2D.push([])
        let xoff = 0;
        for (let y = 0; y < rows; y++) { 
            const posX = x*tileSize + startX;
            const posY = y*tileSize + startY;

            const noise = PERLIN(xoff, yoff);
            if (S.hueMode.v === "perlinNoise") {
                hue = Math.floor(noise*100 + hueOffset);
            }
            if (S.satMode.v === "perlinNoise") {
                sat = Math.floor(noise*100 + satOffset);
            }
            if (S.lightMode.v === "perlinNoise") {
                light = Math.floor(noise*100 + lightOffset);
            }

            grid2D[x].push(new Tile(createVector(x,y),createVector(posX, posY), tileSize, hue, sat, light, lineWidth));

            grid1D.push(grid2D[x][y]);

            xoff += inc;
        }
        yoff += inc;
    }
}


function animate(timeStamp) {
    let deltaTime = timeStamp-lastTime;
    lastTime = timeStamp;

    if (timer > int) {
        console.log("looping", )
        
        for (let i = 0; i < S.runSpeed.v; i++) { 
            if (finishCount < cols*rows) {
                fillTiles();
    
                if (finishCount === cols*rows) {
                    loopOn = false;
                    console.log("solved", )
                }
            }
        }

        timer = 0;
        if (noLoop) {loopOn = false;}
    } else {timer += deltaTime;}

    if (loopOn) {running = requestAnimationFrame(animate);}
}

function startOver() {
    clearAll();
    loopOn = true;

    init();
    animate(0);
}

function clearAll() {
    console.log("cleared", )
    loopOn = false;
    cancelAnimationFrame(running);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function pauseGame() {
    if (loopOn) {
        loopOn = false;
        cancelAnimationFrame(running);
        console.log("pause", )
    }
    else {
        loopOn = true;
        animate(0);
        console.log("resume", )
    }
}


function chooseDrawPattern(tile) {
    const type = tile.options[0];

        switch(type[0]) {
            case "A":
                drawTile3P(tile.offsets, tile.pos.x, tile.pos.y, tile.size, rulesAll[type], tile.hue, tile.sat, tile.light, tile.width);
                break;

            case "B":
            case "C":
                drawTile2P(tile.offsets, tile.pos.x, tile.pos.y, tile.size, rulesAll[type], tile.hue, tile.sat, tile.light, tile.width);
                break;

            case "D":
                drawTile4P(tile.offsets, tile.pos.x, tile.pos.y, tile.size, rulesAll[type], tile.hue, tile.sat, tile.light, tile.width);
                break;
                
            case "Z":
                drawTile1P(tile.offsets, tile.pos.x, tile.pos.y, tile.size, rulesAll[type], tile.hue, tile.sat, tile.light, tile.width);
                break;
        }
}


function drawTile1P(offsets, x,y,s,arr,hue,sat, light, width) {
    // console.log("draw1", )
    const offs = offsets;
    const midx = x+s/2; const midy = y+s/2;
    let innerX; let innerY;

    if (S.connection.v === "random") {
        innerX = x + randomise(true, s-2, 2);
        innerY = y + randomise(true, s-2, 2);
    }
    else if (S.connection.v === "middle") {
        innerX = midx; innerY = midy;
    }


    let startLine; let endLine;
    let cp11; let cp12; let cp21;

    // top-right and bottom-left
    if (arr[0] === 1) {
        startLine = createVector(x+offs[0], y);
    }
    else if (arr[1] === 1) {
        startLine = createVector(x+s, y+offs[1]);
    }
    else if (arr[2] === 1) {
        startLine = createVector(x+offs[2], y+s);
    }
    else if (arr[3] === 1) {
        startLine = createVector(x, y+offs[3]);
    }
    endLine = createVector(innerX, innerY);

    if (S.curves.v && S.lineCurve.v) {
        cp11 = createVector(midx, midy);
        cp21 = createVector(midx, midy);
    }

    drawLine(startLine, endLine, hue, sat, light, width, cp11, cp12);
    // drawLine(startLine2, endLine2, hue, sat, cp21, cp22);
}

function drawTile2P(offsets, x,y,s,arr,hue,sat, light, width) {
    // console.log("draw2", )
    const offs = offsets;
    let startLine; let endLine;
    let cp1; let cp2;
    const cpOffset = 3;
    // console.log("arr", arr)

    // top and bottom
    if (arr[0] === 1 && arr[2] === 1) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x+offs[2], y+s);
        // startLine = createVector(x+s/2, y);
        // endLine = createVector(x+s/2, y+s);

        if (S.curves.v && S.lineCurve.v) {
            const cp1x = rndTrueFalse(0.5) ? x : x+s;
            const cp1y = y+s/cpOffset;
            cp1 = createVector(cp1x, cp1y);
    
            const cp2x = cp1x === x ? x+s : x;
            const cp2y = y+(s/cpOffset)*2;
            cp2 = createVector(cp2x, cp2y);
        }
    } 
    // right and left
    else if (arr[1] === 1 && arr[3] === 1) {
        startLine = createVector(x+s, y+offs[1]);
        endLine = createVector(x, y+offs[3]);
        
        if (S.curves.v && S.lineCurve.v) {
            const cp1y = rndTrueFalse(0.5) ? y : y+s;
            const cp1x = x+s/cpOffset;
            cp1 = createVector(cp1x, cp1y);
    
            const cp2y = cp1y === y ? y+s : y;
            const cp2x = x+(s/cpOffset)*2;
            cp2 = createVector(cp2x, cp2y);
        }
    }
    // top and right
    else if (arr[0] === 1 && arr[1] === 1) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x+s, y+offs[1]);
        if (S.curves.v && S.cornerCurve.v) {
            cp1 = createVector(x, y+s);}

    } 
    // top and left
    else if (arr[0] === 1 && arr[3] === 1) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x, y+offs[3]);
        if (S.curves.v && S.cornerCurve.v) {
            cp1 = createVector(x+s, y+s);}
    } 
    // right and bottom
    else if (arr[1] === 1 && arr[2] === 1) {
        startLine = createVector(x+s, y+offs[1]);
        endLine = createVector(x+offs[2], y+s);
        if (S.curves.v && S.cornerCurve.v) {
            cp1 = createVector(x, y);}
    } 

    // bottom and left
    else if (arr[2] === 1 && arr[3] === 1) {
        startLine = createVector(x+offs[2], y+s);
        endLine = createVector(x, y+offs[3]);
        if (S.curves.v && S.cornerCurve.v) {
            cp1 = createVector(x+s, y);}
    }

    // console.log("--st", startLine)
    // console.log("en", endLine)
    drawLine(startLine, endLine, hue, sat, light, width, cp1, cp2);

}

function drawTile3P(offsets,x,y,s,arr,hue,sat, light, width) {
    // console.log("draw3", )
    const offs = offsets;
    let startLine; let endLine;
    let startLine2; let endLine2;
    let endLine0; // this is where the line from the 2nd point would go to if it was drawn to the opposite side

    // top and bottom
    if (arr[0] === 1 && arr[2] === 1) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x+offs[2], y+s);

        if (arr[1] === 1) {
            startLine2 = createVector(x+s, y+offs[1]);
            endLine0 = createVector(x, y+s-offs[1]);
        }

        else if (arr[3] === 1) {
            startLine2 = createVector(x, y+offs[3]);
            endLine0 = createVector(x+s, y+s-offs[3]);
        }
    }
     // right and left
    else if (arr[1] === 1 && arr[3] === 1) {
        startLine = createVector(x+s, y+offs[1]);
        endLine = createVector(x, y+offs[3]);

        if (arr[0] === 1) {
            startLine2 = createVector(x+offs[0], y);
            endLine0 = createVector(x+s-offs[0], y+s);
        }
        else if (arr[2] === 1) {
            startLine2 = createVector(x+offs[2], y+s);
            endLine0 = createVector(x+s-offs[2], y);
        }
    }

    // this is an adjustment for midx midy, where the crossing line is met by the other line
    // endLine2 = getIntercept(startLine, endLine, startLine2, endLine0);

    // this connects the line from the 2nd point to the middle of the crossing line; this requires much fewer maths
    endLine2 = getIntercept2(startLine, endLine);

    // drawLine(startLine, endLine, 0, 90, 60, width);
    drawLine(startLine, endLine, hue, sat, light, width);
    drawLine(startLine2, endLine2, hue, sat, light, width);
}

function drawTile4P(offsets, x,y,s,arr,hue,sat,light, width) {
    // console.log("draw4", )
    const offs = offsets;
    const midx = x+s/2; const midy = y+s/2;
    let startLine; let endLine; let startLine2; let endLine2;
    let cp11; let cp12; let cp21; let cp22;

    // top-bottom and right-left
    if (arr[4] === 1) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x+offs[2], y+s);
        startLine2 = createVector(x+s, y+offs[1]);
        endLine2 = createVector(x, y+offs[3]);
    }
    // top-right and bottom-left
    else if (arr[4] === 2) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x+s, y+offs[1]);
        startLine2 = createVector(x+offs[2], y+s);
        endLine2 = createVector(x, y+offs[3]);
    }
    // top-left and bottom-right
    else if (arr[4] === 3) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x, y+offs[3]);
        startLine2 = createVector(x+offs[2], y+s);
        endLine2 = createVector(x+s, y+offs[1]);
    }

    if (S.curves.v && S.crossCurve.v) {
        // cp11 = createVector(x+s, y+s);
        // cp21 = createVector(x, y);
        cp11 = createVector(midx, midy);
        cp21 = createVector(midx, midy);
    }

    drawLine(startLine, endLine, hue, sat, light, width, cp11, cp12);
    drawLine(startLine2, endLine2, hue, sat, light, width, cp21, cp22);
}


function drawLine(start, end, hue, sat, light, width, cp1, cp2) {
    ctx.save();
        ctx.strokeStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);

        if (cp2) {
            ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
        }
        else if (cp1) {
            ctx.quadraticCurveTo(cp1.x, cp1.y, end.x, end.y);
        } else {
            ctx.lineTo(end.x, end.y);
        }
        ctx.stroke();
    ctx.restore();
}

function getIntercept(start1, end1, start2, end2) {
    // y = m*x + b
    // get the variables in the equations for both lines
    // slope = (y2 - y1) / (x2 - x1);
    // b = y - m*x;

    let x1Difference = end1.x - start1.x;
    x1Difference = x1Difference === 0 ? 1 : x1Difference;
    const m1 = (end1.y - start1.y) / (x1Difference);
    const b1 = start1.y - (m1 * start1.x);
    
    let x2Difference = end2.x - start2.x;
    x2Difference = x2Difference === 0 ? 1 : x2Difference;
    const m2 = (end2.y - start2.y) / (x2Difference);
    const b2 = start2.y - (m2 * start2.x);

    // both line equations are equal at the same y coordinate, from that, get x
    // y = m1*x + b1 and y = m2*x + b2
    // m1*x + b1 = m2*x + b2
    // rearrange for x
    const x = (b2 - b1)  / (m1 - m2);
    const y = m1 * x + b1;

    return createVector(x, y);
}

function getIntercept2(start1, end1) {
    const halfX = start1.x + (end1.x - start1.x)/2;
    const halfy = start1.y + (end1.y - start1.y)/2;

    return createVector(halfX, halfy); 
}



//helper functions
function randomise(floor, max, min, toFixed) {
    if (floor === true) {
        return Math.floor(Math.random() * (max-min+1) + min);
    } else if (floor === false) {
        return Number((Math.random() * (max-min+1) + min).toFixed(toFixed));
    }
}

function rndTrueFalse(threshold) {
    return Math.random() < threshold ? true : false;
}

function randomArrayItem(arr) {
    const i = Math.floor(Math.random() * arr.length);
    return arr[i];
}

function removeArrayItems(fromArr, itemsArr) {
    itemsArr.forEach(item => {
        const i = fromArr.indexOf(item);
        fromArr.splice(i,1);
    })
}

function map(n, start1, stop1, start2, stop2) {
    var newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;

    return Math.max(Math.min(newval, stop2), start2);
}

function createVector(x,y) {
    return {x: x, y: y}
}



// })