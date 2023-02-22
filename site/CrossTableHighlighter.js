import { berger } from "./berger.js";

// TODO: Add a facility to remember multiple highlights.
// TODO: Maybe add highlight groups? Like transparency layers.

export class CrossTableHighlighter
{
	constructor(table)
	{
		this.table = table;
		
		this.cellHighlightClass = `${this.table.prefix}highlight-match`;
		this.playerHighlightClass = `${this.table.prefix}highlight-player`;
		// this.roundHighlightClass = `${this.table.prefix}highlight-round`;
		this.roundHighlightWhiteClass = `${this.table.prefix}highlight-round-white`;
		this.roundHighlightBlackClass = `${this.table.prefix}highlight-round-black`;
		this.roundHighlightDeskClass = `${this.table.prefix}highlight-round-desk`;
		this.roundIndexHighlightClass = `${this.table.prefix}highlight-round-index`;
		
		this.lastCellHighlight = null;
		this.lastRowHighlight = null;
		this.lastColHighlight = null;
		
		this.lastPlayerHighlight = null;
		this.lastMatchHighlight = null;
		
		this.lastRoundHighlight = null;
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
		if (this.lastRoundHighlight !== null)
			this.setRoundHighlight(this.lastRoundHighlight);
	}

	setRowHighlight(row, on = true)
	{
		// TODO: Use CrossTable.SetRowClass?
		
		this.lastRowHighlight = on ? row : null;
		
		const tr = $(this.table.getCell(row, 0)).parent();
		if (on) tr.addClass(this.playerHighlightClass);
		else tr.removeClass(this.playerHighlightClass);
	}

	setColHighlight(col, on = true)
	{
		// TODO: Use CrossTable.SetColClass?
		
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

	clearMatchHighlights()
	{
		if (this.lastMatchHighlight === null) return;
		const { pid1 : lastPid1, pid2 : lastPid2 } = this.lastMatchHighlight;
		this.setMatchHighlight(lastPid1, lastPid2, false);
	}
	
	clearAllHighlights()
	{
		// TODO: Incomplete. Not tested yet and probably should
		//	merge this with reset() .
		
		const count = this.table.model.matches.pa.length;
		for (let row = 0; row < count + 1; ++row)
			for (let col = 1; col < count + 3; ++col)
			{
				const cell = $(this.table.getCell(i, j));
				cell.removeClass(this.cellHighlightClass);
				cell.removeClass(this.playerHighlightClass);
				// cell.removeClass(this.roundHighlightClass);
				cell.removeClass(this.roundHighlightWhiteClass);
				cell.removeClass(this.roundHighlightBlackClass);
			}
	}

	setRoundHighlight(index, on = true)
	{
		// FIXME: The code is messy. Clean it up.
		
		if (this.lastRoundHighlight != null)
		{
			const lastRoundHighlight = this.lastRoundHighlight;
			this.lastRoundHighlight = null;
			this.setRoundHighlight(lastRoundHighlight, false);
		}
		
		if (index == 0 || index == null) return;
		
		this.lastRoundHighlight = on ? index : null;
		
		const playerCount = this.table.model.matches.pa.length;
		
		const bergerTable = berger(playerCount);
		if (bergerTable == null) return;
		
		const pairings = bergerTable[index];
		if (pairings == null) return;
		
		const th = this.table.getCell(0, 1 + index);
		if (on && this.table.opt.showRids) th.classList.add(this.roundIndexHighlightClass);
		else th.classList.remove(this.roundIndexHighlightClass);
		
		let desk = 1;
		
		pairings.forEach(([wpid, bpid]) => {
			const wbye = wpid > playerCount;
			const bbye = bpid > playerCount;
			
			const wdrop = this.table.model.matches.isDropout(wpid);
			const bdrop = this.table.model.matches.isDropout(bpid);
			
			const row = this.table.model.pid2row[wpid];
			const col = this.table.model.pid2row[bpid];
			
			const m = this.table.model.matches.getMatchInfo(wpid, bpid);
			
			// console.log({wpid, bpid, row, col, wbye, bbye, wdrop, bdrop, m});
			
			if (wdrop || bdrop)
			{
				// One of the players is a dropout. Do nothing.
			}
			else if (wbye || bbye)
			{
				// TODO: Maybe add a roundHighlightByeClass ?
			}
			else if (m !== null && m[2] !== null)
			{
				// TODO: Maybe use the roundHighlightClass ?
				const w = $(this.table.getScoreCell(row, col));
				const b = $(this.table.getScoreCell(col, row));
				if (on) w.addClass(this.roundHighlightDeskClass);
				else w.removeClass(this.roundHighlightDeskClass);
				if (on) b.addClass(this.roundHighlightDeskClass);
				else b.removeClass(this.roundHighlightDeskClass);
				
				if (on)
				{
					++desk;
				}
			}
			else
			{
				const w = $(this.table.getScoreCell(row, col));
				if (on) w.addClass(this.roundHighlightWhiteClass);
				else w.removeClass(this.roundHighlightWhiteClass);
				const b = $(this.table.getScoreCell(col, row));
				if (on) b.addClass(this.roundHighlightBlackClass);
				else b.removeClass(this.roundHighlightBlackClass);
				
				if (on)
				{
					w.text(desk);
					b.text(desk);
					++desk;
				}
				else
				{
					w.html(m === null ? null : m.ws);
					b.html(m === null ? null : m.bs);
				}
			}
		});
	}
}