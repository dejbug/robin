import unittest
import json

import berger


class TestBerger(unittest.TestCase):

	def test_fide_equivalence(self):
		with open('berger.json') as file:
			fide = json.load(file)

		for key in fide.keys():
			with self.subTest(playersCount = int(key)):
				self.assertEqual(fide[key], berger.table(int(key)))



if __name__ == '__main__':
	unittest.main()
