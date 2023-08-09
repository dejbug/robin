import sys


def seed(playerCount : int) -> tuple[int]:
	if playerCount % 2:
		return *range(1, playerCount + 1), 0
	else:
		return tuple(range(1, playerCount + 1))


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


def main():
	c = seed(14)
	for i in range(14):
		print('-' * 80)
		dump(c)
		c = rotate(c, clockwise = True)
	print('=' * 80)
	c = seed(14)
	for i in range(14):
		dump(c)
		print('-' * 80)
		c = rotate(c, clockwise = False)


if __name__ == '__main__':
	sys.exit(main())
