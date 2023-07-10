export function printDocumentPrototype()
{
	console.log(Object.getPrototypeOf(Object.getPrototypeOf(document)));
}

export function printHtmlElementPrototype(tag = "div")
{
	let e = document.createElement(tag);
	console.log(Object.getPrototypeOf(Object.getPrototypeOf(e)));
}

export function printElementPrototype(tag = "div")
{
	let e = document.createElement(tag);
	console.log(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(e))));
}