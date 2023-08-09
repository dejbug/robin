def seed(playersCount : int) -> tuple[int]:
	return tuple(range(1, playersCount + playersCount % 2 + 1))


def rounds(playersCount : int) -> int:
	return (playersCount + playersCount % 2) // 2


def rotate(c : tuple[int], clockwise = True):
	return (c[0], c[-1], *c[1:-1]) if clockwise else (c[0], *c[2:], c[1])


def split(c : tuple[int]):
	rounds = (len(c) + len(c) % 2) // 2
	return c[:rounds], tuple(reversed(c[rounds:]))


def pairings(playersCount, clockwise = True, flipper = None):
	if playersCount < 1:
		raise ValueError(f'players count must be >= 1')

	if not flipper: flipper = lambda row, col: False

	playersCount += playersCount % 2
	# columns = playersCount // 2
	# rows = playersCount - 1

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


def tableFromPairings(pairings, playersCount = None):
	table = []
	row = []

	if not playersCount:
		pairings = tuple(pairings)
		playersCount = playersCountFromPairings(pairings)

	columns = (playersCount + playersCount % 2) // 2

	for i, pairing in enumerate(pairings):
		# row.append(pairing) # Immutables are a little bit faster
		row.append(list(pairing))
		if (i + 1) % columns == 0:
			table.append(row)
			row = []

	return table


def playersCountFromPairings(pairings):
	import math

	# G = (P - 1) * P / 2
	# G * 2 = PP - P

	# pairings = tuple(pairings) # Slow, but only for INSANE player counts.

	# import collections
	# if not isinstance(pairings, collections.abc.Sized):
	# 	raise TypeError('argument must have a definite len()')

	playersCount = math.ceil(math.sqrt(len(pairings) * 2))

	# I'm frankly amazed that this seems to work exactly.
	# Sure, G * 2 - P = PP, with PP >> P, but still.
	assert len(pairings) == (playersCount - 1) * (playersCount // 2)

	return playersCount


if __name__ == '__main__':
	playersCount = 14
	print(rounds(playersCount), 'rounds', playersCount, 'players')
	for round in table(playersCount):
		for white, black in round:
			print('%5s' % f'{white}-{black}', end=' | ')
		print()
