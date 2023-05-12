export class Match
{
	static getResultForPlayer(match, pid)
	{
		if (match == undefined) return undefined;
		const res = match[2];
		if (res != 0 && res != 0.5 && res != 1) return undefined;
		if (match[0] == pid) return res;
		if (match[1] == pid) return 1 - res;
		return undefined;
	}
	
	static getOpponentForPlayer(match, pid)
	{
		if (match[0] == pid) return match[1];
		if (match[1] == pid) return match[0];
		return undefined;
	}
	
	static getColorForPlayer(match, pid)
	{
		if (match[0] == pid) return 1;
		if (match[1] == pid) return 0;
		return undefined;
	}
}