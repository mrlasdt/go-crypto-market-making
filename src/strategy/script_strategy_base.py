import sys
from config.settings import SCRIPT_STRATEGIES_MODULE
import importlib
import inspect
from decimal import Decimal
from typing import List
from src.order_candidate import OrderType, TradeType, LimitOrder
from src.order_tracker import OrderTracker
s_decimal_nan = Decimal("NaN")

class ScriptStrategyBase:
    def __init__(self, connectors):
        """
        Initialising a new script strategy object.

        :param connectors: A dictionary of connector names and their corresponding connector.
        """
        self.connectors = connectors
        # self.add_markets(list(connectors.values()))
        self.order_tracker = OrderTracker()
        for connector in connectors:
            self.order_tracker.init_tracker_for_connector(connector)
        self.ready_to_trade = False
    @classmethod
    def load_script_class(cls, script_name):
        """
        Imports the script module based on its name (module file name) and returns the loaded script class

        :param script_name: name of the module where the script class is defined
        """
        module = sys.modules.get(f"{SCRIPT_STRATEGIES_MODULE}.{script_name}")
        if module is not None:
            script_module = importlib.reload(module)
        else:
            script_module = importlib.import_module(f".{script_name}", package=SCRIPT_STRATEGIES_MODULE)
        try:
            script_class = next((member for member_name, member in inspect.getmembers(script_module)
                                 if inspect.isclass(member) and
                                 issubclass(member, ScriptStrategyBase) and
                                 member is not ScriptStrategyBase))
        except StopIteration:
            raise ModuleNotFoundError(f"The module {script_name} does not contain any subclass of ScriptStrategyBase")
        return script_class

    def tick(self, timestamp: float):
        """
        Clock tick entry point, is run every second (on normal tick setting).
        Checks if all connectors are ready, if so the strategy is ready to trade.

        :param timestamp: current tick timestamp
        """
        if not self.ready_to_trade:
            self.ready_to_trade = all(ex.ready for ex in self.connectors.values())
            if not self.ready_to_trade:
                for con in [c for c in self.connectors.values() if not c.ready]:
                    print("[WARNING]:",f"{con.name} is not ready. Please wait...")
                return
        else:
            self.current_timestamp = timestamp
            self.tracking_orders()
            self.on_tick()

    def place_order(self, connector_name: str, order) -> str:
        created = self.connectors[connector_name].place_order(order)
        if created:
            self.order_tracker.start_track_order(connector_name, order.trading_pair, created.id)
            print("[INFO]:", "order created with id {}, status {}, details\n {}".format(created.id, created.status, order))
        
    def cancel(self,
            connector_name: str,
            trading_pair: str,
            order_id:str) -> str:
        canceled = self.connectors[connector_name].cancel_order(trading_pair, order_id)
        self.order_tracker.stop_track_order(connector_name, order_id)
        print("[INFO]:", "order cancelled\n {}".format(canceled.id))
        
    def get_active_orders(self, connector_name: str) -> List[LimitOrder]:
        """
        Returns a list of active orders for a connector.
        :param connector_name: The name of the connector.
        :return: A list of active orders
        """
        orders = self.order_tracker.active_limit_orders
        return [o[1] for o in orders if o[0] == connector_name]
    
    def tracking_orders(self):
        for connector_name in self.connectors:
            active_orders = self.get_active_orders(connector_name)
            for orders in active_orders:
                for order in orders.values():
                    self.connectors[connector_name].print_order_info(order)
                