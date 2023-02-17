import { strCmp, keys } from "./tools.js";

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

	sortById(reversed = null, pushDownDropouts = false)
	{
		if (reversed === null)
		{
			this.lastSortMode = this.lastSortMode == 1 ? -this.lastSortMode : 1;
			reversed = this.lastSortMode < 0;
		}
		else this.lastSortMode = reversed ? -2 : 2;
		
		this.row2pid = [];
		this.pid2row = [];
		const pa = this.matches.pa.slice(0);
		pa.sort((a,b) => {
			let cmp = a[0] - b[0];
			if (pushDownDropouts)
			{
				if (this.matches.isDropout(a[0])) cmp += reversed ? -pa.length : pa.length;
				if (this.matches.isDropout(b[0])) cmp -= reversed ? -pa.length : pa.length;
			}
			return reversed ? 1 - cmp : cmp;
		});
		for (let i = 0; i < pa.length; ++i)
		{
			const row = i + 1;
			this.row2pid[row] = pa[i][0];
			this.pid2row[pa[i][0]] = row;
		}
	}

	sortByName(reversed = null, pushDownDropouts = false)
	{
		if (reversed === null)
		{
			this.lastSortMode = this.lastSortMode == 2 ? -this.lastSortMode : 2;
			reversed = this.lastSortMode < 0;
		}
		else this.lastSortMode = reversed ? -2 : 2;
		
		this.row2pid = [];
		this.pid2row = [];
		const pa = this.matches.pa.slice(0);
		pa.sort((a,b) => {
			let cmp = strCmp(a[1], b[1]);
			if (pushDownDropouts)
			{
				if (this.matches.isDropout(a[0])) cmp += reversed ? -pa.length : pa.length;
				if (this.matches.isDropout(b[0])) cmp -= reversed ? -pa.length : pa.length;
			}
			return reversed ? 1 - cmp : cmp;
		});
		for (let i = 0; i < pa.length; ++i)
		{
			const row = i + 1;
			this.row2pid[row] = pa[i][0];
			this.pid2row[pa[i][0]] = row;
		}
	}

	sortByPoints(reversed = null, pushDownDropouts = false, smartResort = false)
	{
		// TODO: Add more fallback sorting options. E.g. instead of
		//	falling back on name sort (in case of points equality)
		//	maybe first sort by rank of defeated opponents? So:
		//	if A.points == B.points but A fought stronger players
		//	than B, then A.rank < B.rank. "Stronger" meaning
		//	"currently lower ranked (i.e. higher up the list)".
		
		// Whenever we call this in toggle mode (reversed == null),
		//	we have to decide whether to reverse the sort (toggle)
		//	or whether to resort.
		
		// If the reversed param is true or false, then we just force the
		//	sort that way.
		// If reversing was left to us then, if we are supposed to be
		//	sorted by points already, we would simply reverse the sort.
		// But what if this.lastSortMode no longer reflects the actual
		//	table sorting state? This could happen because match
		//	results (score cells) were altered or when players have
		//	dropped out. In this case we want to re-sort into whatever
		//	we were supposed to be sorted in.
		if (reversed !== null)
			this.lastSortMode = reversed ? -3 : 3;
		else if (!smartResort)
		{
			this.lastSortMode = this.lastSortMode == 3 ? -this.lastSortMode : 3;
			reversed = this.lastSortMode < 0;
		}
		else if (Math.abs(this.lastSortMode) != 3)
		{
			// We haven't been sorted by points yet and reversing was
			//	left to us. This is an initial sort (in descending order).
			this.lastSortMode = 3;
			reversed = false;
		}
		else
		{
			// NOTE: isSortedByPoints() is an expensive operation. We
			//	basically sort twice (plus some additional comparisons).
			if (this.isSortedByPoints() == this.lastSortMode)
				this.lastSortMode = -this.lastSortMode;
			reversed = this.lastSortMode < 0;
		}
		
		[ this.row2pid, this.pid2row ] =
			this.SortByPoints(this.matches, reversed, pushDownDropouts);
	}

	SortByPoints(matches, reversed = false, pushDownDropouts = true)
	{
		// TODO: See this.sortByPoints (i.e. the non-static namesake).
		
		let row2pid = [];
		let pid2row = [];
		const tpa = matches.getTotalPointsArray();
		tpa.sort((a,b) => {
			let cmp = Math.sign(b[2] - a[2]);
			if (cmp == 0) cmp = strCmp(a[1], b[1]);
			if (pushDownDropouts)
			{
				if (this.matches.isDropout(a[0])) cmp += reversed ? -tpa.length : tpa.length;
				if (this.matches.isDropout(b[0])) cmp -= reversed ? -tpa.length : tpa.length;
			}
			return reversed ? 1 - cmp : cmp;
		});
		for (let i = 0; i < tpa.length; ++i)
		{
			const row = i + 1;
			row2pid[row] = tpa[i][0];
			pid2row[tpa[i][0]] = row;
		}
		return [ row2pid, pid2row ];
	}

	isSortedByPoints()
	{
		// TODO: This seems such an inefficient way of doing it, but
		//	I can't think of a better way just yet....
		
		const [ row2pid, pid2row ] = this.SortByPoints(this.matches);
		
		const cond = (pids, key) => {
			return !this.matches.isDropout(pids[key]);
		};
		
		const kk1 = keys(this.row2pid, cond);
		const kk2 = keys(row2pid, cond);
		const len = Math.min(kk1.length, kk2.length);
		
		// console.log(kk1, kk2);
		
		let feq = true;
		let beq = true;
		
		for (let i = 0; i < len; ++i)
		{
			const k1f = kk1[i];
			const k2f = kk2[i];
			const k2r = kk2[len - 1 - i];
			
			if (this.row2pid[k1f] != row2pid[k2f]) feq = false;
			if (this.row2pid[k1f] != row2pid[k2r]) beq = false;
			
			// console.log("[%.2d] %.2d.%.2d | %.2d.%.2d | %.2d.%.2d", i,
			// 	k1f, this.row2pid[k1f], k2f, row2pid[k2f], k2r, row2pid[k2r]);
		}
		
		return feq ? 3 : (beq ? -3 : 0);
	}
}