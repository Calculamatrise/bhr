// self.physicsLines = [];
// self.sceneryLines = [];
// self.powerups = [];
addEventListener('message', ({ data }) => {
	switch(data.code) {
	case 0:
		// import
		break;
	case 1:
		// export
		console.log(data.data)

		let physics = data.data.physicsLines.reduce((lines, line, index, arr) => {
			if (line.recorded) return lines;
			lines.length > 0 && (lines += ',');
			let currentSegment = line.a.x.toString(32) + ' ' + line.a.y.toString(32) + ' ' + line.b.x.toString(32) + ' ' + line.b.y.toString(32);
			let connectedLine = arr.find(connectedLine => (connectedLine.a.x === line.b.x && connectedLine.a.y === line.b.y) || (connectedLine.b.x === line.b.x && connectedLine.b.y === line.b.y));
			if (!connectedLine) return lines += currentSegment;
			let nextPoint = (connectedLine.a.x === line.b.x && connectedLine.a.y === line.b.y) ? connectedLine.b : connectedLine.a;
			connectedLine.recorded = true;
			return lines += currentSegment + ' ' + nextPoint.x.toString(32) + ' ' + nextPoint.y.toString(32);
		}, '')
		  , scenery = ''
		  , powerups = '';
		// for (const line of data.physicsLines.filter(line => ))
		// 	line.recorded || (physics.length > 0 && (physics += ','),
		// 	physics += line.toString());

		// for (const line of data.sceneryLines)
		// 	line.recorded || (scenery.length > 0 && (scenery += ','),
		// 	scenery += line.toString());
		// for (const line of data.sceneryLines)
		// 	delete line.recorded;
		// for (const powerupType in data.powerupTypes) {
		// 	for (const powerup of data.powerupTypes[powerupType]) {
		// 		powerups.length > 0 && (powerups += ',');
		// 		powerups += powerup.toString();
		// 	}
		// }

		console.log(physics)

		postMessage({
			code: 1,
			data: {
				code: physics + '#' + scenery + '#' + powerups + '#' + data.data.vehicle
			}
		})
		break;
	}
})

function findConnectedLine() {

}