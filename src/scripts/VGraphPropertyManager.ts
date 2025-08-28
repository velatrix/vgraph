//


import type {VGraphProperty} from "./VGraphProperty.js";
import {VGraphNode} from "./VGraphNode.js";

type PropertyConstructor<T extends VGraphProperty<any> = VGraphProperty<any>> =
	new (label: string, value: any) => T;

export class VGraphPropertyManager {
	static #properties = new Map<string, PropertyConstructor>();

	static registerProperty<T extends VGraphProperty<any>>(
		name: string,
		PropertyClass: PropertyConstructor<T>
	) {
		this.#properties.set(name, PropertyClass);
	}

	static getProperty(name: string): PropertyConstructor {
		const prop = this.#properties.get(name);
		if (!prop) {
			throw new Error(`Property ${name} not registered`);
		}
		return prop;
	}
}