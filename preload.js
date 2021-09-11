const {
	contextBridge,
	ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
	"api", {
	send: (channel, data) => {
		// whitelist channels
		let validChannels = ["toMain"];
		if (validChannels.includes(channel)) {
			return ipcRenderer.send(channel, data);
		}
	},
	receive: (channel, func) => {
		// Deliberately strip event as it includes `sender` 
		ipcRenderer.on(channel, (event, ...args) => func(...args));

	}
}
);


function makeHTMLboxes(size) {
	const returnn = [];
	returnn.push('<div class="entire">')
	for (let i = 0; i < size; i++) {
		returnn.push('<div class="row row-' + (i + 1) + '">');
		for (let j = 0; j < size; j++) {
			returnn.push('<div id="' + i.toString() + " " + j.toString() + '" class="cell"></div>');
		}
		returnn.push('</div>');
	}
	returnn.push('</div>');
	return returnn.join("\n").toString();
}