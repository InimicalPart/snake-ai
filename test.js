const hampath = require("./hampath.js")
const path = hampath.generate({
	width: 40, // Optional. Width of the grid (Default: 4)
	height: 40 // Optional. Height of the grid (Default: 4)
});
//log path
console.log(path);