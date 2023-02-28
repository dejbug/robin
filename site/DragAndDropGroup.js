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
		this.hook = undefined;
		
		this.dragged = undefined;
		this.draggedParent = undefined;
		this.draggedLine = undefined;
		this.draggedLineParent = undefined;
		this.draggedLineHook = undefined;
		this.hoveredRadius = undefined;
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
		console.log("dropped", { source, target });
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
	}
	
	onHoverLeave(e)
	{
		this.hovered.setAttribute("r", this.hoveredRadius);
		this.hoveredRadius = undefined;
		this.hovered = undefined;
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
	
	attach(svg)
	{
		this.svg = svg;
		
		this.cursor = document.createElementNS(this.svg.namespaceURI, "circle");
		this.cursor.setAttribute("r", "18");
		this.cursor.setAttribute("cx", "0");
		this.cursor.setAttribute("cy", "0");
		this.cursor.setAttribute("fill", "white");
		this.cursor.setAttribute("stroke", "grey");
		this.cursor.style.strokeWidth = "2px";
		this.cursor.style.pointerEvents = "none";
		
		this.hook = document.createElementNS(this.svg.namespaceURI, "circle");
		this.hook.setAttribute("r", "3");
		this.hook.setAttribute("cx", "0");
		this.hook.setAttribute("cy", "0");
		this.hook.setAttribute("fill", "grey");
		this.hook.setAttribute("stroke", "none");
		this.hook.style.pointerEvents = "none";
		
		this.link = document.createElementNS(this.svg.namespaceURI, "line");
		this.link.setAttribute("x1", "0");
		this.link.setAttribute("y1", "0");
		this.link.setAttribute("x2", "0");
		this.link.setAttribute("y2", "0");
		this.link.setAttribute("stroke", "grey");
		this.link.style.strokeWidth = "2px";
		this.link.style.pointerEvents = "none";
		
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
}