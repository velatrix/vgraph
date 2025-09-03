//


import {VGraphNode} from "./VGraphNode.js";
import {Vector2, VGraphDrawing} from "./Utils.js";
import type {VGraphIOHit} from "./VGraphTypes.js";
import {VGraphInput} from "./VGraphInput.js";
import {VGraphOutput} from "./VGraphOutput.js";
import {VGraphThemeManager} from "./VGraphTheme.js";
import {VGraphIdGenerator} from "./VGraphIdGenerator.js";
import type {VGraphProperty} from "./VGraphProperty.js";

export class VGraph {
	private idGen = new VGraphIdGenerator();
	private canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private readonly dpr: number;
	private nodes: VGraphNode[] = [];

	public theme = VGraphThemeManager.getDefault();
	private nodeRegistry = new Map<string, typeof VGraphNode>();

	//Helpers
	private selectedNode: VGraphNode | null = null;
	private actionNode: VGraphNode | null = null;
	private actionStart: Vector2 = new Vector2(0, 0);
	private action: 'move' | 'resize' | 'connect' | null = null;
	private moveOffset = new Vector2(0, 0);
	private mouseDownIOHit: VGraphIOHit | null = null;
	private lastMoveIOHit: VGraphIOHit | null = null;
	private lastMoveFieldHit: VGraphProperty<any> | null = null;
	private connectionLinePreviewPoint: Vector2 | null = null

	private isPanning = false;
	private lastMouseClientPosition = Vector2.zero();
	private camera = {
		position: Vector2.zero(),
		scale: 1
	}

	public hoverNodeProperties = false;

	#needsDraw = false;

	constructor(canvasElement: HTMLCanvasElement) {
		if (!(canvasElement instanceof HTMLCanvasElement)) {
			throw new Error("VGraph constructor expects a HTMLCanvasElement");
		}
		this.canvas = canvasElement;
		const ctx = this.canvas.getContext('2d');
		if (!ctx) throw new Error('Failed to get 2D context from canvas');
		this.ctx = ctx;
		this.dpr = window.devicePixelRatio || 1;

		this.resize();
		window.addEventListener('resize', () => this.resize());
		this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
		this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
		window.addEventListener('mouseup', this.onMouseUp.bind(this));
		this.canvas.addEventListener("wheel", (e) => this.onMouseWheel(e), { passive: false });
	}

	public clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	public draw() {
		this.clear();
		this.ctx.save();

		this.ctx.translate(this.camera.position.x, this.camera.position.y);
		this.ctx.scale(this.camera.scale, this.camera.scale);

		this.drawGrid();

		for (const node of this.nodes) {
			node.drawConnections(this.ctx);
		}
		for (const node of this.nodes) {
			node.draw(this.ctx);
		}
		for (const node of this.nodes) {
			node.drawConnectionCircles(this.ctx);
		}
		if (this.connectionLinePreviewPoint) {
			this.drawConnectionLine(this.connectionLinePreviewPoint);
		}
		this.ctx.restore();
	}

	public registerNode<T extends typeof VGraphNode>(path: string, NodeClass: T) {
		this.nodeRegistry.set(path, NodeClass);
	}

	public unregisterNode(id: string): boolean {
		return this.nodeRegistry.delete(id);
	}

	public createNode<T extends VGraphNode>(type: string): T {
		const NodeClass = this.nodeRegistry.get(type);
		if (!NodeClass) throw new Error(`Unknown node type '${type}'`);

		const node = new NodeClass() as T;
		node.id = this.idGen.next();
		node.type = type;
		node.graph = this;
		node.events.addEventListener("property:changed", () => this.requestDraw());
		node.setTheme(this.theme);

		this.nodes.push(node);

		return node;
	}

	private requestDraw() {
		if (!this.#needsDraw) {
			this.#needsDraw = true;
			requestAnimationFrame(() => {
				this.#needsDraw = false;
				this.draw();
			});
		}
	}

	private resize() {
		const {canvas, dpr} = this;
		const width = window.innerWidth;
		const height = window.innerHeight;

		canvas.width = width * dpr;
		canvas.height = height * dpr;

		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';

		this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
		this.ctx.scale(dpr, dpr);
		this.draw();
	}

	private drawGrid() {
		const ctx = this.ctx;

		// --- 1) clear background in screen space (no transforms)
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = this.theme.grid.backgroundColor;
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// viewport size in CSS px
		const viewW = this.canvas.width  / this.dpr;
		const viewH = this.canvas.height / this.dpr;

		// --- 2) compute visible world rect using your camera
		const topLeftWorld     = this.screenToWorld(new Vector2(0, 0));
		const bottomRightWorld = this.screenToWorld(new Vector2(viewW, viewH));

		const worldLeft   = topLeftWorld.x;
		const worldTop    = topLeftWorld.y;
		const worldRight  = bottomRightWorld.x;
		const worldBottom = bottomRightWorld.y;

		// snap starts to exact multiples of grid size
		const spacing = this.theme.grid.size;
		const startX = Math.floor(worldLeft  / spacing) * spacing;
		const startY = Math.floor(worldTop   / spacing) * spacing;

		// --- 3) apply ONE world transform (camera + dpr) and draw in world units
		ctx.setTransform(
			this.camera.scale * this.dpr, 0,
			0, this.camera.scale * this.dpr,
			this.camera.position.x * this.camera.scale * this.dpr,
			this.camera.position.y * this.camera.scale * this.dpr
		);

		ctx.strokeStyle = this.theme.grid.lineColor;
		// keep line thickness visually constant as you zoom
		ctx.lineWidth = this.theme.grid.lineWidth / this.camera.scale;

		// draw vertical lines across the visible world rect
		for (let x = startX; x <= worldRight; x += spacing) {
			ctx.beginPath();
			ctx.moveTo(x, worldTop);
			ctx.lineTo(x, worldBottom);
			ctx.stroke();
		}

		// draw horizontal lines across the visible world rect
		for (let y = startY; y <= worldBottom; y += spacing) {
			ctx.beginPath();
			ctx.moveTo(worldLeft, y);
			ctx.lineTo(worldRight, y);
			ctx.stroke();
		}
	}

	private drawConnectionLine(mousePoint: Vector2) {
		if (this.mouseDownIOHit) {
			let from = this.mouseDownIOHit.io.position;
			VGraphDrawing.drawLine(this.ctx, from, mousePoint);
		}

	}

	private disableIrrelevantIOs() {
		for (const input of this.mouseDownIOHit?.io.node.inputs || []) {
			input.state = 'disabled';
		}

		for (const node of this.nodes) {
			if (this.mouseDownIOHit && node !== this.mouseDownIOHit.io.node) {
				let hitIO = this.mouseDownIOHit.io
				for (const input of node.inputs) {
					if (hitIO instanceof VGraphOutput && input.type === hitIO.type) {
						input.state = 'target';
					} else {
						input.state = 'disabled';
					}
				}
				for (const output of node.outputs) {
					if (hitIO instanceof VGraphInput && output.type === hitIO.type) {
						output.state = 'target';
					} else {
						output.state = 'disabled';
					}
				}
			}
		}
	}

	private clearIOStates() {
		for (const node of this.nodes) {
			for (const input of node.inputs) {
				input.state = 'idle';
			}
			for (const output of node.outputs) {
				output.state = 'idle';
			}
		}
	}

	// Mouse event handlers

	private onMouseDown(e: MouseEvent) {
		const rect = this.canvas.getBoundingClientRect();
		// const point = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
		const screen = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
		const point = this.screenToWorld(screen);
		this.actionStart = point.clone();
		this.lastMouseClientPosition.set(e.clientX, e.clientY);

		for (let node of this.nodes) {
			this.mouseDownIOHit = node.containsIOPoint(point)
			if (this.mouseDownIOHit) {
				if (this.mouseDownIOHit.io instanceof VGraphInput && this.mouseDownIOHit.io.connection) {
					this.mouseDownIOHit.io.connection.disconnect(this.mouseDownIOHit.io)
				}
				this.actionNode = node;
				this.action = 'connect';
				this.disableIrrelevantIOs();
				return;
			} else if (node.isOverResizeHandle(point)) {
				this.actionNode = node;
				this.action = 'resize';
				return;
			}
			if (node.containsPoint(point)) {
				this.actionNode = node;
				this.moveOffset.set(
					point.x - node.position.x,
					point.y - node.position.y
				);
				this.action = 'move';
				this.bringToFront(node);
				return;
			}
		}
		this.isPanning = true;
	}

	private onMouseMove(e: MouseEvent) {
		const rect = this.canvas.getBoundingClientRect();
		const screen = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
		const point = this.screenToWorld(screen);

		if (this.isPanning) {
			this.camera.position.x += (e.clientX - this.lastMouseClientPosition.x) / this.camera.scale;
			this.camera.position.y += (e.clientY - this.lastMouseClientPosition.y) / this.camera.scale;

			this.lastMouseClientPosition.set(e.clientX, e.clientY);
			this.requestDraw();
			return;
		}

		if (this.action === 'move' && this.actionNode) {
			const newX = point.x - this.moveOffset.x;
			const newY = point.y - this.moveOffset.y;
			this.actionNode.move(newX, newY);
			this.requestDraw();
		} else if (this.action === 'resize' && this.actionNode) {
			const newWidth = this.actionNode.size.x + (point.x - this.actionStart.x);
			const newHeight = this.actionNode.size.y + (point.y - this.actionStart.y);
			this.actionNode.resize(newWidth, newHeight);
			this.actionStart = point.clone();
			this.requestDraw();
		} else {
			let cursor = 'default';
			let needsRedraw = false;
			let ioHit: VGraphIOHit | null = null;

			for (const node of this.nodes) {
				const hit = node.containsIOPoint(point);
				if (hit && hit.io.state !== 'disabled') {
					ioHit = hit;
					break;
				}

				if(this.hoverNodeProperties) {
					const prop = node.isOverProperty(point);
					if (this.lastMoveFieldHit) {
						this.lastMoveFieldHit.state = 'idle';
						this.lastMoveFieldHit = null;
						needsRedraw = true;
					}
					if (prop) {
						this.lastMoveFieldHit = prop;
						cursor = 'pointer';
						prop.state = 'hover';
						needsRedraw = true;
						break;
					}
				}

				if (node.isOverResizeHandle(point)) {
					cursor = 'nwse-resize';
				} else if (node.containsPoint(point)) {
					cursor = 'move';
				}
			}

			if (ioHit) {
				ioHit.io.state = 'hovering';
				if (this.lastMoveIOHit && this.lastMoveIOHit.io !== ioHit.io) {
					this.lastMoveIOHit.io.state = 'idle';
					needsRedraw = true;
				}
				this.lastMoveIOHit = ioHit;
				needsRedraw = true;
			} else if (this.lastMoveIOHit) {
				this.lastMoveIOHit.io.state = 'idle';
				this.lastMoveIOHit = null;
				needsRedraw = true;
			}

			this.canvas.style.cursor = cursor;

			if (this.action === 'connect') {
				this.connectionLinePreviewPoint = point;
				this.requestDraw();

			} else if (needsRedraw) {
				this.connectionLinePreviewPoint = null;
				this.requestDraw();
			}


		}
	}

	private onMouseUp(e: MouseEvent) {
		this.clearIOStates();
		const rect = this.canvas.getBoundingClientRect();
		// const upPoint = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
		const screen = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
		const upPoint = this.screenToWorld(screen);
		if (this.actionNode && this.action === 'move' && this.actionStart) {
			const dx = upPoint.x - this.actionStart.x;
			const dy = upPoint.y - this.actionStart.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// If mouse barely moved, treat as click/select
			if (distance < 4) {
				let prop = this.actionNode.isOverProperty(upPoint)
				if (prop) {
					prop.click();
				} else {
					for (const n of this.nodes) n.isSelected = false;
					this.actionNode.setSelection(true);
					this.selectedNode = this.actionNode;
					this.draw();
				}

			}
		} else if (this.actionNode && this.action === 'connect' && this.mouseDownIOHit) {
			const initialIo = this.mouseDownIOHit.io;
			for (const node of this.nodes) {
				const hit = node.containsIOPoint(upPoint);
				if (hit && hit.io.type === initialIo.type) {
					const hitIO = hit.io;
					if (hitIO instanceof VGraphInput && initialIo instanceof VGraphOutput && !hitIO.hasConnection()) {
						initialIo.connect(hitIO);

					} else if (hitIO instanceof VGraphOutput && initialIo instanceof VGraphInput && !initialIo.hasConnection()) {
						hitIO.connect(initialIo);
					}
					break;
				}
			}
			this.draw();
		} else if (!this.actionNode && this.selectedNode) {
			this.selectedNode.setSelection(false);
			this.draw();
		}

		this.action = null;
		this.actionNode = null;
		this.lastMoveIOHit = null;
		this.mouseDownIOHit = null;
		this.isPanning = false;
	}

	private onMouseWheel(e: WheelEvent) {
		e.preventDefault();

		const zoomFactor = 1.1;
		const oldScale = this.camera.scale;

		const rect = this.canvas.getBoundingClientRect();
		const screen = new Vector2(e.clientX - rect.left, e.clientY - rect.top);

		const worldBefore = this.screenToWorld(screen);

		if (e.deltaY < 0) {
			this.camera.scale *= zoomFactor;
		} else {
			this.camera.scale /= zoomFactor;
		}

		// clamp scale
		this.camera.scale = Math.max(0.1, Math.min(5, this.camera.scale));

		const worldAfter = this.screenToWorld(screen);

		this.camera.position.x += (worldBefore.x - worldAfter.x);
		this.camera.position.y += (worldBefore.y - worldAfter.y);

		this.requestDraw();
	}

	bringToFront(node: VGraphNode) {
		const index = this.nodes.indexOf(node);
		if (index > -1) {
			this.nodes.splice(index, 1);
			this.nodes.push(node); // Move to end of array
			this.draw();
		}
	}

	worldToScreen(world: Vector2): Vector2 {
		return new Vector2(
			(world.x + this.camera.position.x) * this.camera.scale,
			(world.y + this.camera.position.y) * this.camera.scale
		);
	}

	screenToWorld(screen: Vector2): Vector2 {
		return new Vector2(
			(screen.x / this.camera.scale) - this.camera.position.x,
			(screen.y / this.camera.scale) - this.camera.position.y
		);
	}

}