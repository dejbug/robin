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

export class DragAndDropGroup
{
	constructor(svg = undefined)
	{
		this.svg = undefined;
		
		this.cursor = undefined;
		this.link = undefined;
		this.linkMarker = undefined;
		this.hook = undefined;
		this.ghost = undefined;
		this.trace = undefined;
		this.traceMarker = undefined;
		
		this.dragged = undefined;
		this.draggedParent = undefined;
		this.draggedLine = undefined;
		this.draggedLineParent = undefined;
		this.draggedLineHook = undefined;
		this.hoveredRadius = undefined;
		this.hoveredLine = undefined;
		this.hit = undefined;
		this.hovered = undefined;
		
		this.onMouseMoveListener = undefined;
		this.onMouseDownListener = undefined;
		this.onMouseUpListener = undefined;
		
		if (svg) this.attach(svg);
	}
	
	isValidTarget(target)
	{
		if (target.nodeName != "circle") return false;
		if (this.draggedParent && this.draggedParent != target.parentNode) return false;
		return true;
	}
	
	onDrop(source, target)
	{
		// console.log("dropped", { source, target });
	}
	
	onDragStart(e)
	{
		this.hit = this.svg.getBoundingClientRect();
		this.dragged = e.target;
		this.draggedParent = this.dragged.parentNode;
		this.draggedParent.removeChild(this.dragged);
		
		this.cursor.setAttribute("cx", e.x - this.hit.x);
		this.cursor.setAttribute("cy", e.y - this.hit.y);
		this.svg.appendChild(this.cursor);
		
		const pid = this.dragged.getAttribute("data-pid");
		const lines = this.svg.querySelectorAll("line");
		for (const line of lines)
		{
			const wid = line.getAttribute("data-wid");
			const bid = line.getAttribute("data-bid");
			if (wid != pid && bid != pid) continue;
			this.draggedLine = line;
			this.draggedLineParent = this.draggedLine.parentNode;
			this.draggedLineParent.removeChild(this.draggedLine);
			
			this.draggedLineHook = undefined;
			const circles = this.svg.querySelectorAll("circle");
			for (const circle of circles)
			{
				const oid = circle.getAttribute("data-pid");
				if (oid == pid || oid != wid && oid != bid) continue;
				this.draggedLineHook = circle;
				break;
			}
			break;
		}
		
		if (!this.draggedLineHook)
		{
			this.draggedLineHook = this.hook;
			this.svg.prepend(this.draggedLineHook);
			this.hook.setAttribute("cx", this.cursor.getAttribute("cx"));
			this.hook.setAttribute("cy", this.cursor.getAttribute("cy"));
		}
		
		this.link.setAttribute("x1", this.draggedLineHook.getAttribute("cx"));
		this.link.setAttribute("y1", this.draggedLineHook.getAttribute("cy"));
		this.link.setAttribute("x2", this.cursor.getAttribute("cx"));
		this.link.setAttribute("y2", this.cursor.getAttribute("cy"));
		this.svg.prepend(this.link);
	}
	
	onDragStop(e)
	{
		// TODO: Move all the important/implicit x=undefined to onMouseUp?
		//	Think about subclasses and minimizing their assumptions more.
		
		const source = this.dragged;
		const target = this.hovered;
		
		this.svg.removeChild(this.cursor);
		this.svg.removeChild(this.link);
		this.draggedParent.appendChild(this.dragged);
		this.dragged = undefined;
		this.draggedParent = undefined;
		this.hit = undefined;
		if (this.draggedLineParent)
			this.draggedLineParent.prepend(this.draggedLine);
		if (this.draggedLineHook == this.hook)
			this.svg.removeChild(this.hook);
		this.draggedLine = undefined;
		this.draggedLineParent = undefined;
		this.draggedLineHook = undefined;
		
		if (target) this.onDrop(source, target);
	}
	
	onDragMove(e)
	{
		this.cursor.setAttribute("cx", e.x - this.hit.x);
		this.cursor.setAttribute("cy", e.y - this.hit.y);
		if (this.draggedLineHook)
		{
			this.link.setAttribute("x1", this.draggedLineHook.getAttribute("cx"));
			this.link.setAttribute("y1", this.draggedLineHook.getAttribute("cy"));
			this.link.setAttribute("x2", this.cursor.getAttribute("cx"));
			this.link.setAttribute("y2", this.cursor.getAttribute("cy"));
		}
	}
	
	onHoverEnter(e)
	{
		this.hovered = e.target;
		this.hoveredRadius = this.hovered.getAttribute("r");
		this.hovered.setAttribute("r", "30");
		this.showGhost();
	}
	
	onHoverLeave(e)
	{
		this.hovered.setAttribute("r", this.hoveredRadius);
		this.hoveredRadius = undefined;
		this.hovered = undefined;
		this.hideGhost();
	}
	
	onMouseMove(e)
	{
		if (!this.dragged) return;
		this.onDragMove(e);
		if (this.hovered)
		{
			if (this.hovered != e.target)
				this.onHoverLeave(e);
		}
		else if (this.isValidTarget(e.target))
			this.onHoverEnter(e);
	}
	
	onMouseDown(e)
	{
		if (this.isValidTarget(e.target))
			this.onDragStart(e);
	}
	
	onMouseUp(e)
	{
		// TODO: Emulate a mouse capture by adding this listener
		//	from within (a successful) mousedown event, removing
		//	it from within mouseup after it is handled. Alternatively,
		//	use addEventListener's third "options" argument for that.
		if (this.dragged) this.onDragStop(e);
		if (this.hovered) this.onHoverLeave(e);
	}
	
	createMarkers()
	{
		const marker = this.svg.getElementById("end");
		if (!marker) return;
		
		this.linkMarker = marker.cloneNode(true);
		this.linkMarker.id = "end-link";
		this.linkMarker.classList.add("hook");
		marker.parentNode.append(this.linkMarker);
		
		this.traceMarker = marker.cloneNode(true);
		this.traceMarker.id = "end-trace";
		this.traceMarker.classList.add("ghost");
		marker.parentNode.append(this.traceMarker);
	}
	
	attach(svg)
	{
		this.svg = svg;
		
		this.createMarkers();
		
		this.cursor = document.createElementNS(this.svg.namespaceURI, "circle");
		this.cursor.setAttribute("r", "18");
		this.cursor.setAttribute("cx", "0");
		this.cursor.setAttribute("cy", "0");
		this.cursor.style.pointerEvents = "none";
		this.cursor.classList.add("cursor");
		
		this.hook = document.createElementNS(this.svg.namespaceURI, "circle");
		this.hook.setAttribute("r", "3");
		this.hook.setAttribute("cx", "0");
		this.hook.setAttribute("cy", "0");
		this.hook.style.pointerEvents = "none";
		this.hook.classList.add("hook");
		
		this.link = document.createElementNS(this.svg.namespaceURI, "line");
		this.link.setAttribute("x1", "0");
		this.link.setAttribute("y1", "0");
		this.link.setAttribute("x2", "0");
		this.link.setAttribute("y2", "0");
		this.link.style.pointerEvents = "none";
		this.link.classList.add("link");
		this.link.style.markerEnd = "url(#end-link)";
		// TODO: The marker's fill doesn't adapt to the marked element's stroke.
		//	SVG2 provides for something like { fill: context-stroke; } but it
		//	doesn't seem to work.
		// this.link.classList.add("arrow");
		
		this.ghost = document.createElementNS(this.svg.namespaceURI, "circle");
		this.ghost.setAttribute("r", "18");
		this.ghost.setAttribute("cx", "0");
		this.ghost.setAttribute("cy", "0");
		this.ghost.style.pointerEvents = "none";
		this.ghost.classList.add("ghost");
		
		this.trace = document.createElementNS(this.svg.namespaceURI, "line");
		this.trace.setAttribute("x1", "0");
		this.trace.setAttribute("y1", "0");
		this.trace.setAttribute("x2", "0");
		this.trace.setAttribute("y2", "0");
		this.trace.style.pointerEvents = "none";
		this.trace.classList.add("trace");
		this.trace.style.markerEnd = "url(#end-trace)";
		// this.trace.classList.add("arrow");
		
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
		if (!this.hovered) return;
		
		this.hoveredLine = this.findLineForCircle(this.hovered);
		if (!this.hoveredLine) return;
		
		this.hoveredLineParent = this.hoveredLine.parentNode;
		this.hoveredLine.parentNode.removeChild(this.hoveredLine);
		
		this.ghost.setAttribute("cx", this.dragged.getAttribute("cx"));
		this.ghost.setAttribute("cy", this.dragged.getAttribute("cy"));
		this.svg.append(this.ghost);
		
		// TODO: It would be nice for the trace to have an arrow shown,
		//	but we can not use the regular marker because it doesn't
		//	adapt its colors to the element it marks. Maybe we should
		//	find the marker in the svg (or create one if it doesn't exist?)
		//	then clone it (for both links and traces) and simply add it?
		
		const { white, black } = this.findCirclesForLine(this.hoveredLine);
		
		if (this.hovered === white)
		{
			this.trace.setAttribute("x1", this.ghost.getAttribute("cx"));
			this.trace.setAttribute("y1", this.ghost.getAttribute("cy"));
			this.trace.setAttribute("x2", black.getAttribute("cx"));
			this.trace.setAttribute("y2", black.getAttribute("cy"));
		}
		else if (this.hovered === black)
		{
			this.trace.setAttribute("x1", white.getAttribute("cx"));
			this.trace.setAttribute("y1", white.getAttribute("cy"));
			this.trace.setAttribute("x2", this.ghost.getAttribute("cx"));
			this.trace.setAttribute("y2", this.ghost.getAttribute("cy"));
		}
		this.svg.prepend(this.trace);
	}
	
	hideGhost()
	{
		if (!this.hoveredLine) return;
		// this.hoveredLine.parentNode.append(this.hoveredLine);
		this.hoveredLineParent.append(this.hoveredLine);
		this.hoveredLine = undefined;
		this.svg.removeChild(this.ghost);
		this.svg.removeChild(this.trace);
	}
	
	findLineForCircle(circle)
	{
		const pid = circle.getAttribute("data-pid");
		const lines = this.svg.querySelectorAll("line");
		for (const line of lines)
		{
			const wid = line.getAttribute("data-wid");
			const bid = line.getAttribute("data-bid");
			if (wid == pid || bid == pid) return line;
		}
		return undefined;
	}
	
	findCirclesForLine(line)
	{
		const wid = line.getAttribute("data-wid");
		const bid = line.getAttribute("data-bid");
		const white = this.svg.querySelector(`circle[data-pid="${wid}"`);
		const black = this.svg.querySelector(`circle[data-pid="${bid}"`);
		return { white, black };
	}
}