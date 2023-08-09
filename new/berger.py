import sys
import json


def fide(playersCount):
	playersCount += playersCount % 2
	if playersCount < 1:
		raise ValueError(f'players count must be >= 1')
	if playersCount > 16:
		raise ValueError(f'there are no official Berger tables for {playersCount} players')
	lut = json.load(open('berger.json'))
	assert str(playersCount) in lut.keys()
	return lut[str(playersCount)]


def run(playersCount, start = 1):
	playersCount += playersCount % 2
	for i in range(start - 1, playersCount - 1 + (start - 1)):
		yield 1 + i % (playersCount - 1)
	yield playersCount


def fold(row, index = 0):
	assert len(row) % 2 == 0
	half = len(row) // 2
	left = row[:half]
	right = row[half:]
	if index % 2:
		left[0], right[-1] = right[-1], left[0]
	# return list(zip(left, reversed(right)))
	return [[left[i], right[-(i+1)]] for i in range(half)]


def generate1(playersCount):
	playersCount += playersCount % 2
	if playersCount < 1:
		raise ValueError(f'players count must be >= 1')

	columns = playersCount // 2
	rows = playersCount - 1

	table = []

	row = list(run(playersCount))
	for i in range(rows):
		table.append(fold(row, i))
		row = list(run(playersCount, row[columns]))

	return table

def generate2(playersCount):
	playersCount += playersCount % 2
	if playersCount < 1:
		raise ValueError(f'players count must be >= 1')

	columns = playersCount // 2
	rows = playersCount - 1

	whites = (1 + i % (playersCount - 1) for i in range(columns * rows))
	blacks = (playersCount - 1 - i % (playersCount - 1) for i in range((columns - 1) * rows))

	table = []

	for r in range(rows):
		row = []
		for c in range(columns):
			white = next(whites)
			if c == 0:
				if r % 2:
					black = white
					white = playersCount
				else:
					black = playersCount
			else:
				black = next(blacks)
			row.append((white, black))
		table.append(row)
		row = []

	return table


def main():
	from pprint import pprint

	keys = json.load(open('berger.json')).keys()
	for key in keys:
		key = int(key)
		pprint(fide(key))
		print()
		pprint(generate2(key))
		print()

		assert fide(key) == generate1(key)

		for fideRound, genRound in zip(fide(key), generate2(key)):
			for fideGame, genGame in zip(fideRound, genRound):
				assert fideGame[0] == genGame[0] and fideGame[1] == genGame[1]


if __name__ == '__main__':
	sys.exit(main())
