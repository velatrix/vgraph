//


import {VGraphOutput} from "./VGraphOutput.js";
import {VGraphInput} from "./VGraphInput.js";

export type VGraphIOHit =
	| { type: 'input'; io: VGraphInput; index: number }
	| { type: 'output'; io: VGraphOutput; index: number };