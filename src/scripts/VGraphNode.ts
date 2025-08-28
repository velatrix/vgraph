//

import {Vector2, VGraphDrawing} from "./Utils.js";
import {VGraphInput} from "./VGraphInput.js";
import {VGraphOutput} from "./VGraphOutput.js";
import type {VGraphIOHit} from "./VGraphTypes.js";
import {type VGraphNodeTheme, type VGraphTheme, VGraphThemeManager} from "./VGraphTheme.js";
import {VGraphIdGenerator} from "./VGraphIdGenerator.js";
import type {VGraphProperty} from "./VGraphProperty.js";
import {VGraphPropertyManager} from "./VGraphPropertyManager.js";
import type {VGraph} from "./VGraph.js";

export class VGraphNode {
	id: number = 0;
	type: string = 'node';

	events = new EventTarget();
	graph!: VGraph;

	#position: Vector2;
	#size: Vector2;
	title: string = 'Title';

	nodeColor: string = VGraphThemeManager.getNodeDefault().backgroundColor;
	borderColor: string = VGraphThemeManager.getNodeDefault().borderColor;
	selectedBorderColor: string = VGraphThemeManager.getNodeDefault().borderSelectedColor;
	cornerRadius = VGraphThemeManager.getNodeDefault().cornerRadius;

	titleBarColor: string = VGraphThemeManager.getNodeDefault().title.backgroundColor;
	titleTextColor: string = VGraphThemeManager.getNodeDefault().title.textColor;
	titleBarHeight: number = VGraphThemeManager.getNodeDefault().title.height;

	isSelected: boolean = false;

	inputs: VGraphInput[] = [];
	outputs: VGraphOutput[] = [];
	inputIdGen = new VGraphIdGenerator();
	outputIdGen = new VGraphIdGenerator();

	properties: VGraphProperty<any>[] = [];

	ioSpacing = VGraphThemeManager.getDefault().io.spacing;

	minHeight = 100;
	minWidth = 150;

	#theme = VGraphThemeManager.getDefault();

	set position(value: Vector2) {
		this.#position = value;
		this.recalculatePositions();
	}

	get position(): Vector2 {
		return this.#position;
	}

	set size(value: Vector2) {
		this.#size = value;
		this.recalculatePositions();
	}

	get size(): Vector2 {
		return this.#size;
	}

	constructor() {
		this.#position = new Vector2(0, 0);
		this.#size = new Vector2(200, 150);
	}

	draw(ctx: CanvasRenderingContext2D) {
		const {x, y} = this.position;
		const {x: w, y: h} = this.size;

		ctx.save();

		// Shadow
		ctx.shadowColor = 'rgba(0,0,0,0.40)';
		ctx.shadowBlur = 4;

		// Main node rectangle
		VGraphDrawing.drawRoundedRect(ctx, x, y, w, h, this.cornerRadius);
		ctx.fillStyle = this.nodeColor;
		ctx.fill();
		ctx.shadowBlur = 0;

		this.drawTitle(ctx, x, y, w, h, this.cornerRadius);

		// Border (neon when selected)
		ctx.lineWidth = this.isSelected ? 2 : 2;
		ctx.strokeStyle = this.isSelected ? this.selectedBorderColor : this.borderColor;
		VGraphDrawing.drawRoundedRect(ctx, x, y, w, h, this.cornerRadius);
		ctx.stroke();

		this.drawInputs(ctx);
		this.drawOutputs(ctx);
		this.drawFields(ctx);
		// this.drawConnectionCircles(ctx);
		//

		ctx.restore();
	}

	private drawTitle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
		// Title bar
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		ctx.lineTo(x + w, y + this.titleBarHeight);
		ctx.lineTo(x, y + this.titleBarHeight);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
		ctx.fillStyle = this.titleBarColor;
		ctx.fill();

		// Title text
		ctx.fillStyle = this.titleTextColor;
		ctx.font = 'bold 16px Segoe UI, Arial, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.title, x + w / 2, y + this.titleBarHeight / 2);
		ctx.restore();
	}

	private drawInputs(ctx: CanvasRenderingContext2D) {
		ctx.save();
		for (const input of this.inputs) {
			input.draw(ctx, this.#theme);
		}
		ctx.restore();
	}

	private drawOutputs(ctx: CanvasRenderingContext2D) {
		ctx.save();
		for (const output of this.outputs) {
			output.draw(ctx, this.#theme);
		}
		ctx.restore();
	}

	private drawFields(ctx: CanvasRenderingContext2D) {
		for (const field of this.properties) {
			field.draw(ctx);
		}
	}

	drawConnections(ctx: CanvasRenderingContext2D) {
		for (const output of this.outputs) {
			for (const input of output.connections) {
				const connectionColor = this.#theme.connections.has(input.type) ?
					this.#theme.connections.get(input.type) as string :
					this.#theme.connection.color;
				VGraphDrawing.drawConnection(
					ctx,
					output.position,
					input.position,
					{
						color: connectionColor,
						width: this.#theme.connection.width
					}
				);
			}
		}
	}

	drawConnectionCircles(ctx: CanvasRenderingContext2D) {

		for (const output of this.outputs) {
			for (const input of output.connections) {

				const connectionColor = this.#theme.connections.has(input.type) ?
					this.#theme.connections.get(input.type) as string :
					this.#theme.connection.color;

				// Draw circle at output (start)
				ctx.beginPath();
				ctx.arc(output.position.x, output.position.y, 4, 0, Math.PI * 2);
				ctx.fillStyle = connectionColor;
				ctx.fill();

				// Draw circle at input (end)
				ctx.beginPath();
				ctx.arc(input.position.x, input.position.y, 4, 0, Math.PI * 2);
				ctx.fillStyle = connectionColor;
				ctx.fill();
			}
		}
	}

	//
	move(x: number, y: number) {
		this.position.set(x, y);
		this.recalculatePositions();
	}

	resize(newWidth: number, newHeight: number) {
		const width = Math.max(newWidth, this.minWidth);
		const height = Math.max(newHeight, this.minHeight);
		this.size.set(width, height);
		const margin = this.titleBarHeight + 16;
		this.outputs.forEach((output, i) => {
			output.position.x = this.position.x + this.size.x;
			output.position.y = this.position.y + margin + (this.ioSpacing * i);
		});
	}

	setSelection(status: boolean) {
		this.isSelected = status;
	}

	addInput(label: string, type: string): void {
		const input = new VGraphInput(this.inputIdGen.next(), label, type, Vector2.zero(), this);
		this.inputs.push(input);
		this.recalculatePositions();
	}

	addOutput(label: string, type: string): void {
		const output = new VGraphOutput(this.outputIdGen.next(), label, type, Vector2.zero(), this);
		this.outputs.push(output);
		this.recalculatePositions();
	}

	addProperty(name: string, label: string, value: any): void {
		const PropertyClass = VGraphPropertyManager.getProperty(name);
		const prop = new PropertyClass(label, value); // pass label, value etc.
		prop.node = this; // link to parent node
		// prop.onChange = () => this.events.dispatchEvent(new Event("property:change"));
		prop.onChange = (prop) => this.events.dispatchEvent(new CustomEvent("property:changed", {
			detail: {
				property: prop
			}
		}));
		this.properties.push(prop);
		this.recalculatePositions();
	}

	// Helpers
	containsPoint(point: Vector2): boolean {
		const {x, y} = this.position;
		const {x: w, y: h} = this.size;
		return point.x >= x && point.x <= x + w && point.y >= y && point.y <= y + h;
	}

	isOverResizeHandle(point: Vector2): boolean {
		const handleSize = 12; // px, adjust as needed
		const right = this.position.x + this.size.x;
		const bottom = this.position.y + this.size.y;
		return (
			point.x >= right - handleSize &&
			point.x <= right &&
			point.y >= bottom - handleSize &&
			point.y <= bottom
		);
	}

	isOverProperty(point: Vector2): VGraphProperty<any> | null {
		for (const field of this.properties) {
			const fx = field.position.x;
			const fy = field.position.y;
			const fw = this.size.x;
			const fh = field.height;
			if (point.x >= fx && point.x <= fx + fw && point.y >= fy && point.y <= fy + fh) {
				return field;
			}
		}
		return null;
	}

	containsIOPoint(point: Vector2): VGraphIOHit | null {
		let idx = 0;
		for (const output of this.outputs) {
			if (typeof output.isPointInside === 'function' && output.isPointInside(point.x, point.y)) {
				return {type: 'output', io: output, index: idx};
			}
			idx++;
		}
		idx = 0;
		for (const input of this.inputs) {
			if (typeof input.isPointInside === 'function' && input.isPointInside(point.x, point.y)) {
				return {type: 'input', io: input, index: idx};
			}
			idx++;
		}
		return null;
	}

	recalculatePositions() {
		const margin = this.titleBarHeight + 16;
		const x = this.position.x;
		const y = this.position.y + margin;

		this.inputs.forEach((input, i) => {
			input.position.set(x, y + (this.ioSpacing * i));
		});

		this.outputs.forEach((output, i) => {
			output.position.set(x + this.size.x, y + (this.ioSpacing * i));
		});

		// --- Fields (after IOs) ---
		const fieldStartY = y + Math.max(this.inputs.length, this.outputs.length) * this.ioSpacing - 8;
		let pad = 0;
		this.properties.forEach((field, i) => {
			field.position.set(x, fieldStartY + (field.height * i) + pad);
			pad += field.padding.y * 2;
		});
	}

	getInput(index: number): VGraphInput {
		const input = this.inputs[index];
		if (input) {
			return input;
		} else {
			throw new Error(`Input with index ${index} does not exist.`);
		}
	}

	getOutput(index: number): VGraphOutput {
		const output = this.outputs[index];
		if (output) {
			return output;
		} else {
			throw new Error(`Output with index ${index} does not exist.`);
		}
	}

	setTheme(value: VGraphTheme) {
		this.#theme = value;
		this.nodeColor = value.node.backgroundColor;
		this.borderColor = value.node.borderColor;
		this.selectedBorderColor = value.node.borderSelectedColor;
		this.cornerRadius = value.node.cornerRadius;
		this.titleBarColor = value.node.title.backgroundColor;
		this.titleTextColor = value.node.title.textColor;
		this.titleBarHeight = value.node.title.height;
		this.ioSpacing = value.io.spacing;
	}
}