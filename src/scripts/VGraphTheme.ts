//

export type VGraphNodeTheme = {
	backgroundColor: string,
	borderColor: string,
	borderSelectedColor: string,
	cornerRadius: number,
	title: {
		backgroundColor: string,
		textColor: string,
		height: number
	},
	property: {
		backgroundColor: string,
		borderColor: string,
		labelTextColor: string,
		labelTextFont: string,
		valueTextColor: string,
		valueTextFont: string
	}
}

export type VGraphTheme = {
	grid: {
		backgroundColor: string,
		size: number,
		lineColor: string,
		lineWidth: number
	},
	node: VGraphNodeTheme,
	connection: {
		color: string,
		width: number
	},
	io: {
		spacing: number,
		text: {
			color: {
				default: string,
				hover: string,
				disabled: string
			},
			font: string
		},
		dot: {
			color: {
				default: string,
				hover: string,
				disabled: string
			}
		}
	}
	connections: Map<string, string>
}

const defaultTheme: VGraphTheme = {
	grid: {
		backgroundColor: '#202b3c',
		size: 24,
		lineColor: 'rgba(255,255,255,0.04)',
		lineWidth: 1,
	},
	node: {
		backgroundColor: '#1b202c',
		borderColor: '#263238',
		borderSelectedColor: '#e1904c',
		cornerRadius: 16,
		title: {
			backgroundColor: '#161b25',
			textColor: '#6e7784',
			height: 32
		},
		property: {
			backgroundColor: '#323C58',
			borderColor: '#4A5568',
			labelTextColor: '#b0bec5',
			labelTextFont: '13px Segoe UI, Arial, sans-serif',
			valueTextColor: '#eceff1',
			valueTextFont: '13px Segoe UI, Arial, sans-serif'
		}
	},
	io: {
		spacing: 24,
		text: {
			color: {
				default: '#bfc7d5',
				hover: '#ffffff',
				disabled: '#4c5055'
			},
			font: '14px Segoe UI, Arial, sans-serif'
		},
		dot: {
			color: {
				default: '#455A64',
				hover: '#ffffff',
				disabled: '#4c5055'
			}
		}
	},
	connection: {
		color: '#6e7784',
		width: 2,
	},
	connections: new Map<string, string>()
}

export class VGraphThemeManager {

	static themes = new Map<string, VGraphTheme>();

	static getDefault(): VGraphTheme {
		return structuredClone(defaultTheme);
	}

	static getNodeDefault(): VGraphNodeTheme {
		return structuredClone(defaultTheme.node);
	}

	static addTheme(name: string, theme: VGraphTheme) {
		if (VGraphThemeManager.themes.has(name)) {
			console.warn(`Theme "${name}" already exists. Overwriting.`);
		}
		VGraphThemeManager.themes.set(name, theme);
	}

	static getTheme(name: string): VGraphTheme | undefined {
		if (VGraphThemeManager.themes.has(name)) {
			return VGraphThemeManager.themes.get(name);
		} else {
			throw new Error('Cannot find theme: ' + name);
		}
	}

	static setThemeValues(name: string, values: Partial<VGraphTheme>): void {
		if (this.themes.has(name)) {
			const theme = this.themes.get(name);
			this.themes.set(name, {
				...theme!,
				...values,
			});
		} else {
			throw new Error(`Theme "${name}" does not exist.`);
		}
	}


}