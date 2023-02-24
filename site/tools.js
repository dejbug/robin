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

export function scoreToString(val, nice=false)
{
	if (val === 0 || val === 1) return "" + val;
	if (val === 0.5) return nice ? "&frac12;" : "0.5";
	return "";
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

export function choose(arr)
{
	return arr[Math.round(Math.random() * (arr.length - 1))]
}

function poprandom(arr)
{
	// TODO: I'm not sure what's going on with JS arrays. If I
	//	pop or set length -= 1 (which should both just truncate
	//	the array) the Firefox console shows me a length of 0.
	//	We will have to define our own helper class.
	if (arr.length <= 0) return null;
	const i = Math.round(Math.random() * (arr.length - 1));
	const e = arr[i];
	arr[i] = arr[arr.length - 1];
	console.log(i, e, arr.length, arr[arr.length - 1], arr);
	console.log("%d:%d | %d:%d", i+1, e, arr.length, arr[arr.length - 1], arr);
	// --arr.length;
	arr.pop();
	return e;
}

export class Stack
{
	// We need this because poprandom() isn't quite right.
	// TODO: Maybe rename it to RandomStack and make poprandom the pop?
	
	constructor()
	{
		this.length = 0;
		this.data = [];
	}
	
	empty() { return this.length <= 0; }
	push(e) { this.data[this.length++] = e; }
	pop() { return this.length > 0 ? this.data[--this.length] : null; }
	
	poprandom()
	{
		if (this.length <= 0) return null;
		const i = Math.round(Math.random() * (this.length - 1));
		const e = this.data[i];
		this.data[i] = this.data[this.length - 1];
		this.data[this.length - 1] = null;
		--this.length;
		return e;
	}
}