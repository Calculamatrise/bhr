self.rows = new Map();
addEventListener('message', ({ data }) => {
	// console.log(data)
	let canvas, ctx;
	if ('sector' in data) {
		if (!self.rows.has(data.sector.row)) {
			self.rows.set(data.sector.row, new Map());
		}

		const row = self.rows.get(data.sector.row);
		if (!row.has(data.sector.column) && 'canvas' in data) {
			row.set(data.sector.column, data.canvas);
		}

		canvas = row.get(data.sector.column);
		ctx = canvas.getContext('2d');
	}

	if ('config' in data) {
		canvas.width = data.width;
		canvas.height = data.height;
		for (const i in data.config) {
			ctx[i] = data.config[i];
		}
	}

	if ('physics' in data) {
		// --
		// console.log(data, canvas)
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (const line of data.physics) {
			ctx.beginPath();
			ctx.moveTo(line.a.x, line.a.y);
			ctx.lineTo(line.b.x, line.b.y);
			ctx.stroke();
		}
	}
});