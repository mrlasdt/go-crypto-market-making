package exchange

import (
	"example.com/gate_io_mm/config"
	"example.com/gate_io_mm/iterator"
	"github.com/shopspring/decimal"
)

type Exchange interface {
	Init(cfg config.Config)
	PlaceOrder(order Order) string
	CancelOrder(tradingPair string, orderId string)
	iterator.Iterator //Tick()
	GetLastPrice(tradingPair string) decimal.Decimal
	AdjustCandidate(buyOrder *Order, sellOrder *Order)
}

// func InitExchange(cfg config.Config) Exchange {
// 	var mkt Exchange
// 	if cfg.Strategy["Exchange"] == "Gateio" {
// 		mkt = Gateio{}.Init(cfg)
// 	} else {
// 		panic(fmt.Sprintf("%v not implemented", cfg.Strategy["Exchange"]))
// 	}
// 	return mkt
// }
