package exchange

import (
	"context"
	"fmt"
	"strings"

	"example.com/gate_io_mm/config"
	"github.com/antihax/optional"
	"github.com/gateio/gateapi-go/v6"
	"github.com/shopspring/decimal"
)

type Gateio struct {
	client *gateapi.APIClient
	ctx    context.Context
	cp     gateapi.CurrencyPair
}

// func (g Gateio) Init(cfg config.Config) Exchange {
// 	g.TradingPair = cfg.Strategy["TradingPair"]
// 	g.ApiKey = cfg.Exchange["ApiKey"]
// 	g.SecretKey = cfg.Exchange["SecretKey"]
// 	return g
// }

func newGateio(cfg config.Config) Exchange {
	g := Gateio{}
	g.client = gateapi.NewAPIClient(gateapi.NewConfiguration())
	g.ctx = context.WithValue(context.Background(), gateapi.ContextGateAPIV4, gateapi.GateAPIV4{
		Key:    cfg.Exchange["ApiKey"],
		Secret: cfg.Exchange["SecretKey"],
	})
	cp, _, err := g.client.SpotApi.GetCurrencyPair(g.ctx, cfg.Strategy["TradingPair"])

	if err != nil {
		panic(err)
	} else {
		g.cp = cp
	}
	return &g
}

func (g Gateio) PlaceOrder(order Order) string {
	// Call Api and place order
	newOrder := gateapi.Order{
		CurrencyPair: g.cp.Id,
		Type:         string(order.Otype),
		Account:      "spot",
		Side:         string(order.Ttype),
		Amount:       order.Amount.String(),
		Price:        order.Price.String(),
		TimeInForce:  "gtc",
		AutoBorrow:   false,
	}
	createdOrder, _, err := g.client.SpotApi.CreateOrder(g.ctx, newOrder)
	if err != nil {
		// fmt.Printf("%+v", err)
		if err.(gateapi.GateAPIError).Label == "BALANCE_NOT_ENOUGH" {
			// if e, ok := err.(gateapi.GateAPIError); ok {
			fmt.Println("[ERROR]: Balance is not enough, failted to create order")
			// fmt.Print(e.Label)
		} else {
			panic(err)
		}
	}
	fmt.Printf("[INFO]: order %v created\n %+v\n", createdOrder.Id, order)
	return createdOrder.Id
}

func (g Gateio) CancelOrder(tradingPair string, orderId string) {
	// Call Api and cancel order
	result, _, err := g.client.SpotApi.CancelOrder(g.ctx, orderId, tradingPair, nil)
	if err != nil {
		if err.(gateapi.GateAPIError).Label == "ORDER_NOT_FOUND" {
			fmt.Printf("[ERROR]: Order %v not found\n", orderId)
		} else {
			panic(err)
		}
	}
	fmt.Printf("[INFO]: order %v cancelled\n", result.Id)
}

func (g Gateio) Tick(timestamp int64) {
	// TODO
	// This function serves realtime market data purpose, which was temporarily disable for simplicity
}

func (g Gateio) GetLastPrice(tradingPair string) decimal.Decimal {
	// Call Api and get the current last price of the trading pair
	tickers, _, err := g.client.SpotApi.ListTickers(g.ctx, &gateapi.ListTickersOpts{CurrencyPair: optional.NewString(g.cp.Id)})
	if err != nil {
		panic(err)
	}
	lastPrice := tickers[0].Last
	return decimal.RequireFromString(lastPrice)
}

func (g Gateio) AdjustCandidate(buyOrder *Order, sellOrder *Order) {
	// Call Api, get current balance to adjust the order
	quote := strings.Split(g.cp.Id, "_") // [ask, bid]
	buyBalance, _, err := g.client.SpotApi.ListSpotAccounts(g.ctx, &gateapi.ListSpotAccountsOpts{Currency: optional.NewString(quote[0])})
	if err != nil {
		panic(err)
	}
	if len(buyBalance) != 1 {
		panic("Balance must be at length of 1")
	}
	buyOrder.Amount = decimal.Min(decimal.RequireFromString(buyBalance[0].Available), buyOrder.Amount) //get min of two number
	sellBalance, _, err := g.client.SpotApi.ListSpotAccounts(g.ctx, &gateapi.ListSpotAccountsOpts{Currency: optional.NewString(quote[1])})
	if err != nil {
		panic(err)
	}
	if len(sellBalance) != 1 {
		panic("Balance must be at length of 1")
	}
	sellOrder.Amount = decimal.Min(decimal.RequireFromString(sellBalance[0].Available), sellOrder.Amount) //get min of two number
}
