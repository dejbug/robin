import sys


def seed(playersCount : int) -> tuple[int]:
	return tuple(range(1, playersCount + playersCount % 2 + 1))


def rotate(c : tuple[int], clockwise = True):
	return (c[0], c[-1], *c[1:-1]) if clockwise else (c[0], *c[2:], c[1])


def rounds(c : tuple[int]) -> tuple[int]:
	return (len(c) + len(c) % 2) // 2


def split(c : tuple[int]):
	r = rounds(c)
	return c[:r], tuple(reversed(c[r:]))


def dump(c : tuple[int], file = sys.stdout):
	top, bottom = split(c)
	# print(rounds, gamesPerPlayer, gamesTotal)
	for p in top:
		file.write('%3d' % p)
	file.write('\n')
	for p in bottom:
		file.write('%3d' % p)
	file.write('\n')


def dumpAll(playersCount : int, clockwise = True, file = sys.stdout):
	c = seed(playersCount)
	for i in range(playersCount - 1):
		dump(c)
		c = rotate(c, clockwise)
		file.write('\n')


def pairings(playersCount, clockwise = True, flipper = None):
	if playersCount < 1:
		raise ValueError(f'players count must be >= 1')

	if not flipper: flipper = lambda row, col: False

	playersCount += playersCount % 2
	columns = playersCount // 2
	rows = playersCount - 1

	c = seed(playersCount)
	for row in range(playersCount - 1):
		top, bottom = split(c)
		assert len(top) == len(bottom)
		for col in range(len(top)):
			if flipper(row, col):
				yield bottom[col], top[col]
			else:
				yield top[col], bottom[col]
		c = rotate(c, clockwise)


def table(playersCount, clockwise = True, flipper = None):
	table = []
	row = []

	columns = (playersCount + playersCount % 2) // 2

	for i, pairing in enumerate(pairings(playersCount, clockwise, flipper)):
		# row.append(pairing) # Immutables are a little bit faster
		row.append(list(pairing))
		if (i + 1) % columns == 0:
			table.append(row)
			row = []

	return table


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


def printPositions(table):
	import io
	for i, round in enumerate(table):
		upper = io.StringIO()
		lower = io.StringIO()
		for top, bottom in round:
			upper.write(f'{top:3d}')
			lower.write(f'{bottom:3d}')
		print(upper.getvalue(), f'  |  {i+1}.')
		print(lower.getvalue(), f'  |  Round')
		print()


def printColorsInfo(playersCount, clockwise = True, flipper = None):
	print(f'\nPlayer Positions ({"CW" if clockwise else "CCW"}, {flipper.__name__}):\n')
	printPositions(table(playersCount, clockwise, flipper))

	counts = colorsCount(pairings(playersCount, clockwise, flipper))
	colors = colorsSequence(pairings(playersCount, clockwise, flipper))
	print('                    |  Counts | Streaks')
	print('  P | Colors / Rnd. |   W   B |   W   B')
	print('----+---------------+-------------------')
	for p, cc in sorted(colors.items()):
		print(f'{p:3d} |', ' '.join('W' if c else '-' for c in cc),
			f'| {counts[p]["w"]:3d} {counts[p]["b"]:3d} | {counts[p]["cw"]:3d} {counts[p]["cb"]:3d}')

	# cc = colorsCount(pairings(playersCount, clockwise, flipper))
	# print('    |  Counts | Consecutive (max.)')
	# print('  P |   W   B |   W   B')
	# print('----+---------+-------------------')
	# for p, info in sorted(cc.items()):
	# 	print(f'{p:3d} | {info["w"]:3d} {info["b"]:3d} | {info["cw"]:3d} {info["cb"]:3d}')


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
