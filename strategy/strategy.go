package strategy

import (
	"fmt"

	"example.com/gate_io_mm/config"
	"example.com/gate_io_mm/exchange"
	"example.com/gate_io_mm/iterator"
)

type Strategy interface {
	iterator.Iterator //Tick()
}

func InitStrategy(cfg config.Config, e exchange.Exchange) (Strategy, error) {
	if cfg.Strategy["Name"] == "SimplePMM" {
		return newSimplePMM(cfg, e), nil
	} else if cfg.Strategy["Name"] == "UniswapV3LP" {
		// return newUniswapV3LP(cfg, e), nil
		panic(fmt.Sprintf("%v not implemented", cfg.Strategy["Name"]))
	} else {
		panic(fmt.Sprintf("%v not implemented", cfg.Strategy["Name"]))
	}
}
