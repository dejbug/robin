def pairings(playersCount):
	if playersCount < 1:
		raise ValueError(f'players count must be >= 1')

	playersCount += playersCount % 2
	columns = playersCount // 2
	rows = playersCount - 1

	whites = (1 + i % (playersCount - 1) for i in range(columns * rows))
	blacks = (playersCount - 1 - i % (playersCount - 1) for i in range((columns - 1) * rows))

	for r in range(rows):
		for c in range(columns):
			white = next(whites)
			if c == 0:
				if r & 1: # if r % 2:
					black = white
					white = playersCount
				else:
					black = playersCount
			else:
				black = next(blacks)
			yield white, black


def table(playersCount):
	table = []
	row = []

	columns = (playersCount + playersCount % 2) // 2

	for i, pairing in enumerate(pairings(playersCount)):
		# row.append(pairing) # Immutables are a little bit faster
		row.append(list(pairing))
		if (i + 1) % columns == 0:
			table.append(row)
			row = []

	return table


def main():
	from pprint import pprint

	for playersCount in range(1, 16):
		pprint(table(playersCount))
		print('-' * 79)


if __name__ == '__main__':
	exit(main())
