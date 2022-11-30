
from src.order_candidate import LimitOrder
class OrderTracker:
    def __init__(self):
        super().__init__()
        self._tracked_limit_orders = {}
    
    def init_tracker_for_connector(self, connector):
        self._tracked_limit_orders[connector] = {}
        
    @property
    def active_limit_orders(self):
        limit_orders = []
        for market, limit_order in self._tracked_limit_orders.items():
            limit_orders.append((market, limit_order))
        return limit_orders
    
    
    def start_track_order(self, connector_name, trading_pair, order_id):
        self._tracked_limit_orders[connector_name][order_id] = LimitOrder(order_id, trading_pair)
            
    def stop_track_order(self, connector_name, order_id):
        self._tracked_limit_orders[connector_name].pop(order_id)