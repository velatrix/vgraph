//


import type {Vector2} from "./Utils.js";
import type {VGraphInput} from "./VGraphInput.js";
import {VGraphIO} from "./VGraphIO.js";
import type {VGraphNode} from "./VGraphNode.js";
import type {SerializedVGraphIO} from "./SerializationTypes.js";

export class VGraphOutput extends VGraphIO {
	connections: VGraphInput[]; // Connected inputs

	constructor(id: number, label: string, type: string, position: Vector2, node: VGraphNode) {
		super(id, label, type, position, node);
		this.connections = [];
	}

	connect(input: VGraphInput) {
		this.connections.push(input);
		input.connection = this;
	}

	disconnect(input: VGraphInput) {
		const index = this.connections.indexOf(input);
		if (index !== -1) {
			input.connection = null;
			this.connections.splice(index, 1);
		}
	}

	isConnected(): boolean {
		return this.connections.length > 0;
	}

	getLabelAlign(): "left" | "right" {
		return "right";
	}

}