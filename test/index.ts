//

import '../src/assets/main.scss';
import {VGraph} from '../src/scripts/VGraph.js';
import {VGraphNode} from "../src/scripts/VGraphNode.js";
import {Vector2} from "../src/scripts/Utils.js";
import {TestNode} from "./TestNode.js";
import {VGraphPropertyManager} from "../src/scripts/VGraphPropertyManager.js";
import {VGraphTextProperty} from "../src/scripts/fields/VGraphTextField.js";

const canvas = document.getElementById('graph-area');

if (canvas) {
	const graph = new VGraph(canvas as HTMLCanvasElement);
	graph.theme.connections.set('flow', '#687FE5');

	VGraphPropertyManager.registerProperty('text', VGraphTextProperty);


	graph.registerNode('base', VGraphNode);
	graph.registerNode('test', TestNode);



	const node1 = graph.createNode('test');
	node1.position = Vector2.from(600, 300);
	node1.size = Vector2.from(300, 200);
	// node1.nodeColor = '#ff0000';
	// node1.borderColor = '#ff0000';

	const node2 = graph.createNode('test');
	node2.position = Vector2.from(1000, 100);

	const node3 = graph.createNode('test');
	node3.position = Vector2.from(1000, 500);

	node1.getOutput(0).connect(node2.getInput(0));
	node1.getOutput(0).connect(node3.getInput(0));

	graph.draw();


}