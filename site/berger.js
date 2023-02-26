import { choose, Stack } from "./tools.js";

export function generateRoundsTable(playersCount)
{
	// TODO: When we figure out the prefab Berger tables'
	//	colorization scheme then we will replace the LUT
	//	with this here function and rename it to berger().
	
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

export function checkRoundsTable(rt)
{
	// TODO: The boolean return value is pointless given the
	//	presence/absence of the string. Refactor it.
	
	const rr = Object.keys(rt);
	const playersCount = rr.length;
	if (playersCount < 2) return [ false, "playersCount < 2" ];
	// console.log("ok: playersCount (%d)", playersCount)
	const cc = Object.keys(rt[rr[0]]);
	
	let sum = 0;
	for (let i = 1; i <= playersCount; ++i) sum += i;
	
	for (let r of rr)
	{
		let hsum = parseInt(r);
		for (let c in rt[r]) hsum += parseInt(rt[r][c]);
		if (hsum != sum) return [ false, `row ${r}: ${hsum} != ${sum}` ];
		// console.log("ok: row %d (%d == %d)", r, hsum, sum)
	}
	
	for (let c of cc)
	{
		let vsum = 0;
		for (let r of rr) vsum += rt[r][c];
		if (vsum != sum) return [ false, `col ${c}: ${vsum} != ${sum}` ];
		// console.log("ok: col %d (%d == %d)", c, vsum, sum)
	}
	
	return [ true, null ];
}

export function generateRandomRoundsTable(playersCount)
{
	// TODO: On second thought randomization over PR tables
	//	doesn't look as straight-forward as it does over PP tables.
	//	We only need look left and upwards in PP.
	
	if (playersCount < 2) return null;
	playersCount = playersCount + (playersCount % 2);
	const roundsCount = playersCount - 1;
	
	const table = [];
	const players = new Stack();
	for (let pid = 1; pid <= playersCount; ++pid)
	{
		table[pid] = [];
		for (let rid = 1; rid <= roundsCount; ++rid)
			table[pid][rid] = null;
		if (pid < playersCount) players.push(pid);
	}
	
	const cellsCount = playersCount * roundsCount;
	let cellsConsidered = 0;
	let cellsTouched = 0;
	
	for (let offset = 0; offset < roundsCount; ++offset)
	{
		// This works nicely, of course:
		// const roid = players.empty() ? playersCount : players.pop();
		// Unlike this:
		const roid = players.empty() ? playersCount : players.poprandom();
		// Why? There must be a way to fudge it, given how many configurations exist.
		// It seems that the, let's call it, diagonal approach has the constraint that the
		// higher diagonal hold a higher number.
		
		for (let rid = 1; rid <= roundsCount; ++rid)
		{
			cellsConsidered += 1;
			const pid = (offset + rid - 1) % roundsCount + 1;
			const oid = pid == roid ? playersCount : roid;
			const skip1 = table[pid][rid] !== null;
			const skip2 = table[oid][rid] !== null;
			let notes = "";
			notes += (pid == roid) ? "s|" : "-|";
			notes += (skip1) ? "1|" : "-|";
			notes += (skip1) ? "2" : "-";
			console.log("%d:%d=%d %d:%d=%d |%s|", pid, rid, oid, oid, rid, pid, notes);
			if (!skip1) { table[pid][rid] = oid; ++cellsTouched; }
			if (!skip2) { table[oid][rid] = pid; ++cellsTouched; }
		}
	}
	
	const [ ok, err ] = checkRoundsTable(table);
	
	const cellsLeftOut = cellsCount - cellsTouched;
	console.log("[%s] %d touched of %d considered of %d total (= %d collisions) // %s",
		ok ? "good" : "fail",
		cellsTouched, cellsConsidered, cellsCount, cellsLeftOut, err);
	
	return table;
}

export function generateRandomRoundsTable1(playersCount)
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

export function bergerTableFromRoundsTable(rt)
{
	let bt = [];
	
	for (let rid in rt[1])
		bt[rid] = [];
	
	for (let rid in bt)
		for (let pid in rt)
		{
			pid = parseInt(pid);
			const opp = rt[pid][rid];
			if (pid < opp)
				bt[rid].push([pid, opp])
		}
	
	return bt;
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

export function connectColorTables(a, b)
{
	const swapCellColor = (td, tab) => {
		const row = td.parentNode.rowIndex;
		const col = td.cellIndex;
		if (row < 1 || col < 1) return;
		const tt = tab.attr("berger-colors-table-type");
		const rows = tab[0].querySelectorAll("tr");
		let cell = null;
		let opp = null;
		if (tt == 1)
		{
			const pid = row;
			const oid = col;
			const rid = parseInt(td.innerText);
			if (isNaN(rid)) return;
			cell = rows[pid].children[rid];
			opp = rows[oid].children[rid];
		}
		else if (tt == 2)
		{
			const pid = row;
			const rid = col;
			const oid = parseInt(td.innerText);
			const rows = tab[0].querySelectorAll("tr");
			cell = rows[pid].children[oid];
			opp = rows[oid].children[pid];
		}
		else return;
		
		const white = cell.classList.contains("white");
		cell.classList.remove(white ? "white" : "black");
		cell.classList.add(white ? "black" : "white");
		opp.classList.remove(white ? "black" : "white");
		opp.classList.add(white ? "white" : "black");
	};
	
	a.on("mousedown", e => swapCellColor(e.target, b));
	b.on("mousedown", e => swapCellColor(e.target, a));
}

export function berger(playersCount)
{
	if (playersCount < 3 || playersCount > 16) return null;
	return lut[playersCount + (playersCount % 2)];
}

export function calcTableCount(playersCount)
{
	// FIXME: An 8-player table has 125,411,328,000 possibilities?!
	//	I don't think so! Something is going wrong here.
	//	I'm underestimating the constraints. ( Think sudoku. )
	//	This approach is rushed and rather naive.
	
	// Ok. So let's be looking at PP-tables for the calculations instead.
	//	For a 1-player table there are zero rounds, hence the table
	//	count is 0. 2 players have exactly one round, so 1. For any
	//	odd number of players we wouldn't be able to fill the table,
	//	reflecting the presence of byes. So we start thinking really
	//	only upwards of 4 players. It is obvious that here we have
	//	(n-1)!(n-2)! possibilities. At this point we will have to think
	//	about how to count permutations with constraints. Clearly,
	//	there are no constraints on the first permutation (i.e. the
	//	1st player's opp-seq), so (n-1)!, but for the next cells going
	//	down the diagonal (r:c 1:2, 2:3, ...) we'll need to look leftwards
	//	and up for the exclusions. At 4:5 for example it is clear that
	//	there are 6 cells to consider, which is more than n, proving
	//	the existence of duplicate exclusions. Generally, for each
	//	cell r:c we see that there are ((r-1)*2 + c-(r+1)) exclusions
	//	max (i.e. with counting the duplicates). The presence of
	//	dup-exs complicates the matter. If we could find a way to
	//	count the duplicates, only then would we be able to find the
	//	accurate table count. So maybe we need a different approach.
	//	Looking at the PP table again we see that for row 1 we get
	//	to choose one row out of the max possible permutation list.
	//	1,2,3,4,5 for instance. Choosing this sequence predetermines
	//	the starting element for the second row, in this case: 1. All
	//	we need to do now is to count how many selections we have
	//	with 1 in first position and with none of the remaining elements
	//	in their original positions. A rotation comes to mind. Alas, the
	//	concept of an element's "original position" evaporates for the
	//	lower rows, which would have 2 or more such originals to reckon
	//	with. So rotations won't do in the general case and we need
	//	to come up with some more clever way of swapping.
	
	
	if (playersCount < 2) return 0;
	if (playersCount == 2) return 1;
	
	playersCount += playersCount % 2;
	const roundsCount = playersCount - 1;
	
	// Looking at a rounds table, we go from the first row to the last
	//	and count how many permutations we can choose from.
	//	Each choice removes a diagonal from the bottom rows.
	//	The last two rows are entirely determined by the upper ones.	
	// const factorial = n => n > 1 ? n * factorial(n - 1) : 1;
	// for (let rid = roundsCount; rid > 0; --rid) count *= factorial(rid);
	
	let count = 1;
	let fac = 1;
	for (let rid = 2; rid <= roundsCount; ++rid)
	{
		fac *= rid;
		count *= fac;
	}
	return count;
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

class Vector
{
	constructor(x = 0, y = 0)
	{
		this.x = x;
		this.y = y;
	}
	
	clone() { return new Vector(this.x, this.y); }
	
	smul(s) { return new Vector(this.x * s, this.y * s); }
	sdiv(s) { return new Vector(this.x / s, this.y / s); }
	
	vadd(v) { return new Vector(this.x + v.x, this.y + v.y); }
	vsub(v) { return new Vector(this.x - v.x, this.y - v.y); }
	
	inv() { return new Vector(this.y, -this.x); }
	len() { return Math.sqrt(this.x * this.x, this.y * this.y); }
	norm() { return this.sdiv(this.len()); }
	
	toString() { return `[${this.x} ${this.y}]`; }
}
Vector.fromLine = function(x1, y1, x2, y2) { return new Vector(x2 - x1, y2 - y1); }

function calcRadialVectors(count)
{
	const vv = [];
	const arc = Math.PI * 2 / count;
	for (let i = 0, rad = 0; i <= count; ++i, rad += arc)
		vv.push(new Vector(Math.cos(rad), Math.sin(rad)));
	return vv;
}

function calcRadialPoints(count, x = 0, y = 0, r = 1)
{
	const vv = calcRadialVectors(count);
	const pp = [];
	for (let v of vv)
		pp.push({ x: x + r * v.x, y: y + r * v.y, v });
	return pp;
}

function drawRRMapRound(table, rid, x = 0, y = 0, r = 1, rnode = 1, pc = null)
{
	if (table == undefined || !(rid in table)) return "";
	if (!(rid in table)) return "";
	
	pc = pc || Object.keys(table).length + 1;
	if (pc < 2) return "";
	
	let html = "";
	
	const tx = 0;
	const ty = rnode / 3;
	
	const pp = calcRadialPoints(pc, x, y, r);
	let solo = null;
	
	const data = [];
	
	for (let m of table[rid])
	{
		const [ wid, bid ] = m;
		data[wid] = { white: true, opp: bid, p: pp[wid - 1], n: pp[bid - 1], drop: wid > pc, bye: bid > pc };
		data[bid] = { white: false, opp: wid, p: pp[bid - 1], n: pp[wid - 1], drop: bid > pc, bye: wid > pc };
	}
	
	// TODO: Add a bit more space between the lines, so they
	//	won't overlap the circles.
	// const normal = Vector.fromLine(pp[0].x, pp[0].y, pp[1].x, pp[1].y).inv().norm();
	// const p1 = data[1].p;
	// const p2 = data[1].n;
	// const normal = Vector.fromLine(p1.x, p1.y, p2.x, p2.y).inv().norm();
	// console.log("%s", normal);
	// const off = { x: normal.x * (rnode * 2) / pc, y: normal.y * (rnode * 2) / pc };
	// const mid = Math.floor(pc / 4);
	// console.log({normal, off, mid});
	
	for (let pid in data)
	{
		const d = data[pid];
		if (d.drop || d.bye) continue;
		if (!d.white) continue;
		html += `<line x1="${d.p.x}" y1="${d.p.y}" x2="${d.n.x}" y2="${d.n.y}" stroke="black"/>`;
		
		continue;
		
		const { x: x1, y: y1 } = d.p;
		const { x: x2, y: y2 } = d.n;
		const rv = Vector.fromLine(x, y, x1, y1);
		const tv = Vector.fromLine(x1, x2, x2, y2).sdiv(2);
		const o = rv.vadd(tv).norm().smul(5);
		console.log("%d: %s", pid, o);
		// html += `<line x1="${x1 + o.x}" y1="${y1 + o.y}" x2="${x2 + o.x}" y2="${y2 + o.y}" stroke="black"/>`;
	}
	
	for (let pid in data)
	{
		const d = data[pid];
		if (d.drop) continue;
		const stroke = d.bye ? "grey" : "black";
		html += `<circle r="${rnode}" cx="${d.p.x}" cy="${d.p.y}" fill="white" stroke="${stroke}"/>`;
		html += `<text x="${d.p.x + tx}" y="${d.p.y + ty}" font-size="${rnode}" text-anchor="middle">${pid}</text>`;

	}
	
	return html;
}

function renderMap(table, cols = 1, r = 60, rnode = 10)
{
	const div = document.createElement("div");
	
	const count = Object.keys(table).length;
	if (count < cols) cols = count;
	
	const gap = rnode * 2;
	const off = gap + r;
	const step = (gap + r) * 2;
	const rows = Math.ceil(count / cols);
	
	const width = cols * step;
	const height = rows * step;
	
	let html = `<svg width="${width}" height="${height}">`;
	// html += `<rect x="0" y="0" width="${width-1}" height="${height-1}" fill="white" stroke="black"/>`;
	
	for (let rid in table)
	{
		const i = (rid - 1) % cols;
		const j = Math.floor((rid - 1) / cols);
		// console.log(rid, i, j);
		html += drawRRMapRound(table, rid, off + step * i, off + step * j, r, rnode);
	}
	
	html += '</svg>';
	div.innerHTML = html;
	return div;
}

function createRandomlyGeneratedTable(pc = 8, attempts = 10)
{
	let gen = null;
	let attempt = 0;
	for (attempt = 1; attempt <= attempts; ++attempt)
	{
		gen = generateRandomRoundsTable1(pc);
		if (!gen) continue;
		const [ ok, err ] = checkRoundsTable(gen);
		if (ok) break;
	}
	return [ gen, attempt ];
}

// FIXME: class Table is a patchwork of the above functions. We need to redesign it.
// TODO: Replace these obsoleted functions:
// 	renderBergerColorsTable1, renderBergerColorsTable2,
//	renderBergerTable, colorSwitchingHandler.



export class Table
{
	constructor() { this.reset(); }
	
	reset()
	{
		this.attempts = 0;
		
		this.rm = undefined;
		this.pr = undefined;
		this.ct = undefined;
		
		if (this.rpr) this.rm.remove();
		if (this.rpp) this.pr.remove();
		if (this.rrm) this.ct.remove();
		
		this.rpr = undefined;
		this.rpp = undefined;
		this.rrm = undefined;
	}
	
	ok() { return this.pr != undefined; }
	
	generate(pc, attempts = 1000)
	{
		this.reset();
		
		this.attempts = attempts;
		
		[ this.pr, this.attempt ] = createRandomlyGeneratedTable(pc, this.attempts);
		if (!this.pr) return false;
		
		this.rm = bergerTableFromRoundsTable(distributeRoundsColors(this.pr));
		this.ct = colorsTableFromBergerTable(this.rm);
		
		this.renderPR();
		this.renderPP();
		this.renderRM();
		
		this.rpr.on("mousedown", e => this.colorSwitchingHandler(e));
		this.rpp.on("mousedown", e => this.colorSwitchingHandler(e));
		this.rrm.on("mousedown", e => this.colorSwitchingHandler(e));
		
		return true;
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
	
	appendInfo(id)
	{
		const info = $("<span>").appendTo("#info");
		if (this.pr) info.text(`Generated random PR-table in ${this.attempt} attempt(s).`);
		else info.addClass("error").text(`Was unable to generate PR-table in ${this.attempts} attempt(s).`);
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