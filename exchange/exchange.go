package exchange

import (
	"fmt"

	"example.com/gate_io_mm/config"
	"example.com/gate_io_mm/iterator"
	"github.com/shopspring/decimal"
)

type Exchange interface {
	PlaceOrder(order Order) string
	CancelOrder(tradingPair string, orderId string)
	iterator.Iterator //Tick()
	GetLastPrice(tradingPair string) decimal.Decimal
	AdjustCandidate(buyOrder *Order, sellOrder *Order)
}

func InitExchange(cfg config.Config) (Exchange, error) {
	if cfg.Exchange["Name"] == "Gateio" {
		return newGateio(cfg), nil
	} else if cfg.Strategy["Name"] == "UniswapV3" {
		// return newUniswapV3LP(cfg, e), nil
		panic(fmt.Sprintf("%v not implemented", cfg.Exchange["Name"]))
	} else {
		panic(fmt.Sprintf("%v not implemented", cfg.Exchange["Name"]))
	}
}
