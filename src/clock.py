

from enum import Enum
import time 
import logging


class ClockMode(Enum):
    REALTIME = 1
    BACKTEST = 2

class Clock:
    def logger(self):
        return logging.getLogger(__name__)
    
    def __init__(self, clock_mode: ClockMode, tick_size: float = 1.0, start_time: float = 0.0, end_time: float = 0.0):
        """
        :param clock_mode: either real time mode or back testing mode
        :param tick_size: time interval of each tick
        :param start_time: (back testing mode only) start of simulation in UNIX timestamp
        :param end_time: (back testing mode only) end of simulation in UNIX timestamp. NaN to simulate to end of data.
        """
        self._clock_mode = clock_mode
        self._tick_size = tick_size
        self._clock_mode = clock_mode
        self._tick_size = tick_size
        self._start_time = start_time
        self._end_time = end_time
        self._current_tick = start_time if clock_mode is ClockMode.BACKTEST else (time.time() // tick_size) * tick_size
        self._child_iterators = []

    def run(self):
        while True:
            now = time.time()

            # Sleep until the next tick
            next_tick_time = ((now // self._tick_size) + 1) * self._tick_size
            time.sleep(next_tick_time - now)
            self._current_tick = next_tick_time

            # Run through all the child iterators.
            for ci in self._child_iterators:
                child_iterator = ci
                # try:
                child_iterator.tick(self._current_tick)
                # except Exception as e:
                #     print("[ERROR]: ","Unexpected error running clock tick.", e)

    def add_iterator(self, iterator):
        self._child_iterators.append(iterator)