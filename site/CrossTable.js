// from Matches.js import Matches
// from SortedMatches.js import SortedMatches
// from tools.js import getCellCoords, strCmp, scoreToString

function CrossTable(paneId)
{
	this.pane = $(paneId);
	// TODO: Find out the best practice to do this. We want to
	//	automatically attach to the table pane (by id) and to the
	//	table contained within it which should be its first child (for now)
	//	but we need to find out how to query a node, i.e. instead of
	//	$("<table>") we want something like pane.$("<table>").
	this.table = this.pane.children(0);
	// console.log(this.table);
	this.count = 0;
	this.hi = new CrossTableHighlighter(this);
}

CrossTable.prototype.create = function(count)
{
	this.count = count;
	this.table = $("<table>");
	
	var tr = $("<tr>");
	$("<th>").text("#").css("cursor", "not-allowed").appendTo(tr);
	$("<th>").text("Name").css("cursor", "ns-resize").appendTo(tr);
	for (var i = 0; i < count; ++i)
		$("<th>").text(i + 1).css("cursor", "pointer").appendTo(tr);
	$("<th>").text("Punkte").css("cursor", "ns-resize").appendTo(tr);
	tr.appendTo(this.table);
	
	for (var i = 0; i < count; ++i)
	{
		var tr = $("<tr>");
		$("<td>").text(i + 1).css("cursor", "pointer").appendTo(tr);
		$("<td>").text("").css("cursor", "pointer").appendTo(tr);
		
		for (j = 0; j < count + 1; ++j)
		{
			var td = $("<td>").text(null);
			if (j < count && i != j) td.css("cursor", "cell");
			else td.css("cursor", "not-allowed");
			td.appendTo(tr);
		}
		
		tr.appendTo(this.table);
	}
}

CrossTable.prototype.sumRowPoints = function(row)
{
	if (row < 1 || row > this.count) return null;
	var points = 0;
	for (var col = 1; col <= this.count; ++col)
	{
		if (row == col) continue;
		const cell = this.getScoreCell(row, col);
		const val = parseFloat($(cell).attr("data-res"));
		points += parseFloat(val);
	}
	return points;
}

CrossTable.prototype.fill = function(players, matches)
{
	// TODO: Error if players.length > this.count ?
	
	for (var i = 0; i < players.length; ++i)
	{
		const p = players[i];
		const cell = $(this.getNameCell(i + 1));
		cell.text(p[1]);
		// cell.attr("data-pid", p[0]);
	}
	
	// const suits = ["&spades;", "&clubs;", "&hearts;", "&diams;"];
	
	for (var i = 0; i < players.length; ++i)
	{
		const cell = this.getScoreCell(i + 1, i + 1);
		// cell.innerHTML = suits[i % suits.length];
		// cell.innerHTML = "&middot;";
		// cell.innerHTML = "&lowast;";
		// cell.innerHTML = "&there4;";
		$(cell).addClass("crosshatch");
	}
	
	for (var i = 0; i < matches.length; ++i)
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
	
	for (var i = 0; i < players.length; ++i)
	{
		const points = this.sumRowPoints(i + 1);
		const cell = $(this.getPointsCell(i + 1));
		cell.text(points);
	}
}

CrossTable.prototype.remove = function()
{
	$(this.table).remove();
}

CrossTable.prototype.attach = function()
{
	$(this.table).appendTo(this.pane);
}

CrossTable.prototype.update = function(players, matches)
{
	this.create(players.length);
	this.fill(players, matches);
	this.remove();
	this.attach();
}

CrossTable.prototype.getCell = function(row, col)
{
	return this.table[0].childNodes[row].childNodes[col];
}

CrossTable.prototype.getScoreCell = function(row, col)
{
	return this.getCell(row, col + 1);
}

CrossTable.prototype.getNameCell = function(row)
{
	return this.getCell(row, 1);
}

CrossTable.prototype.getPointsCell = function(row)
{
	return this.getCell(row, 2 + this.count);
}

CrossTable.prototype.installEvents = function()
{
	const table = this;
	
	this.pane.on("mousedown", function(e)
	{
		// console.log(table);
		// const that = new CrossTable(this);
		// console.log("TABLE", this.id, table);
		// console.log(e);
		
		e.preventDefault();
		
		const cc = getCellCoords(e.target);
		if (!cc) return;
		// console.log(cc);
		
		if (cc.row == 0)
		{
			if (cc.col == 1)
				table.sortByName(e);
			else
			{
				if (cc.col - 2 == table.count)
					table.sortByPoints(e);
				else if (cc.col >= 2 && cc.col - 1 <= table.count)
					table.onPlayerClicked(e, cc.col - 1, table.getNameCell(cc.col - 1).innerText);
			}
		}
		else if (cc.row >= 1)
		{
			if (cc.col == 0)
				table.onPlayerClicked(e, cc.row, table.getNameCell(cc.row).innerText);
			else if (cc.col == 1)
				table.onPlayerClicked(e, cc.row, e.target.innerText);
			else if (cc.col >= 2 && cc.col - 1 != cc.row && cc.col - 1 <= table.count)
				table.onScoreClicked(e, cc.row, cc.col - 1, e.target.innerText);
		}
	});
}

CrossTable.prototype.onPlayerClicked = function(e, row, text)
{
	console.log("onPlayerClicked(e, " + row + ", '" + text + "')");
	this.hi.toggleRowHighlight(row);
	this.hi.toggleColHighlight(row + 1);
}

CrossTable.prototype.onScoreClicked = function(e, row, col, text)
{
	console.log("onScoreClicked(e, " + row + ", " + col + ", '" + text + "')");
	this.hi.toggleMatchHighlight(row, col);
}

CrossTable.prototype.sortByName = function(e)
{
	console.log("sortByName(e)");
	// this.sm.sortByName();
	// this.sm.dump();
	// this.update();
}

CrossTable.prototype.sortByPoints = function(e)
{
	console.log("sortByPoints(e)");
}