import { getCellCoords, scoreToString } from "./tools.js";
import { CrossTableHighlighter } from "./CrossTableHighlighter.js";
import { Matches } from "./Matches.js";
import { SortedMatches } from "./SortedMatches.js";

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
		this.opt = { keepLastHighlight : true, keepLastHighlightSorted : true, }
	}

	create(count)
	{
		// const suits = ["&spades;", "&clubs;", "&hearts;", "&diams;"];
		
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
		for (let i = 0; i < count; ++i)
			$("<th>").text(i + 1).addClass(cc.player).appendTo(tr);
		$("<th>").text("Punkte").addClass(cc.sortable).appendTo(tr);
		tr.appendTo(this.table);
		
		for (let i = 0; i < count; ++i)
		{
			let tr = $("<tr>");
			$("<td>").text(i + 1).addClass(cc.player).appendTo(tr);
			$("<td>").text("").addClass(cc.player).appendTo(tr);
			
			for (let j = 0; j < count + 1; ++j)
			{
				let td = $("<td>").text(null);
				if (j < count && i != j) td.addClass(cc.cell)
				else
				{
					if (i == j)
					{
						td.addClass("crosshatch");
						// td.css("color", "lightgrey").html(suits[i % suits.length]);
						// td.html("&middot;");
						// td.html("&there4;");
					}
				}
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
			// cell.attr("data-pid", p[0]);
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
		
		// TODO: Do this with the internal data since accessing the DOM might be
		//	too expensive. Don't forget to use the pid2row LUT if present!
		
		for (let i = 0; i < players.length; ++i)
		{
			const points = this.sumRowPoints(i + 1);
			const cell = $(this.getPointsCell(i + 1));
			cell.text(points);
		}
	}

	remove()
	{
		if(this.table) $(this.table).remove();
	}

	attach()
	{
		if(this.table) $(this.table).appendTo(this.paneId);
	}

	installEvents()
	{
		$(this.paneId).on("mousedown", (e) =>
		{
			e.preventDefault();
			
			const cc = getCellCoords(e.target);
			if (!cc) return;
			// console.log(cc);
			
			if (cc.row == 0)
			{
				if (cc.col == 0)
					this.onSortById(e);
				else if (cc.col == 1)
					this.onSortByName(e);
				else
				{
					if (cc.col - 2 == this.count)
						this.onSortByPoints(e);
					else if (cc.col >= 2 && cc.col - 1 <= this.count)
						this.onPlayerClicked(e, cc.col - 1, this.getNameCell(cc.col - 1).innerText);
				}
			}
			else if (cc.row >= 1)
			{
				if (cc.col == 0)
					this.onPlayerClicked(e, cc.row, this.getNameCell(cc.row).innerText);
				else if (cc.col == 1)
					this.onPlayerClicked(e, cc.row, e.target.innerText);
				else if (cc.col >= 2 && cc.col - 1 != cc.row && cc.col - 1 <= this.count)
					this.onScoreClicked(e, cc.row, cc.col - 1, e.target.innerText);
			}
		});
	}

	setData(data)
	{
		this.model = new SortedMatches(new Matches(data));
		return this.model;
	}

	update()
	{
		// TODO: Do we need a nicer model API?
		
		if (!this.model) return false;
		this.remove();
		this.create(this.model.matches.pa.length);
		this.fill(this.model.matches.pa, this.model.matches.ma, this.model.pid2row);
		this.attach();
		if (this.opt.keepLastHighlight) this.hi.apply(this.opt.keepLastHighlightSorted);
		else this.hi.reset();
		// this.makeScoreCellsRectangular();
		return true;
	}

	sumRowPoints(row)
	{
		if (row < 1 || row > this.count) return null;
		let points = 0;
		for (let col = 1; col <= this.count; ++col)
		{
			if (row == col) continue;
			const cell = this.getScoreCell(row, col);
			const val = parseFloat($(cell).attr("data-res"));
			points += parseFloat(val);
		}
		return points;
	}

	getCell(row, col)
	{
		return this.table[0].childNodes[row].childNodes[col];
	}

	getScoreCell(row, col)
	{
		return this.getCell(row, col + 1);
	}

	getNameCell(row)
	{
		return this.getCell(row, 1);
	}

	getPointsCell(row)
	{
		return this.getCell(row, 2 + this.count);
	}

	onPlayerClicked(e, row, text)
	{
		const pid = this.model.row2pid[row];
		console.log(`onPlayerClicked(e, ${row} (${pid}), '${text}')`);
		
		this.hi.togglePlayerHighlight(pid);
	}

	onScoreClicked(e, row, col, text)
	{
		const rowpid = this.model.row2pid[row];
		const colpid = this.model.row2pid[col];
		console.log(`onScoreClicked(e, ${row} (${rowpid}), ${col} (${colpid}), '${text}')`);
		
		this.hi.toggleMatchHighlight(rowpid, colpid);
	}

	onSortById(e)
	{
		// TODO: Repeated clicks should toggle sorting order.
		
		console.log("onSortById(e)");
		if (!this.model) return;
		this.model.sortById();
		this.update();
	}

	onSortByName(e)
	{
		// TODO: Repeated clicks should toggle sorting order.
		
		console.log("onSortByName(e)");
		if (!this.model) return;
		this.model.sortByName();
		this.update();
	}

	onSortByPoints(e)
	{
		// TODO: Repeated clicks should toggle sorting order.
		
		console.log("onSortByPoints(e)");
		if (!this.model) return;
		this.model.sortByPoints();
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
}