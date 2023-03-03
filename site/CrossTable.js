import { getCellCoords } from "./tools.js";
import { CrossTableHighlighter } from "./CrossTableHighlighter.js";
import { Matches } from "./Matches.js";
import { SortedMatches } from "./SortedMatches.js";

// FIXME: Isolate the model from the controller & view
//	more thoroughly. So that all auxiliary controllers can
//	update it independently, triggering events. Maybe
//	start migrating to a (cross-browser) framework?

// The problem is that once we start the tournament
//	with N players, we've kinda committed to the
//	full N-1 rounds. Yes we can pull some matches
//	forward but in many cases (if not most) there is
//	no way to pack the remaining matches into fewer
//	rounds. But maybe for larger tournaments, or for
//	fortuitously indexed dropouts, it may still be
//	(efficiently) possible to cut a round or two. So:

// TODO: Devise a way to highlight up to N-1 rounds,
//	regardless of dropouts. See: onPlayerIndexClicked

// TODO: If sorting by points and some players' points are equal
//	let them have the same id (rank). Also add an option for this.

// TODO: When a score is updated make it pulse to draw
//	attention to it. When it is toggled via remote-control
//	auto-re-sort the table? Don't re-sort when updated
//	from within the crosstable or warp the cursor to stay
//	over the cell (this could be too confusing though).
//	See: onScoreClicked

// TODO: Add a pairings class. Make the column header
//	sensitive to round status.

// FIXME: Change all nulls to undefineds?

// FIXME: What do we do with Berger pairings when one or
//	more dropouts happen? Do we need to reindex the
//	pids? If so then do it with a LUT because players could
//	drop out but also back in (not practically but clicktically).

// TODO: Set the Berger pairing black side markers on creation.
//	Optionally highlight any discrepancies (when the match
//	actually played had a different color distribution than the
//	one dictated by the Berger pairings; which should never
//	happen, really).

// TODO: Put more effort into your choice of a palette. It must
//	be legible on the projector screen. Best to add a color
//	picker and some config controls for text size, font fam, etc.

// TODO: Middle buttons are not available on e.g. smartphones.
//	Decide how to handle the secondary click on those devices
//	(long press would count as a right click, no?). Maybe just
//	avoid it and enforce the use of extra HTML buttons.

// TODO: Add a player entry form. We need to be able to
//	quickly add the players of our club. Maybe add an
//	interface to the DWZ API of the Schachbund. Think
//	drag and drop rather than tippedy-type.

// TODO: Add a pairings table. Including the pairings in the
//	cross table could be too confusing, since the tables are
//	usually numbered rather than alphabetically enumerated.

// TODO: Add a remote control page to be provided the players
//	via a tablet. A player would click the table number where
//	they played and then click the game result.

// TODO: Encapsulate the fundamental table-geometry-based
//	layer into a separate class? (Remember not to optimize
//	too early! Thinking about too much at once will not get
//	you very far. Abstract the details away behind nice and
//	easy-to-remember interfaces and forget about the
//	implementation. Trust your code to be efficient enough,
//	at least for the time being.)

// TODO: In other words: Inflate the API to be more user friendly!

export class CrossTable
{
	constructor(paneId)
	{
		this.paneId = paneId;
		this.prefix = "data-cc-";
		this.table = null;
		this.model = null;
		this.count = 0;
		this.lastRoundHighlightIndex = 0;
		this.lastRoundHighlightIsPermanent = false;
		this.hi = new CrossTableHighlighter(this);
		this.opt = {
			keepLastHighlight : true,
			keepLastHighlightSorted : true,
			forceRectangularScoreCells : false,
			showPidsInsteadOfIndex : false,
			pushDownDropouts : true,
			smartResort : true,
			dropoutColSensitive : false,
			showRids : false,
		};
	}

	onmatchupdate(row, col, m) { console.log("onmatchupdate", row, col, m)  }

	attach() { if(this.table) $(this.table).appendTo(this.paneId); }

	remove() { if(this.table) $(this.table).remove(); }

	installEvents() { $(this.paneId).on("mousedown", e => { this.onMouseDown(e) }); }

	setData(data) { return this.model = new SortedMatches(new Matches(data)); }

	loadFromLocalStorage()
	{
		const pj = localStorage.players || "[]";
		const mj = localStorage.matches || "[]";
		// console.log("load: pj", pj);
		// console.log("load: mj", mj);
		const data = { players: [], matches: [] };
		try {
			data.players = JSON.parse(pj);
			data.matches = JSON.parse(mj);
			// console.info("data", data);
		} catch (e) {
			console.error(e);
		}
		const json = JSON.stringify(data);
		// console.log(json);
		return this.setData(json);
	}

	saveToLocalStorage()
	{
		const pj = JSON.stringify(this.model.matches.pa);
		const mj = JSON.stringify(this.model.matches.ma);
		// console.log("save: pj", pj);
		// console.log("save: mj", mj);
		localStorage.players = pj;
		localStorage.matches = mj;
	}

	getCell(row, col) { return this.table[0].childNodes[row].childNodes[col]; }

	getScoreCell(row, col) { return this.getCell(row, col + 1); }

	getNameCell(row) { return this.getCell(row, 1); }

	getPointsCell(row) { return this.getCell(row, 2 + this.count); }

	create(count)
	{
		const cc = {
			inert : `${this.prefix}celltype-inert`,
			sortable : `${this.prefix}celltype-sortable`,
			cell : `${this.prefix}celltype-cell`,
			player : `${this.prefix}celltype-player`,
		};
		
		const nameText = this.opt.showRids ? "Name/R" : "Name";
		
		this.count = count;
		this.table = $("<table>");
		
		let tr = $("<tr>");
		$("<th>").text("#").addClass(cc.sortable).appendTo(tr);
		$("<th>").text(nameText).addClass(cc.sortable).appendTo(tr);
		for (let row = 1; row <= count; ++row)
			$("<th>").addClass(cc.player).appendTo(tr);
		$("<th>").text("Punkte").addClass(cc.sortable).appendTo(tr);
		tr.appendTo(this.table);
		
		for (let i = 0; i < count; ++i)
		{
			let tr = $("<tr>");
			$("<td>").addClass(cc.player).appendTo(tr);
			$("<td>").text("").addClass(cc.player).appendTo(tr);
			
			for (let j = 0; j < count + 1; ++j)
			{
				let td = $("<td>").text(null);
				if (i == j) td.addClass(cc.inert).addClass("crosshatch");
				else if (j >= count) td.addClass(cc.inert);
				else td.addClass(cc.cell);
				td.appendTo(tr);
			}
			
			tr.appendTo(this.table);
		}
	}

	fill()
	{
		// TODO: Remove these shorthands?
		const matches = this.model.matches;
		const players = this.model.matches.pa;
		const pid2row = this.model.pid2row;
		
		// for (let i = 0; i < players.length; ++i)
		for (const p of players)
		{
			if (!p) continue;
			const row = pid2row[p[0]];
			const cell = $(this.getNameCell(row));
			cell.text(p[1]);
		}
		
		for (let i = 0; i < matches.matchesCount; ++i)
		{
			const m = matches.getMatchInfoByIndex(i);
			const whiteRow = pid2row[m[0]];
			const blackRow = pid2row[m[1]];
			const whiteCell = $(this.getScoreCell(whiteRow, blackRow));
			const blackCell = $(this.getScoreCell(blackRow, whiteRow));
			whiteCell.html(m.ws);
			blackCell.html(m.bs);
			whiteCell.addClass(`${this.prefix}side-w`);
			blackCell.addClass(`${this.prefix}side-b`);
		}
		
		this.fillIds();
		this.fillPoints();
		this.fillPointsResortIndicator();
		this.fillDropouts();
	}

	fillIds()
	{
		for (let col = 0, id = 0; col < this.count; ++col)
		{
			const pid = this.model.row2pid[col + 1];
			const th = $(this.table.find("th")[col + 2]);
			
			if (this.opt.showRids)
				th.text(col + 1);
			else
			{
				if (this.model.matches.isDropout(pid)) continue;
				else if (this.opt.showPidsInsteadOfIndex)
					th.text(pid);
				else
					th.text(id += 1);
			}
		}
		
		for (let row = 0, id = 0; row < this.count; ++row)
		{
			const pid = this.model.row2pid[row + 1];
			const td = $(this.getCell(row + 1, 0));
			
			if (this.model.matches.isDropout(pid)) continue;
			
			if (this.opt.showPidsInsteadOfIndex)
				td.text(pid);
			else
				td.text(id += 1);
		}
	}

	fillPointsResortIndicator()
	{
		const cls = `${this.prefix}resort`;
		const th = this.table.find("th").last();
		if (this.model.isSortedByPoints(this.opt.pushDownDropouts))
			th.removeClass(cls);
		else
			th.addClass(cls);
	}

	fillPoints()
	{
		for (let i = 0; i < this.count; ++i)
		{
			const points = this.sumRowPoints(i + 1);
			const cell = $(this.getPointsCell(i + 1));
			cell.text(points);
		}
	}

	fillDropouts(invalidate = true)
	{
		if (invalidate)
			for (let i = 0; i < this.count; ++i)
			{
				this.setRowClass(i + 1, "dropout", false);
				this.setColClass(i + 2, "dropout", false);
			}
		
		for (let i in this.model.matches.dropouts)
		{
			const pid = this.model.matches.dropouts[i];
			const row = this.model.pid2row[pid];
			const col = row + 1;
			
			this.setRowClass(row, "dropout", true);
			this.setColClass(col, "dropout", true);
		}
	}

	update()
	{
		// TODO: Do we need a nicer model API?
		
		if (!this.model) return false;
		this.remove();
		this.create(this.model.matches.playerCount);
		this.fill();
		this.attach();
		if (this.opt.keepLastHighlight)
			this.hi.apply(this.opt.keepLastHighlightSorted);
		else
			this.hi.reset();
		if (this.opt.forceRectangularScoreCells)
			this.makeScoreCellsRectangular();
		return true;
	}

	sumRowPoints(row)
	{
		if (row < 1 || row > this.count) return null;
		const pid = this.model.row2pid[row];
		return this.model.matches.getTotalPointsForPlayer(pid);
	}

	onMouseDown(e)
	{
		e.preventDefault();
		
		const cc = getCellCoords(e.target);
		if (!cc) return;
		
		if (cc.row == 0)
		{
			if (cc.col == 0)
				this.onIdHeaderClicked(e);
			
			else if (cc.col == 1)
				this.onNameHeaderClicked(e);
			
			else
			{
				if (cc.col - 2 == this.count)
					this.onPointsHeaderClicked(e);
				
				else if (cc.col >= 2 && cc.col - 1 <= this.count)
					this.onPlayerIndexClicked(e, cc.col - 1,
						this.getNameCell(cc.col - 1).innerText,
						e.originalEvent.button);
			}
		}
		else
		{
			if (cc.col <= 1)
				this.onPlayerClicked(e, cc.row,
					this.getNameCell(cc.row).innerText,
					e.originalEvent.button);
			
			else if (cc.col >= 2 && cc.col - 1 != cc.row && cc.col - 1 <= this.count)
				this.onScoreClicked(e, cc.row, cc.col - 1,
					e.target.innerText, e.originalEvent.button);
		}
	}

	onPlayerIndexClicked(e, row, text, button)
	{
		if (this.opt.showRids)
			return this.toggleRoundHighlight(row, button == 1);
		
		return this.onPlayerClicked(e, row, text, button);
	}

	onPlayerClicked(e, row, text, button)
	{
		// TODO: If a disabled (dropout) player is clicked, just remove
		// the last player highlight but make disabled players
		// non-highlightable. This is implicitly working for now,
		// b/c our background images have a hard-coded background
		// color (which is drawn on top of the cells' background).
		// In reality the highlight is set though but is hidden.
		
		const pid = this.model.row2pid[row];
		const isDropout = this.model.matches.isDropout(pid);
		if (button == 0 && (!isDropout || this.opt.dropoutColSensitive))
			this.hi.togglePlayerHighlight(pid);
		if (button == 1)
			this.togglePlayerEnabled(pid);
	}

	onScoreClicked(e, row, col, text, button)
	{
		const rowpid = this.model.row2pid[row];
		if (this.model.matches.isDropout(rowpid)) return;
		const colpid = this.model.row2pid[col];
		if (this.model.matches.isDropout(colpid)) return;
		
		if (e.button == 0)
		{
			this.hi.toggleMatchHighlight(rowpid, colpid);
		}
		else if (e.button == 1)
		{
			// this.hi.clearMatchHighlights();
			this.toggleScoreState(row, col, true);
		}
	}

	onIdHeaderClicked(e)
	{
		if (!this.model) return;
		if (e.button == 0)
			this.model.sortById(null, this.opt.pushDownDropouts);
		else if (e.button == 1)
			this.opt.showPidsInsteadOfIndex = !this.opt.showPidsInsteadOfIndex;
		this.update();
	}

	onNameHeaderClicked(e)
	{
		if (e.button == 0)
		{
			if (!this.model) return;
			this.model.sortByName(null, this.opt.pushDownDropouts);
		}
		else if (e.button == 1)
		{
			this.toggleRoundIdMode();
		}
		this.update();
	}

	onPointsHeaderClicked(e)
	{
		if (!this.model) return;
		this.model.sortByPoints(null, this.opt.pushDownDropouts, this.opt.smartResort);
		this.update();
	}

	makeScoreCellsRectangular()
	{
		if (!this.table) return;
		if (!this.model) return;
		
		const count = this.model.matches.pa.length;
		for (let i=1; i <= count; ++i)
			for (let j=1; j <= count; ++j)
			{
				let td = this.getScoreCell(i, j);
				if (!td) continue;
				td = $(td);
				const w = parseFloat(td.css("width"));
				const h = parseFloat(td.css("height"));
				let size = Math.max(w, h);
				td.css("width", size + "px");
				td.css("height", size + "px");
			}
	}

	setRowClass(row, cls, on = true)
	{
		cls = this.prefix + cls;
		
		const tr = $(this.getCell(row, 0)).parent();
		if (on) tr.addClass(cls);
		else tr.removeClass(cls);
		
		for (let col = 0; col < this.count + 3; ++col)
		{
			const td = $(this.getCell(row, col));
			if (on) td.addClass(cls);
			else td.removeClass(cls);
		}
	}

	setColClass(col, cls, on = true)
	{
		// TODO: In addition, maybe we could use colgroups here?
		
		cls = this.prefix + cls;
		for (let row = 0; row < this.count + 1; ++row)
		{
			const td = $(this.getCell(row, col));
			if (on) td.addClass(cls);
			else td.removeClass(cls);
		}
	}
	
	togglePlayerEnabled(pid)
	{
		// TODO: Add an option to remove the player completely.
		//	Maybe { display: none; } could serve to do just that?
		
		const on = this.model.matches.toggleDropout(pid);
		
		const row = this.model.pid2row[pid];
		const col = row + 1;
		
		this.setRowClass(row, "dropout", on);
		this.setColClass(col, "dropout", on);
		
		// TODO: All of these might be affected by players dropping in/out.
		//	Make the fillers more fine-grained?
		
		// this.fillIds();
		// this.fillPoints();
		// this.fillPointsResortIndicator();
		// this.fillDropouts(true);
		
		this.update();
	}

	toggleScoreState(row, col, notify = false)
	{
		// this.hi.clearMatchHighlights(row, col);
		const rowpid = this.model.row2pid[row];
		if (this.model.matches.isDropout(rowpid)) return;
		const colpid = this.model.row2pid[col];
		if (this.model.matches.isDropout(colpid)) return;
		this.model.matches.ensureMatchExists(rowpid, colpid);
		const match = this.model.matches.getMatchInfo(rowpid, colpid);
		const whiteScoreClicked = rowpid == match[0];
		match.toggleResult(whiteScoreClicked);
		this.update();	// FIXME: We just need to update a single cell here.
		if (notify && this.onmatchupdate)
			this.onmatchupdate(row, col, match.m);
	}

	toggleRoundIdMode()
	{
		this.opt.showRids = !this.opt.showRids;
		
		if (!this.opt.showRids && !this.lastRoundHighlightIsPermanent)
			this.toggleRoundHighlight(this.lastRoundHighlightIndex);
	}

	toggleRoundHighlight(index, permanent = false)
	{
		this.hi.setRoundHighlight(0);
		
		if (this.lastRoundHighlightIndex == index || index == 0 || index == null)
		{
			this.lastRoundHighlightIndex = 0;
			this.lastRoundHighlightIsPermanent = false;
			return;
		}
		
		this.lastRoundHighlightIndex = index;
		this.lastRoundHighlightIsPermanent = permanent;
		this.hi.setRoundHighlight(index);
	}
}