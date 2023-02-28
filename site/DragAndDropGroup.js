// TODO: Show text in cursor.

// TODO: Make this a little more general. In particular,
//	change pid, wid, bid to something else: id/index,
//	source/from/start, target/sink/to/end.

// TODO: Make it robust when data- attributes are missing
//	or aren't correctly set. Shouldn't matter because we
//	generate the svg procedurally.

// TODO: When we drag a solo, unconnected circle (i.e. when
//	the hook element is triggered) the arrowhead is pushed
//	outside the circle. This is ugly.

// TODO: In the absence of svg styles, initialize with sensible
//	defaults (based, perhaps, on the general page style?).
//	In the presence of some styles, derive the missing ones
//	from what is given. We need a way to get the rendered/
//	computed styles and not just a huge array of mostly
//	nulls. How does jQuery do it?

// TODO: Make the link overlap the hover. Best way would be to
//	create clones of the hover and the hook, make the originals
//	invisible, then layer the temporary objects like so: cursor over
//	hook over link over hover. But the easiest way might be to
//	store the hover's fill and make it transparent.

// TODO: Emulate a mouse capture by adding this listener
//	from within (a successful) mousedown event, removing
//	it from within mouseup after it is handled. Alternatively,
//	use addEventListener's third "options" argument for that.

class Element
{
	constructor(element, parent = undefined)
	{
		this.element = element;
		if (parent) this.parent = parent;
		else if (element) this.parent = element.parentNode;
		this._shown = 0;
	}

	cadd(s) { this.element.classList.add(s); }

	sset(k, s) { this.element.style[k] = s; }

	get shown() { return this._shown > 0; }

	get hidden() { return this._shown < 0; }

	equals(other) { return other && other.element == this.element; }

	hide()
	{
		console.assert(this._shown >= 0, "already hidden");
		if (this._shown < 0) return false;
		--this._shown;
		this.parent.removeChild(this.element);
		return true;
	}

	show(append = true)
	{
		// TODO: Calling show(false) looks like we are
		//	hiding something!
		
		console.assert(this._shown <= 0, "already shown");
		if (this._shown > 0) return false;
		++this._shown;
		if (append) this.parent.append(this.element);
		else this.parent.prepend(this.element);
		return true;
	}
}

class Line extends Element
{
	constructor(element, ...rest)
	{
		if (!Line.isValid(element)) throw new Error("not a line");
		super(element, ...rest);
		this.wid = parseInt(element.getAttribute("data-wid"));
		this.bid = parseInt(element.getAttribute("data-bid"));
	}

	get x1() { return parseInt(this.element.getAttribute("x1")); }

	get y1() { return parseInt(this.element.getAttribute("y1")); }

	get x2() { return parseInt(this.element.getAttribute("x2")); }

	get y2() { return parseInt(this.element.getAttribute("y2")); }

	set x1(n) { this.element.setAttribute("x1", n); }

	set y1(n) { this.element.setAttribute("y1", n); }

	set x2(n) { this.element.setAttribute("x2", n); }

	set y2(n) { this.element.setAttribute("y2", n); }

	show() { super.show(false); }

	other(pid)
	{
		if (pid == this.wid) return this.bid;
		if (pid == this.bid) return this.wid;
		return undefined;
	}

	static create(svg)
	{
		return new Line(document.createElementNS(svg.namespaceURI, "line"), svg);
	}

	static isValid(element)
	{
		return element && element.nodeName == "line";
	}

	static find(parent, pid)
	{
		if (pid == undefined) return undefined;
		const lines = parent.querySelectorAll("line");
		for (const line of lines)
		{
			const wid = line.getAttribute("data-wid");
			const bid = line.getAttribute("data-bid");
			if (wid == pid || bid == pid) return new Line(line);
		}
		return undefined;
	}
}

class Circle extends Element
{
	constructor(element, ...rest)
	{
		if (!Circle.isValid(element)) throw new Error("not a circle");
		super(element, ...rest);
		this.pid = Circle.getPid(element);
		this.text = Circle.findText(this.parent, this.pid);
		this.line = Line.find(this.parent, this.pid);
		this.oid = this.line && this.line.other(this.pid);
		this.white = this.line && this.line.wid == this.pid;
		this._other = null;
	}

	get r() {return parseInt(this.element.getAttribute("r")); }

	get x() { return parseInt(this.element.getAttribute("cx")); }

	get y() { return parseInt(this.element.getAttribute("cy")); }

	set r(n) { this.element.setAttribute("r", n); }

	set x(n) { this.element.setAttribute("cx", n); }

	set y(n) { this.element.setAttribute("cy", n); }

	get other()
	{
		if (this._other === undefined) return undefined;
		if (this._other === null)
		{
			if (this.oid == undefined) this._other = undefined;
			else this._other = Circle.find(this.parent, this.oid);
		}
		return this._other;
	}

	hide()
	{
		super.hide();
		if (this.text) this.parent.removeChild(this.text);
		if (this.line) this.line.hide();
	}

	show()
	{
		if (this.line) this.line.show();
		super.show();
		if (this.text) this.parent.append(this.text);
	}

	static create(svg)
	{
		return new Circle(document.createElementNS(svg.namespaceURI, "circle"), svg);
	}

	static isValid(element) { return element && element.nodeName == "circle"; }

	static getPid(element)
	{
		const pid = element.getAttribute("data-pid");
		return pid && parseInt(pid);
	}

	static find(parent, pid)
	{
		if (pid == undefined) return undefined;
		const circles = parent.querySelectorAll("circle");
		for (const circle of circles)
		{
			const oid = Circle.getPid(circle);
			if (oid == pid) return new Circle(circle);
		}
		return undefined;
	}

	static findText(parent, pid)
	{
		if (pid == undefined) return undefined;
		
		// TODO: This is rather presumptious. Perhaps add a
		// data-for attribute to texts?
		
		const texts = parent.querySelectorAll("text");
		for (const text of texts)
			if (text.textContent == pid)
				return text;
		return undefined;
	}
}

export class DragAndDropGroup
{
	constructor(svg = undefined)
	{
		this.svg = undefined;
		
		this.temp = {
			cursor: undefined,
			hook: undefined,
			ghost: undefined,
			link: undefined,
			trace: undefined,
			linkMarker: undefined,
			traceMarker: undefined
		};
		
		this.dragged = undefined;
		this.hook = undefined;
		
		this.hoveredRadius = undefined;
		this.hit = undefined;
		this.hovered = undefined;
		
		this.onMouseMoveListener = undefined;
		this.onMouseDownListener = undefined;
		this.onMouseUpListener = undefined;
		
		if (svg) this.attach(svg);
	}

	onDrop(source, target)
	{
		// console.log("dropped", { source, target });
	}

	onDragStart(e)
	{
		// console.log(e);
		
		this.dragged = new Circle(e.target);
		this.dragged.hide();
		
		this.hit = this.svg.getBoundingClientRect();
		
		this.temp.cursor.x = e.x - this.hit.x;
		this.temp.cursor.y = e.y - this.hit.y;
		this.temp.cursor.show();
		
		if (this.dragged.other)
			this.hook = this.dragged.other;
		else
		{
			this.hook = this.temp.hook;
			this.hook.x = this.dragged.x;
			this.hook.y = this.dragged.y;
			this.hook.show(false);
		}
		
		this.temp.link.x1 = this.hook.x;
		this.temp.link.y1 = this.hook.y;
		this.temp.link.x2 = this.temp.cursor.x;
		this.temp.link.y2 = this.temp.cursor.y;
		this.temp.link.show();
	}

	onDragStop(e)
	{
		// TODO: Move all the important/implicit x=undefined to onMouseUp?
		//	Think about subclasses and minimizing their assumptions more.
		
		const source = this.dragged.element;
		const target = this.hovered && this.hovered.element;
		
		this.temp.cursor.hide();
		this.temp.link.hide();
		this.dragged.show();
		
		if (this.hook == this.temp.hook)
			this.hook.hide();
		
		this.dragged = undefined;
		this.hit = undefined;
		this.hook = undefined;
		
		if (target) this.onDrop(source, target);
	}

	onDragMove(e)
	{
		this.temp.cursor.x = e.x - this.hit.x;
		this.temp.cursor.y = e.y - this.hit.y;
		if (this.hook)
		{
			this.temp.link.x1 = this.hook.x;
			this.temp.link.y1 = this.hook.y;
			this.temp.link.x2 = this.temp.cursor.x;
			this.temp.link.y2 = this.temp.cursor.y;
		}
	}

	onHoverEnter(e)
	{
		this.hovered = new Circle(e.target);
		this.hoveredRadius = this.hovered.r;
		this.hovered.r = 30;
		this.showGhost();
	}

	onHoverLeave(e)
	{
		this.hovered.r = this.hoveredRadius;
		this.hideGhost();
		this.hoveredRadius = undefined;
		this.hovered = undefined;
	}

	onMouseMove(e)
	{
		if (!this.dragged) return;
		this.onDragMove(e);
		if (this.hovered)
		{
			if (this.hovered.element != e.target)
				this.onHoverLeave(e);
		}
		else if (this.isHoverable(e.target))
			this.onHoverEnter(e);
	}

	onMouseDown(e)
	{
		if (this.isDraggable(e.target))
			this.onDragStart(e);
	}

	onMouseUp(e)
	{
		if (this.dragged) this.onDragStop(e);
		if (this.hovered) this.onHoverLeave(e);
	}

	createMarkers()
	{
		const marker = this.svg.getElementById("end");
		if (!marker) return;
		
		this.temp.linkMarker = marker.cloneNode(true);
		this.temp.linkMarker.id = "end-link";
		this.temp.linkMarker.classList.add("hook");
		marker.parentNode.append(this.temp.linkMarker);
		
		this.temp.traceMarker = marker.cloneNode(true);
		this.temp.traceMarker.id = "end-trace";
		this.temp.traceMarker.classList.add("ghost");
		marker.parentNode.append(this.temp.traceMarker);
	}

	attach(svg)
	{
		this.svg = svg;
		
		this.createMarkers();
		
		this.temp.cursor = Circle.create(this.svg);
		this.temp.cursor.r = 18;
		this.temp.cursor.sset("pointer-events", "none");
		this.temp.cursor.cadd("cursor");
		
		this.temp.hook = Circle.create(this.svg);
		this.temp.hook.r = 3;
		this.temp.hook.sset("pointer-events", "none");
		this.temp.hook.cadd("hook");
		
		this.temp.link = Line.create(this.svg);
		this.temp.link.sset("marker-end", "url(#end-link)");
		this.temp.link.sset("pointer-events", "none");
		this.temp.link.cadd("link");
		
		this.temp.ghost = Circle.create(svg);
		this.temp.ghost.r = 18;
		this.temp.ghost.sset("pointer-events", "none");
		this.temp.ghost.cadd("ghost");
		
		this.temp.trace = Line.create(svg);
		this.temp.trace.sset("marker-end", "url(#end-trace)");
		this.temp.trace.sset("pointer-events", "none");
		this.temp.trace.cadd("trace");
		
		// TODO: Use Function.prototype.bind instead ?
		
		this.onMouseMoveListener = e => { this.onMouseMove(e) };
		document.addEventListener("mousemove", this.onMouseMoveListener);
		
		this.onMouseDownListener = e => { this.onMouseDown(e) };
		this.svg.addEventListener("mousedown", this.onMouseDownListener);
		
		this.onMouseUpListener = e => { this.onMouseUp(e) };
		document.addEventListener("mouseup", this.onMouseUpListener);
	}

	detach()
	{
		if (!this.svg) return;
		
		// TODO: Destroy the temps.
		
		document.removeEventListener("mousemove", this.onMouseMoveListener);
		this.onMouseMoveListener = undefined;
		
		this.svg.removeEventListener("mousedown", this.onMouseDownListener);
		this.onMouseDownListener = undefined;
		
		this.svg.removeEventListener("mouseup", this.onMouseUpListener);
		this.onMouseUpListener = undefined;
		
		this.svg = undefined;
	}

	showGhost()
	{
		if (!this.dragged) return;
		if (!this.hovered) return;
		if (!this.hovered.other) return;
		if (this.dragged.other && this.hovered.equals(this.dragged.other)) return;
		
		this.temp.ghost.x = this.dragged.x;
		this.temp.ghost.y = this.dragged.y;
		this.temp.ghost.show();
		
		if (this.hovered.line) this.hovered.line.hide();
		
		if (this.hook == this.temp.hook) return;
		if (!this.hovered.other) return;
		if (!this.hovered.line) return;
		
		if (this.hovered.line.wid == this.hovered.pid)
		{
			this.temp.trace.x1 = this.temp.ghost.x;
			this.temp.trace.y1 = this.temp.ghost.y;
			this.temp.trace.x2 = this.hovered.other.x;
			this.temp.trace.y2 = this.hovered.other.y;
		}
		else
		{
			this.temp.trace.x1 = this.hovered.other.x;
			this.temp.trace.y1 = this.hovered.other.y;
			this.temp.trace.x2 = this.temp.ghost.x;
			this.temp.trace.y2 = this.temp.ghost.y;
		}
		this.temp.trace.show();
	}

	hideGhost()
	{
		if (!this.hovered) return;
		if (this.hovered.line && this.hovered.line.hidden)
			this.hovered.line.show();
		if (this.temp.ghost.shown) this.temp.ghost.hide();
		if (this.temp.trace.shown) this.temp.trace.hide();
	}

	isDraggable(target)
	{
		if (this.dragged != undefined) return false;
		return target.nodeName == "circle";
	}

	isHoverable(target)
	{
		if (this.dragged == undefined) return false;
		if (this.dragged.parent != target.parentNode) return false;
		return target.nodeName == "circle";
	}
}