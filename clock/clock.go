package clock

import (
	"time"

	"example.com/gate_io_mm/iterator"
)

type ClockMode uint8

const (
	RealTime ClockMode = 1
	BackTest ClockMode = 2
)

type Clock struct {
	Mode           ClockMode
	TickSize       int64
	StartTime      float32
	EndTime        float32
	CurrentTick    int64
	childIterators []iterator.Iterator
}

func DefaultClock() Clock {
	return Clock{Mode: RealTime, TickSize: 1, StartTime: 0.0, EndTime: 0.0}
}

func (c Clock) Run() {
	for {
		now := time.Now().Unix()
		// sleep until the next tick
		nextTickTime := ((now / c.TickSize) + 1) * c.TickSize
		time.Sleep(time.Duration(nextTickTime - now))
		// Run through all the child iterators.
		for _, ci := range c.childIterators {
			ci.Tick(c.CurrentTick) //see exchange.Tick() and strategy.Tick()
		}
	}
}

func (c *Clock) AddIterator(i iterator.Iterator) {
	c.childIterators = append(c.childIterators, i)
}
