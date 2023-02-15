export class CrossTableHighlighter
{
	constructor(table)
	{
		this.table = table;
		
		this.cellHighlightClass = `${this.table.prefix}highlight-match`;
		this.playerHighlightClass = `${this.table.prefix}highlight-player`;
		
		this.lastCellHighlight = null;
		this.lastRowHighlight = null;
		this.lastColHighlight = null;
		
		this.lastPlayerHighlight = null;
		this.lastMatchHighlight = null;
	}

	setPlayerHighlight(pid, on = true)
	{
		this.lastPlayerHighlight = on ? pid : null;
		
		const row = this.table.model.pid2row[pid];
		const col = row + 1;
		
		this.setRowHighlight(row, on);
		this.setColHighlight(col, on);
	}

	setMatchHighlight(pid1, pid2, on = true)
	{
		[ pid1, pid2 ] = [ Math.min(pid1, pid2), Math.max(pid1, pid2) ];
		this.lastMatchHighlight = on ? { pid1, pid2 } : null;
		
		const row = this.table.model.pid2row[pid1];
		const col = this.table.model.pid2row[pid2];
		this.setCellHighlight(row, col, on);
	}

	togglePlayerHighlight(pid)
	{
		if (this.lastPlayerHighlight !== null)
		{
			// We need this because setPlayerHighlight modifies this.lastPlayerHighlight.
			const lastPlayerHighlight = this.lastPlayerHighlight;
			
			this.setPlayerHighlight(lastPlayerHighlight, false);
			if (lastPlayerHighlight == pid) return;
		}
		this.setPlayerHighlight(pid, true);
	}

	toggleMatchHighlight(pid1, pid2)
	{
		[ pid1, pid2 ] = [ Math.min(pid1, pid2), Math.max(pid1, pid2) ];
		
		if (this.lastMatchHighlight !== null)
		{
			const { pid1 : lastPid1, pid2 : lastPid2 } = this.lastMatchHighlight;
			this.setMatchHighlight(lastPid1, lastPid2, false);
			if (pid1 == lastPid1 && pid2 == lastPid2) return;
		}
		this.setMatchHighlight(pid1, pid2, true);
	}

	reset()
	{
		this.lastCellHighlight = null;
		this.lastRowHighlight = null;
		this.lastColHighlight = null;
		
		this.lastPlayerHighlight = null;
		this.lastMatchHighlight = null;
	}

	apply(byPid = true)
	{
		if (byPid)
		{
			if (this.lastPlayerHighlight !== null)
				this.setPlayerHighlight(this.lastPlayerHighlight);
			if (this.lastMatchHighlight !== null)
				this.setMatchHighlight(this.lastMatchHighlight.pid1, this.lastMatchHighlight.pid2);
		}
		else // byGrid
		{
			if (this.lastRowHighlight !== null)
				this.setRowHighlight(this.lastRowHighlight);
			if (this.lastColHighlight !== null)
				this.setColHighlight(this.lastColHighlight);
			if (this.lastCellHighlight !== null)
			{
				const { row, col } = this.lastCellHighlight;
				this.setCellHighlight(row, col);
			}
		}
	}

	setRowHighlight(row, on = true)
	{
		this.lastRowHighlight = on ? row : null;
		
		const tr = $(this.table.getCell(row, 0)).parent();
		if (on) tr.addClass(this.playerHighlightClass);
		else tr.removeClass(this.playerHighlightClass);
	}

	setColHighlight(col, on = true)
	{
		this.lastColHighlight = on ? col : null;
		
		for (let row = 0; row <= this.table.count; ++row)
		{
			const td = $(this.table.getCell(row, col));
			if (on) td.addClass(this.playerHighlightClass);
			else td.removeClass(this.playerHighlightClass);
		}
	}

	setCellHighlight(row, col, on=true)
	{
		[row, col] = [ Math.min(row, col), Math.max(row, col) ];
		this.lastCellHighlight = on ? { row, col } : null;
		
		const first = $(this.table.getCell(row, col + 1));
		if (on) first.addClass(this.cellHighlightClass);
		else first.removeClass(this.cellHighlightClass);
		
		const second = $(this.table.getCell(col, row + 1));
		if (on) second.addClass(this.cellHighlightClass);
		else second.removeClass(this.cellHighlightClass);
	}

	toggleRowHighlight(row)
	{
		throw new Error("Not implemented yet.");
	}

	toggleColHighlight(col)
	{
		throw new Error("Not implemented yet.");
	}

	toggleCellHighlight(row_, col_)
	{
		throw new Error("Not implemented yet.");
	}
}