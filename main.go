package main

import (
	"example.com/gate_io_mm/command"
	"example.com/gate_io_mm/config"
)

func main() {
	cfg := config.DefaultConfig()
	command.Start(cfg)
}
