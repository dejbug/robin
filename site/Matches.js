// TODO: Rename the concept of a player to the concept of a name, because
//	that is really what this is: a string table, i.e. a mapping of name-ids to name-strings.
//	A player is more than a name. A player has e.g. a rating and a sequence of matches.

export class Matches
{
	constructor(json)
	{
		json = this.Sanitize(json);
		this.pa = json.players;	// players array
		this.pd = [];			// players dict
		for (let i = 0; i < this.pa.length; ++i)
		{
			const p = this.pa[i];
			this.pd[p[0]] = p[1];
		}
		this.ma = json.matches;
		this.count = this.pd.length;
	}

	Sanitize(json)
	{
		// TODO: Is this function necessary?
		// TODO: Remove empty array elements.
		const players = json.players.slice(0);
		const matches = json.matches.slice(0);
		// Make sure players are sorted by pid in ascending order.
		players.sort(function (a, b) {
			return a[0] - b[0];
		});
		return {players : players, matches : matches};
	}

	dump()
	{
		// console.log(this);
		console.log(this.count);
		console.log(this.getMatchesForPlayer(1));
		console.log(this.getTotalPointsForPlayer(1));
	}

	getMatchesForPlayer(pid)
	{
		const xx = [];
		for (let i = 0; i < this.ma.length; ++i)
		{
			const m = this.ma[i];
			if (m[0] == pid || m[1] == pid)
				xx.push(m);
		}
		return xx;
	}

	getTotalPointsForPlayer(pid)
	{
		let p = 0;
		for (let i = 0; i < this.ma.length; ++i)
		{
			const m = this.ma[i];
			if (m[0] == pid) p += m[2];
			else if (m[1] == pid) p += (1 - m[2]);
		}
		return p;
	}

	getTotalPointsArray()
	{
		// TODO: Optimize it by reducing to a single loop?
		const tpa = [];
		for (let pid in this.pd)
			tpa.push([parseInt(pid), this.pd[pid], this.getTotalPointsForPlayer(pid)]);
		return tpa;
	}
}