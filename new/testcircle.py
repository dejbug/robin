import unittest

import circle

class TestCircle(unittest.TestCase):

	def test_seed_lengths(self):
		self.assertEqual(len(circle.seed(0)), 0)
		self.assertEqual(len(circle.seed(1)), 2)
		self.assertEqual(len(circle.seed(2)), 2)
		self.assertEqual(len(circle.seed(3)), 4)
		self.assertEqual(len(circle.seed(4)), 4)
		self.assertEqual(len(circle.seed(13)), 14)
		self.assertEqual(len(circle.seed(14)), 14)

	def test_parity_equivalence_4(self):
		for i in range(11):
			oddPlayersCount = 1 + 2 * i
			evenPlayersCount = 1 + 2 * i + 1
			with self.subTest(
					oddPlayersCount = oddPlayersCount,
					evenPlayersCount = evenPlayersCount):
				oddCircle = circle.seed(oddPlayersCount)
				evenCircle = circle.seed(evenPlayersCount)
				evenCircleRounds = circle.rounds(evenCircle)
				oddCircleRounds = circle.rounds(oddCircle)
				self.assertEqual(evenCircleRounds, oddCircleRounds)

	def test_full_cycles(self):
		for clockwise in (True, False):
			for playersCount in range(21):
				with self.subTest(clockwise = clockwise, playersCount = playersCount):
					c = circle.seed(playersCount)
					for i in range(len(c) - 1):
						c = circle.rotate(c, clockwise)
					self.assertEqual(circle.seed(playersCount), c)

	def test_rotate_4(self):
		cases = (
			( 3, True, (
					(1, 2, 3, 0),
					(1, 0, 2, 3),
					(1, 3, 0, 2),
					(1, 2, 3, 0),
				)
			),
			( 3, False, (
					(1, 2, 3, 0),
					(1, 3, 0, 2),
					(1, 0, 2, 3),
					(1, 2, 3, 0),
				)
			),
			( 4, True, (
					(1, 2, 3, 4),
					(1, 4, 2, 3),
					(1, 3, 4, 2),
					(1, 2, 3, 4),
				)
			),
			( 4, False, (
					(1, 2, 3, 4),
					(1, 3, 4, 2),
					(1, 4, 2, 3),
					(1, 2, 3, 4),
				)
			),
		)
		for case in cases:
			playersCount, clockwise, states = case
			initialState = states[0]
			states = states[1:]

			with self.subTest(clockwise = clockwise):
				c = circle.seed(playersCount)
				self.assertEqual(c, initialState)
				for state in states:
					c = circle.rotate(c, clockwise)
					self.assertEqual(c, state)


if __name__ == '__main__':
	unittest.main()
