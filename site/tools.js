export function getCellCoords(td)
{
	if (td.nodeName != "TD" && td.nodeName != "TH") return null;
	return {col: td.cellIndex, row : td.parentNode.rowIndex};
}

export function strCmp(a_, b_)
{
	const a = a_.toLowerCase();
	const b = b_.toLowerCase();
	if (a < b) return -1;
	if (a > b) return +1;
	return 0;
}

export function scoreToString(val)
{
	if (val == 0 || val == 1) return "" + val;
	if (val == 0.5) return "&frac12;";
	return null;
}

export function mouseButtonFlagString(event)
{
	const bb = event.originalEvent.buttons;
	let s = "";
	if (bb & 1) s += " L";
	if (bb & 4) s += " M";
	if (bb & 2) s += " R";
	return s;
}

export function keys(arr, test = null)
{
	return Object.keys(arr)
		.filter(key => {
			return arr[key] && (!test || test(arr, key)) ? key : null;
		});
}