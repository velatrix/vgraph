import {Vector2, VGraphDrawing} from "./Utils.js";
import type {VGraphNode} from "./VGraphNode.js";
import type {VGraphNodeTheme} from "./VGraphTheme.js";

export abstract class VGraphProperty<T> {
	type: string = "field";
	label: string;
	#value: T;
	position: Vector2;
	padding: Vector2 = new Vector2(16, 4);
	height: number = 24;
	node!: VGraphNode;
	state: "idle" | "hover" | "active" = "idle";
	onChange?: (prop: VGraphProperty<T>) => void;
	onClick?: (prop: VGraphProperty<T>) => void;
	theme!: VGraphNodeTheme["property"]

	protected constructor(label: string, value: T) {
		this.label = label;
		this.#value = value;
		this.position = new Vector2(0, 0);
	}

	abstract click(): void;

	set value(v: T) {
		this.#value = v;
		this.onChange?.(this);
	}

	get value(): T {
		return this.#value;
	}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.save();

		const nodeWidth = this.node.size.x;
		const boxX = this.position.x + this.padding.x; // left
		const boxY = this.position.y + this.padding.y; // top
		const boxW = nodeWidth - (this.padding.x * 2); // full width minus horizontal padding
		const boxH = this.height;
		const radius = 8;

		VGraphDrawing.drawRoundedRect(ctx, boxX, boxY, boxW, boxH, radius);
		ctx.fillStyle = this.theme.backgroundColor;
		ctx.fill();

		ctx.strokeStyle = this.theme.borderColor;
		ctx.lineWidth = 1.2;
		ctx.stroke();

		ctx.shadowBlur = 0;

		const textY = boxY + boxH / 2;
		ctx.fillStyle = this.theme.labelTextColor;
		ctx.font = this.theme.labelTextFont;
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillText(this.label, boxX + 12, textY);

		ctx.fillStyle = this.theme.valueTextColor;
		ctx.font = this.theme.valueTextFont;
		ctx.textAlign = "right";
		ctx.fillText(String(this.value), boxX + boxW - 12, textY);
		ctx.restore();

	}


	/*abstract draw(ctx: CanvasRenderingContext2D): void;*/


}
