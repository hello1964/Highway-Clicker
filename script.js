//test
console.clear()

var s = "http://www.w3.org/2000/svg"
var x = "http://www.w3.org/1999/xlink"
var titleScreen = document.getElementById("titleScreen")
var mainScreen = document.getElementById("mainScreen")
var title = document.getElementById("title")
var titlePic = document.getElementById("titlePic")
var highway = document.getElementById("highway")
var feild = document.getElementById("feild")
var moneyElem = document.getElementById("money")
var cul = document.getElementById("carUpgrades")
var highwayInfo = [{
  animate: [1000, 40, -200, 40],
  rotate: false,
},{
  animate: [1000, 152.5, -200, 152.5],
  rotate: false,
},{
  animate: [-200, 265, 1000, 265],
  rotate: true,
},{
  animate: [-200, 377.5, 1000, 377.5],
  rotate: true,
}]
var info = new Proxy({
  highwaylvl: 1,
  money: 0,
}, {
  set(o, p, v) {
    if (p == "money") {
      moneyElem.innerHTML = v
    }
    o[p] = v
    return true;
  }
})
var startButton = document.getElementById("startButton")

startButton.addEventListener("click", () => {
  titleScreen.style.display = "none"
  mainScreen.style.display = "flex"
  
  summonCar()
  run()
})

mainScreen.addEventListener("load", () => {
  if (mainScreen.style.display != "none") {
    summonCar()
    run()
  }
})

window.addEventListener("resize", (eve) => {
  let self = eve.currentTarget
  
  adjustFontSize()
  
  let imgRatio = titlePic.offsetWidth / titlePic.offsetHeight
  let screenRatio = titleScreen.offsetWidth / titleScreen.offsetHeight
  if (imgRatio > screenRatio) {
    titlePic.style.width = "auto"
    titlePic.style.height = "100%"
  } else {
    titlePic.style.width = "100%"
    titlePic.style.height = "auto"
  }
})

window.dispatchEvent(new Event("resize"))

clean(document.getElementsByClassName("backButton")).forEach((e) => {
  e.addEventListener("click", (eve) => {
    let self = eve.currentTarget

    e.parentNode.parentNode.style.display = "none"
  })
})

run()

class Car {
  static allCars = []
  static activeCars = []
  
  constructor(type, color, speed, cash, level=0) {
    this.type = type
    this.color = color
    this.speed = speed
    this.cash = cash
    this.level = level
    
    this.index = Car.allCars.length + 1
    
    Car.allCars.push(this)
  }
  
  play() {
    this.elem = document.createElementNS(s, "use")
    this.elem.setAttributeNS(x, "xlink:href", `#${this.type}`)
    this.elem.setAttributeNS(null, "fill", this.color)
    
    let nonsense = choice(highwayInfo)
    if (nonsense.rotate) {
      this.elem.setAttributeNS(null, "transform", "rotate(180, 100, 40)")
    }
    
    feild.appendChild(this.elem)
    
    let animation = carAnimation(this.elem, this, ...nonsense.animate, this.speed)
    
    this.elem.addEventListener("click", () => {
      info.money += this.getAmount()
      animation.dispatchEvent(new Event("endEvent"))
    })
  }
  
  getAmount() {
    return Math.ceil(0.0625*this.index*(this.level-1)**2 + this.cash)
  }
  
  getPurchaseAmount() {
    return Math.ceil((0.923*Math.E)**(1.58*this.index))
  }
  
  getUpgradeAmount() {
    return this.getAmount()*6
  }
}

new Car("basic", "red", 5, 1, 1)
new Car("basic", "blue", 4.5, 3)
new Car("basic", "#FF7518", 4, 5)
new Car("basic", "#FFFF00", 4.9, 10)
new Car("basic", "#007500", 4.8, 25)

Car.allCars.forEach((e, i) => {
  if (e.level > 0) {
    Car.activeCars.push(e)
  }
})

function summonCar() {
  let car = choice(Car.activeCars)
  Object.assign(new Car(0,0,0,0), car).play()
}

Car.allCars.forEach((e, i, arr) => {
  let div = document.createElement("div")
  div.classList.add("culItem")
  div.classList.add("centerH")
  
  let carName = document.createElement("h1")
  carName.classList.add("bold")
  carName.innerHTML = "Car " + (i + 1)
  
  let div2 = document.createElement("div")
  let levelTxt = document.createElement("P")
  levelTxt.innerHTML = "Lvl: " + e.level
  
  div2.appendChild(levelTxt)
  
  let button = document.createElement("button")
  button.setAttribute("data-index", e.index - 1)
  if (e.level == 0) {
   button.innerHTML = `Cost: $${e.getPurchaseAmount()}`
  } else {
    button.innerHTML = `Upgrade Cost: $${e.getUpgradeAmount()}`
  }
  button.addEventListener("click", (eve) => {
    let self = eve.currentTarget
    let elem = Car.allCars[parseInt(self.dataset.index, 10)]
    
    let cash
    
    if (elem.level == 0) {
      cash = e.getPurchaseAmount()
    } else {
      cash = e.getUpgradeAmount()
    }
    
    if (info.money >= cash) {
      info.money -= cash
      if (elem.level == 0) {
        Car.activeCars.push(elem)
      }
      elem.level += 1
      clean(self.parentNode.childNodes)[1].innerHTML = "Lvl: " + elem.level
      button.innerHTML = `Upgrade Cost: $${e.getUpgradeAmount()}`
    }
  })
  
  div.appendChild(carName)
  div.appendChild(div2)
  div.appendChild(button)
  cul.appendChild(div)
})

function run() {
  setTimeout(() => {
    summonCar()
    
    run()
  }, 1000/*5/info.highwaylvl + randInt(-5, 5))*1000*/)
}

function clean(nodes) {
    return Array.prototype.slice.call(nodes).filter((e) => {
      return e.nodeType == 1
    })
}

function randInt(num1, num2) {
  return num1 + Math.floor(Math.random() * (num2 + 1 - num1));
}

function choice(arr) {
  return arr[randInt(0, arr.length - 1)]
}

function adjustFontSize() {
  let nodes = clean(document.getElementsByClassName("adjust"))
  
  nodes.forEach((e) => {
    e.style.fontSize = (e.parentNode.offsetWidth/e.dataset.fontSize) + "px"
  })
}

function carAnimation(elem, classs, startX, startY, endX, endY, speed) {
  let animation = document.createElementNS(s, "animateMotion")
  animation.setAttributeNS(null, "path", `M ${startX} ${startY} L ${endX} ${endY}`)
  animation.setAttributeNS(null, "dur", `${speed}s`)
  animation.setAttributeNS(null, "repeatCount", 0)
  animation.setAttributeNS(null, "fill", "freeze")
  elem.appendChild(animation)
  animation.beginElement()
  
  animation.addEventListener("endEvent", (eve) => {
    let self = eve.currentTarget
    
    elem.remove()
    delete classs
  })
  return animation
}