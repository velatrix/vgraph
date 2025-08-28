//


export class VGraphIdGenerator {
	index = 0;

	constructor(startIndex: number = 0) {
		this.index = startIndex;
	}

	next() : number {
		return this.index++;
	}

}