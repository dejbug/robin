import sys

import circle


def dump(c : tuple[int], file = sys.stdout):
	top, bottom = circle.split(c)
	for p in top:
		file.write('%3d' % p)
	file.write('\n')
	for p in bottom:
		file.write('%3d' % p)
	file.write('\n')


def dumpAll(playersCount : int, clockwise = True, file = sys.stdout):
	c = circle.seed(playersCount)
	for i in range(len(c) - 1):
		dump(c)
		c = circle.rotate(c, clockwise)
		file.write('\n')


def colorsSequence(pairings):
	colors = {}
	for white, black in pairings:
		if white not in colors:
			colors[white] = [1]
		else:
			colors[white] += [1]
		if black not in colors:
			colors[black] = [0]
		else:
			colors[black] += [0]
	return colors


def colorsCount(pairings):
	colors = colorsSequence(pairings)

	import collections
	d = collections.defaultdict(lambda: { 'w': 0, 'b': 0, 'cw': 0, 'cb': 0 })

	for p, cc in colors.items():
		d[p]['w'] = sum(cc)
		d[p]['b'] = len(cc) - d[p]['w']

	for p, cc in colors.items():
		WW = ww = 0
		BB = bb = 0
		last = cc[0]
		for c in cc:
			if c:
				ww += 1
				if last != c:
					BB = max(BB, bb)
					bb = 0
			else:
				bb += 1
				if last != c:
					WW = max(WW, ww)
					ww = 0
			last = c

		d[p]['cw'] = max(WW, ww)
		d[p]['cb'] = max(BB, bb)

	return d


def printPositions(table, file = sys.stdout):
	import io
	for i, round in enumerate(table):
		upper = io.StringIO()
		lower = io.StringIO()
		for top, bottom in round:
			upper.write(f'{top:3d}')
			lower.write(f'{bottom:3d}')
		file.write(f'{upper.getvalue()}     {i+1}.\n')
		file.write(f'{lower.getvalue()}     Round\n')
		file.write('\n')


def printColorsInfo(playersCount, clockwise = True, flipper = None, file = sys.stdout):
	pairings = tuple(circle.pairings(playersCount, clockwise, flipper))
	table = circle.tableFromPairings(pairings, playersCount)

	file.write(f'Player Positions ({"CW" if clockwise else "CCW"}, {flipper.__name__}):\n\n')
	printPositions(table, file = file)

	counts = colorsCount(pairings)
	colors = colorsSequence(pairings)
	file.write('                    |  Counts | Streaks\n')
	file.write('  P | Colors / Rnd. |   W   B |   W   B\n')
	file.write('----+---------------+-------------------\n')
	for p, cc in sorted(colors.items()):
		file.write(
			f'{p:3d} |' + ' '.join('W' if c else '-' for c in cc) +
			f'| {counts[p]["w"]:3d} {counts[p]["b"]:3d} | {counts[p]["cw"]:3d} {counts[p]["cb"]:3d}\n')

	file.write('\n')


def main():
	noFlipper = lambda row, col: False
	noFlipper.__name__ = 'noFlipper'

	clubFlipper = lambda row, col: col == 0 and row % 2
	clubFlipper.__name__ = 'clubFlipper'

	wikiFlipper = lambda r, c: r % 2
	wikiFlipper.__name__ = 'wikiFlipper'

	printColorsInfo(7, True, noFlipper)
	printColorsInfo(7, True, clubFlipper)
	printColorsInfo(7, True, wikiFlipper)


if __name__ == '__main__':
	sys.exit(main())
