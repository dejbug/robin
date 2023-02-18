// TODO: Rename the concept of a player to the concept of a name, because
//	that is really what this is: a string table, i.e. a mapping of name-ids to name-strings.
//	A player is more than a name. A player has e.g. a rating and a sequence of matches.

import { scoreToString } from "./tools.js";

export class Matches
{
	constructor(json)
	{
		this.pa = json.players;	// players array
		this.pd = [];			// players dict
		for (let i = 0; i < this.pa.length; ++i)
		{
			const p = this.pa[i];
			this.pd[p[0]] = p[1];
		}
		this.ma = json.matches;
		this.md = {};
		const madd = (d, w, b, i) => {
			if (!(w in d)) d[w] = {};
			d[w][b] = i;
		};
		for (let i = 0; i < this.ma.length; ++i)
		{
			const m = this.ma[i];
			madd(this.md, m[0], m[1], i);
			madd(this.md, m[1], m[0], i);
		}
		this.count = this.pd.length;	// FIXME: Rename this to playerCount
		this.matchesCount = this.ma.length;
		this.dropouts = [];
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
			if (m[2] !== 0 && m[2] !== 0.5 && m[2] !== 1) continue;
			if (m[0] == pid && !this.isDropout(m[1])) p += m[2];
			else if (m[1] == pid && !this.isDropout(m[0])) p += (1 - m[2]);
		}
		return p;
	}

	getTotalPointsArray()
	{
		// TODO: Optimize it by reducing to a single loop?
		const tpa = [];
		for (let pid in this.pd)
		{
			pid = parseInt(pid);
			tpa.push([
				pid,
				this.pd[pid],
				this.getTotalPointsForPlayer(pid),
			]);
		}
		return tpa;
	}

	isDropout(pid) { return this.dropouts.indexOf(pid) >= 0; }

	addDropout(pid)
	{
	}

	removeDropout(pid)
	{
	}

	getMatchIndex(p1, p2)
	{
		return this.md[p1][p2];
	}

	getMatch(p1, p2)
	{
		const i = this.getMatchIndex(p1, p2);
		return this.getMatchByIndex(i);
	}

	getMatchByIndex(i)
	{
		return this.ma[i];
	}

	getMatchInfo(p1, p2)
	{
		const i = this.getMatchIndex(p1, p2);
		return this.getMatchInfoByIndex(i);
	}

	getMatchInfoByIndex(i)
	{
		const m = this.getMatchByIndex(i);
		return {
			m, 0: m[0], 1: m[1], 2: m[2],
			w: m[0],
			b: m[1],
			ws: m[2] === null ? "" : scoreToString(m[2], true),
			bs: m[2] === null ? "" : scoreToString(1 - m[2], true),
			wr: m[2] === null ? "" : scoreToString(m[2], false),
			br: m[2] === null ? "" : scoreToString(1 - m[2], false),
			toggleResult(forward = true) {
				if (m[2] === null) m[2] = forward ? 1 : 0;
				else if (m[2] === 1) m[2] = forward ? 0.5 : null;
				else if (m[2] === 0.5) m[2] = forward ? 0 : 1;
				else if (m[2] === 0) m[2] = forward ? null : 0.5;
			}
		};
	}
}