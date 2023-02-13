function getCellCoords(td)
{
	if (td.nodeName != "TD" && td.nodeName != "TH") return null;
	return {col: td.cellIndex, row : td.parentNode.rowIndex};
}

function strCmp(a_, b_)
{
	const a = a_.toLowerCase();
	const b = b_.toLowerCase();
	if (a < b) return -1;
	if (a > b) return +1;
	return 0;
}

function scoreToString(val)
{
	if (val == 0 || val == 1) return "" + val;
	if (val == 0.5) return "&frac12;";
	return null;
}