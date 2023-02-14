export default class CrossTableHighlighter
{
	constructor(table)
	{
		this.table = table;
		this.lastMatchHighlight = null;
		this.lastRowHighlight = null;
		this.lastColHighlight = null;
		this.matchHighlightClass = `${this.table.prefix}highlight-match`;
		this.playerHighlightClass = `${this.table.prefix}highlight-player`;
	}

	setMatchHighlight(row_, col_, on=true)
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

	toggleMatchHighlight(row_, col_)
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

	clearLastMatchHighlight()
	{
		if (this.lastMatchHighlight === null) return;
		const lastRow = this.lastMatchHighlight["row"];
		const lastCol = this.lastMatchHighlight["col"];
		this.setMatchHighlight(lastRow, lastCol, false);
		this.lastMatchHighlight = null;
	}

	toggleRowHighlight(row)
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

	setRowHighlight(row, on = true)
	{
		if (row === null) return;
		const tr = $(this.table.getCell(row, 0)).parent();
		if (on) tr.addClass(this.playerHighlightClass);
		else tr.removeClass(this.playerHighlightClass);
	}

	clearLastRowHighlight()
	{
		if (this.lastRowHighlight === null) return;
		this.setRowHighlight(this.lastRowHighlight, false);
		this.lastRowHighlight = null;
	}

	toggleColHighlight(col)
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

	setColHighlight(col, on = true)
	{
		if (col === null) return;
		for (let row = 0; row <= this.table.count; ++row)
		{
			const td = $(this.table.getCell(row, col));
			if (on) td.addClass(this.playerHighlightClass);
			else td.removeClass(this.playerHighlightClass);
		}
	}

	clearLastColHighlight()
	{
		if (this.lastColHighlight === null) return;
		this.setColHighlight(this.lastColHighlight, false);
		this.lastColHighlight = null;
	}
}