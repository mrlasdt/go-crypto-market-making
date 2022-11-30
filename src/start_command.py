import time
from src.clock import Clock, ClockMode
from src.strategy.script_strategy_base import ScriptStrategyBase
from src.exchange.gate_io_exchange import GateIoExchange
class StartCommand:
    def _initialize_markets(self, markets): #put here for simplicity, should be in hummingbot_application.py
        for exchange, trading_pair in markets.items():
            if exchange == "gate_io":
                connector = GateIoExchange(self.client_config_map, trading_pair)
                self.markets[exchange] = connector
            else:
                raise NotImplementedError('Only supported gate.io')
    
    def _initialize_strategy(self):
        script_strategy = ScriptStrategyBase.load_script_class(self.strategy_file_name)
        self._initialize_markets(script_strategy.markets)
        self.strategy = script_strategy(self.markets)
        
    def start(self, script):
        file_name = script.split(".")[0]
        self.strategy_file_name = file_name
        self._initialize_strategy()
        self.start_market_making()
        
    def start_market_making(self):
        # try:
        self.start_time = time.time() * 1e3  # Time in milliseconds
        tick_size = self.client_config_map.tick_size
        print('[INFO]:',f"Creating the clock with tick size: {tick_size}")
        self.clock = Clock(ClockMode.REALTIME, tick_size=tick_size)
        for market in self.markets.values():
            if market is not None:
                self.clock.add_iterator(market)
        if self.strategy:
            self.clock.add_iterator(self.strategy)          
        self.clock.run()
            # self.notify(f"\n'{self.strategy_name}' strategy started.\n"
            #             f"Run `status` command to query the progress.")
            # self.logger().info("start command initiated.")
        # except Exception as e:
        #     # self.logger().error(str(e), exc_info=True)
        #     print('[ERROR]:',str(e))

  