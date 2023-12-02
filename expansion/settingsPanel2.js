import { S as SETTINGS } from "./exp.js"

// slider example:
// S["var"] = new Setting("var", startValue);
// S.var.slider(min, max, step, separator[T/F]);

// selector example:
// S["var"] = new Setting("var", startValue);
// S.var.selector(optionsArray, separator[T/F]);

const body = document.querySelector("body");
const canvas1 = document.querySelector("canvas");
const ctx1 = canvas1.getContext("2d");

const checkboxChange = {true: "&#9745;", false: "&#9744;"}
const rndIcons = {true: "&#9883;", false: "&#9744;"};
const panelChange = {
    "opened": "closed",
    "closed": "opened",
}

let clickedTab = 0;

let panelSize = 260;
let settingsPanelVar;
let tabContainerPanel;
let tabContainerMenu1;
let tabContainerMenu2;
let saveBtnMenu1;
let saveBtnMenu2;

let mainPanel;
export function createMainPanel() {
  setDimensions();
    mainPanel = createDOMElement("div", {
        "id": "settingsPanel",
        "class": "opened"
    })
    body.appendChild(mainPanel);

    const resetBtn = createDOMElement("div", {
      "id": "resetBtn",
      "title": "Reset"
    })
    resetBtn.innerHTML = "&#9851;";
    mainPanel.appendChild(resetBtn);
    
    const randomiseBtn = createDOMElement("div", {
      "id": "randomiseBtn",
      "value": "all-off",
      "title": "Randomise"
    })
    randomiseBtn.innerHTML = "&#9883;";
    mainPanel.appendChild(randomiseBtn);

    const btnContainer = createDOMElement("div", {
      "id": "btnContainer"
    })
    mainPanel.appendChild(btnContainer);


    // tab with arrows to open and close the panel
    const openBtn = createDOMElement("div", {
        "id": "openBtn",
        "class": "btn tab"
    })
    openBtn.innerHTML = "&#10096; &#10097;";
    btnContainer.appendChild(openBtn);

    // tab to take screenshot of the canvas
    const screenshotBtn = createDOMElement("div", {
        "id": "screenshot",
        "class": "btn tab",
        "title": "Screenshot. Requires fingerprinting enabled."
    })
    btnContainer.appendChild(screenshotBtn);

    const scrShotSpan = createDOMElement("span");
    scrShotSpan.innerHTML = "&#10048;";
    screenshotBtn.appendChild(scrShotSpan);

    // tab to save templates
    const saveBtn = createDOMElement("div", {
      "id": "saveBtn",
      "class": "btn tab",
      "value": "closed",
      "title": "Left-click: Save / Right-click: Menu"
    })

    saveBtn.innerHTML = "&#9825;";
    btnContainer.appendChild(saveBtn);

    const saveBtnMenu1Save = createDOMElement("div", {
      "id": "tabMenuDownload",
      "class": "saveBtn tab",
      "title": "Download all"
    })
    const saveBtnMenu1span = createDOMElement("span");
    saveBtnMenu1span.innerHTML = "&#10151;";
    saveBtnMenu1Save.appendChild(saveBtnMenu1span);
    
    const saveBtnMenu2Delete = createDOMElement("div", {
      "id": "tabMenuDelete",
      "class": "saveBtn tab",
      "title": "Delete all"
    })
    saveBtnMenu2Delete.innerHTML = "&#10008;";

    saveBtn.appendChild(saveBtnMenu1Save);
    saveBtn.appendChild(saveBtnMenu2Delete);

   
    // tab to import templates
    const importBtn = createDOMElement("div", {
      "id": "importBtn",
      "class": "btn tab",
      "title": "Import. Select file first."
    })
    const importSpan = createDOMElement("span");
    importSpan.innerHTML = "&#10151;";
    importBtn.appendChild(importSpan);
    btnContainer.appendChild(importBtn);

    const inputBtn = createDOMElement("div", {
      "id": "inputBtn",
      "class": "btn tab",
      "title": "Select saved template"
    })
    const inputSpan = createDOMElement("input", {
      "type": "file",
      "accept": ".json",
      "title": "Select a saved template"
    })
    inputBtn.appendChild(inputSpan);
    btnContainer.appendChild(inputBtn);


    // container for template tabs on the left of screen
    const tabContainer = createDOMElement("div", {
      "id": "tabContainer",
    });
    body.appendChild(tabContainer);

    const tabMenu1 = createDOMElement("div", {
      "id": "tabMenuDownload",
      "class": "tabContainer tab"
    })
    const menu1span = createDOMElement("span");
    menu1span.innerHTML = "&#10151;";
    tabMenu1.appendChild(menu1span);
    
    const tabMenu2 = createDOMElement("div", {
      "id": "tabMenuDelete",
      "class": "tabContainer tab"
    })
    tabMenu2.innerHTML = "&#10008;";

    tabContainer.appendChild(tabMenu1);
    tabContainer.appendChild(tabMenu2);

    // css rules
    addCSSRules();

    // eventlisteners
    openBtn.addEventListener("click", openClosePanel);
    function openClosePanel() {
        let status = mainPanel.getAttribute("class");
        mainPanel.setAttribute("class", panelChange[status]);
    }

    resetBtn.addEventListener("click", function(){
        for (let key in SETTINGS) {
          resetSetting(key);
        }
    })
    randomiseBtn.addEventListener("mousedown", function(e) {
      switch(e.which) {
        case 1:
          for (let key in SETTINGS) {randomiseSetting(key);}
          break;

        case 3:
          const state = e.target.getAttribute("value");
          if (state === "all-off") {
            e.target.setAttribute("value", "all-on")
            for (let key in SETTINGS) {setRndSetting(key);}
          }
          else {
            e.target.setAttribute("value", "all-off")
            for (let key in SETTINGS) {clearRndSetting(key);}
            break;
          }
      }
    })

    screenshotBtn.addEventListener("click", function() {
      closeContainerTabMenu();
      closeSaveBtnMenu();
      takeScreenshot(settingsPanelVar);
    })

    saveBtn.addEventListener("mousedown", function(e) {
      if (clickedTab > 0) {closeContainerTabMenu()}
      switch (e.which) {
          case 1:
              if (e.target.id === "saveBtn") {
                tryTemplateSave(saveBtn);
              }
              break;
          case 3:
              const state = e.target.getAttribute("value");
              switchMenuButtons(state, e.target);
              break;
      }
    });

    saveBtnMenu1Save.addEventListener("click", function() {
      if (clickedTab > 0) {closeContainerTabMenu()}
      if (Object.keys(templates).length > 0) {
        downloadJSON();
      }
    })

    saveBtnMenu2Delete.addEventListener("click", function() {
      const temps = Object.keys(templates);
      if (temps.length > 0) {
          temps.forEach(temp => {
              deleteTemplate(temp);
          })
      }
      closeContainerTabMenu();
    })

    importBtn.onclick = function() {
      if (clickedTab > 0) {
        closeContainerTabMenu();
        closeSaveBtnMenu();
      }
      uploadJSON();
    }

    tabMenu1.addEventListener("click", function() {
      downloadTemplate(clickedTab);
    })
    tabMenu2.addEventListener("click", function() {
      const num = clickedTab;
      closeContainerTabMenu();
      deleteTemplate(num);
    })

    settingsPanelVar = document.getElementById("settingsPanel");

    saveBtnMenu1 = document.querySelector("#tabMenuDownload.saveBtn");
    saveBtnMenu2 = document.querySelector("#tabMenuDelete.saveBtn");

    tabContainerPanel = document.getElementById("tabContainer");
    tabContainerMenu1 = document.querySelector("#tabMenuDownload.tabContainer");
    tabContainerMenu2 = document.querySelector("#tabMenuDelete.tabContainer");

    canvas1.addEventListener("click", function() {
      closeContainerTabMenu();
      closeSaveBtnMenu();
    })

    rndSlider()
    setPanelSize()
}

window.addEventListener("keydown", function(e) {
  switch(e.key) {
      case "r":
          // randomise
          for (let key in SETTINGS) {randomiseSetting(key);}
          break;
  }
})


// css rules
function addCSSRules() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssrules);
    document.adoptedStyleSheets = [sheet];
}


export function createSlider(variable, title, min, max, step, divider) {
    const mainPanel = document.getElementById("settingsPanel");

    const container = createDOMElement("div", {
        id: title,
        class: "setting slider"
    })
    if (divider) {container.classList.add("break")}
    mainPanel.appendChild(container);

    const titleDiv = createDOMElement("div", {
        class: `title ${title}`
    })
    titleDiv.innerText = `${title}:`;
    container.appendChild(titleDiv);

    const displayDiv = createDOMElement("div", {
        class: "display"
    })
    displayDiv.innerText = variable;
    container.appendChild(displayDiv);
    
    const input = createDOMElement("input", {
        type: "range",
        min: min,
        max: max,
        step: step,
        value: variable,
    })
    container.appendChild(input);

    const rndBox = createDOMElement("div", {
      "id": "rndbox"
    })
    rndBox.innerHTML = rndIcons["false"];
    container.appendChild(rndBox);

    // moving the slider changes value
    input.addEventListener("input", function(e) {
        const id = e.target.parentElement.id;
        const newVal = Number(e.target.value);
        displayDiv.innerText = newVal;
        SETTINGS[id].set(newVal);
        setPanelSize();
      })
    
      // turn on/off randomising
    rndBox.addEventListener("mousedown", function(e) {
      const type = e.target.parentElement.id;
      switch(e.which) {
        case 1:
          randomiseSetting(type);
          break;
        
        case 3:
          switchRndBox(type);
          break;
      }
      })

      // right-click on setting name resets value
    titleDiv.addEventListener("mousedown", function(e) {
      switch(e.which) {
        case 3:
          const id = e.target.parentElement.id;
          resetSetting(id);
      }
    })
    countSettings();
}

let rndAmount = 5;
function rndSlider() {
  const mainPanel = document.getElementById("settingsPanel");

  const container = createDOMElement("div", {
      id: "rndSlider",
      class: "setting slider",
      title: "Number of options to randomise",
  })

  mainPanel.appendChild(container);

  const titleDiv = createDOMElement("div", {
      class: `title rndSlider`,
  })
  titleDiv.innerHTML = "&#9883;";
  container.appendChild(titleDiv);

  const displayDiv = createDOMElement("div", {
      class: "display"
  })
  displayDiv.innerText = rndAmount;
  container.appendChild(displayDiv);
  
  const input = createDOMElement("input", {
      type: "range",
      min: 0,
      max: rndAmount,
      step: 1,
      value: rndAmount,
  })
  container.appendChild(input);

  const rndBox = createDOMElement("div", {
    "id": "rndbox"
  })
  rndBox.innerHTML = "&#9883;";
  container.appendChild(rndBox);

  // moving the slider changes value
  input.addEventListener("input", function(e) {
      const newVal = Number(e.target.value);
      displayDiv.innerText = newVal;
      rndAmount = newVal;
      setPanelSize();
    })
  
    // randomise
  rndBox.addEventListener("mousedown", function(e) {
    switch(e.which) {
      case 1:
        const max = Number(input.getAttribute("max"));
        rndAmount = Math.floor(Math.random() * max);
        setRndSlider(rndAmount);
        break;
      
    }
    })

    // right-click on setting name resets value
    // left-click on setting name turns on rndBox on randomly selected settings
    displayDiv.addEventListener("mousedown", function(e) {
      switch(e.which) {
      case 1:
        rndSelectSettings();
        break;
      case 3:
        if (rndAmount !== 5) {
          rndAmount = 5;
          setRndSlider(rndAmount);
        }
        break;
    }
  })
  titleDiv.addEventListener("mousedown", function(e) {
    switch(e.which) {
      case 1:
        rndSelectSettings();
        break;
      case 3:
        if (rndAmount !== 5) {
          rndAmount = 5;
          setRndSlider(rndAmount);
        }
        break;
    }
  })
}

function setRndSlider(value) {
  const input = document.querySelector("#settingsPanel #rndSlider input");
  const display = document.querySelector("#settingsPanel #rndSlider .display");

  input.value = value;
  display.innerText = value;
}

function countSettings() {
  const count = document.querySelectorAll("#settingsPanel .setting").length;
  const input = document.querySelector("#settingsPanel #rndSlider input");
  input.setAttribute("max", count);
}

function rndSelectSettings() {
  const all = Object.keys(SETTINGS);
  const chosen = [];
  while (chosen.length < rndAmount) {
    const i = Math.floor(Math.random() * all.length);
    chosen.push(all[i]);
    all.splice(i, 1);
  }

  all.forEach(type => {
    clearRndSetting(type);
  })
  chosen.forEach(type => {
    setRndSetting(type);
  })

}

// this holds the options for selector type variables
const selectors = {}
export function createSelector(variable, title, options, divider) {
    const mainPanel = document.getElementById("settingsPanel");

    const container = createDOMElement("div", {
        id: title,
        class: "setting selector"
    })
    if (divider) {container.classList.add("break")}
    mainPanel.appendChild(container);

    const titleDiv = createDOMElement("div", {
        class: title
    })
    titleDiv.innerText = `${title}:`;
    container.appendChild(titleDiv);

    const displayDiv = createDOMElement("div", {
        class: "display",
        value: variable
    })
    container.appendChild(displayDiv);

    if (variable === true || variable === false) {
      displayDiv.innerHTML = checkboxChange[variable];
    } else {displayDiv.innerText = variable;}

    selectors[title] = [...options];

    const rndBox = createDOMElement("div", {
      "id": "rndbox"
    })
    rndBox.innerHTML = rndIcons["false"];
    container.appendChild(rndBox);

    // eventlistener
    titleDiv.addEventListener("mousedown", function(e) {
      const id = e.target.parentElement.id;
      switch(e.which) {
        case 1:
          const displayDiv = e.target.nextSibling;
          switchOption(id, displayDiv);
          break;
        case 3:
          resetSetting(id);
          break;
        }
        
      })

    displayDiv.addEventListener("click", function(e) {
      const id = e.target.parentElement.id;
      switchOption(id, e.target);
    })

    // turn on/off randomising
    rndBox.addEventListener("mousedown", function(e) {
      const type = e.target.parentElement.id;
      switch(e.which) {
        case 1:
          randomiseSetting(type);
          break;
        
        case 3:
          switchRndBox(type);
          break;
      }
    })
    
    function switchOption(id, displayDiv) {
      let value = displayDiv.getAttribute("value");
      
      if (value === "true") {value = true;}
      else if (value === "false") {value = false;}
      else if (value === "null") {value = null;}
      else if (value === "undefined") {value = undefined;}
      else if (!isNaN(Number(value))) {value = Number(value)}
      
      const newValue = nextArrayItem(value, selectors[id]);
      
      displayDiv.setAttribute("value", newValue);

      if (newValue === true || newValue === false) {
        displayDiv.innerHTML = checkboxChange[newValue];
      } else {displayDiv.innerText = newValue;}

      SETTINGS[id].set(newValue);

      // console.log("switch", id, value, selectors[id])

      setPanelSize();

    }

    countSettings();
}

function createDOMElement(type, attributes) {
  const el = document.createElement(type);
  if (attributes !== undefined) {
      for (let key in attributes) {
          el.setAttribute(key, attributes[key]);
      }
  }

  return el;
}

function nextArrayItem(currentitem, arr) {
  const i = arr.indexOf(currentitem);
 
  return i === arr.length-1 ? arr[0] : arr[i+1];
}

const cssrules = `
  #settingsPanel {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0px;
    min-width: ${panelSize}px;
    
    height: auto;
    padding: 10px 10px 10px 10px;
    border: 1px solid #aaa;
    border-radius: 5px;
    background: transparent;
    font-family: "Segoe UI";
    color: #aaa;
    opacity: 0.1;
    z-index: 10;
  }

    #settingsPanel.hide {display: none !important;}

    #settingsPanel:hover {
      background: #111;
      opacity: 1;
    }
    #settingsPanel.closed {
      transform: translate(100%, 0);
    }
    #settingsPanel.opened {
      transform: translate(0, 0);
    }

    #settingsPanel #btnContainer {
      display: flex;
      flex-direction: row;
      height: 15px;

    }
  #settingsPanel .tab {
    position: relative;
    display: block;
    right: 0px;
    width: 45px;
    height: 30px;
    padding-left: 5px;
    font-size: 20px;
    text-align: center;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    border: 1px solid #aaa;
  }
    #settingsPanel:hover .tab {
      background: #111;
      opacity: 1;
    }
    #settingsPanel .tab:hover {color: cadetblue;}
    #settingsPanel .tab:active {color: royalblue;}

  #settingsPanel #openBtn {
    right: 56px;
    top: -11px;
    border-top-right-radius: 5px;
    border: 1px solid red;
  }

  #settingsPanel #screenshot {
    right: 101px;
    top: 18px;
  }
    #settingsPanel #screenshot span {
      position: relative;
      top: -5px;
      padding: 0;
      display: block;
      font-size: 25px;
      text-align: center;
    }

  #settingsPanel #saveBtn {
    right: 146px;
    top: 47px;
    font-size: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
    #settingsPanel #saveBtn.full:active {
      color: red;
    }
    #saveBtn #tabMenuDownload, #saveBtn #tabMenuDelete {
      position: absolute;
      top: 0px;
      left: 0px;
      visibility: hidden;
    }
      #saveBtn #tabMenuDelete:hover {color: red;}

    #saveBtn[value=opened] #tabMenuDownload, #saveBtn[value=opened] #tabMenuDelete {
      visibility: visible;
    }
    #saveBtn #tabMenuDownload span {
      display: block;
      top: -2px;
      font-size: 25px;
      rotate: 90deg;
    }
  
  #settingsPanel #importBtn {
    right: 191px;
    top: 75px;
    font-size: 30px;
  }
    #settingsPanel #importBtn span {
      position: relative;
      top: -2px;
      left: -2px;
      padding: 0;
      display: block;
      font-size: 25px;
      text-align: center;
      rotate: -90deg;
    }
    
  #settingsPanel #inputBtn {
    right: 236px;
    top: 104px;
    font-size: 30px;
  }
    #settingsPanel #inputBtn input {
      position: relative;
      top: -12px;
      left: -4px;
      width: 40px;
      height: 30px;
    }

  #settingsPanel #resetBtn {
    position: absolute;
    top: 0px;
    right: 42px;
    font-size: 25px;
  }
    #settingsPanel #resetBtn:hover {
      color: cadetblue;
    }
    #settingsPanel #resetBtn:active {
      color: royalblue;
    }

  #settingsPanel #randomiseBtn {
    position: absolute;
    top: -2px;
    right: 10px;
    font-size: 30px;
  }
    #settingsPanel #randomiseBtn:hover {
      color: cadetblue;
    }
    #settingsPanel #randomiseBtn:active {
      color: royalblue;
    }

  #settingsPanel .setting {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 5px;
    padding-right: 20px;
    width: auto;
  }
    #settingsPanel .setting.break {
      border-top: 1px #aaa solid;
      margin-top: 10px;
    }
        #settingsPanel .setting:hover {
          color: white;
        }
    #settingsPanel .setting .title {
      width: auto;
      text-align: left;
    }
    #settingsPanel .setting .display {
      min-width: 20px;
      margin-right: auto;
      text-align: left;
      font-weight: bold;
    }
      #settingsPanel .setting .display:hover {color: cadetblue;}
      #settingsPanel .setting .display:active {color: royalblue;}

    #settingsPanel .checkbox:hover {color: cadetblue;}
    #settingsPanel .checkbox:active {color: royalblue;}


  #settingsPanel .setting input {
    width: 110px;
    margin-right: 5px;
  } 

  #settingsPanel .setting #rndbox {
    position: absolute;
    right: 15px;
  }

  #settingsPanel #rndSlider {
    position: absolute;
  }
  #settingsPanel #rndSlider input{
    width: 110px;
    margin-right: 15px;
  }
  #settingsPanel #rndSlider #rndbox {
    position: absolute;
    right: 15px;
  }

  #tabContainer {
    position: fixed;
    top: 0px;
    left: 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    max-height: 100%;
    background: transparent;
    font-family: "Segoe UI";
    color: #aaa;
  }
  #tabContainer.hide {display: none !important;}

  #tabContainer .templateTab {
    position: relative;
    width: 45px;
    left: 0px;
    top: 0px;
    height: 30px;
    padding-left: 5px;
    font-size: 16px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #aaa;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    opacity: 0.1;
  }
    #tabContainer:hover .templateTab:hover {
      opacity: 1;
    }
    #tabContainer .templateTab:hover {
      background: #111;
      color: cadetblue;
      opacity: 1;
    }
    #tabContainer .templateTab:active {
      color: royalblue;
    }
    #tabContainer .templateTab.highlight {
      opacity: 1;
    }
  
  


  #tabMenuDownload, #tabMenuDelete {
      position: absolute;
      height: 30px;
      width: 45px;
      padding-left: 5px;
      color: #aaa;
      font-size: 26px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #aaa;
      border-radius: 5px;
      z-index: 5;
  }
  #tabContainer #tabMenuDownload, #tabContainer #tabMenuDelete {
    left: -45px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    visibility: hidden;
  }
  #tabContainer #tabMenuDelete {
    font-size: 20px;
  }
  #tabContainer.opened #tabMenuDownload, #tabContainer.opened #tabMenuDelete {
    visibility: visible;
  }

  #tabMenuDownload span {
      position: relative;
      display: block;
      top: 1px;
      rotate: 90deg;
  }

  #tabMenuDownload:hover {color: cadetblue;}
  #tabMenuDelete:hover {color: magenta;}

  `

// take screenshot
function takeScreenshot(settingsPanel) {
  const canvas = document.querySelector("#canvas1");
  const anchor = document.createElement("a");
  const capture = async () => {
      try {
          anchor.setAttribute("target", "_blank");
          document.body.appendChild(anchor);

          settingsPanel.classList.add("hide");
          tabContainerPanel.classList.add("hide");
          canvas.style.cursor = "none";

          const video = document.createElement("video");
          const captureStream = await navigator.mediaDevices.getDisplayMedia({preferCurrentTab: true});
          
          video.srcObject = captureStream;
          console.log("captureStream", captureStream)

          video.addEventListener("loadedmetadata", function() {
            const canvas2 = document.createElement("canvas");
            const ctx2 = canvas2.getContext("2d");

            canvas2.width = window.innerWidth;
            canvas2.height = window.innerHeight;

            const y = window.outerHeight - window.innerHeight;

            video.play();

            ctx2.drawImage(video, 
                0, y, canvas.width, canvas.height,
                0, 0, canvas.width, canvas.height);

            captureStream.getVideoTracks()[0].stop();
            const data = canvas2.toDataURL();

            // window.location.href = data;
            anchor.href = data;
            anchor.click();

            anchor.remove();
            settingsPanel.classList.remove("hide");
            tabContainerPanel.classList.remove("hide");
            canvas.style.cursor = "initial";
            // scrshotImg.src = data;
        })

      } catch (err) {
        console.error("Error: " + err);
        settingsPanel.classList.remove("hide");
        tabContainerPanel.classList.remove("hide");
        canvas.style.cursor = "initial";
      //   anchor.remove();
      }
    };
    
  capture();
}


// templates

let tabCount = 0;
const tabStartY = 0;
const tabStartX = 0;
const tabYIncrease = 30;
const tabXIncrease = 45;
let tabMaxY = canvas1.height;
let tabMaxX = Math.floor(canvas1.width/2);
let maxTabRow = Math.floor(tabMaxY/tabYIncrease);
let maxTabCol = Math.floor(tabMaxX/tabXIncrease);
let maxTabs = maxTabRow*maxTabCol;

function setDimensions() {
  const canvas1 = document.querySelector("canvas");
  tabMaxY = canvas1.height;
  tabMaxX = Math.floor(canvas1.width/3);
  maxTabRow = Math.floor(tabMaxY/tabYIncrease);
  maxTabCol = Math.floor(tabMaxX/tabXIncrease);
  maxTabs = maxTabRow*maxTabCol;
}

const templates = {};
class Template {
    constructor(num, settings) {
        this.num = num;
        this.settings = settings;
    }
}

function tryTemplateSave(btn) {
    if (tabCount < maxTabs) {
      const settings = gatherSettings();
      createTemplate(settings);
    } else {
      setFullWarning(btn);
    }
}

function setFullWarning(btn) {
    btn.classList.add("full");

    setTimeout(() => {
        btn.classList.remove("full");
    }, 1000);
}

function gatherSettings() {
  const settings = {}

  for (let k in SETTINGS) {settings[k] = SETTINGS[k].v;}
  
  return settings;
}

function createTemplate(settings) {
    tabCount++;
    templates[tabCount] = new Template(tabCount, settings);

    const options = {
        "id": `tab-${tabCount}`,
        // "class": "btn tab template",
        "class": "templateTab",
        "value": tabCount
    }

    const tab = createElement("div", options);
    tab.innerText = tabCount;
    document.getElementById("tabContainer").appendChild(tab);

    tab.classList.add("highlight");
    setTimeout(() => {
      tab.classList.remove("highlight");
    }, 500);

    tab.addEventListener("mousedown", function(e) {
        templateClick(e);
    })
}

function createElement(el, props) {
  const newEl = document.createElement(el);
    for (let k in props) {
        newEl.setAttribute(k, props[k]);
    }
    return newEl;
}

function templateClick(e) {
    const num = e.target.getAttribute("value");
    switch(e.which) {
        case 1: 
            loadTemplate(num);
            break;
        case 3:
          setTabMenu(e.target, Number(num));
            break;
    }
}



function setTabMenu(tab, num) {
  const data = tab.getBoundingClientRect();

  // if alread openened
  if (clickedTab > 0) {
    let activeTab;
    if (clickedTab === num) {
      // clicked same one -> close
      closeContainerTabMenu();
    }
    else {
      // switch to another
      activeTab = document.getElementById(`tab-${clickedTab}`);
      activeTab.classList.remove("highlight");

      clickedTab = num;
      activeTab = document.getElementById(`tab-${clickedTab}`);
      activeTab.classList.add("highlight");
      tabContainerMenu1.style.left = `${data.x+1*45}px`;
      tabContainerMenu1.style.top = `${data.y}px`;
  
      tabContainerMenu2.style.left = `${data.x+2*45}px`;
      tabContainerMenu2.style.top = `${data.y}px`;
    }
  }
  else {
    // unopened -> open
    clickedTab = num;
    const activeTab = document.getElementById(`tab-${clickedTab}`);
    activeTab.classList.add("highlight");
    tabContainerPanel.classList.add("opened");

    tabContainerMenu1.style.left = `${data.x+1*45}px`;
    tabContainerMenu1.style.top = `${data.y}px`;

    tabContainerMenu2.style.left = `${data.x+2*45}px`;
    tabContainerMenu2.style.top = `${data.y}px`;
  }
}

function closeContainerTabMenu() {
  if (clickedTab > 0) {
    const activeTab = document.getElementById(`tab-${clickedTab}`)
    clickedTab = 0;
    activeTab.classList.remove("highlight");
  
    tabContainerMenu1.style.left = `${-50}px`;
    tabContainerMenu2.style.left = `${-50}px`;

    tabContainerPanel.classList.remove("opened");
  }
}

function loadTemplate(num) {
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);

  const template = templates[num];

  for (let key in template.settings) {
    const newVal = template.settings[key];
    SETTINGS[key].v = newVal;

    // apply template values to sliders and selectors
    const el = document.querySelector(`#settingsPanel #${key}`);
    const display = el.querySelector(".display");

    if (el.classList.contains("slider")) {
      display.innerText = newVal;
      el.querySelector("input").value = newVal;
    }
    else if (el.classList.contains("selector")) {
      if (newVal === true || newVal === false) {
        display.innerHTML = checkboxChange[newVal];
      }
      else {display.innerText = newVal;}
        display.setAttribute("value", newVal);
    }
  }
}

function deleteTemplate(num) {
    if (templates[num].num == num) {delete templates[num];}

    const tab = document.getElementById(`tab-${num}`);
    tab.remove();

    resetTabPositions();
};

function resetTabPositions() {
    const tabs = document.querySelectorAll(".template");
    tabs.forEach((tab, i) => {
        const num = tab.getAttribute("value");
        const newY = tabStartY + tabYIncrease*i;
        tab.style.top = `${newY}px`;
        templates[num].posY = newY;
    })
}

// saveBtn menu buttons
function switchMenuButtons(state, btn) {
  switch(state) {
    case "closed":
      btn.setAttribute("value", "opened");
      saveBtnMenu1.style.left = "-90px";
      saveBtnMenu2.style.left = "-45px";
      break;
    case "opened":
      closeSaveBtnMenu();
      break;
  }
}

function closeSaveBtnMenu() {
  const btn = document.querySelector("#settingsPanel #saveBtn");
  btn.setAttribute("value", "closed");
  saveBtnMenu1.style.left = "0px";
  saveBtnMenu2.style.left = "0px";
}

// save all templates as json file
function downloadJSON() {
    const json = JSON.stringify(templates, null, 2);
    const title = document.title;
    const filename = `${title}-settings.json`;

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// save one template as json file
function downloadTemplate(num) {
    const templateToSave = {};
    templateToSave[num] = templates[num];
    const json = JSON.stringify(templateToSave, null, 2);
    const title = document.title;
    const filename = `${title}-template.json`;

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// upload template
function uploadJSON() {
    const file = document.querySelector("#inputBtn input").files;
    // console.log(file);
    
    if (file.length <= 0) {return false;}

    const reader = new FileReader();

    reader.onload = function(e) { 
    // console.log(e);
      const result = JSON.parse(e.target.result);
      // const formatted = JSON.stringify(result, null, 2);

      const amountToAdd = Object.keys(result).length;
      if (tabCount + amountToAdd < maxTabs) {
        pushTemplates(result)

      } else {
        window.alert(`Not enough room to add ${amountToAdd} new templates.`)
      }

      // console.log("", result)
    }
    
    reader.readAsText(file.item(0));
}

function pushTemplates(importedObj) {
  for (let key in importedObj) {
    createTemplate(importedObj[key].settings)
  }
}

function applyNewValueToPanel(type) {
  const val = SETTINGS[type].v;
  const el = document.querySelector(`#settingsPanel #${type}`);
  const display = el.querySelector(".display");

  if (el.classList.contains("slider")) {
    display.innerText = val;
    el.querySelector("input").value = val;
  }
  else if (el.classList.contains("selector")) {
    if (val === true || val === false) {
      display.innerHTML = checkboxChange[val];
    }
    else {display.innerText = val;}
    display.setAttribute("value", val);
  }
  setPanelSize()
}

function resetSetting(type) {
  SETTINGS[type].reset();
  applyNewValueToPanel(type);
}

function randomiseSetting(type) {
  SETTINGS[type].randomise();
  applyNewValueToPanel(type);
}


// turn on/off randomise box on a setting
function switchRndBox(type) {
  SETTINGS[type].rnd = !SETTINGS[type].rnd;
  const el = document.querySelector(`#${type} #rndbox`);
  el.innerHTML = rndIcons[SETTINGS[type].rnd];
}

// turn off randomise box on a setting
function clearRndSetting(type) {
  if (SETTINGS[type].rnd) {
    SETTINGS[type].rnd = !SETTINGS[type].rnd;
    const el = document.querySelector(`#${type} #rndbox`);
    el.innerHTML = rndIcons[SETTINGS[type].rnd];
  }
}
// turn on randomise box on a setting
function setRndSetting(type) {
  if (!SETTINGS[type].rnd) {
    SETTINGS[type].rnd = !SETTINGS[type].rnd;
    const el = document.querySelector(`#${type} #rndbox`);
    el.innerHTML = rndIcons[SETTINGS[type].rnd];
  }
}

function setPanelSize() {
 const size = mainPanel.getBoundingClientRect().width;
 
 if (size > panelSize) {
   panelSize = size;
   mainPanel.style.minWidth = `${panelSize}px`;
 }
}

