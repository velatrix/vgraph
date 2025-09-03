import {VGraphProperty} from "../VGraphProperty.js";
import {VGraphDrawing} from "../Utils.js";

export class VGraphTextProperty extends VGraphProperty<string> {

	constructor(label: string, value: string) {
		super(label, value);
	}

	/*draw(ctx: CanvasRenderingContext2D): void {
		ctx.save();

		const nodeWidth = this.node.size.x;
		const boxX = this.position.x + this.padding.x; // left
		const boxY = this.position.y + this.padding.y; // top
		const boxW = nodeWidth - (this.padding.x * 2); // full width minus horizontal padding
		const boxH = this.height;
		const radius = 8;

		// --- Background ---
		const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
		if (this.state === "idle") {
			// softer bluish background so it stands out from node
			gradient.addColorStop(0, "rgba(55,65,95,1)");
			gradient.addColorStop(1, "rgba(45,55,80,1)");
		} else if (this.state === "hover") {
			gradient.addColorStop(0, "rgba(65,85,120,1)");
			gradient.addColorStop(1, "rgba(50,65,100,1)");
		} else if (this.state === "active") {
			gradient.addColorStop(0, "rgba(70,60,40,1)");
			gradient.addColorStop(1, "rgba(90,70,50,1)");
		}

		VGraphDrawing.drawRoundedRect(ctx, boxX, boxY, boxW, boxH, radius);
		ctx.fillStyle = gradient;
		ctx.fill();

		// --- Border ---
		if (this.state === "idle") {
			ctx.strokeStyle = "rgba(255,255,255,0.08)";
			ctx.lineWidth = 1.2;
			ctx.stroke();
		} else if (this.state === "hover") {
			ctx.strokeStyle = "#3ea6ff";
			ctx.shadowColor = "#3ea6ff";
			ctx.shadowBlur = 6;
			ctx.lineWidth = 2;
			ctx.stroke();
		} else if (this.state === "active") {
			ctx.strokeStyle = "#e1904c";
			ctx.shadowColor = "#e1904c";
			ctx.shadowBlur = 8;
			ctx.lineWidth = 2;
			ctx.stroke();
		}

		// Reset shadow for text
		ctx.shadowBlur = 0;

		// --- Text ---
		const textY = boxY + boxH / 2;

		// Label (left)
		ctx.fillStyle = this.state === "idle" ? "rgba(200,220,255,0.7)" : "#ffffff";
		ctx.font = "13px 'Segoe UI', Arial, sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillText(this.label, boxX + 12, textY);

		// Divider line
		ctx.strokeStyle = "rgba(255,255,255,0.08)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(boxX + boxW * 0.35, boxY + 6);
		ctx.lineTo(boxX + boxW * 0.35, boxY + boxH - 6);
		ctx.stroke();

		// Value (right)
		ctx.fillStyle = this.state === "idle" ? "#f3f4f6" : "#ffffff";
		ctx.font = this.state === "active"
			? "bold 13px 'Segoe UI', Arial, sans-serif"
			: "13px 'Segoe UI', Arial, sans-serif";
		ctx.textAlign = "right";
		ctx.fillText(String(this.value), boxX + boxW - 12, textY);

		ctx.restore();
	}*/

	createEditor () {

	}

	click() {
		console.log('Text property clicked:', this);
	}


}

// Neon-style text property field
/*VGraphDrawing.drawRoundedRect(ctx, boxX, boxY, boxW, boxH, radius);
ctx.fillStyle = gradient;
ctx.fill();

// Neon border
ctx.strokeStyle = "#3ea6ff"; // cyan-blue glow
ctx.shadowColor = "#3ea6ff";
ctx.shadowBlur = 6;
ctx.lineWidth = 2;
ctx.stroke();

// Reset shadow for text
ctx.shadowBlur = 0;

// Vertical center
const textY = boxY + boxH / 2;

// Label (left, muted futuristic gray)
ctx.fillStyle = "#9ca8c4";
ctx.font = "13px 'Segoe UI', Arial, sans-serif";
ctx.textAlign = "left";
ctx.textBaseline = "middle";
ctx.fillText(this.label, boxX + 12, textY);

// Divider line
ctx.strokeStyle = "rgba(255,255,255,0.1)";
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(boxX + boxW / 2, boxY + 6);
ctx.lineTo(boxX + boxW / 2, boxY + boxH - 6);
ctx.stroke();

// Value (right, brighter color)
ctx.fillStyle = "#ffffff";
ctx.font = "bold 13px 'Segoe UI', Arial, sans-serif";
ctx.textAlign = "right";
ctx.fillText(String(this.value), boxX + boxW - 12, textY);*/
