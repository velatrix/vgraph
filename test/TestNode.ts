//


import {VGraphNode} from "../src/scripts/VGraphNode.js";
import {Vector2} from "../src/scripts/Utils.js";

export class TestNode extends VGraphNode {

	constructor() {
		super();
		this.position = new Vector2(100, 100);
		this.addInput('Step In', 'flow');
		this.addOutput('Step Out', 'flow');

		this.addProperty('text', 'Label', 'Hello world!');
		this.addProperty('text', 'Label', 'Hello world!');
	}
}