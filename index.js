
const { app, BrowserWindow, Notification, ipcMain } = require('electron')
const proc = require('child_process')
const path = require('path')
var PF = require('pathfinding');

//const Graph = require("astar").Graph;
//const graph = new Graph(40, { diagonal: true });
// will print something similar to /Users/maf/.../Electron

function createWindow(width, height) {
	width = width || 800
	height = height || 600
	const win = new BrowserWindow({
		width: width,
		height: height,
		webPreferences: {
			//nodeIntegration: true,
			preload: path.join(app.getAppPath(), 'preload.js')
		}, resizable: false
	})

	//win.loadFile('index.html')
	win.loadFile('snakey.html')

	// win.webContents.openDevTools()

}
// spawn Electron
// function showNotification(a, b) {
// 	setTimeout(() => new Notification({ title: a, body: b }).show(), 2000)
// }
//const child = proc.spawn(electron, [path.join(__dirname + "/index.html")])

app.whenReady().then(() => createWindow(650, 650))//.then(() => showNotification('Snake-AI', 'Ready!')).then(() => {
//
//
//})
let snake;
let game;
ipcMain.on('toMain', async (event, arg) => {
	/**
 * 
 * 
 * 
 * @param {Snake} snake 
 * @param {array} appleLocation 
 * @param {function} callback 
 */

	function generatePath(snake, appleLocation, callback) {
		var grid = new PF.Grid(40, 40);
		//const graph = new Graph(40);
		const startx = snake.head[0];
		const starty = snake.head[1];
		const endx = appleLocation[0];
		const endy = appleLocation[1];
		for (let i in snake.tail) {
			const x = snake.tail[i].split(" ")[0];
			const y = snake.tail[i].split(" ")[1];
			grid.setWalkableAt(parseInt(x), parseInt(y), false);
			//graph.set(parseInt(x), parseInt(y), "tower");
		}
		var finder;
		if (snake.length > 20) {
			console.log("Using A* reversed")
			game.longPath = true
			finder = new PF.AStarFinder();
		} else {
			game.longPath = false
			finder = new PF.AStarFinder();
		}
		var path = finder.findPath(parseInt(startx), parseInt(starty), parseInt(endx), parseInt(endy), grid)

		const endPath = []
		for (let i in path) {
			endPath.push({ x: path[i][0], y: path[i][1] })
		}
		return callback(endPath)

		/*graph.path(startx, starty, endx, endy, (path) => {
			return callback(path)
		});*/

	}
	if (arg[0] === "BUTTON_CLICK") {
		if (arg[1] === "startSim") {
			if (game?.isRunning) {
				return
			}
			game = new Game()
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`document.querySelectorAll(".cell").forEach(cell => {cell.removeAttribute("style");cell.removeAttribute("data-is-apple");cell.removeAttribute("data-is-part-of-snake")})`)
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('startSim').disabled = true")
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`document.getElementById("4 10").setAttribute("style", "background-color:lime;");
			document.getElementById("3 10").setAttribute("style", "background-color:green;");
			document.getElementById("2 10").setAttribute("style", "background-color:green;");
			document.getElementById("2 9").setAttribute("style", "background-color:green;");
			document.getElementById("4 10").dataset.isPartOfSnake = true
			document.getElementById("3 10").dataset.isPartOfSnake = true;
			document.getElementById("2 10").dataset.isPartOfSnake = true;
			document.getElementById("2 9").dataset.isPartOfSnake = true;`)
			await BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`function generateApple(){for(let e in document.getElementsByClassName("entire")[0].childNodes){if(Number.isNaN(parseInt(e)))break;if("DIV"!==document.getElementsByClassName("cell")[e].tagName)break;for(;;){const e=[Math.floor(40*Math.random())+0,Math.floor(40*Math.random())+0].join(" ");if("true"===(document.getElementById(e).dataset.isPartOfSnake||!1)!=!0&&"true"===(document.getElementById(e).dataset.isApple||!1)!=!0)return e}}}appleLoc = generateApple(); document.getElementById(appleLoc).setAttribute("style", "background-color:red"); document.getElementById(appleLoc).dataset.isApple = true;`)
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`function move(a,b){console.log("command was: move("+a+", "+b+")"),console.log("snake is: "+a.head+" "+a.tail+" "+a.direction+" "+a.length);const c=b.x,d=b.y;console.log("snake is being moved to: "+c+" "+d);const e=[c,d];if("true"===document.getElementById(e.join(" ")).dataset?.isApple){a.length++,document.getElementById(e.join(" ")).dataset.isApple=!1;let b=generateApple();document.getElementById(b).setAttribute("style","background-color:red"),document.getElementById(b).dataset.isApple=!0,a.tail.push(a.head.join(" ")),e[0]>a.head[0]?(a.direction="right",document.getElementById("snakeDirTxt").innerText="Snake is heading: RIGHT"):e[0]<a.head[0]?(a.direction="left",document.getElementById("snakeDirTxt").innerText="Snake is heading: LEFT"):e[1]>a.head[1]?(a.direction="down",document.getElementById("snakeDirTxt").innerText="Snake is heading: DOWN"):e[1]<a.head[1]&&(a.direction="up",document.getElementById("snakeDirTxt").innerText="Snake is heading: UP"),a.head=e}else a.tail.shift(),a.tail.push(a.head.join(" ")),e[0]>a.head[0]?(a.direction="right",document.getElementById("snakeDirTxt").innerText="Snake is heading: RIGHT"):e[0]<a.head[0]?(a.direction="left",document.getElementById("snakeDirTxt").innerText="Snake is heading: LEFT"):e[1]>a.head[1]?(a.direction="down",document.getElementById("snakeDirTxt").innerText="Snake is heading: DOWN"):e[1]<a.head[1]&&(a.direction="up",document.getElementById("snakeDirTxt").innerText="Snake is heading: UP"),a.head=e;document.getElementById("snakeHeadTxt").innerText="Snakes head is at: x:"+a.head[0]+" y:"+a.head[1],document.getElementById("snakeLengthTxt").innerText="Snakes tail length is: "+a.length,updateBoardAfterMove(a.head.join(" "),a.tail,genApplePos())}function updateBoardAfterMove(a,b,c){for(let d in document.querySelectorAll(".cell").forEach(a=>{a.removeAttribute("style"),a.removeAttribute("data-is-apple"),a.removeAttribute("data-is-part-of-snake")}),document.getElementById(a).setAttribute("style","background-color:lime"),document.getElementById(a).dataset.isPartOfSnake=!0,b)document.getElementById(b[d]).setAttribute("style","background-color:green"),document.getElementById(b[d]).dataset.isPartOfSnake=!0;document.getElementById(c).setAttribute("style","background-color:red"),document.getElementById(c).dataset.isApple=!0}`);

			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`function Snake() {this.head = [0, 0];this.tail = [];this.direction = "right";this.length = 0}snake = new Snake();snake.head=[4,10];snake.tail = ["2 9", "2 10", "3 10"]; snake.direction="right";snake.length=3`);
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("timer = setInterval(() => {action(['UPDATE_SNAKE'])},75)")
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`function genApplePos() { for (let i in document.getElementsByClassName("cell")) {const thing = document.getElementsByClassName("cell")[i].dataset?.isApple || false; if (thing === true || thing == "true") return document.getElementsByClassName("cell")[i].id } return false }`)
			snake = new Snake()
			snake.head = [4, 10]
			snake.tail = ["2 9", "2 10", "3 10"]
			snake.direction = "right"
			snake.length = 3
			game.isRunning = true
		}
	} else if (arg[0] === "UPDATE_SNAKE") {
		console.log(snake.head, snake.tail, snake.direction, snake.length)
		// update snake
		let applePos = await BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`genApplePos()`)
		if (applePos === false) {
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('startSim').disabled = false")
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("clearInterval(timer)")
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('snakeHeadTxt').innerText = 'Snakes head is at: N/A'")
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('snakeLengthTxt').innerText = 'Snakes tail length is: N/A'")
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('snakeDirTxt').innerText = 'Snake is heading: N/A'")
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('searchTook').innerText = 'Pathfinding took: N/A'")
			BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`document.getElementById("MovesToApple").innerText = 'Moves to apple: N/A'`)
			return
		}
		let appleLocation = applePos.split(" ")
		firsttime = new Date().getTime()
		generatePath(snake, appleLocation, async function (path) {
			let secondtime = new Date().getTime()
			let time = secondtime - firsttime
			pretty_ms = require('pretty-ms')

			if (path[0]?.x === undefined || path[0]?.y === undefined) {
				console.log("No moves found")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('startSim').disabled = false")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("clearInterval(timer)")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('snakeHeadTxt').innerText = 'Snakes head is at: N/A'")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('snakeLengthTxt').innerText = 'Snakes tail length is: N/A'")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('snakeDirTxt').innerText = 'Snake is heading: N/A'")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('searchTook').innerText = 'Pathfinding took: N/A'")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`document.getElementById("MovesToApple").innerText = 'Moves to apple: N/A'`)
				game.isRunning = false
				return
			}
			if (path.length > 0) {
				path.shift()
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`document.getElementById("MovesToApple").innerText = 'Moves to apple: ${String(path.length).padStart(2, "0")}'`)
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`document.getElementById("searchTook").innerText = 'Pathfinding took: ${pretty_ms(time)}'`)
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`move(snake, {x:${path[0].x}, y:${path[0].y}})`);

				snake.head = JSON.parse(await BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`"["+snake.head.toString() + "]"`))
				aTempVal = await BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`snake.tail`)
				snake.tail = aTempVal.toString().split(",")
				snake.direction = await BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`snake.direction`)
				snake.length = parseInt(await BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`snake.length`))
			} else {
				console.log("No moves found")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('startSim').disabled = false")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("clearInterval(timer)")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('snakeHeadTxt').innerText = 'Snakes head is at: N/A'")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('snakeLengthTxt').innerText = 'Snakes tail length is: N/A'")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('snakeDirTxt').innerText = 'Snake is heading: N/A'")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById('searchTook').innerText = 'Pathfinding took: N/A'")
				BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`document.getElementById("MovesToApple").innerText = 'Moves to apple: N/A'`)
				game.isRunning = false
				return
			}
		})
	}
})
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})


function move(snake, position) {
	const moveToX = position.x
	const moveToY = position.y
	const head = snake.head
	console.log(head)
	console.log("snake is being moved to: " + moveToX + " " + moveToY)
	const moveTo = [moveToX, moveToY]
	if (document.getElementById(moveTo.join(" ")).dataset?.isApple === "true") {
		snake.length++
		document.getElementById(moveTo.join(" ")).dataset.isApple = false
		let appleLoc = generateApple()
		document.getElementById(appleLoc).setAttribute("style", "background-color:red")
		document.getElementById(appleLoc).dataset.isApple = true;
		snake.tail.push(snake.head.join(" "))
		if (moveTo[0] > snake.head[0]) {
			snake.direction = "right"
			document.getElementById("snakeDirTxt").innerText = "Snake is heading: RIGHT"
		} else if (moveTo[0] < snake.head[0]) {
			snake.direction = "left"
			document.getElementById("snakeDirTxt").innerText = "Snake is heading: LEFT"
		} else if (moveTo[1] > snake.head[1]) {
			snake.direction = "down"
			document.getElementById("snakeDirTxt").innerText = "Snake is heading: DOWN"
		} else if (moveTo[1] < snake.head[1]) {
			snake.direction = "up"
			document.getElementById("snakeDirTxt").innerText = "Snake is heading: UP"
		}
		snake.head = moveTo
	} else {
		snake.tail.shift()
		snake.tail.push(snake.head.join(" "))
		//calculate the direction of the snake
		if (moveTo[0] > snake.head[0]) {
			snake.direction = "right"
			document.getElementById("snakeDirTxt").innerText = "Snake is heading: RIGHT"
		} else if (moveTo[0] < snake.head[0]) {
			snake.direction = "left"
			document.getElementById("snakeDirTxt").innerText = "Snake is heading: LEFT"
		} else if (moveTo[1] > snake.head[1]) {
			snake.direction = "down"
			document.getElementById("snakeDirTxt").innerText = "Snake is heading: DOWN"
		} else if (moveTo[1] < snake.head[1]) {
			snake.direction = "up"
			document.getElementById("snakeDirTxt").innerText = "Snake is heading: UP"
		}
		snake.head = moveTo // move head
	}
	document.getElementById("snakeHeadTxt").innerText = "Snakes head is at: x:" + snake.head[0] + " y:" + snake.head[1]
	document.getElementById("snakeLengthTxt").innerText = "Snakes tail length is: " + snake.length
	updateBoardAfterMove(snake.head.join(" "), snake.tail, genApplePos())
	//console.log("new snake: " + snake.head + " " + snake.tail + " " + snake.direction + " " + snake.length)

}

function updateBoardAfterMove(snakeHead, snakeTail, appleLoc) {
	// remove all style attributes from all elements that contain the class "cell"
	document.querySelectorAll(".cell").forEach(cell => {
		cell.removeAttribute("style")
		cell.removeAttribute("data-is-apple")
		cell.removeAttribute("data-is-part-of-snake")
	})
	// add style attribute to snake head
	document.getElementById(snakeHead).setAttribute("style", "background-color:lime")
	document.getElementById(snakeHead).dataset.isPartOfSnake = true
	// add style attribute to snake tail
	for (let i in snakeTail) {
		document.getElementById(snakeTail[i]).setAttribute("style", "background-color:green")
		document.getElementById(snakeTail[i]).dataset.isPartOfSnake = true
	}
	// add style attribute to apple
	document.getElementById(appleLoc).setAttribute("style", "background-color:red")
	document.getElementById(appleLoc).dataset.isApple = true
}


/**
 * 
 * @description Generates a random location for the apple
 * 
 * @returns The position of the apple
 * 
 */
function generateApple() {
	for (let i in document.getElementsByClassName("entire")[0].childNodes) {
		if (Number.isNaN(parseInt(i))) break
		if (document.getElementsByClassName("cell")[i].tagName !== "DIV") break

		do {
			const randomSpot = [Math.floor(Math.random() * (39 - 0 + 1)) + 0, Math.floor(Math.random() * (39 - 0 + 1)) + 0].join(" ")
			if ((((document.getElementById(randomSpot).dataset.isPartOfSnake || false) === "true") !== true) && (((document.getElementById(randomSpot).dataset.isApple || false) === "true") !== true)) {
				return randomSpot
			} else {
				continue

			}
		} while (1 == 1)
	}
}
/**
 * 
 * @description Get the position of the apple on the board
 * 
 * @returns The position of the apple. If no apple was found, returns false
 * 
*/
function getApplePos() {
	for (let i in document.getElementsByClassName("cell")) {
		if (document.getElementsByClassName("cell")[i].dataset.isApple || false === true) return document.getElementsByClassName("cell")[i].id
	}
	return false
}
/**
 * 
 * @description Generates the snake.
 * 
 * @returns A new snake instance with a head location, tails, direction and length
 */
function Snake() {
	this.head = [0, 0]
	this.tail = []
	this.direction = "right"
	this.length = 0
}
/**
 * 
 * @description Game instance that contains the game logic and information
 * 
 * 
 * @returns A new game instance
 */
function Game() {
	this.algorithm = "A*"
	this.longPath = false
	this.isRunning = false
}
/*
document.getElementById("4 10").setAttribute("style", "background-color:lime;");
document.getElementById("3 10").setAttribute("style", "background-color:green;");
document.getElementById("2 10").setAttribute("style", "background-color:green;");
document.getElementById("2 9").setAttribute("style", "background-color:green;");
document.getElementById("4 10").dataset.isPartOfSnake = true
document.getElementById("3 10").dataset.isPartOfSnake = true;
document.getElementById("2 10").dataset.isPartOfSnake = true;
document.getElementById("2 9").dataset.isPartOfSnake = true;

let appleLoc = generateApple(); document.getElementById(appleLoc).setAttribute("style", "background-color:red"); document.getElementById(appleLoc).dataset.isApple = true;


let snakeHead = [4, 10]
let apple = appleLoc.split(" ")


*/