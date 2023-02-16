import { strCmp } from "./tools.js";

// TODO: This class is a misnomer. It's not the matches that are sorted.
//	It's the model which is extended by a sorting capability. Maybe
//	this is an indication of muddled thinking. Maybe the muddled
//	thinking precludes a better design.

export class SortedMatches
{
	constructor(matches)
	{
		this.matches = matches;
		this.row2pid = null;
		this.pid2row = null;
		this.lastSortMode = null;
		// FIXME: Instead of sorting here, which is expensive,
		//	it would suffice to simply create an identity map.
		//	Not only would it suffice but it would match the
		//	expectations of the user.
		this.sortById();
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

	sortById(reversed = null)
	{
		this.lastSortMode = this.lastSortMode == 1 ? -this.lastSortMode : 1;
		reversed = reversed || this.lastSortMode < 0
		
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
		this.lastSortMode = this.lastSortMode == 2 ? -this.lastSortMode : 2;
		reversed = reversed || this.lastSortMode < 0
		
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

	sortByPoints(reversed = false, pushDownDropouts = true)
	{
		// TODO: Add more fallback sorting options. E.g. instead of
		//	falling back on name sort (in case of points equality)
		//	maybe first sort by rank of defeated opponents? So:
		//	if A.points == B.points but A fought stronger players
		//	than B, then A.rank < B.rank. "Stronger" meaning
		//	"currently lower ranked (i.e. higher up the list)".
		
		this.lastSortMode = this.lastSortMode == 3 ? -this.lastSortMode : 3;
		reversed = reversed || this.lastSortMode < 0
		
		this.row2pid = [];
		this.pid2row = [];
		const tpa = this.matches.getTotalPointsArray();
		console.log(tpa);
		tpa.sort(function (a,b) {
			let cmp = Math.sign(b[2] - a[2]);
			if (cmp == 0) cmp = strCmp(a[1], b[1]);
			if (pushDownDropouts)
			{
				if (a[3]) cmp += reversed ? -tpa.length : tpa.length;
				if (b[3]) cmp -= reversed ? -tpa.length : tpa.length;
			}
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