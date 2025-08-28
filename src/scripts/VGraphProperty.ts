import {Vector2} from "./Utils.js";
import type {VGraphNode} from "./VGraphNode.js";

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

	protected constructor(label: string, value: T) {
		this.label = label;
		this.#value = value;
		this.position = new Vector2(0, 0);
	}

	set value(v: T) {
		this.#value = v;
		this.onChange?.(this);
	}

	get value(): T {
		return this.#value;
	}

	// Each field type defines how it looks
	abstract draw(ctx: CanvasRenderingContext2D): void;

	abstract click(): void;
}
