package strategy

import (
	"example.com/gate_io_mm/exchange"
	"github.com/shopspring/decimal"
)

type UniswapV3LP struct {
	BidSpread       decimal.Decimal
	AskSpread       decimal.Decimal
	OrderAmount     decimal.Decimal
	MinProfit       decimal.Decimal
	CreateTimeStamp float32
	TradingPair     string
	Exchange        exchange.Exchange
	OrderTracker    map[string]exchange.Order
}
