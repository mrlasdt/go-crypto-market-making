package exchange

import "github.com/shopspring/decimal"

type OrderType string

const (
	Limit  OrderType = "limit"
	Market OrderType = "market"
)

type TradeType string

const (
	Buy  TradeType = "buy"
	Sell TradeType = "sell"
)

type Order struct {
	TradingPair string
	Otype       OrderType
	Ttype       TradeType
	Price       decimal.Decimal
	Amount      decimal.Decimal
}
