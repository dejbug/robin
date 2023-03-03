// FIXME: The last row is not registered if we fail to hit return
//	(and thus popping up a new entry row) before committing.

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
	
	static create(index, pid, autostyle = true)
	{
		const div = document.createElement("div");
		// div.setAttribute("data-pid", `${index}`);
		
		const label = document.createElement("label");
		label.innerText = `#${index}`;
		label.setAttribute("for", `pid-${pid}`);
		div.append(label);
		
		const input = document.createElement("input");
		input.setAttribute("id", `pid-${pid}`);
		input.setAttribute("type", "text");
		input.setAttribute("placeholder", `Spieler ${index}`);
		div.append(input);
		
		if (autostyle)
		{
			div.style.display = "flex";
			div.style.flexFlow = "row nowrap";
			div.style.justifyContent = "flex-start";
			div.style.alignItems = "flex-end";
			div.style.padding = ".3em";
			
			label.style.width = "3em";
			label.style.color = "lightgrey";
			
			input.style.width = "100%";
		}
		
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
	
	get pid()
	{
		const groups = this.label.getAttribute("for").match(/pid-(\d+)/);
		console.assert(groups, "no pid");
		console.assert(1 in groups, "invalid pid");
		return groups && parseInt(groups[1]);
	}
	
	set pid(n)
	{
		this.label.setAttribute("for", `pid-${n}`);
		this.input.setAttribute("id", `pid-${n}`);
	}
	
	get index() {
		const groups = this.label.innerText.match(/#(\d+)/);
		console.assert(groups, "no index");
		console.assert(1 in groups, "invalid index");
		return groups && parseInt(groups[1]);
	}
	
	set index(n)
	{
		this.label.innerText = `#${n}`;
		this.input.setAttribute("placeholder", `Spieler ${n}`);
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
	
	load(data)
	{
		data = typeof data == "string" ? JSON.parse(data) : data;
		let row = undefined;
		for (const item of data)
		{
			const text = item[1].trim()
			if (!text) continue;
			const row = Row.create(this.count + 1, item[0]);
			row.text = text;
			this.append(row);
		}
		if (row) row.focus();
	}
	
	oncommit() 	{ console.log(this.rows.map(r => r.text)) }
	
	onappend(row) { console.log("onappend", row.index, row.pid, row.text) }
	
	onedit(row) { console.log("onedit", row.index, row.pid, row.text) }
	
	onremove(row) { console.log("onremove", row.index, row.pid, row.text) }
	
	onshuffle(map) { console.log(map) }
	
	get json() { return JSON.stringify(this.items) }
	
	get items() { return Array.prototype.map.call(this.rows, r => [r.pid, r.text]) }
	
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
	
	hide(parent = false)
	{
		const style = parent ? this.element.parentNode.style : this.element.style;
		style.display = "none";
	}
	
	get highestPid()
	{
		let pid = 0;
		for (const row of this.rows)
			pid = Math.max(pid, row.pid);
		return pid;
	}
	
	add()
	{
		const row = Row.create(this.count + 1, this.highestPid + 1);
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
		// FIXME: We have to renormalize otherwise our current
		//	CrossTable implementation (or its composite helpers)
		//	will get confused. In particular, if memory serves, we
		//	occasionally assume that playerCount is the highest pid.
		//	But renormalization makes our form more complicated.
		//	Renaming/adding/removing players should be as easy
		//	as looking at the (unchanging) pids. A pid should be
		//	thought of as the timestamp at which a player was added.
		
		for (const row of this.rows)
			if (row.empty)
			{
				if (!this.onremove || row.isLast || !this.onremove(row))
					this.remove(row);
			}
		this.reindex();
	}
	
	shuffle()
	{
		throw new Error("not implemented yet");
	}
	
	commit()
	{
		if (this.focus) this.focus.input.blur();
		this.renormalize();
		if (this.oncommit) this.oncommit(this);
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
				if (!this.onremove || row.isLast || !this.onremove(row))
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
			this.commit();
		else if (row.index < this.count && row.next) // Do we need both checks?
			this.onRowEdit(row, e);
		else
			this.onRowInput(row, e);
	}
	
	onRowEdit(row, e)
	{
		row.next.focus();
		this.onedit(row);
	}
	
	onRowInput(row, e)
	{
		// TODO: Either do it as with onremove (bestowing veto powers to onappend)
		//	or else do it vice versa. #api.consistence
		if (row.text)
		{
			this.add();
			this.onappend(row);
		}
	}
}