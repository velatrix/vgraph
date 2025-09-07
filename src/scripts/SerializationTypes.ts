//


export type SerializedVGraphNode = {
	id: number;
	type: string;
	title: string;
	position: { x: number; y: number };
	size: { width: number; height: number };

	inputs: SerializedVGraphIO[];
	outputs: SerializedVGraphIO[];
	/*properties: { id: number; type: string; value: any }[];*/

	metaData: any;
	theme: {
		nodeColor: string;
		borderColor: string;
		selectedBorderColor: string;
		cornerRadius: number;
		titleBarColor: string;
		titleTextColor: string;
		titleBarHeight: number;
		ioSpacing: number;
	}
}

export type SerializedVGraphIO = {
	id: number;
	label: string;
	type: string;
}

export type SerializedVGraphConnection = {
	from: {
		node: number;
		io: number;
	},
	to: {
		node: number;
		io: number;
	}
}

export type SerializedVGraph = {
	nodes: SerializedVGraphNode[];
	connections: SerializedVGraphConnection[];
};
