import codecs
import csv
import fnmatch
import json
import os

class Error(Exception): pass
class InvalidResultError(Error): pass

class degen:
	def __init__(self, *aa):
		self.aa = aa
	def __call__(self, f):
		def _(*aa, **kk):
			r = f(*aa, **kk)
			for a in self.aa: r = a(r)
			return r
		return _

@degen(list)
def paths(cwd="."):
	# return glob.glob("**.csv", root_dir=".", recursive=True)
	for t, dd, nn in os.walk(cwd):
		for n in nn:
			if fnmatch.fnmatch(n, "*.csv"):
				yield os.path.join(t, n)

@degen(list)
def rows(p):
	with codecs.open(p, "r", "utf8") as f:
		for r in csv.reader(f):
			yield r

@degen(list)
def names(rr):
	for i, r in enumerate(rr[1:], start=1):
		yield i, r[1]

def parseScore(s):
	if s not in ("0", "0.5", "1"): raise InvalidResultError(s)
	f = float(s)
	i = int(f)
	if f == i: return i
	return f

@degen(set, list)
def matches(rr):
	nn = list(names(rr))
	for i, r in enumerate(rr[1:], start=1):
		for j, c in enumerate(r[2:-2], start=1):
			if i == j: continue
			s = parseScore(c)
			if i < j: yield i, j, s
			else: yield j, i, 1 - s

if __name__ == "__main__":
	pp = paths()
	for p in pp:
		rr = rows(p)
		nn = names(rr)
		mm = matches(rr)
		data = json.dumps({"players": nn, "matches": mm})
		po = p + ".json"
		if os.path.exists(po):
			print(data)
			print("! Output file \"%s\" already exists; delete it manually." % po)
		else:
			print(p, "=>", po)
			with codecs.open(po, "w", "utf8") as f:
				f.write(data)
