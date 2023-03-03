import { berger } from "./berger.js";
import { Matches } from "../Matches.js";

export class PairingsTable
{
	constructor(paneId, table)
	{
		this.paneId = paneId;
		this.element = document.getElementById(paneId);
		this.table = table;
	}
	
	removeAllChildren()
	{
		for (const e of this.element.children)
			this.element.remove(e);
	}
	
	show()
	{
		this.removeAllChildren();
		
		const bergerTable = berger(this.table.model.matches.playerCount);
		if (bergerTable == null) return;
		
		const ol = document.createElement("ol");
		ol.style.display = "flex";
		ol.style.flexFlow = "row wrap";
		ol.style.border = "thin solid black";
		const matches = this.table.model.matches;
		for (const i in matches.ma)
		{
			const m = matches.ma[i];
			console.assert(m != undefined);
			if (m == undefined) continue;
			const [ wid, bid ] = m;
			const mi = matches.getMatchInfoByIndex(i);
			const wn = matches.pd[wid];
			const bn = matches.pd[bid];
			const li = document.createElement("li");
			li.style.border = "thin solid blue";
			li.width = "5em";
			li.innerText = `${wn} - ${bn}`;
			ol.append(li);
		}
		this.element.append(ol);
	}
}