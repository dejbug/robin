export class Table
{
	constructor(rows, cols, hasHeader = false)
	{
		this.rendered = undefined;
		this.rows = parseInt(rows);
		this.cols = parseInt(cols);
		this.hasHeader = hasHeader;
	}

	render()
	{
		if (this.rendered)
		{
			this.rendered.remove();
			this.rendered = undefined;
		}
		this.rendered = document.createElement("table");
		for (let ri=0; ri<this.rows; ++ri)
		{
			const tr = document.createElement("tr");
			for (let ci=0; ci<this.cols; ++ci)
			{
				const td = document.createElement(ci == 0 && this.hasHeader ? "th" : "td");
				tr.append(td);
			}
			this.rendered.append(tr);
		}
		return this;
	}

	cell(row, col)
	{
		if (!this.rendered) return undefined;
		if (row < 0 || row >= this.rows) return undefined;
		if (col < 0 || col >= this.cols) return undefined;
		return this.rendered.children[row].children[col];
	}

	vget(row, col)
	{
		const cell = this.cell(row, col);
		if (!cell) return cell;
		return cell.innerText;
	}

	vset(row, col, v)
	{
		const cell = this.cell(row, col);
		if (!cell) return false;
		cell.innerText = v;
		return true;
	}

	chas(row, col, c)
	{
		const cell = this.cell(row, col);
		if (!cell) return false;
		return cell.classList.contains(c);
	}

	cadd(row, col, c)
	{
		const cell = this.cell(row, col);
		if (!cell) return false;
		cell.classList.add(c);
		return true;
	}

	crem(row, col, cls)
	{
		const cell = this.cell(row, col);
		if (!cell) return false;
		cell.classList.remove(cls);
		return true;
	}

	cfind(row, col, ...cc)
	{
		const cell = this.cell(row, col);
		if (!cell) return undefined;
		const clist = cell.classList;
		return cc.filter(c => clist.contains(c));
	}

	cifind(row, col, ...cc)
	{
		const cell = this.cell(row, col);
		if (!cell) return undefined;
		const clist = cell.classList;
		let ii = [];
		for (let i in cc)
			if (clist.contains(cc[i]))
				ii.push(i);
		return ii;
	}

	ctog(row, col, ...cc)
	{
		const cell = this.cell(row, col);
		if (!cell) return false;
		
		const clst = cell.classList;
		
		let enableNext = false;
		let disableNext = false;
		
		for (let c of cc)
		{
			if (disableNext)
			{
				clst.remove(c);
			}
			else if (enableNext)
			{
				clst.add(c);
				disableNext = true;
			}
			else if (clst.contains(c))
			{
				clst.remove(c);
				enableNext = true;
			}
		}
		
		if (!enableNext)
			clst.add(cc[0]);
		
		return true;
	}

	ahas(row, col, a)
	{
		const cell = this.cell(row, col);
		if (!cell) return false;
		return a in cell.attributes;
	}

	afind(row, col, a, ...vv)
	{
		const cell = this.cell(row, col);
		if (!cell) return undefined;
		const adict = cell.attributes;
		if (!(a in adict)) return undefined;
		const val = adict[a];
		return vv.filter(v => val == v);
	}

	aifind(row, col, a, ...vv)
	{
		const cell = this.cell(row, col);
		if (!cell) return undefined;
		const adict = cell.attributes;
		if (!(a in adict)) return undefined;
		return vv.indexOf(adict[a]);
	}

	aadd(row, col, a, v = null)
	{
		const cell = this.cell(row, col);
		if (!cell) return false;
		cell.attributes[a] = v;
		return true;
	}

	arem(row, col, a)
	{
		const cell = this.cell(row, col);
		if (!cell) return false;
		delete cell.attributes[a];
		return true;
	}

	atog(row, col, a, ...vv)
	{
		const cell = this.cell(row, col);
		if (!cell) return false;
		
		const adict = cell.attributes;
		
		if (!(a in adict))
		{
			adict[a] = vv.length > 0 ? vv[0] : null;
			return true;
		}
		
		if (!vv) return true;
		
		let enableNext = false;
		
		for (let v of vv)
		{
			if (enableNext)
			{
				adict[a] = v;
				break;
			}
			else if (adict[a] == v)
			{
				delete adict[a];
				enableNext = true;
			}
		}
		
		if (!enableNext)
			adict[a] = vv[0];
		
		return true;
	}
};
