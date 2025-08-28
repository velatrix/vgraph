//

export class Vector2 {
	constructor(public x: number = 0, public y: number = 0) {
	}

	clone() {
		return new Vector2(this.x, this.y);
	}

	add(v: Vector2) {
		return new Vector2(this.x + v.x, this.y + v.y);
	}

	sub(v: Vector2) {
		return new Vector2(this.x - v.x, this.y - v.y);
	}

	scale(factor: number) {
		return new Vector2(this.x * factor, this.y * factor);
	}

	equals(v: Vector2) {
		return this.x === v.x && this.y === v.y;
	}

	set(x: number, y: number) {
		this.x = x;
		this.y = y;
		return this;
	}

	static from(x: number, y: number): Vector2 {
		return new Vector2(x, y);
	}

	static zero(): Vector2 {
		return new Vector2(0, 0);
	}
}

export class VGraphDrawing {

	static drawConnection(
		ctx: CanvasRenderingContext2D,
		from: Vector2,
		to: Vector2,
		options: { color?: string; width?: number } = {}
	) {
		const {color = '#e1904c', width = 2} = options;

		const sx = from.x, sy = from.y;
		const ex = to.x, ey = to.y;

		const dx = ex - sx;
		const dy = ey - sy;

		const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

		const rightHandle = clamp(dx * 0.5 + Math.abs(dy) * 0.25, 40, 160);

		const leftHandle = clamp(40 + (-dx) * 0.8 + Math.abs(dy) * 0.10, 60, 240);

		const handleX = dx >= 0 ? rightHandle : leftHandle;

		const vertical = Math.sign(dy) * clamp(Math.abs(dy) * 0.35, 0, 80);

		const c1x = sx + handleX;
		const c1y = sy + vertical;
		const c2x = ex - handleX;
		const c2y = ey - vertical;

		// Stroke
		ctx.beginPath();
		ctx.moveTo(sx, sy);
		ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.stroke();
	}


	static drawLine(ctx: CanvasRenderingContext2D, from: Vector2, to: Vector2, color: string = '#e1904c', width: number = 2) {
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.stroke();
	}

	static drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		ctx.lineTo(x + w, y + h - r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(x + r, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
	}
}