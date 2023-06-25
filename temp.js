
window.addEventListener("load", function() {
    const canvas = this.document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    // disable right-click menu
    this.document.body.addEventListener("contextmenu", function(evt){
        evt.preventDefault();
        return false;
    });

    this.window.addEventListener("keydown", function(e) {
        switch(e.key) {
            case " ":
                // start/pause
                pauseGame();
                break;
            case "x":
                // clear all
                clearAll()
                break;
            case "d":
                debug = debug ? false : true;
        }
    })
    this.window.addEventListener("mousedown", function(e) {
        if (e.target.id === "canvas1") {
            switch(e.which) {
                case 1:
                    // start over
                    console.log("left-click", )
                    startOver()
                    break;
                case 3:
                    // pause/start
                    console.log("right-click", )
                    pauseGame()
                    break;
            }
        }
    })
    this.window.addEventListener("resize", function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    })

    const checkboxChange = {
        true: `&#9745;`,
        false: `&#9744;`,
    }

    let debug = false;
    let looping;
    let gameOn = false;
    const pie2 = Math.PI * 2;
    let fps = 20;
    let int = 1000/fps;
    let timer = 0;
    let lastTime = 0;

    // settings
    class Settings {
        constructor() {
            this.clearCanvas = {
                "t": "clearCanvas",
                "v": false,
                "reset":() => {return false},
                "rndVal": () => {return rndTrueFalse(0.05);},
                "rndCheck": true,};

            this.finiteDraw = {
                "t": "finiteDraw",
                "v": true,
                "reset": () => {return true},
                "rndVal": () => { return rndTrueFalse(0.5);},"rndCheck": true,
            } ;

            this.finiteCount = {
                "t": "finiteCount",
                "v": 10,
                "reset": () => {return 10},
                "rndVal": () => { return (true, 100, 10);},
                "rndCheck": true,
            } ;

            this.colorShift = {
                "t": "colorShift",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.25);},
                "rndCheck": true,
            };
            this.colorDifference = {
                "t": "colorDifference",
                "v": 10,
                "reset": () => {return 10},
                "rndVal": () => { return randomise(true, 360, 5);},
                "rndCheck": true,
            };

            this.startHue = {
                "t": "startHue",
                "v": 220,
                "reset": () => {return 220},
                "rndVal": () => { return randomise(true, 360, 1);},
                "rndCheck": true,
            } ;
            this.changeHue = {
                "t": "changeHue",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.5);},
                "rndCheck": true,
            } ;

            this.startSaturate = {
                "t": "startSaturate",
                "v": 90,
                "reset": () => {return 90},
                "rndVal": () => {return randomise(true, 100, 0);
                },
                "rndCheck": true,
            } ;

            this.changeSat = {
                "t": "changeSat",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.5);},
                "rndCheck": true,
            } ;

            this.startLight = {
                "t": "startLight",
                "v": 60,
                "reset": () => {return 60},
                "rndVal": () => {return randomise(true, 100, 0);},
                "rndCheck": true,
            } ;

            this.changeLight = {
                "t": "changeLight",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.5);},
                "rndCheck": true,
            } ;

            this.shapeType = {
                "t": "shapeType",
                "v": "line",
                "reset": () => {return "line"},
                "rndVal": () => { 
                    return rndTrueFalse(0.2) === false ? "line" :
                shapesTypeChange[randomise(true, 2, 1)];
                },
                "rndCheck": true,
            } ;

            this.drawLinesFromOrigo = {
                "t": "drawLinesFromOrigo",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.2);},
                "rndCheck": true,
            } ;
            this.shapeSize = {
                "t": "shapeSize",
                "v": 10,
                "reset": () => {return 10},
                "rndVal": () => { return randomise(true, 200, 10);},
                "rndCheck": true,
            } ;
            this.vSize = {
                "t": "vSize",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return vSize = rndTrueFalse(0.3) === false ? 
                0 : (randomise(true, 20, 1) * 1)/10;
                },
                "rndCheck": true,

            } ;
            this.maxSize = {
                "t": "maxSize",
                "v": 20,
                "reset": () => {return 20},
                "rndVal": () => { return randomise(true, 200, 20);},
                "rndCheck": true,

            } ;
            this.reverseSize = {
                "t": "reverseSize",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.3);},
                "rndCheck": true,

            } ;
        
            this.shiftXY = {
                "t": "shiftXY",
                "v": true,
                "reset": () => {return true},
                "rndVal": () => { return rndTrueFalse(0.8);},
                "rndCheck": true,

            } ;
            this.linesWithinBorders = {
                "t": "linesWithinBorders",
                "v": true,
                "reset": () => {return true},
                "rndVal": () => { return rndTrueFalse(0.7);},
                "rndCheck": true,

            } ;
            this.radius1 = {
                "t": "radius1",
                "v": 2,
                "reset": () => {return 2},
                "rndVal": () => { 
                    return rndTrueFalse(0.3) === false ? 
                1 : randomise(true, Math.floor(canvas.width/2), 1);
                },
                "rndCheck": true,

            } ;
            this.radius2 = {
                "t": "radius2",
                "v": 2,
                "reset": () => {return 2},
                "rndVal": () => { 
                    return rndTrueFalse(0.3) === false ? 
                1 : randomise(true, Math.floor(canvas.height/2), 1);
                },
                "rndCheck": true,

            } ;
            this.vRadius1 = {
                "t": "vRadius1",
                "v": 1,
                "reset": () => {return 1},
                "rndVal": () => { 
                    return (randomise(true, 40, -40) * 5)/100;
                },
                "rndCheck": true,

            } ;
            this.vRadius2 = {
                "t": "vRadius2",
                "v": -1,
                "reset": () => {return -1},
                "rndVal": () => { 
                    return (randomise(true, 40, -40) * 5)/100;
                },
                "rndCheck": true,

            } ;
            this.vvRadius1 = {
                "t": "vvRadius1",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return (randomise(true, 40, -40) * 5)/100;
                },
                "rndCheck": true,

            };
            this.vvRadius2 = {
                "t": "vvRadius2",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return (randomise(true, 40, -40) * 5)/100;
                },
                "rndCheck": true,

            };
        
            this.vAngle = {
                "t": "vAngle",
                "v": 0.1,
                "reset": () => {return 0.1},
                "rndVal": () => { 
                    return (randomise(true, 100, 5) * 1)/100;
                },
                "rndCheck": true,

            };        // 0.05 - 1 for vAngle
            this.vvAngle = {
                "t": "vvAngle",
                "v":  0.01,
                "reset": () => {return 0.01},
                "rndVal": () => { 
                    return rndTrueFalse(0.3) === false ? 
                0 : (randomise(true, 10, 1) * 1)/10;
                },
                "rndCheck": true,

            };
            this.vAngleReversePoint = {
                "t": "vAngleReversePoint",
                "v": 1,
                "reset": () => {return 1},
                "rndVal": () => { 
                    return (0.3) === false ? 
                0 : randomise(true, 5, 1);

                },
                "rndCheck": true,

            } ;
            this.randomAngleShiftChance = {
                "t": "randomAngleShiftChance",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return (0.3) === false ? 
                0 : (randomise(true, 19, 1) * 5)/100;

                },
                "rndCheck": true,

            } ;
        
            this.lineWidth = {
                "t": "lineWidth",
                "v": 2,
                "reset": () => {return 2},
                "rndVal": () => { 
                    return rndTrueFalse(0.9) === true ? 
                randomise(true, 15, 1) : randomise(true, 50, 16);
                },
                "rndCheck": true,

            } ;
            this.vLineWidth = {
                "t": "vLineWidth",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return rndTrueFalse(0.3) === false ? 
                0 : (randomise(true, 20, 1) * 1)/10;
                },
                "rndCheck": true,

            } ;
            this.maxLineWidth = {
                "t": "maxLineWidth",
                "v": 20,
                "reset": () => {return 20},
                "rndVal": () => { 
                    return randomise(true, 100, 20);
                },
                "rndCheck": true,

            } ;
            this.reverseLineWidth = {
                "t": "reverseLineWidth",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { 
                    return rndTrueFalse(0.3);
                },
                "rndCheck": true,

            } ;
            this.opacityShift = {
                "t": "opacityShift",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { 
                    return rndTrueFalse(0.3);
                },
                "rndCheck": true,

            } ;
            this.list = [];
        }
        collectSettings() {
            let keys = Object.keys(this);
            keys.forEach(key => {
                this.list.push(this[key])
            })
            this.list.pop();
        }
        initialize() {
            initSettings();
        }

    }
    const S = new Settings();
    S.collectSettings();
    S.initialize();

    class Shape {
        constructor(settings) {
            this.S = settings;
            this.hue = this.S.startHue.v;
            this.saturate = this.S.startSaturate.v;
            this.light = this.S.startLight.v;
            this.vSat = 1;
            this.vLight = 1;
            this.midX = canvas.width/2;
            this.midY = canvas.height/2;

            this.x = this.midX; this.y = this.midY;
            this.nextX = this.midX; this.nextY = this.midY;

            this.size = this.S.shapeSize.v;
            this.vSize = this.S.vSize.v;

            this.rad1 = this.S.radius1.v;
            this.rad2 = this.S.radius2.v;
            this.vRad1 = this.S.vRadius1.v;
            this.vRad2 = this.S.vRadius2.v;
            this.vvRad1 = this.S.vvRadius1.v;
            this.vvRad2 = this.S.vvRadius2.v;

            this.firstAngle = Math.random() * (Math.PI*2);
            this.angle = this.firstAngle;
            this.vAngle = this.S.vAngle.v;
            this.vvAngle = this.S.vvAngle.v;

            this.lineWidth = this.S.lineWidth.v;
            this.vLineWidth = this.S.vLineWidth.v;
            this.opacity = 1;
            this.vOpac = 0.05;
            
            this.rotation = 0;
            this.vRot = 0.001;
            this.first = true;
            this.count = 0;
        }
        draw() {
            ctx.save();
                // if (rotateCanvas) {
                //     ctx.translate(this.midX, this.midY);
                //     ctx.rotate(this.rotation);
                // }

                ctx.strokeStyle = `hsl(${this.hue}, ${this.saturate}%, ${this.light}%)`;
                ctx.lineWidth = this.lineWidth;
                ctx.lineCap = "round";
                ctx.globalAlpha = this.opacity;
                
                if (this.S.shapeType.v === "line") {
                    if (this.count > 1) {
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(this.nextX, this.nextY);
                        ctx.stroke();
                    }
                }

                else if (this.S.shapeType.v === "circle") {
                    ctx.beginPath();
                    ctx.arc(this.nextX-this.size/2, this.nextY-this.size/2, this.size, 0, pie2);
                    ctx.stroke();
                }
                else if (this.S.shapeType.v === "square") {
                    // ctx.fillStyle = `hsl(${this.hue}, ${this.saturate}%, ${this.light}%)`;

                    ctx.strokeRect(this.nextX-this.size/2, this.nextY-this.size/2, this.size, this.size);
                }

            ctx.restore();
            this.update();
        }
        update() {
            if (this.count < 2) {this.count++;}
            // if (this.first === true) {this.first = false;}
            // if (rotateCanvas) {this.rotation += this.vRot;}
            // this.rotation += this.vRot;

            // color
            if (this.S.colorShift.v) {
                if (this.S.changeHue.v) {
                    this.hue++;
                    if (this.hue > 360) {this.hue -= 360;}
                };
                if (this.S.changeSat.v) {
                    this.saturate += this.vSat;
                    if (this.saturate >= 100 || this.saturate <= 0) {this.vSat *= -1;}
                };
                if (this.S.changeLight.v) {
                    this.light += this.vLight;
                    if (this.light >= 100 || this.light <= 0) {this.vLight *= -1;}
                };
            }

            // size
            if (this.S.shapeType.v !== "line" && this.vSize !== 0) {
                this.size += this.vSize;

                if (!this.S.reverseSize.v && this.size > this.S.maxSize.v) {
                    this.vSize = 0;
                }

                else if (this.S.reverseSize.v && (this.size >= this.S.maxSize.v || this.size < 1)) {
                    this.vSize *= -1;
                }
            }

            // linewidth
            if (this.vLineWidth !== 0) {
                this.lineWidth += this.vLineWidth;

                if (!this.S.reverseLineWidth.v && this.lineWidth > this.S.maxLineWidth.v) {
                    this.vLineWidth = 0;
                }

                else if (this.S.reverseLineWidth.v
                    && (this.lineWidth >= this.S.maxLineWidth.v 
                        || this.lineWidth < 1)) {
                    this.vLineWidth *= -1;
                }
            }

            // change radius
            if (this.S.shiftXY.v) {
                // prevent radii from going negative
                if (this.rad1+this.vRad1 >= 0) {
                    this.rad1 += this.vRad1;} else {
                        this.vRad1 *= -1;
                    }
                if (this.rad2+this.vRad2 >= 0) {
                    this.rad2 += this.vRad2;} else {
                        this.vRad2 *= -1;
                    }

                
                // this.rad1 += this.vRad1;
                // this.rad2 += this.vRad2;

                if (this.S.linesWithinBorders.v) {
                    if (this.rad1 > this.midX 
                        || this.rad1 <= 0) 
                            {this.vRad1 *= -1;}
                    if (this.rad2 > this.midY 
                        || this.rad2 <= 0) 
                            {this.vRad2 *= -1;}
                }

                if (this.vvRad1 > 0) {this.vRad1 += this.vvRad1;}
                if (this.vvRad2 > 0) {this.vRad2 += this.vvRad2;}

                if (this.vRad1 > 5 || this.vRad1 < -5) 
                {this.vvRad1 *= -1}
                if (this.vRad2 > 5 || this.vRad2 < -5) 
                {this.vvRad2 *= -1}
           }

            // finite drawing
            if (this.S.finiteDraw.v && 
                this.angle > (Math.PI*2) * this.S.finiteCount.v + this.firstAngle) {
                console.log("finished", )
                pauseGame();
            }

            // shift opacity
            if (this.S.opacityShift.v) {
                this.opacity -= this.vOpac;
        
                if (this.opacity < this.vOpac) {
                    this.vOpac *= -1;
                }
                else if (this.opacity > 1) {
                    this.vOpac *= -1;
                }
            }

            // draw from the middle
            if (!this.S.drawLinesFromOrigo.v) {
                this.x = this.nextX; this.y = this.nextY; 
            } else {
                this.x = canvas.width/2;
                this.y = canvas.height/2;
            }

            // shift angle
            if (this.S.randomAngleShiftChance.v > 0 &&
                Math.random() < this.S.randomAngleShiftChance.v) {this.vAngle *= -1;
                // this.hue += Math0.floor(Math.random()*19+1);
            }

            this.angle += this.vAngle;
            
            if (this.vvAngle > 0 || this.S.vAngleReversePoint.v > 0) {
                this.vAngle += this.vvAngle;

                if (this.S.vAngleReversePoint.v > 0) {
                    if (this.vAngle < 0.1 || this.vAngle > this.S.vAngleReversePoint.v) {
                        this.vvAngle *= -1;
                    }
                }
            }

            this.nextX = Math.floor(Math.cos(this.angle) * this.rad1 + this.midX);
            this.nextY = Math.floor(Math.sin(this.angle) * this.rad2 + this.midY);
        }
    }

    let newShape = false;

    function animate(timeStamp) {
        let deltaTime = timeStamp-lastTime;
        lastTime = timeStamp;

        if (timer > int) {
            console.log("looping", )
            if (S.clearCanvas.v) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            newShape.draw();
            // 
            timer = 0;
        } else {timer += deltaTime;}

        if (gameOn) {
            looping = requestAnimationFrame(animate);
        }
    }
    function clearAll() {
        gameOn = false;
        cancelAnimationFrame(looping);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function startOver() {
        clearAll();
        gameOn = true;
        newShape = new Shape(S);
        animate(0);
    }
    function pauseGame() {
        if (gameOn) {
            gameOn = false;
            cancelAnimationFrame(looping);
        }
        else if (!gameOn){
            gameOn = true;
            animate(0);
        }
    }



    // UI and buttons
const panelChange = {
    "opened": "closed",
    "closed": "opened",
}
const openBtn = this.document.getElementById("openBtn");
const settingsPanel = this.document.getElementById("cont");

openBtn.addEventListener("click", function() {
    const status = settingsPanel.getAttribute("class");
    settingsPanel.setAttribute("class", panelChange[status]);
    console.log("settingsPanel", settingsPanel)

})

// fps
const fpsStep = 5;
const fpsDisplay = this.document.querySelector("#fps .display");
const fpsMinus = this.document.querySelector("#fps .minus");
const fpsPlus = this.document.querySelector("#fps .plus");

fpsDisplay.innerText = fps;
fpsMinus.addEventListener("click", function() {
    if (fps > 0) {
        fps -= fpsStep;
        int = 1000/fps;
        fpsDisplay.innerText = fps;
    }
})
fpsPlus.addEventListener("click", function() {
    if (fps < 60) {
        fps += fpsStep;
        int = 1000/fps;
        fpsDisplay.innerText = fps;
    }
})

// let clearCanvas = false;
const clearCanvasDisplay = this.document.querySelector("#clearCanvas .display");

clearCanvasDisplay.addEventListener("click", function() {
    S.clearCanvas.v = S.clearCanvas.v ? false : true;
    clearCanvasDisplay.innerText = S.clearCanvas.v;
})

// let rotateCanvas = false;
// const rotateCanvasDisplay = this.document.querySelector("#rotateCanvas .display");

// rotateCanvasDisplay.addEventListener("click", function() {
//     rotateCanvas = rotateCanvas ? false : true;
//     rotateCanvasDisplay.innerText = rotateCanvas;
// })

// let finiteDraw = true;
const finiteDrawDisplay = this.document.querySelector("#finiteDraw .display");

finiteDrawDisplay.addEventListener("click", function() {
    S.finiteDraw.v = S.finiteDraw.v ? false : true;
    finiteDrawDisplay.innerText = S.finiteDraw.v;
})

// let goAroundCount = 10;
const finiteCountStep = 1;
const finiteCountDisplay = this.document.querySelector("#finiteCount .display");
const finiteCountMinus = this.document.querySelector("#finiteCount .minus");
const finiteCountPlus = this.document.querySelector("#finiteCount .plus");

finiteCountMinus.addEventListener("click", function() {
    if (S.finiteCount.v > 1) {
        S.finiteCount.v -= finiteCountStep;
        finiteCountDisplay.innerText = S.finiteCount.v;
    }
})
finiteCountPlus.addEventListener("click", function() {
    if (S.finiteCount.v < 20) {
        S.finiteCount.v += finiteCountStep;
        finiteCountDisplay.innerText = S.finiteCount.v;
    }
})

// let colorShift = true;
const colorShiftDisplay = this.document.querySelector("#colorShift .display");

colorShiftDisplay.addEventListener("click", function() {
    S.colorShift.v = S.colorShift.v ? false : true;
    colorShiftDisplay.innerText = S.colorShift.v;
})

// let startHue = 220;
const startHueDisplay = this.document.querySelector("#startHue .display");
const startHueDisplayColor = this.document.querySelector("#startHue .displaycolor");
const startHueInput = this.document.querySelector("#startHue input");

startHueInput.addEventListener("input", function(e) {
    S.startHue.v = Number(e.target.value);
    startHueDisplay.innerText = S.startHue.v;
    displayColor();
})

const startHueCheckbox = this.document.querySelector("#startHue .checkbox");
const startHueTitle = this.document.querySelector("#startHue .title");
startHueCheckbox.addEventListener("click", setCheckbox);
startHueTitle.addEventListener("click", setCheckbox);
startHueDisplay.addEventListener("click", setCheckbox);

// let startSaturate = 90;
const startSaturateDisplay = this.document.querySelector("#startSaturate .display");
const startSaturateInput = this.document.querySelector("#startSaturate input");

startSaturateInput.addEventListener("input", function(e) {
    S.startSaturate.v = Number(e.target.value);
    startSaturateDisplay.innerText = `${S.startSaturate.v}%`;
    displayColor();
})

const startSaturationCheckbox = this.document.querySelector("#startSaturate .checkbox");
const startSaturationTitle = this.document.querySelector("#startSaturate .title");
startSaturationCheckbox.addEventListener("click", setCheckbox);
startSaturateDisplay.addEventListener("click", setCheckbox);
startSaturationTitle.addEventListener("click", setCheckbox);


// let startLight = 60;
const startLightDisplay = this.document.querySelector("#startLight .display");
const startLightInput = this.document.querySelector("#startLight input");

startLightInput.addEventListener("input", function(e) {
    S.startLight.v = Number(e.target.value);
    startLightDisplay.innerText = `${S.startLight.v}%`;
    displayColor();
})

const startLightCheckbox = this.document.querySelector("#startLight .checkbox");
const startLightTitle = this.document.querySelector("#startLight .title");
startLightCheckbox.addEventListener("click", setCheckbox);
startLightTitle.addEventListener("click", setCheckbox);
startLightDisplay.addEventListener("click", setCheckbox);

// let shapeType;
const shapesTypeChange = ["line", "circle", "square", "line"];
const shapeTypeDisplay = this.document.querySelector("#shapeType .display");

shapeTypeDisplay.addEventListener("click", function() {
    const i = shapesTypeChange.indexOf(S.shapeType.v);
    S.shapeType.v = shapesTypeChange[i+1];
    shapeTypeDisplay.innerText = S.shapeType.v;
})

// let drawLinesFromOrigo = false;
const drawLinesFromOrigoDisplay = this.document.querySelector("#drawLinesFromOrigo .display");

drawLinesFromOrigoDisplay.addEventListener("click", function() {
    S.drawLinesFromOrigo.v = !S.drawLinesFromOrigo.v;
    drawLinesFromOrigoDisplay.innerText = S.drawLinesFromOrigo.v;
})

// shapeSize
const shapeSizeDisplay = this.document.querySelector("#shapeSize .display");
const shapeSizeInput = this.document.querySelector("#shapeSize input");

shapeSizeInput.addEventListener("input", function(e) {
    S.shapeSize.v = Number(e.target.value);
    shapeSizeDisplay.innerText = S.shapeSize.v;
})



// increase shapeSize
const vSizeDisplay = this.document.querySelector("#vSize .display");
const vSizeInput = this.document.querySelector("#vSize input");

vSizeInput.addEventListener("input", function(e) {
    S.vSize.v = Number(e.target.value);
    vSizeDisplay.innerText = S.vSize.v;
})

// maxSize
const maxSizeDisplay = this.document.querySelector("#maxSize .display");
const maxSizeInput = this.document.querySelector("#maxSize input");

maxSizeInput.addEventListener("input", function(e) {
    S.maxSize.v = Number(e.target.value);
    maxSizeDisplay.innerText = S.maxSize.v;
})

// let reverseLineWidthDisplay = false;
const reverseSizeDisplay = this.document.querySelector("#reverseSize .display");

reverseSizeDisplay.addEventListener("click", function() {
    S.reverseSize.v = S.reverseSize.v ? false : true;
    reverseSizeDisplay.innerText = S.reverseSize.v;
})


// let startRadius1 = 2;
const radius1Display = this.document.querySelector("#radius1 .display");
const radius1Input = this.document.querySelector("#radius1 input");

radius1Input.addEventListener("input", function(e) {
    S.radius1.v = Number(e.target.value);
    radius1Display.innerText = S.radius1.v;
})

// let startRadius2 = 2;
const radius2Display = this.document.querySelector("#radius2 .display");
const radius2Input = this.document.querySelector("#radius2 input");

radius2Input.addEventListener("input", function(e) {
    S.radius2.v = Number(e.target.value);
    radius2Display.innerText = S.radius2.v;
})

// let shiftXY = true;
const shiftXYDisplay = this.document.querySelector("#shiftXY .display");

shiftXYDisplay.addEventListener("click", function() {
    S.shiftXY.v = S.shiftXY.v ? false : true;
    shiftXYDisplay.innerText = S.shiftXY.v;
})

// linesWithinBorders
const linesWithinBordersDisplay = this.document.querySelector("#linesWithinBorders .display");

linesWithinBordersDisplay.addEventListener("click", function() {
    S.linesWithinBorders.v = !S.linesWithinBorders.v;
    linesWithinBordersDisplay.innerText = S.linesWithinBorders.v;
})

// let vRad1 = 1;
const vRadius1Display = this.document.querySelector("#vRadius1 .display");
const vRadius1Input = this.document.querySelector("#vRadius1 input");

vRadius1Input.addEventListener("input", function(e) {
    S.vRadius1.v = Number(e.target.value);
    vRadius1Display.innerText = S.vRadius1.v;
})

// let vRad2 = -1;
const vRadius2Display = this.document.querySelector("#vRadius2 .display");
const vRadius2Input = this.document.querySelector("#vRadius2 input");

vRadius2Input.addEventListener("input", function(e) {
    S.vRadius2.v = Number(e.target.value);
    vRadius2Display.innerText = S.vRadius2.v;
})

// let vvRad1 = 0.1;
const vvRadius1Display = this.document.querySelector("#vvRadius1 .display");
const vvRadius1Input = this.document.querySelector("#vvRadius1 input");

vvRadius1Input.addEventListener("input", function(e) {
    S.vvRadius1.v = Number(e.target.value);
    vvRadius1Display.innerText = S.vvRadius1.v;
})

// let vvRad2 = 0.1;
const vvRadius2Display = this.document.querySelector("#vvRadius2 .display");
const vvRadius2Input = this.document.querySelector("#vvRadius2 input");

vvRadius2Input.addEventListener("input", function(e) {
    S.vvRadius2.v = Number(e.target.value);
    vvRadius2Display.innerText = S.vvRadius2.v;
})

// let vAngle = 0.1;  
const vAngleDisplay = this.document.querySelector("#vAngle .display");
const vAngleInput = this.document.querySelector("#vAngle input");

vAngleInput.addEventListener("input", function(e) {
    S.vAngle.v = Number(e.target.value);
    vAngleDisplay.innerText = S.vAngle.v;
})

// vAngleReversePoint = 0; 
const vAngleReverseDisplay = this.document.querySelector("#vAngleReversePoint .display");
const vAngleReverseInput = this.document.querySelector("#vAngleReversePoint input");

vAngleReverseInput.addEventListener("input", function(e) {
    S.vAngleReversePoint.v = Number(e.target.value);
    vAngleReverseDisplay.innerText = S.vAngleReversePoint.v;
})

// let vvAngle = 0;  
const vvAngleDisplay = this.document.querySelector("#vvAngle .display");
const vvAngleInput = this.document.querySelector("#vvAngle input");

vvAngleInput.addEventListener("input", function(e) {
    S.vvAngle.v = Number(e.target.value);
    vvAngleDisplay.innerText = S.vvAngle.v;
})

// let randomAngleShiftChance = 0.05;
const randomAngleShiftChanceDisplay = this.document.querySelector("#randomAngleShiftChance .display");
const randomAngleShiftChanceInput = this.document.querySelector("#randomAngleShiftChance input");

randomAngleShiftChanceInput.addEventListener("input", function(e) {
    S.randomAngleShiftChance.v = (Number(e.target.value))/100;
    randomAngleShiftChanceDisplay.innerText = S.randomAngleShiftChance.v;
})

// let lineWidth = 2;
const lineWidthDisplay = this.document.querySelector("#lineWidth .display");
const lineWidthInput = this.document.querySelector("#lineWidth input");

lineWidthInput.addEventListener("input", function(e) {
    S.lineWidth.v = Number(e.target.value);
    lineWidthDisplay.innerText = S.lineWidth.v;
    // ctx.lineWidth = lineWidth;
    
})

// increase lineWidth
const vLineWidthDisplay = this.document.querySelector("#vLineWidth .display");
const vLineWidthInput = this.document.querySelector("#vLineWidth input");

vLineWidthInput.addEventListener("input", function(e) {
    S.vLineWidth.v = Number(e.target.value);
    vLineWidthDisplay.innerText = S.vLineWidth.v;
})

// maxLineWidth
const maxLineWidthDisplay = this.document.querySelector("#maxLineWidth .display");
const maxLineWidthInput = this.document.querySelector("#maxLineWidth input");

maxLineWidthInput.addEventListener("input", function(e) {
    S.maxLineWidth.v = Number(e.target.value);
    maxLineWidthDisplay.innerText = S.maxLineWidth.v;
})

// let reverseLineWidthDisplay = false;
const reverseLineWidthDisplay = this.document.querySelector("#reverseLineWidth .display");

reverseLineWidthDisplay.addEventListener("click", function() {
    S.reverseLineWidth.v = !S.reverseLineWidth.v;
    reverseLineWidthDisplay.innerText = S.reverseLineWidth.v;
})

// let opacityShift = false;
const opacityShiftDisplay = this.document.querySelector("#opacityShift .display");

opacityShiftDisplay.addEventListener("click", function() {
    S.opacityShift.v = !S.opacityShift.v;
    opacityShiftDisplay.innerText = S.opacityShift.v;
})


// initialise all settings
function initSettings() {
    S.list.forEach(set => {
        // console.log("set", set)
        setDisplayAndInput(set.t);
    })

    displayColor();
}

// reset all
const resetBtn = this.document.getElementById("resetBtn");
resetBtn.addEventListener("click", resetSettings);
function resetSettings() {
    S.list.forEach(set => {
        set.v = set.reset();
    })
    initSettings();
}

// doubleclick to reset
const displays = this.document.querySelectorAll(".display");
displays.forEach(display => {
    display.addEventListener("dblclick", function() {
        const id = display.parentElement.id;
        
        if (S.hasOwnProperty(id)) {
            S[id].v = S[id].reset();
            setDisplayAndInput(id);
        }
    })
})

// randomise all
const randomiseBtn = this.document.getElementById("randomiseBtn");
randomiseBtn.addEventListener("click", randomiseParameters);
function randomiseParameters() {
    S.list.forEach(set => {
        if (set.rndCheck) {
            set.v = set.rndVal();
            // console.log("set.v", set.v)
        }
    })

    initSettings();
    startOver();
}

// randomise each
const rndIcons = {
    true: "&#9883;",
    false: "&#9744;"
}
const rndButtons = this.document.querySelectorAll("#rndbox");
rndButtons.forEach(btn => btn.addEventListener("mousedown", function(e) {
        // console.log("", e.target.parentElement.id)
        const tagID = e.target.parentElement.id;

        // switch randomising
        if (e.which === 3) {
            S[tagID].rndCheck = !S[tagID].rndCheck;
            e.target.innerHTML = rndIcons[S[tagID].rndCheck];
        }
        // randomise
        else if (e.which === 1) {
            S[tagID].v = S[tagID].rndVal();
            setDisplayAndInput(tagID);
        }
}))

function setDisplayAndInput(id) {
    const display = document.querySelector(`#${id} .display`);
    if (display !== null) {
        display.innerText = S[id].v;
    }

    const input = document.querySelector(`#${id} input`);
    if (input !== null) {
        input.setAttribute("value", S[id].v);
    }

    if (id === "startHue" ||
        id === "startSaturate" ||
        id === "startLight") {
        displayColor();
        }
    if (id === "changeHue" ||
        id === "changeSat" ||
        id === "changeLight") {
        setChangeColorCheckbox(id);
        }
}


function displayColor() {
    const startHueDisplayColor = this.document.querySelector("#startHue .displaycolor");
    startHueDisplayColor.style.backgroundColor = `hsl(${S.startHue.v}, ${S.startSaturate.v}%, ${S.startLight.v}%)`;
}

function setCheckbox(e) {
    console.log("e", e)
    const id = e.target.parentElement.querySelector(".checkbox").id;
    console.log("id", id)

    S[id].v = !S[id].v;
    const checkbox = document.querySelector(`#${id}`);
    checkbox.innerHTML = checkboxChange[S[id].v];


    setColorShift();
}

function setChangeColorCheckbox(id) {
    console.log("id", id)
    S[id].v = !S[id].v;
    const checkbox = document.querySelector(`#${id}`);
    checkbox.innerHTML = checkboxChange[S[id].v];

    setColorShift();
}

function setColorShift() {
    const colorShiftDisplay = this.document.querySelector("#colorShift .display");
    
    if (S.changeHue.v || S.changeSat.v || S.changeLight.v) {
        S.colorShift.v = true;
    }
    else if (!S.changeHue.v || !S.changeSat.v || !S.changeLight.v) {
        S.colorShift.v = false;
    }
    colorShiftDisplay.innerText = S.colorShift.v;
}

function randomise(floor, max, min, toFixed) {
    if (floor === true) {
        return Math.floor(Math.random() * max + min);
    } else if (floor === false) {
        return Number((Math.random() * max + min).toFixed(toFixed));
    }
}
function rndTrueFalse(threshold) {
    return Math.random() < threshold ? true : false;
}

function setInputValue(element, value) {
    element.setAttribute("value", value);
    // console.log("element",)
    // console.log("element", element, value)
}




})