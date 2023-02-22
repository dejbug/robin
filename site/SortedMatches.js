import { strCmp, keys } from "./tools.js";

// TODO: This class is a misnomer. It's not the matches that are sorted.
//	It's the model which is extended by a sorting capability. Maybe
//	this is an indication of muddled thinking. Maybe the muddled
//	thinking precludes a better design.

// TODO: Make this a proper subclass of Matches?

// TODO: Add another sorting method (row/col swap-sort) so
//	we can animate the changing table (slowly, nicely) to
//	visualize the rank-shuffling going on.

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
			// If the actual current table data is in the expected sorting
			//	order (reflecting our lastSortMode), then just flip the
			//	sorting order; otherwise resort it (so that lastSortMode
			//	is respected).
			if (this.isSortedByPoints(pushDownDropouts) == Math.sign(this.lastSortMode))
				this.lastSortMode = -this.lastSortMode;
			reversed = this.lastSortMode < 0;
		}
		
		this.sort(this.getPointsSortableRepresentation(),
			this.comparePoints, reversed, pushDownDropouts);
	}

	comparePoints(a, b, reversed = false, pushDownDropouts = false)
	{
		// Need the reversed param here so push-down works regardless
		//	of sorting order. The best way to get rid of it would be to use
		//	different return values, but why bother?
		
		let cmp = 0;
		if (pushDownDropouts)
		{
			cmp = a[3] - b[3];
			if (cmp != 0) return cmp;
		}
		cmp = Math.sign(b[2] - a[2]); // Sort points in descending order.
		if (cmp == 0) cmp = strCmp(a[1], b[1]); // Fall back on ascending name sort.
		return reversed ? -cmp : cmp;
	}

	sort(array, compare, ...args)
	{
		array.sort((a, b) => {
			return compare(a, b, ...args);
		});
		this.row2pid = [];
		this.pid2row = [];
		for (let i = 0; i < array.length; ++i)
		{
			const row = i + 1;
			this.row2pid[row] = array[i][0];
			this.pid2row[array[i][0]] = row;
		}
	}

	getPointsSortableRepresentation()
	{
		// TODO: Using forEach could be better, given the fuzzy
		//	nature of JS's array indexing scheme.
		
		const array = [];
		for (let i = 0; i < this.row2pid.length; ++i)
		{
			const pid = this.row2pid[i];
			if (pid === undefined) continue;
			array.push([
				pid,
				this.matches.pd[pid],
				this.matches.getTotalPointsForPlayer(pid),
				this.matches.isDropout(pid) ? 1 : 0,
			]);
		}
		return array;
	}

	isSorted(array, compare, ...args)
	{
		// Conceptually: Do a pairwise compare of the array items.
		//		compare(array[0], array[1], ...args)
		//		compare(array[1], array[2], ...args)
		//	And store the results. If all the results have the same sign,
		//	return the inverse of that sign. Return zero if not.
		// Logically: If the array is sorted so that a < b then return
		//	positive; else if array is sorted so that b < a, return
		//	negative; else return zero.
		
		// TODO: Adopt a consistent interpretation of negative sortModes.
		//	The compare function will return a negative value if a < b.
		//	This means that a negative number should represent the
		//	normal sorting order. As it is now, lastSortMode is negative
		//	if the reversed-of-normal sort order is true. This is why we
		//	return the inverted sign here.
		
		let sign = null;
		for (let i = 1; i < array.length; ++i)
		{
			const cmp = compare(array[i-1], array[i], ...args);
			if (sign === null) sign = Math.sign(cmp);
			else if (sign != Math.sign(cmp)) return 0;
		}
		return -sign;
	}

	isSortedByPoints(ignoreDropouts = true)
	{
		// We use this to determine if a resort is in needed. A resort
		//	is needed if the lastSortMode no longer reflects the actual
		//	table data. Currently we use this only with sortByPoints.
		
		// There are two ways to sort by points: with or without pushing
		//	dropouts down. If they are pushed down, then we need to
		//	skip them because their presence doesn't affect whether
		//	the table is to be considered sorted or not. Note that we
		//	call comparePoints with pushDownDropouts set to false
		//	(to skip the little bit of unnecessary extra work) since it
		//	will never see a dropout (its array arg is pre-cooked).
		
		if (Math.abs(this.lastSortMode) != 3) return 0;
		let array = this.getPointsSortableRepresentation();
		if (ignoreDropouts) array = array.filter((item) => { return !item[3]; });
		return this.isSorted(array, this.comparePoints, false, false);
	}

	row2index()
	{
		let ii = {};
		for (let row = 1, index = 1; row <= this.matches.pa.length; ++row)
		{
			if (this.matches.isDropout(this.row2pid[row]))
				ii[row] = null;
			else
				ii[row] = index++;
		}
		return ii;
	}
}