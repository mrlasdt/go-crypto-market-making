package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Exchange map[string]string
	Strategy map[string]string
}

func DefaultConfig() Config {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	cfg := Config{}
	cfg.Exchange = map[string]string{
		"Name":      "Gateio",
		"ApiKey":    os.Getenv("APIKEY"),
		"SecretKey": os.Getenv("SECRETKEY"),
	}
	cfg.Strategy = map[string]string{
		"Name":             "SimplePMM", //TODO: implement strategy.Init() -> return Strategy by Name
		"BidSpread":        "0.1",       // BuyPrice = LastPrice*90%
		"AskSpread":        "0.1",       // SellPrice = LastPrice*110%
		"OrderRefreshTime": "10",        // Cancel all placed orders
		"OrderAmount":      "0.005",     //Amount of token to buy/sell of every order
		"CreateTimeStamp":  "0",         //
		"TradingPair":      "BNB_USDT",  //Token pair to trade
	}
	return cfg
}
