# What?

Trying different [circle methods](https://en.wikipedia.org/wiki/Round-robin_tournament#Circle_method).

# Why?

I was never a fan of our club's preferred round-robin scheduler. Instead, I've opted for the use of [Berger tables](https://en.wikipedia.org/wiki/Round-robin_tournament#Berger_tables) -- alas, too soon!

It's time to prove that our carousel method is rubbish.


## No flipping.

Just (clockwise) wandering.

```
Player Positions (CW, noFlipper):

  1  2  3  4   |  1.
  8  7  6  5   |  Round

  1  8  2  3   |  2.
  7  6  5  4   |  Round

  1  7  8  2   |  3.
  6  5  4  3   |  Round

  1  6  7  8   |  4.
  5  4  3  2   |  Round

  1  5  6  7   |  5.
  4  3  2  8   |  Round

  1  4  5  6   |  6.
  3  2  8  7   |  Round

  1  3  4  5   |  7.
  2  8  7  6   |  Round

                    |  Counts | Streaks
  P | Colors / Rnd. |   W   B |   W   B
----+---------------+-------------------
  1 | W W W W W W W |   7   0 |   7   0
  2 | W W W - - - - |   3   4 |   3   4
  3 | W W - - - - W |   3   4 |   2   4
  4 | W - - - - W W |   3   4 |   2   4
  5 | - - - - W W W |   3   4 |   3   4
  6 | - - - W W W - |   3   4 |   3   3
  7 | - - W W W - - |   3   4 |   3   2
  8 | - W W W - - - |   3   4 |   3   3
```

Just for comparison. Seven consecutive whites are obviously bad.


## Our club's flipper.

The static player (number 1) flips their color between rounds.


```
Player Positions (CW, clubFlipper):

  1  2  3  4   |  1.
  8  7  6  5   |  Round

  7  8  2  3   |  2.
  1  6  5  4   |  Round

  1  7  8  2   |  3.
  6  5  4  3   |  Round

  5  6  7  8   |  4.
  1  4  3  2   |  Round

  1  5  6  7   |  5.
  4  3  2  8   |  Round

  3  4  5  6   |  6.
  1  2  8  7   |  Round

  1  3  4  5   |  7.
  2  8  7  6   |  Round

                    |  Counts | Streaks
  P | Colors / Rnd. |   W   B |   W   B
----+---------------+-------------------
  1 | W - W - W - W |   4   3 |   1   1
  2 | W W W - - - - |   3   4 |   3   4
  3 | W W - - - W W |   4   3 |   2   3
  4 | W - - - - W W |   3   4 |   2   4
  5 | - - - W W W W |   4   3 |   4   3
  6 | - - - W W W - |   3   4 |   3   3
  7 | - W W W W - - |   4   3 |   4   2
  8 | - W W W - - - |   3   4 |   3   3
```

Still pretty bad! Up to 4 consecutive colors for half the players (numbers 2, 4, 5 and 7).

How is it that nobody complained?

It's so bad that I'm doubting that this is really how we're doing it. I must have made an error here. I'll need to double-check with somebody next time.


## Wikipedia flipper.

This is the flipper that the [wikipedia article](https://en.wikipedia.org/wiki/Round-robin_tournament#Circle_method) apparently proposes.


```
Player Positions (CW, wikiFlipper):

  1  2  3  4   |  1.
  8  7  6  5   |  Round

  7  6  5  4   |  2.
  1  8  2  3   |  Round

  1  7  8  2   |  3.
  6  5  4  3   |  Round

  5  4  3  2   |  4.
  1  6  7  8   |  Round

  1  5  6  7   |  5.
  4  3  2  8   |  Round

  3  2  8  7   |  6.
  1  4  5  6   |  Round

  1  3  4  5   |  7.
  2  8  7  6   |  Round

                    |  Counts | Streaks
  P | Colors / Rnd. |   W   B |   W   B
----+---------------+-------------------
  1 | W - W - W - W |   4   3 |   1   1
  2 | W - W W - W - |   4   3 |   2   1
  3 | W - - W - W W |   4   3 |   2   2
  4 | W W - W - - W |   4   3 |   2   2
  5 | - W - W W - W |   4   3 |   2   1
  6 | - W - - W - - |   2   5 |   1   2
  7 | - W W - W W - |   4   3 |   2   1
  8 | - - W - - W - |   2   5 |   1   2
```

Much better!
