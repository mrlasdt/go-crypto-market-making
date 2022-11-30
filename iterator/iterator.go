package iterator

type Iterator interface {
	Tick(currentTick int64)
}
