package command

import (
	"fmt"

	"example.com/gate_io_mm/clock"
	"example.com/gate_io_mm/config"
	"example.com/gate_io_mm/exchange"
	"example.com/gate_io_mm/strategy"
)

func Start(cfg config.Config) {
	// stg := strategy.InitStrategy(cfg)
	// mkt := exchange.InitExchange(cfg)
	mkt := &exchange.Gateio{}
	mkt.Init(cfg)
	stg := &strategy.SimplePMM{}
	stg.Init(cfg, mkt)
	StartMarketMaking(stg, mkt)
}

func StartMarketMaking(stg strategy.Strategy, mkt exchange.Exchange) {
	clk := clock.DefaultClock()
	fmt.Printf("[INFO]: Creating the lock with tick size: %v\n", clk.TickSize)
	clk.AddIterator(mkt)
	clk.AddIterator(stg)
	clk.Run()
}
