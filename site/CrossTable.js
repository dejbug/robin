import { getCellCoords, scoreToString } from "./tools.js";
import CrossTableHighlighter from "./CrossTableHighlighter.js";

export default class CrossTable
{
	constructor(paneId)
	{
		this.paneId = paneId;
		this.table = null;
		this.count = 0;
		this.hi = new CrossTableHighlighter(this);
	}

	create(count)
	{
		const suits = ["&spades;", "&clubs;", "&hearts;", "&diams;"];

		this.count = count;
		this.table = $("<table>");
		
		let tr = $("<tr>");
		$("<th>").text("#").css("cursor", "not-allowed").appendTo(tr);
		$("<th>").text("Name").css("cursor", "ns-resize").appendTo(tr);
		for (let i = 0; i < count; ++i)
			$("<th>").text(i + 1).css("cursor", "pointer").appendTo(tr);
		$("<th>").text("Punkte").css("cursor", "ns-resize").appendTo(tr);
		tr.appendTo(this.table);
		
		for (let i = 0; i < count; ++i)
		{
			let tr = $("<tr>");
			$("<td>").text(i + 1).css("cursor", "pointer").appendTo(tr);
			$("<td>").text("").css("cursor", "pointer").appendTo(tr);
			
			for (let j = 0; j < count + 1; ++j)
			{
				let td = $("<td>").text(null);
				if (j < count && i != j) td.css("cursor", "cell");
				else {
					if (i == j)
					{
						td.addClass("crosshatch");
						// td.css("color", "lightgrey").html(suits[i % suits.length]);
						// td.html("&middot;");
						// td.html("&there4;");
					}
					td.css("cursor", "not-allowed");
				}
				td.appendTo(tr);
			}
			
			tr.appendTo(this.table);
		}
		
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

	fill(players, matches)
	{
		// TODO: Error if players.length > this.count ?
		
		for (let i = 0; i < players.length; ++i)
		{
			const p = players[i];
			const cell = $(this.getNameCell(i + 1));
			cell.text(p[1]);
			// cell.attr("data-pid", p[0]);
		}
		
		for (let i = 0; i < matches.length; ++i)
		{
			const m = matches[i];
			const whiteCell = $(this.getScoreCell(m[0], m[1]));
			const blackCell = $(this.getScoreCell(m[1], m[0]));
			whiteCell.html(scoreToString(m[2]));
			whiteCell.attr("data-res", m[2]);
			blackCell.html(scoreToString(1 - m[2]));
			blackCell.attr("data-res", 1 - m[2]);
			whiteCell.attr("data-side", "w");
			blackCell.attr("data-side", "b");
		}
		
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

	update(players, matches)
	{
		this.remove();
		this.create(players.length);
		this.fill(players, matches);
		this.attach();
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
				if (cc.col == 1)
					this.sortByName(e);
				else
				{
					if (cc.col - 2 == this.count)
						this.sortByPoints(e);
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

	onPlayerClicked(e, row, text)
	{
		console.log("onPlayerClicked(e, " + row + ", '" + text + "')");
		this.hi.toggleRowHighlight(row);
		this.hi.toggleColHighlight(row + 1);
	}

	onScoreClicked(e, row, col, text)
	{
		console.log("onScoreClicked(e, " + row + ", " + col + ", '" + text + "')");
		this.hi.toggleMatchHighlight(row, col);
	}

	sortByName(e)
	{
		console.log("sortByName(e)");
		// this.sm.sortByName();
		// this.sm.dump();
		// this.update();
	}

	sortByPoints(e)
	{
		console.log("sortByPoints(e)");
	}
}