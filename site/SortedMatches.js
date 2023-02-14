export default class SortedMatches
{
	constructor(matches)
	{
		this.matches = matches;
		this.row2pid = null;
		this.pid2row = null;
	}

	dump()
	{	
		this.sortByName();
		console.log("N>", this.row2pid);
		console.log("N<", this.pid2row);
		this.sortByName(true);
		console.log("Nr>", this.row2pid);
		console.log("Nr<", this.pid2row);
		
		this.sortByPoints();
		console.log("P>", this.row2pid);
		console.log("P<", this.pid2row);
		this.sortByPoints(true);
		console.log("Pr>", this.row2pid);
		console.log("Pr<", this.pid2row);
		
		this.sortById();
		console.log("I>", this.row2pid);
		console.log("I<", this.pid2row);
		this.sortById(true);
		console.log("Ir>", this.row2pid);
		console.log("Ir<", this.pid2row);
	}

	sortById(reversed = false)
	{
		this.row2pid = [];
		this.pid2row = [];
		const pa = this.matches.pa.slice(0);
		pa.sort(function (a,b) {
			const cmp = a[0] - b[0];
			return reversed ? 1 - cmp : cmp;
		});
		for (let i = 0; i < pa.length; ++i)
		{
			const row = i + 1;
			this.row2pid[row] = pa[i][0];
			this.pid2row[pa[i][0]] = row;
		}
	}

	sortByName(reversed = false)
	{
		this.row2pid = [];
		this.pid2row = [];
		const pa = this.matches.pa.slice(0);
		pa.sort(function (a,b) {
			const cmp = strCmp(a[1], b[1]);
			return reversed ? 1 - cmp : cmp;
		});
		for (let i = 0; i < pa.length; ++i)
		{
			const row = i + 1;
			this.row2pid[row] = pa[i][0];
			this.pid2row[pa[i][0]] = row;
		}
	}

	sortByPoints(reversed = false)
	{
		this.row2pid = [];
		this.pid2row = [];
		const tpa = this.matches.getTotalPointsArray();
		tpa.sort(function (a,b) {
			let cmp = Math.sign(b[2] - a[2]);
			if (cmp == 0) cmp = strCmp(a[1], b[1]);
			return reversed ? 1 - cmp : cmp;
		});
		for (let i = 0; i < tpa.length; ++i)
		{
			const row = i + 1;
			this.row2pid[row] = tpa[i][0];
			this.pid2row[tpa[i][0]] = row;
		}
	}
}