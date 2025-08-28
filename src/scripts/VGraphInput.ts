import {Vector2} from "./Utils.js";
import {VGraphOutput} from "./VGraphOutput.js";
import {VGraphIO} from "./VGraphIO.js";
import type {VGraphNode} from "./VGraphNode.js";

export class VGraphInput extends VGraphIO {
	connection: VGraphOutput | null; // Single connection to an output

	constructor(id: number, label: string, type: string, position: Vector2, node: VGraphNode) {
		super(id, label, type, position, node);
		this.connection = null;
	}


	hasConnection(): boolean {
		return this.connection !== null;
	}

	isConnected(): boolean {
		return this.connection !== null;
	}

	getLabelAlign(): "left" | "right" {
		return "left";
	}
}