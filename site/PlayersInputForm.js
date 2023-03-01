export class Row
{
	constructor(element)
	{
		if (typeof(element) == "string")
			this.element = document.getElementById(element);
		else
			this.element = element;
		console.assert(this.element.nodeName == "DIV");
	}
	
	static create(index)
	{
		const div = document.createElement("div");
		div.classList.add("inset");
		div.classList.add("row");
		
		const label = document.createElement("label");
		label.innerText = `#${index}`;
		label.setAttribute("for", `pid-${index}`);
		div.append(label);
		
		const input = document.createElement("input");
		input.setAttribute("id", `pid-${index}`);
		input.setAttribute("type", "text");
		input.setAttribute("placeholder", `Spieler ${index}`);
		div.append(input);
		
		return new Row(div);
	}
	
	focus() { this.input.focus(); return this }
	
	set callback(callback) { this.input.onkeydown = callback }
	
	get callback() { return this.input.onkeydown }
	
	get prevel() { return this.element.previousSibling }
	
	get nextel() { return this.element.nextSibling }
	
	get prev() { return this.prevel && new Row(this.prevel) }
	
	get next() { return this.nextel && new Row(this.nextel) }
	
	get text() { return this.input.value.trim() }
	
	get empty() { return !this.text }
	
	get isFirst() { return this.element.firstChild == this.element }
	
	get isLast() { return this.parent.element.lastChild == this.element }
	
	get index() {
		const groups = this.label.getAttribute("for").match(/pid-(\d+)/);
		console.assert(groups, "no pid");
		console.assert(1 in groups, "invalid pid");
		return groups && parseInt(groups[1]);
	}
	
	get parent() { return this.element.parentNode }
	
	get label() { return this.element.firstChild }
	
	get input() { return this.element.lastChild }
}

export class Form
{
	constructor(id)
	{
		console.assert(typeof(id) == "string", "id must be a string");
		this.element = document.getElementById(id);
	}
	
	get count() { return this.element.children.length }
	
	append(row, focus = true)
	{
		row.callback = e => this.onRowKeyDown(row, e);
		this.element.append(row.element)
		if (focus) row.focus();
	}
	
	remove(row)
	{
		row.callback = undefined;
		this.element.removeChild(row.element);
	}
	
	add()
	{
		const row = Row.create(this.count + 1);
		this.append(row);
		row.focus();
	}
	
	onRowKeyDown(row, e)
	{
		if (e.keyCode == 27)
			this.onRowEscape(row, e);
		else if (e.keyCode == 8)
			this.onRowBackspace(row, e);
		else if (e.keyCode == 13)
			this.onRowReturn(row, e);
	}
	
	onRowEscape(row, e)
	{
		row.input.value = "";
	}
	
	onRowBackspace(row, e)
	{
		if (e.ctrlKey || !row.isFirst && row.empty)
		{
			const prev = row.prev;
			if (prev)
			{
				e.preventDefault();
				this.remove(row);
				prev.focus();
			}
		}
	}
	
	onRowReturn(row, e)
	{
		e.preventDefault();
		if (e.ctrlKey)
			row.input.blur();
		else if (this.count > row.index && row.next)
			row.next.focus();
		else
			this.onRowInput(row, e);
	}
	
	onRowInput(row, e)
	{
		if (row.text)
			this.add();
	}
}