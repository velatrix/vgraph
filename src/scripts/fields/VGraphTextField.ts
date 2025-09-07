import {VGraphProperty} from "../VGraphProperty.js";

export class VGraphTextProperty extends VGraphProperty<string> {

	constructor(label: string, value: string) {
		super(label, value);
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
