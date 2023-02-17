import { getCellCoords, scoreToString } from "./tools.js";
import { CrossTableHighlighter } from "./CrossTableHighlighter.js";
import { Matches } from "./Matches.js";
import { SortedMatches } from "./SortedMatches.js";

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

export class CrossTable
{
	constructor(paneId)
	{
		this.paneId = paneId;
		this.prefix = "data-cc-";
		this.table = null;
		this.model = null;
		this.count = 0;
		this.hi = new CrossTableHighlighter(this);
		this.opt = {
			keepLastHighlight : true,
			keepLastHighlightSorted : true,
			forceRectangularScoreCells : false,
			showPidsInsteadOfIndex : false,
			pushDownDropouts : true,
			smartResort : true,
		};
	}

	attach() { if(this.table) $(this.table).appendTo(this.paneId); }

	remove() { if(this.table) $(this.table).remove(); }

	installEvents() { $(this.paneId).on("mousedown", e => { this.onMouseDown(e) }); }

	setData(data) { return this.model = new SortedMatches(new Matches(data)); }

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
		
		this.count = count;
		this.table = $("<table>");
		
		let tr = $("<tr>");
		$("<th>").text("#").addClass(cc.sortable).appendTo(tr);
		$("<th>").text("Name").addClass(cc.sortable).appendTo(tr);
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
				if (j < count && i != j) td.addClass(cc.cell)
				else if (i == j) td.addClass("crosshatch");
				td.addClass(cc.inert).appendTo(tr);
			}
			
			tr.appendTo(this.table);
		}
	}

	fill(players, matches, pid2row)
	{
		// TODO: Error if players.length > this.count ?
		
		for (let i = 0; i < players.length; ++i)
		{
			const p = players[i];
			const row = pid2row ? pid2row[p[0]] : i + 1;
			const cell = $(this.getNameCell(row));
			cell.text(p[1]);
		}
		
		for (let i = 0; i < matches.length; ++i)
		{
			const m = matches[i];
			const whiteRow = pid2row ? pid2row[m[0]] : m[0];
			const blackRow = pid2row ? pid2row[m[1]] : m[1];
			const whiteCell = $(this.getScoreCell(whiteRow, blackRow));
			const blackCell = $(this.getScoreCell(blackRow, whiteRow));
			whiteCell.html(scoreToString(m[2]));
			whiteCell.attr("data-res", m[2]);
			blackCell.html(scoreToString(1 - m[2]));
			blackCell.attr("data-res", 1 - m[2]);
			whiteCell.attr("data-side", "w");
			blackCell.attr("data-side", "b");
		}
		
		this.fillIds();
		this.fillPoints();
		this.fillPointsResortIndicator();
		this.fillDropouts();
	}

	fillIds()
	{
		// TODO: If sorting by points and some players' points are equal
		//	let them have the same id (rank). Also add an option for this.
		
		for (let col = 0, id = 0; col < this.count; ++col)
		{
			const pid = this.model.row2pid[col + 1];
			const th = $(this.table.find("th")[col + 2]);
			if (this.opt.showPidsInsteadOfIndex)
				th.text(pid);
			else if (this.model.matches.dropouts.indexOf(pid) < 0)
				th.text(id += 1);
		}
		
		for (let row = 0, id = 0; row < this.count; ++row)
		{
			const pid = this.model.row2pid[row + 1];
			const td = $(this.getCell(row + 1, 0));
			if (this.opt.showPidsInsteadOfIndex)
				td.text(pid);
			else if (this.model.matches.dropouts.indexOf(pid) < 0)
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
		this.create(this.model.matches.pa.length);
		this.fill(this.model.matches.pa, this.model.matches.ma, this.model.pid2row);
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
		// TODO: Do this with the internal data since accessing the DOM might be
		//	too expensive. Don't forget to use the pid2row LUT!
		
		if (row < 1 || row > this.count) return null;
		
		const pid = this.model.row2pid[row];
		if (this.model.matches.dropouts.indexOf(pid) >= 0) return null;
		
		let points = 0;
		for (let col = 1; col <= this.count; ++col)
		{
			if (row == col) continue;
			const pid = this.model.row2pid[col];
			if (this.model.matches.dropouts.indexOf(pid) >= 0) continue;
			
			const cell = this.getScoreCell(row, col);
			const val = parseFloat($(cell).attr("data-res"));
			points += parseFloat(val);
		}
		return points;
	}

	onMouseDown(e)
	{
		// TODO: Distinguish between player clicks and player index/id clicks.
		//	The latter should be handled as usual on left click but may be
		//	optionally treated as round ids on middle clicks. Clicking on a
		//	round id could highlight the score cells for the pairings of that round.
		//	This would cut down on our layout real estate since there wouldn't
		//	be a need for an extra pairings table. Instead of an empty score cell,
		//	yet to be filled with the match result, it could be filled with the table
		//	number on which the player is going to play. The black-or-white mark
		//	needs to be styled more prominently though.
		
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
					this.onPlayerClicked(e, cc.col - 1,
						this.getNameCell(cc.col - 1).innerText,
						e.originalEvent.button);
			}
		}
		else if (cc.row >= 1)
		{
			if (cc.col == 0)
				this.onPlayerClicked(e, cc.row,
					this.getNameCell(cc.row).innerText,
					e.originalEvent.button);
			
			else if (cc.col == 1)
				this.onPlayerClicked(e, cc.row,
					e.target.innerText,
					e.originalEvent.button);
			
			else if (cc.col >= 2 && cc.col - 1 != cc.row && cc.col - 1 <= this.count)
				this.onScoreClicked(e, cc.row, cc.col - 1,
					e.target.innerText, e.originalEvent.button);
		}
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
		if (button == 0) this.hi.togglePlayerHighlight(pid);
		if (button == 1) this.togglePlayerEnabled(pid);
	}

	onScoreClicked(e, row, col, text, button)
	{
		// TODO: Make a middle click toggle through the possible
		//	values of a cell: a. empty/round-id, b. 0, c. 1/2, d. 1.
		//	Note that we must not automatically sort the table
		//	while interacting with it: a cell shall not be pulled from
		//	under our cursor mid-entry. This makes an extraneous
		//	pairings table more attractive.
		
		// TODO: When a score is updated, via remote-control, make
		//	it pulse once to draw attention to it.
		
		// TODO: Add another sorting mode (row/col swap-sort) so
		//	we can animate the changing table (slowly, nicely) to
		//	visualize the rank-shuffling going on.
		
		const rowpid = this.model.row2pid[row];
		const colpid = this.model.row2pid[col];
		this.hi.toggleMatchHighlight(rowpid, colpid);
	}

	onIdHeaderClicked(e)
	{
		if (!this.model) return;
		this.model.sortById(null, this.opt.pushDownDropouts);
		this.update();
	}

	onNameHeaderClicked(e)
	{
		if (!this.model) return;
		this.model.sortByName(null, this.opt.pushDownDropouts);
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
		
		const row = this.model.pid2row[pid];
		const col = row + 1;
		
		const index = this.model.matches.dropouts.indexOf(pid);
		
		if (index < 0) this.model.matches.dropouts.push(pid);
		else delete this.model.matches.dropouts[index];
		
		this.setRowClass(row, "dropout", index < 0);
		this.setColClass(col, "dropout", index < 0);
		
		// All of these things might be affected by players dropping in/out.
		this.fillIds();
		this.fillPoints();
		this.fillPointsResortIndicator();
		this.fillDropouts(true);
	}
}