import { choose } from "./tools.js";

export function generateRoundsTable(playersCount)
{
	if (playersCount < 2) return null;
	playersCount = playersCount + (playersCount % 2);
	const roundsCount = playersCount - 1;
	
	let table = [];
	for (let r = 0; r < playersCount - 1; ++r)
	{
		let row = [];
		let pid = roundsCount - r;
		for (let c = 0; c < roundsCount; ++c)
		{
			const x = pid++ % roundsCount;
			row[c + 1] = x == r ? playersCount : x + 1;
		}
		table[r + 1] = row;
	}
	
	let row = [];
	let i = 1;
	let j = playersCount / 2 + 1;
	for (let c = 0; c < roundsCount; ++c)
		row[c + 1] = c % 2 == 0 ? i++ : j++;
	table[playersCount] = row;
	
	return table;
}

export function generateRandomRoundsTable(playersCount)
{
	if (playersCount < 2) return null;
	playersCount = playersCount + (playersCount % 2);
	const roundsCount = playersCount - 1;
	
	const table = [];
	const players = [];
	for (let pid = 1; pid <= playersCount; ++pid)
	{
		players.push(pid);
		table[pid] = [];
		for (let rid = 1; rid <= roundsCount; ++rid)
			table[pid][rid] = null;
	}
	
	for (let pid = 1; pid <= playersCount; ++pid)
		for (let rid = 1; rid <= roundsCount; ++rid)
		{
			const exclude = [];
			for (let i = 1; i < pid; ++i) exclude.push(table[i][rid]);
			const oid = exclude.indexOf(pid);
			if (oid >= 0)
			{
				const opp = oid + 1;
				table[pid][rid] = opp;
				// console.log(pid, rid, null, opp);
				continue;
			}
			for (let i = 1; i <= pid; ++i) exclude.push(i);
			for (let i = 1; i < rid; ++i) exclude.push(table[pid][i]);
			const include = players.filter(i => !exclude.includes(i));
			const choice = choose(include);
			if (!choice) return null;
			table[pid][rid] = choice;
			// console.log(pid, rid, exclude, include, choice);
		}
	
	return table;
}

export function colorsTableFromBergerTable(t)
{
	let c = [];
	for (let r in t)
	{
		c[r] = [];
		for (let m of t[r])
			c[r].push(m[0]);
	}
	return c;
}

export function roundsTableFromBergerTable(t)
{
	let d = [];
	for (let r in t)
		for (let m in t[r])
		{
			let [w, b] = t[r][m];
			if (!(w in d)) d[w] = [];
			if (!(b in d)) d[b] = [];
			d[w][r] = b;
			d[b][r] = w;
		}
	return d;
}

export function bergerTableFromRoundsTable(table)
{
	let berger = [];
	
	for (let rid in table[1])
		berger[rid] = [];
	
	for (let rid in table[1])
		for (let pid in table)
		{
			pid = parseInt(pid);
			const opp = table[pid][rid];
			if (pid < opp)
				berger[rid].push([pid, opp])
		}
	
	return berger;
}

export function sortBergerTable(table, matches = true, rounds = true)
{
	// TODO: Find out how to deepcopy objects.
	
	let out = [];
	for (let rid in table)
	{
		out[rid] = [];
		for (let mid in table[rid])
		{
			out[rid][mid] = [...table[rid][mid]];
			if (matches) out[rid][mid].sort((a, b) => a - b);
		}
		if (rounds) out[rid].sort((a, b) => a[0] - b[0]);
	}
	return out;
}

export function distributeRoundsColors(rt)
{
	
	return rt;
}

export function distributeBergerColors(berger)
{
	let pp = [];
	const addWhite = p => pp[p] += 1;
	const countWhites = p => p in pp ? pp[p] : pp[p] = 0;
	const needSwap = m => countWhites(m[0]) > countWhites(m[1]);
	const swapColors = m => [ m[0], m[1] ] = [ m[1], m[0] ];
	
	for (let rid in berger)
		for (let m of berger[rid])
		{
			if (needSwap(m))
				swapColors(m);
			addWhite(m[0]);
		}
	
	return berger;
}

export function renderRoundsTable(table, caption = null)
{
	const e = $("<table>").addClass("rounds-table");
	if (caption) $("<caption>").text(caption).appendTo(e);
	
	const tr = $("<tr>").appendTo(e);
	$("<th>").text("#").appendTo(tr);
	for (let c in table[1])
		$("<th>").text(c).appendTo(tr);
	
	for (let r in table)
	{
		const tr = $("<tr>").appendTo(e);
		$("<td>").text(r).appendTo(tr);
		for (let c in table[r])
			$("<td>").text(table[r][c]).appendTo(tr);
	}
	
	return e;
}

export function renderBergerTable(table, caption = null)
{
	if (table == null) return table;
	
	const e = $("<table>").addClass("berger-table");
	if (caption) $("<caption>").text(caption).appendTo(e);
	
	const tr = $("<tr>").appendTo(e);
	$("<th>").text("#").appendTo(tr);
	for (let mid in table[1])
		$("<th>").text(parseInt(mid) + 1).appendTo(tr);
	
	for (let rid in table)
	{
		const tr = $("<tr>").appendTo(e);
		$("<td>").text(rid).appendTo(tr);
		for (let m of table[rid])
			$("<td>")
				.addClass(m[0] < m[1] ? "ordered" : "unordered")
				.text(`${m[0]}-${m[1]}`)
				.appendTo(tr);
		tr.appendTo(e);
	}
	
	return e;
}

export function renderBergerColorsTable1(bt, caption = null)
{
	const rt = roundsTableFromBergerTable(bt);
	const ct = colorsTableFromBergerTable(bt);
	
	const e = $("<table>").addClass("berger-colors-table").attr("berger-colors-table-type", 1);
	if (caption) $("<caption>").text(caption).appendTo(e);
	
	const tr = $("<tr>");
	$("<th>").text("#").appendTo(tr);
	for (let pid in rt)
	{
		for (let rid in rt[pid])
			$("<th>").addClass("rid").text(rid).appendTo(tr);
		tr.appendTo(e);
		break;
	}
	
	for (let pid in rt)
	{
		const tr = $("<tr>");
		$("<td>").addClass("pid").text(pid).appendTo(tr);
		for (let rid in rt[pid])
			$("<td>").text(rt[pid][rid])
			.addClass("opp")
			.addClass(ct[rid].includes(parseInt(pid)) ? "white" : "black")
			.appendTo(tr);
		tr.appendTo(e);
	}
	
	return e;
}

export function renderBergerColorsTable2(bt, caption = null)
{
	const playerCount = Object.keys(bt).length + 1;
	
	const e = $("<table>").addClass("berger-colors-table").attr("berger-colors-table-type", 2);
	if (caption) $("<caption>").text(caption).appendTo(e);
	
	const tr = $("<tr>");
	$("<th>").text("#").appendTo(tr);
	for (let pid = 1; pid <= playerCount; ++pid)
		$("<th>").addClass("oid").text(pid).appendTo(tr);
	tr.appendTo(e);
	
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
		tr.appendTo(e);
	}
	
	const rows = e.find("tr");
	
	for (let rid in bt)
		for (let mid in bt[rid])
		{
			const [ wid, bid ] = bt[rid][mid];
			const w = rows[wid].children[bid];
			const b = rows[bid].children[wid];
			w.classList.add("white");
			b.classList.add("black");
			w.innerText = rid;
			b.innerText = rid;
		}
	
	return e;
}

export function colorSwitchingHandler(element)
{
	const toggleColor = (a, b) => {
		const white = a.classList.contains("white");
		a.classList.remove(white ? "white" : "black");
		b.classList.remove(white ? "black" : "white");
		a.classList.add(white ? "black" : "white");
		b.classList.add(white ? "white" : "black");
	};
	element = $(element);
	element.on("mousedown", e => {
		const tt = element.attr("berger-colors-table-type");
		if (tt == 1)
		{
			const pid = e.target.parentNode.rowIndex;
			const rid = e.target.cellIndex;
			if (pid < 1 || rid < 1) return;
			const oid = e.target.innerText;
			const opp = element.find("tr")[oid].children[rid];
			toggleColor(e.target, opp);
		}
		if (tt == 2)
		{
			const pid = e.target.parentNode.rowIndex;
			const oid = e.target.cellIndex;
			if (pid < 1 || oid < 1 || pid == oid) return;
			const opp = element.find("tr")[oid].children[pid];
			toggleColor(e.target, opp);
		}
	});
	return element;
}

export function berger(playersCount)
{
	if (playersCount < 3 || playersCount > 16) return null;
	return lut[playersCount + (playersCount % 2)];
}

let lut = {
	4: {
		1: [[1, 4], [2, 3]],
		2: [[4, 3], [1, 2]],
		3: [[2, 4], [3, 1]],
	},
	6: {
		1: [[1, 6], [2, 5], [3, 4]],
		2: [[6, 4], [5, 3], [1, 2]],
		3: [[2, 6], [3, 1], [4, 5]],
		4: [[6, 5], [1, 4], [2, 3]],
		5: [[3, 6], [4, 2], [5, 1]],
	},
	8: {
		1: [[1, 8], [2, 7], [3, 6], [4, 5]],
		2: [[8, 5], [6, 4], [7, 3], [1, 2]],
		3: [[2, 8], [3, 1], [4, 7], [5, 6]],
		4: [[8, 6], [7, 5], [1, 4], [2, 3]],
		5: [[3, 8], [4, 2], [5, 1], [6, 7]],
		6: [[8, 7], [1, 6], [2, 5], [3, 4]],
		7: [[4, 8], [5, 3], [6, 2], [7, 1]],
	},
	10: {
		1: [[1, 10], [2, 9], [3, 8], [4, 7], [5, 6]],
		2: [[10, 6], [7, 5], [8, 4], [9, 3], [1, 2]],
		3: [[2, 10], [3, 1], [4, 9], [5, 8], [6, 7]],
		4: [[10, 7], [8, 6], [9, 5], [1, 4], [2, 3]],
		5: [[3, 10], [4, 2], [5, 1], [6, 9], [7, 8]],
		6: [[10, 8], [9, 7], [1, 6], [2, 5], [3, 4]],
		7: [[4, 10], [5, 3], [6, 2], [7, 1], [8, 9]],
		8: [[10, 9], [1, 8], [2, 7], [3, 6], [4, 5]],
		9: [[5, 10], [6, 4], [7, 3], [8, 2], [9, 1]],
	},
	12: {
		1: [[1, 12], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]],
		2: [[12, 7], [8, 6], [9, 5], [10, 4], [11, 3], [1, 2]],
		3: [[2, 12], [3, 1], [4, 11], [5, 10], [6, 9], [7, 8]],
		4: [[12, 8], [9, 7], [10, 6], [11, 5], [1, 4], [2, 3]],
		5: [[3, 12], [4, 2], [5, 1], [6, 11], [7, 10], [8, 9]],
		6: [[12, 9], [10, 8], [11, 7], [1, 6], [2, 5], [3, 4]],
		7: [[4, 12], [5, 3], [6, 2], [7, 1], [8, 11], [9, 10]],
		8: [[12, 10], [11, 9], [1, 8], [2, 7], [3, 6], [4, 5]],
		9: [[5, 12], [6, 4], [7, 3], [8, 2], [9, 1], [10, 11]],
		10: [[12, 11], [1, 10], [2, 9], [3, 8], [4, 7], [5, 6]],
		11: [[6, 12], [7, 5], [8, 4], [9, 3], [10, 2], [11, 1]],
	},
	14: {
		1: [[1, 14], [2, 13], [3, 12], [4, 11], [5, 10], [6, 9], [7, 8]],
		2: [[14, 8], [9, 7], [10, 6], [11, 5], [12, 4], [13, 3], [1, 2]],
		3: [[2, 14], [3, 1], [4, 13], [5, 12], [6, 11], [7, 10], [8, 9]],
		4: [[14, 9], [10, 8], [11, 7], [12, 6], [13, 5], [1, 4], [2, 3]],
		5: [[3, 14], [4, 2], [5, 1], [6, 13], [7, 12], [8, 11], [9, 10]],
		6: [[14, 10], [11, 9], [12, 8], [13, 7], [1, 6], [2, 5], [3, 4]],
		7: [[4, 14], [5, 3], [6, 2], [7, 1], [8, 13], [9, 12], [10, 11]],
		8: [[14, 11], [12, 10], [13, 9], [1, 8], [2, 7], [3, 6], [4, 5]],
		9: [[5, 14], [6, 4], [7, 3], [8, 2], [9, 1], [10, 13], [11, 12]],
		10: [[14, 12], [13, 11], [1, 10], [2, 9], [3, 8], [4, 7], [5, 6]],
		11: [[6, 14], [7, 5], [8, 4], [9, 3], [10, 2], [11, 1], [12, 13]],
		12: [[14, 13], [1, 12], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]],
		13: [[7, 14], [8, 6], [9, 5], [10, 4], [11, 3], [12, 2], [13, 1]],
	},
	16: {
		1: [[1, 16], [2, 15], [3, 14], [4, 13], [5, 12], [6, 11], [7, 10], [8, 9]],
		2: [[16, 9], [10, 8], [11, 7], [12, 6], [13, 5], [14, 4], [15, 3], [1, 2]],
		3: [[2, 16], [3, 1], [4, 15], [5, 14], [6, 13], [7, 12], [8, 11], [9, 10]],
		4: [[16, 10], [11, 9], [12, 8], [13, 7], [14, 6], [15, 5], [1, 4], [2, 3]],
		5: [[3, 16], [4, 2], [5, 1], [6, 15], [7, 14], [8, 13], [9, 12], [10, 11]],
		6: [[16, 11], [12, 10], [13, 9], [14, 8], [15, 7], [1, 6], [2, 5], [3, 4]],
		7: [[4, 16], [5, 3], [6, 2], [7, 1], [8, 15], [9, 14], [10, 13], [11, 12]],
		8: [[16, 12], [13, 11], [14, 10], [15, 9], [1, 8], [2, 7], [3, 6], [4, 5]],
		9: [[5, 16], [6, 4], [7, 3], [8, 2], [9, 1], [10, 15], [11, 14], [12, 13]],
		10: [[16, 13], [14, 12], [15, 11], [1, 10], [2, 9], [3, 8], [4, 7], [5, 6]],
		11: [[6, 16], [7, 5], [8, 4], [9, 3], [10, 2], [11, 1], [12, 15], [13, 14]],
		12: [[16, 14], [15, 13], [1, 12], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]],
		13: [[7, 16], [8, 6], [9, 5], [10, 4], [11, 3], [12, 2], [13, 1], [14, 15]],
		14: [[16, 15], [1, 14], [2, 13], [3, 12], [4, 11], [5, 10], [6, 9], [7, 8]],
		15: [[8, 16], [9, 7], [10, 6], [11, 5], [12, 4], [13, 3], [14, 2], [15, 1]],
	}
};