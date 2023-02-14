function CrossTableHighlighter(table)
{
	this.table = table;
	this.lastMatchHighlight = null;
	this.lastRowHighlight = null;
	this.lastColHighlight = null;
	this.matchHighlightClass = "matchSelected";
	this.rowHighlightClass = "rowSelected";
	this.colHighlightClass = "colSelected";
}

CrossTableHighlighter.prototype.setMatchHighlight = function(row_, col_, on=true)
{
	const row = Math.min(row_, col_);
	const col = Math.max(row_, col_);
	const first = $(this.table.getCell(row, col + 1));
	if (on) first.addClass(this.matchHighlightClass);
	else first.removeClass(this.matchHighlightClass);
	const second = $(this.table.getCell(col, row + 1));
	if (on) second.addClass(this.matchHighlightClass);
	else second.removeClass(this.matchHighlightClass);
}

CrossTableHighlighter.prototype.toggleMatchHighlight = function(row_, col_)
{
	const row = Math.min(row_, col_);
	const col = Math.max(row_, col_);
	if (this.lastMatchHighlight !== null)
	{
		const lastRow = this.lastMatchHighlight["row"];
		const lastCol = this.lastMatchHighlight["col"];
		this.setMatchHighlight(lastRow, lastCol, false);
		if (lastRow == row && lastCol == col)
		{
			this.lastMatchHighlight = null;
			return;
		}
	}
	this.lastMatchHighlight = {row: row, col: col};
	this.setMatchHighlight(row, col);
}

CrossTableHighlighter.prototype.clearLastMatchHighlight = function()
{
	if (this.lastMatchHighlight === null) return;
	const lastRow = this.lastMatchHighlight["row"];
	const lastCol = this.lastMatchHighlight["col"];
	this.setMatchHighlight(lastRow, lastCol, false);
	this.lastMatchHighlight = null;
}

CrossTableHighlighter.prototype.toggleRowHighlight = function(row)
{
	if (this.lastRowHighlight !== null)
	{
		this.setRowHighlight(this.lastRowHighlight, false);
		if (this.lastRowHighlight == row)
		{
			this.lastRowHighlight = null;
			return;
		}
	}
	this.lastRowHighlight = row;
	this.setRowHighlight(row);
}

CrossTableHighlighter.prototype.setRowHighlight = function(row, on=true)
{
	if (row === null) return;
	const tr = $(this.table.getCell(row, 0)).parent();
	if (on) tr.addClass(this.rowHighlightClass);
	else tr.removeClass(this.rowHighlightClass);
}

CrossTableHighlighter.prototype.clearLastRowHighlight = function()
{
	if (this.lastRowHighlight === null) return;
	this.setRowHighlight(this.lastRowHighlight, false);
	this.lastRowHighlight = null;
}

CrossTableHighlighter.prototype.toggleColHighlight = function(col)
{
	if (this.lastColHighlight !== null)
	{
		this.setColHighlight(this.lastColHighlight, false);
		if (this.lastColHighlight == col)
		{
			this.lastColHighlight = null;
			return;
		}
	}
	this.lastColHighlight = col;
	this.setColHighlight(col);
}

CrossTableHighlighter.prototype.setColHighlight = function(col, on=true)
{
	if (col === null) return;
	for (let row = 0; row <= this.table.count; ++row)
	{
		const td = $(this.table.getCell(row, col));
		if (on) td.addClass(this.colHighlightClass);
		else td.removeClass(this.colHighlightClass);
	}
}

CrossTableHighlighter.prototype.clearLastColHighlight = function()
{
	if (this.lastColHighlight === null) return;
	this.setColHighlight(this.lastColHighlight, false);
	this.lastColHighlight = null;
}