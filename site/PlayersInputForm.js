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
	
	set text(s) { return this.input.value = s }
	
	get empty() { return !this.text }
	
	get isFirst() { return this.element.parentNode.firstChild == this.element }
	
	get isLast() { return this.element.parentNode.lastChild == this.element }
	
	get index() {
		const groups = this.label.getAttribute("for").match(/pid-(\d+)/);
		console.assert(groups, "no pid");
		console.assert(1 in groups, "invalid pid");
		return groups && parseInt(groups[1]);
	}
	
	set index(n)
	{
		this.label.setAttribute("for", `pid-${n}`);
		this.label.innerText = `#${n}`;
		this.input.setAttribute("id", `pid-${n}`);
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
		this.focus = undefined;
	}
	
	load(json)
	{
		const data = JSON.parse(json);
		let row = undefined;
		for (const item of data)
		{
			const text = item[1].trim()
			if (!text) continue;
			const row = Row.create(this.count + 1);
			row.text = text;
			this.append(row);
		}
		if (row) row.focus();
	}
	
	oncommit() 	{ console.log(this.rows.map(r => r.text)) }
	
	get json() { return JSON.stringify(this.items) }
	
	get items() { return Array.prototype.map.call(this.rows, r => [r.index, r.text]) }
	
	get rows() { return Array.prototype.map.call(this.element.children, e => new Row(e)) }
	
	get count() { return this.element.children.length }
	
	get empty() { return this.count <= 0 }
	
	append(row, focus = true)
	{
		row.callback = e => this.onRowKeyDown(row, e);
		row.input.onfocus = e => this.onRowFocus(row, e);
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
	
	reindex()
	{
		let i = 0;
		for (const row of this.rows)
			row.index = ++i;
	}
	
	renormalize()
	{
		for (const row of this.rows)
			if (row.empty)
				this.remove(row);
		this.reindex();
	}
	
	onRowFocus(row, e) { this.focus = row; }
	
	onRowKeyDown(row, e)
	{
		const k = e.keyCode;
		if (k == 27)
			this.onRowEscape(row, e);
		else if (k == 8)
			this.onRowBackspace(row, e);
		else if (k == 13)
			this.onRowReturn(row, e);
		else if (k == 38 && !this.focus.isFirst)
			this.focus.prev.focus();
		else if (k == 40 && !this.focus.isLast)
			this.focus.next.focus();
	}
	
	onRowEscape(row, e) { row.input.value = "" }
	
	onRowBackspace(row, e)
	{
		if (e.ctrlKey || !row.isFirst && row.empty)
		{
			const prev = row.prev;
			if (prev)
			{
				e.preventDefault();
				this.remove(row);
				if (!prev.isLast) this.reindex();
				prev.focus();
			}
		}
	}
	
	onRowReturn(row, e)
	{
		e.preventDefault();
		if (e.ctrlKey)
		{
			row.input.blur();
			this.renormalize();
			this.oncommit(this);
		}
		else if (this.count > row.index && row.next)
			row.next.focus();
		else
			this.onRowInput(row, e);
	}
	
	onRowInput(row, e) { if (row.text) this.add() }
}