package strategy

import (
	"fmt"

	"example.com/gate_io_mm/config"
	"example.com/gate_io_mm/exchange"
	"example.com/gate_io_mm/utils"
	"github.com/shopspring/decimal"
)

type SimplePMM struct {
	BidSpread        decimal.Decimal
	AskSpread        decimal.Decimal
	OrderRefreshTime float32
	OrderAmount      decimal.Decimal
	CreateTimeStamp  float32
	TradingPair      string
	Exchange         exchange.Exchange
	OrderTracker     map[string]exchange.Order
}

func (s *SimplePMM) Init(cfg config.Config, e exchange.Exchange) {
	s.BidSpread = decimal.RequireFromString(cfg.Strategy["BidSpread"])
	s.AskSpread = decimal.RequireFromString(cfg.Strategy["AskSpread"])
	s.OrderRefreshTime = utils.CvtStrToFloat32(cfg.Strategy["OrderRefreshTime"])
	s.OrderAmount = decimal.RequireFromString(cfg.Strategy["OrderAmount"])
	s.CreateTimeStamp = utils.CvtStrToFloat32(cfg.Strategy["CreateTimeStamp"])
	s.TradingPair = cfg.Strategy["TradingPair"]
	s.Exchange = e
	s.OrderTracker = make(map[string]exchange.Order)
}

func (s *SimplePMM) Tick(timestamp int64) {
	if s.CreateTimeStamp <= float32(timestamp) {
		s.CancelAllOrders()
		buyOrder, sellOrder := s.CreateProposals()
		s.AdjustOrderToBudget(&buyOrder, &sellOrder)
		buyOrderId := s.Exchange.PlaceOrder(buyOrder)
		s.OrderTracker[buyOrderId] = buyOrder
		sellOrderId := s.Exchange.PlaceOrder(sellOrder)
		s.OrderTracker[sellOrderId] = sellOrder
		s.CreateTimeStamp = float32(timestamp)
	}
}

func (s SimplePMM) CreateProposals() (exchange.Order, exchange.Order) {
	refPrice := s.Exchange.GetLastPrice(s.TradingPair)
	buyPrice := refPrice.Mul(decimal.NewFromInt(1).Sub(s.BidSpread))  //refPrice*(1-s.BidSpread)
	sellPrice := refPrice.Mul(decimal.NewFromInt(1).Add(s.AskSpread)) //refPrice*(1+s.AskSpread)
	buyOrder := exchange.Order{TradingPair: s.TradingPair, Otype: "limit", Ttype: "buy", Amount: s.OrderAmount, Price: buyPrice}
	sellOrder := exchange.Order{TradingPair: s.TradingPair, Otype: "limit", Ttype: "sell", Amount: s.OrderAmount, Price: sellPrice}
	return buyOrder, sellOrder
}

func (s SimplePMM) AdjustOrderToBudget(buyOrder *exchange.Order, sellOrder *exchange.Order) {
	s.Exchange.AdjustCandidate(buyOrder, sellOrder)
}

func (s SimplePMM) CancelAllOrders() {
	for orderId, order := range s.GetActiveOrders() {
		s.Exchange.CancelOrder(order.TradingPair, orderId)
		delete(s.OrderTracker, orderId)
	}
}

func (s SimplePMM) GetActiveOrders() map[string]exchange.Order {
	// Return all currently active order in the order book of the exchange
	return s.OrderTracker
}

func (s SimplePMM) TrackingOrders() {
	// Add placed order to tracking list
	for _, order := range s.GetActiveOrders() {
		fmt.Printf("%v", order)
	}
}
