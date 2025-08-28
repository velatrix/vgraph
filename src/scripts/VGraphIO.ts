//

import {Vector2} from "./Utils.js";
import type {VGraphNode} from "./VGraphNode.js";
import {VGraphOutput} from "./VGraphOutput.js";
import {VGraphInput} from "./VGraphInput.js";
import type {VGraphTheme} from "./VGraphTheme.js";

export abstract  class VGraphIO {
	id: number;
	label: string;
	type: string;
	position: Vector2;
	node : VGraphNode;
	state : 'idle' | 'disabled' | 'hovering' | 'target' = 'idle';

	static readonly R = 6;

	abstract isConnected(): boolean;
	abstract getLabelAlign(): "left" | "right";

	protected constructor(id:number, label: string, type: string, position: Vector2, node: VGraphNode) {
		this.id = id; // Auto-generate as needed
		this.label = label;
		this.type = type;
		this.position = position;
		this.node = node;
	}

	isPointInside(x: number, y: number): boolean {
		const dx = x - this.position.x;
		const dy = y - this.position.y;
		return dx * dx + dy * dy <= VGraphIO.R * VGraphIO.R;
	}

	draw(ctx: CanvasRenderingContext2D, theme : VGraphTheme) {
		ctx.beginPath();

		if (!this.isConnected()) {
			ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
			switch (this.state) {
				case 'disabled':
					ctx.fillStyle = theme.io.dot.color.disabled; // Dark, muted gray fill
					//ctx.strokeStyle = '#343b4d'; // Even darker gray border
					break;
				case 'hovering':
					ctx.fillStyle = theme.io.dot.color.hover; // Bright, light gray fill
					//ctx.strokeStyle = this.selectedBorderColor;
					break;
				default:
					ctx.fillStyle = theme.io.dot.color.default;
			}
			ctx.lineWidth = 2;
			ctx.fill();
		}

		//ctx.stroke();

		// Draw input/output label
		switch (this.state) {
			case 'disabled':
				ctx.fillStyle = '#4c5055'; // Medium gray label
				break;
			case 'hovering':
				ctx.fillStyle = '#fff';
				break;
			default:
				ctx.fillStyle = '#bfc7d5';
		}
		ctx.font = '14px Segoe UI, Arial, sans-serif';
		ctx.textAlign = this.getLabelAlign() === 'left' ? 'left' : 'right';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.label, this.position.x + (this.getLabelAlign() === 'left' ? 16 : -16), this.position.y);
	}
}