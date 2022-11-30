package strategy

import (
	"example.com/gate_io_mm/config"
	"example.com/gate_io_mm/exchange"
	"example.com/gate_io_mm/iterator"
)

type Strategy interface {
	iterator.Iterator //Tick()
	GetActiveOrders() map[string]exchange.Order
	TrackingOrders()
	Init(cfg config.Config, e exchange.Exchange)
}

// func InitStrategy(cfg config.Config) Strategy {
// 	var stg Strategy
// 	if cfg.Strategy["Name"] == "SimplePMM" {
// 		stg = SimplePMM{}.Init(cfg)
// 	} else {
// 		panic(fmt.Sprintf("%v not implemented", cfg.Strategy["Name"]))
// 	}
// 	return stg
// }
