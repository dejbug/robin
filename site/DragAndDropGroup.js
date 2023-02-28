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
		// this.dragged.setAttribute("cx", e.clientX - this.hit.x);
		// this.dragged.setAttribute("cy", e.clientY - this.hit.y);
		this.svg.removeChild(this.cursor);
		this.draggedParent.append(this.dragged);
		this.dragged = null;
		this.draggedParent = null;
		this.hit = null;
	}
	
	onDragMove(e)
	{
		// console.log(this.svg.offsetLeft, this.svg.offsetTop, this.svg.offsetWidth, this.svg.offsetHeight);
		// console.log(this.svg.getBoundingClientRect());
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
		this.hoveredRadius = null;
		this.hovered = null;
	}
	
	attach(svg)
	{
		this.svg = svg;
		
		this.svg.addEventListener("mousemove", e => {
			if (!this.dragged) return;
			this.onDragMove(e);
			if (this.hovered)
			{
				if (this.hovered != e.target)
					this.onHoverLeave(e);
			}
			else if (this.isValidTarget(e.target))
				this.onHoverEnter(e);
		});
		
		this.svg.addEventListener("mousedown", e => {
			this.dragged = false;
			this.hit = null;
			if (!this.isValidTarget(e.target)) return;
			this.onDragStart(e);
		});
		
		document.addEventListener("mouseup", e => {
			// TODO: Emulate a mouse capture by adding this listener
			//	from within (a successful) mousedown event, removing
			//	it from within mouseup after it is handled.
			if (this.dragged) this.onDragStop(e);
			if (this.hovered) this.onHoverLeave(e);
		});
	}
}