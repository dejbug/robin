export class DragAndDropGroup
{
	constructor(svg = undefined)
	{
		this.svg = undefined;
		
		this.dragged = undefined;
		this.draggedParent = undefined;
		this.hoveredRadius = undefined;
		this.hit = undefined;
		this.hovered = undefined;
		
		this.onMouseMoveListener = undefined;
		this.onMouseDownListener = undefined;
		this.onMouseUpListener = undefined;
		
		this.cursor = document.createElementNS(output.namespaceURI, "circle");
		this.cursor.setAttribute("r", "20");
		this.cursor.setAttribute("cx", "300");
		this.cursor.setAttribute("cy", "200");
		this.cursor.setAttribute("fill", "none");
		this.cursor.setAttribute("stroke", "grey");
		this.cursor.style.strokeWidth = "3px";
		this.cursor.style.pointerEvents = "none";
		
		if (svg) this.attach(svg);
	}
	
	isValidTarget(target)
	{
		if (target.nodeName != "circle") return false;
		if (this.draggedParent && this.draggedParent != target.parentNode) return false;
		return true;
	}
	
	onDragStart(e)
	{
		this.hit = { x: e.clientX - e.target.getAttribute("cx"), y: e.clientY - e.target.getAttribute("cy") };
		this.dragged = e.target;
		this.draggedParent = e.target.parentNode;
		this.cursor.setAttribute("cx", e.clientX - this.hit.x);
		this.cursor.setAttribute("cy", e.clientY - this.hit.y);
		this.draggedParent.removeChild(this.dragged);
		this.svg.appendChild(this.cursor);
	}
	
	onDragStop(e)
	{
		this.svg.removeChild(this.cursor);
		this.draggedParent.append(this.dragged);
		this.dragged = undefined;
		this.draggedParent = undefined;
		this.hit = undefined;
	}
	
	onDragMove(e)
	{
		this.cursor.setAttribute("cx", e.clientX - this.hit.x);
		this.cursor.setAttribute("cy", e.clientY - this.hit.y);
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
		//	it from within mouseup after it is handled.
		if (this.dragged) this.onDragStop(e);
		if (this.hovered) this.onHoverLeave(e);
	}
	
	attach(svg)
	{
		this.svg = svg;
		
		this.onMouseMoveListener = e => { this.onMouseMove(e) };
		this.svg.addEventListener("mousemove", this.onMouseMoveListener);
		
		this.onMouseDownListener = e => { this.onMouseDown(e) };
		this.svg.addEventListener("mousedown", this.onMouseDownListener);
		
		this.onMouseUpListener = e => { this.onMouseUp(e) };
		document.addEventListener("mouseup", this.onMouseUpListener);
	}
	
	detach()
	{
		if (!this.svg) return;
		
		this.svg.removeEventListener("mousemove", this.onMouseMoveListener);
		this.onMouseMoveListener = undefined;
		
		this.svg.removeEventListener("mousedown", this.onMouseDownListener);
		this.onMouseDownListener = undefined;
		
		this.svg.removeEventListener("mouseup", this.onMouseUpListener);
		this.onMouseUpListener = undefined;
		
		this.svg = undefined;
	}
}