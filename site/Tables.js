import * as berger from "./berger.js";

function createRandomlyGeneratedTable(pc = 8, attempts = 10)
{
	let gen = null;
	let attempt = 0;
	for (attempt = 1; attempt <= attempts; ++attempt)
	{
		gen = berger.generateRandomRoundsTable1(pc);
		if (!gen) continue;
		const [ ok, err ] = berger.checkRoundsTable(gen);
		if (ok) break;
	}
	return [ gen, attempt ];
}

// FIXME: class Table is a patchwork of bergerjs functions. We need to redesign it.
// TODO: Replace these obsoleted functions:
// 	renderBergerColorsTable1, renderBergerColorsTable2,
//	renderBergerTable, colorSwitchingHandler.

export class Tables
{
	constructor() { this.reset(); }

	reset()
	{
		this.attempts = 0;
		this.attempt = 0;
		
		this.rm = undefined;
		this.pr = undefined;
		this.ct = undefined;
		
		if (this.rpr) this.rpr.remove();
		if (this.rpp) this.rpp.remove();
		if (this.rrm) this.rrm.remove();
		
		this.rpr = undefined;
		this.rpp = undefined;
		this.rrm = undefined;
	}

	ok() { return this.pr != undefined; }

	generate(pc, attempts = 1000, sparse = false)
	{
		this.reset();
		
		this.attempts = attempts;
		
		[ this.pr, this.attempt ] = createRandomlyGeneratedTable(pc, this.attempts);
		if (!this.pr) return false;
		
		this.rm = berger.bergerTableFromRoundsTable(berger.distributeRoundsColors(this.pr));
		this.ct = berger.colorsTableFromBergerTable(this.rm);
		
		this.render(sparse);
		
		return true;
	}

	render(sparse = false)
	{
		this.rpr = undefined;
		this.rpp = undefined;
		this.rrm = undefined;
		
		this.renderPR(undefined, sparse);
		this.renderPP(undefined, sparse);
		this.renderRM();
		
		this.rpr.on("mousedown", e => this.colorSwitchingHandler(e));
		this.rpp.on("mousedown", e => this.colorSwitchingHandler(e));
		this.rrm.on("mousedown", e => this.colorSwitchingHandler(e));
	}

	append(id)
	{
		this.appendPR(id);
		this.appendPP(id);
		this.appendBT(id);
	}

	remove()
	{
		if (this.rpr) this.rpr.remove();
		if (this.rpp) this.rpp.remove();
		if (this.rrm) this.rrm.remove();
	}

	colorSwitchingHandler(e)
	{
		const row = e.target.parentNode.rowIndex;
		const col = e.target.cellIndex;
		const tt = this.tableTypeFromCell(e.target);
		this.toggleColorTT(row, col, tt);
	}

	tableTypeFromCell(td)
	{
		const table = td.parentNode.parentNode;
		const a = table.attributes["berger-table-type"];
		if (a) return parseInt(a.value);
	}

	infoFromPR(row, col)
	{
		if (row < 1 || col < 1) return undefined;
		const pid = row;
		const rid = col;
		const oid = this.pr[pid][rid];
		const mid = this.rm[rid].findIndex(m => {
			const [ w, b ] = m;
			return w == pid && b == oid || w == oid && b == pid;
		});
		return { pid, rid, oid, mid };
	}

	infoFromPP(row, col)
	{
		if (row < 1 || col < 1 || row == col) return undefined;
		const pid = row;
		const oid = col;
		const rid = this.pr[pid].findIndex(val => val == oid);
		const mid = this.rm[rid].findIndex(val => {
			const [ w, b ] = val;
			return w == pid && b == oid || w == oid && b == pid;
		});
		return { pid, rid, oid, mid };
	}

	infoFromRM(row, col)
	{
		if (row < 1 || col < 1) return undefined;
		const rid = row;
		const mid = col - 1;
		const [ pid, oid ] = this.rm[rid][mid];
		return { pid, rid, oid, mid };
	}

	toggleColor(info)
	{
		if (!info) return;
		
		this.toggleRMColor(info.rid, info.mid);
		const [ wid, bid ] = this.rm[info.rid][info.mid];
		this.setCTColor(info.rid, wid, bid);
		
		this.updateCellPR(info.pid, info.rid);
		this.updateCellPP(info.pid, info.oid);
		this.updateCellRM(info.rid, info.mid);
	}

	toggleColorTT(row, col, tt)
	{
		if (tt == 1) this.toggleColorPR(row, col);
		else if (tt == 2) this.toggleColorPP(row, col);
		else if (tt == 3) this.toggleColorRM(row, col);
	}

	toggleColorPR(row, col) { this.toggleColor(this.infoFromPR(row, col)); }

	toggleColorPP(row, col) { this.toggleColor(this.infoFromPP(row, col)); }

	toggleColorRM(row, col) { this.toggleColor(this.infoFromRM(row, col)); }

	toggleRMColor(rid, mid)
	{
		const m = this.rm[rid][mid];
		[ m[1], m[0] ] = [ m[0], m[1] ];
		this.rm[rid][mid] = m;
	}

	setCTColor(rid, wid, bid)
	{
		const i = this.ct[rid].findIndex(val => val == bid);
		if (i >= 0) delete this.ct[rid][i];
		const j = this.ct[rid].findIndex(val => val == wid);
		if (j < 0) this.ct[rid].push(wid);
	}

	updateCellPR(pid, rid)
	{
		const a = this.getCellPR(pid, rid);
		const oid = this.pr[pid][rid];
		const b = this.getCellPR(oid, rid);
		const white = this.ct[rid].includes(pid)
		a.classList.remove("white");
		a.classList.remove("black");
		b.classList.remove("white");
		b.classList.remove("black");
		a.classList.add(white ? "white" : "black");
		b.classList.add(white ? "black" : "white");
		return true;
	}

	updateCellPP(pid, oid)
	{
		const rid = this.pr[pid].findIndex(val => val == oid);
		const white = this.ct[rid].includes(pid)
		const a = this.getCellPP(pid, oid);
		const b = this.getCellPP(oid, pid);
		a.classList.remove("white");
		a.classList.remove("black");
		b.classList.remove("white");
		b.classList.remove("black");
		a.classList.add(white ? "white" : "black");
		b.classList.add(white ? "black" : "white");
	}

	updateCellRM(rid, mid)
	{
		const [ w, b ] = this.rm[rid][mid];
		const c = this.getCellRM(rid, mid  + 1);
		c.innerText = `${w}-${b}`;
		c.classList.remove("ordered");
		c.classList.remove("unordered");
		c.classList.add(w < b ? "ordered" : "unordered");
	}

	getCell(tab, row, col)
	{
		const tr = tab.find("tr")[row];
		if (!tr) return undefined;
		return tr.querySelectorAll("td")[col];
	}

	getCellPR(pid, rid) { return this.getCell(this.rpr, pid, rid); }

	getCellPP(pid, oid) { return this.getCell(this.rpp, pid, oid); }

	getCellRM(rid, mid) { return this.getCell(this.rrm, rid, mid); }

	getCellValueRM(row, col)
	{
		const info = this.infoFromRM(row, col);
		if (!info) return undefined;
		const cell = this.getCellRM(info.rid, info.mid + 1);
		if (!cell) return undefined;
		const val = cell.innerText;
		if (!val) return { cell, val: undefined, wid: undefined, bid: undefined };
		const groups = val.match(/(\d+)-(\d+)/);
		if (!groups) return { cell, val, wid: undefined, bid: undefined };
		const [ _, wid, bid ] = groups;
		return { cell, val, wid: parseInt(wid), bid: parseInt(bid) };
	}

	getGenerationStatus()
	{
		if (this.attempts <= 0) return [ undefined, "Nothing rendered yet." ];
		if (this.pr) return [ true, `Generated random PR-table in ${this.attempt} attempt(s).` ];
		return [ false, `Was unable to generate PR-table in ${this.attempts} attempt(s).`];
	}

	appendPR(id) { return this.rpr ? this.rpr.appendTo(id) : undefined;	}

	appendPP(id) { return this.rpp ? this.rpp.appendTo(id) : undefined; }

	appendBT(id) { return this.rrm ? this.rrm.appendTo(id) : undefined; }

	appendMap(id, cols = 1, r = 60, rnode = 10)
	{
		return $(renderMap(this.rm, cols, r, rnode)).appendTo(id);
	}

	renderPR(caption = undefined, sparse = false)
	{
		this.rpr = $("<table>").addClass("berger-table").attr("berger-table-type", 1);
		if (caption) $("<caption>").text(caption).appendTo(this.rpr);
		
		const tr = $("<tr>");
		$("<th>").text("#").appendTo(tr);
		for (let pid in this.pr)
		{
			for (let rid in this.pr[pid])
				$("<th>").addClass("rid").text(rid).appendTo(tr);
			tr.appendTo(this.rpr);
			break;
		}
		
		for (let pid in this.pr)
		{
			pid = parseInt(pid);
			const tr = $("<tr>");
			$("<td>").addClass("pid").text(pid).appendTo(tr);
			for (let rid in this.pr[pid])
			{
				const oid = this.pr[pid][rid];
				const white = this.ct[rid].includes(pid);
				const td = $("<td>")
					.addClass("opp")
					.addClass(white ? "white" : "black");
				if (sparse && oid < pid) $("<td>").text("");
				else td.text(oid);
				td.appendTo(tr);
			}
			tr.appendTo(this.rpr);
		}
	}

	renderPP(caption = undefined, sparse = false)
	{
		const playerCount = Object.keys(this.rm).length + 1;
		
		this.rpp = $("<table>").addClass("berger-table").attr("berger-table-type", 2);
		if (caption) $("<caption>").text(caption).appendTo(e);
		
		const tr = $("<tr>");
		$("<th>").text("#").appendTo(tr);
		for (let pid = 1; pid <= playerCount; ++pid)
			$("<th>").addClass("oid").text(pid).appendTo(tr);
		tr.appendTo(this.rpp);
		
		for (let wid = 1; wid <= playerCount; ++wid)
		{
			const tr = $("<tr>");
			$("<td>").addClass("pid").text(`${wid}`).appendTo(tr);
			for (let bid = 1; bid <= playerCount; ++bid)
			{
				const td = $("<td>").appendTo(tr);
				if (wid == bid) td.addClass("crosshatch");
				else td.addClass("rid");
			}
			tr.appendTo(this.rpp);
		}
		
		const rows = this.rpp.find("tr");
		
		for (let rid in this.rm)
			for (let mid in this.rm[rid])
			{
				const [ wid, bid ] = this.rm[rid][mid];
				const w = rows[wid].children[bid];
				const b = rows[bid].children[wid];
				w.classList.add("white");
				b.classList.add("black");
				if (!sparse || wid < bid) w.innerText = rid;
				if (!sparse || bid < wid) b.innerText = rid;
			}
	}

	renderRM(caption = undefined)
	{
		this.rrm = $("<table>").addClass("berger-table").attr("berger-table-type", 3);
		if (caption) $("<caption>").text(caption).appendTo(e);
		
		const tr = $("<tr>").appendTo(this.rrm);
		$("<th>").text("#").appendTo(tr);
		for (let mid in this.rm[1])
			$("<th>").text(parseInt(mid) + 1).appendTo(tr);
		
		for (let rid in this.rm)
		{
			const tr = $("<tr>").appendTo(this.rrm);
			$("<td>").text(rid).appendTo(tr);
			for (let m of this.rm[rid])
				$("<td>")
					.addClass(m[0] < m[1] ? "ordered" : "unordered")
					.text(`${m[0]}-${m[1]}`)
					.appendTo(tr);
			tr.appendTo(this.rrm);
		}
	}
}