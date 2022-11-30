#https://github.com/gateio/gateapi-python/blob/master/example/spot.py
from gate_api import ApiClient, Configuration, Order, SpotApi
from gate_api.exceptions import GateApiException
from decimal import Decimal

class GateIoExchange:
    def __init__(self,client_config_map, trading_pairs):
        config = Configuration(key=client_config_map.gate_io_api_key, secret=client_config_map.gate_io_secret_key)
        self._spot_api = SpotApi(ApiClient(config))
        self._currency_pairs = {trading_pair: self._spot_api.get_currency_pair(trading_pair) for trading_pair in trading_pairs}
        self._min_amount = {k: v.min_base_amount for k,v in self._currency_pairs.items()}
        self.ready = self.check_connection()
        self.name = "gate_io"

    def check_connection(self):
        return True #TODO: implement this
    
    def place_order(self, order) -> str:
        #TODO: continue
        order_ = Order(amount=str(order.amount), price=str(order.price), side=order.order_side.value, type=order.order_type.value, currency_pair=order.trading_pair)
        try:
            return self._spot_api.create_order(order_)
        except GateApiException as e:
            if e.label == "BALANCE_NOT_ENOUGH":
                print("[ERROR]:", 'Balance is not enough, failted to create order\n {}'.format(order))
                return
            else:
                raise GateApiException(str(e))
            
        
        
    def cancel_order(self, trading_pair, order_id):
        try:
            return self._spot_api.cancel_order(order_id, trading_pair)
        except GateApiException as e:
            if e.label == "ORDER_NOT_ENOUGH":
                return
            else:
                raise GateApiException(str(e))
            
    def tick(self, timestamp):
        #TODO: implement web socket listener
        pass
    

    def get_last_price(self, trading_pair):
        tickers = self._spot_api.list_tickers(currency_pair=trading_pair)
        assert len(tickers) == 1
        last_price = tickers[0].last
        return Decimal(last_price)
    
    def adjust_candidates(self, proposals):
        # make sure balance is enough
        buy_order, sell_order = proposals
        assert buy_order.trading_pair == sell_order.trading_pair, "Invalid proposals to adjust"
        bid_quote, ask_quote = buy_order.trading_pair.split('_')
        bid_accounts = self._spot_api.list_spot_accounts(currency=bid_quote)
        ask_accounts = self._spot_api.list_spot_accounts(currency=ask_quote)
        assert len(bid_accounts) == 1
        assert len(ask_accounts) == 1
        bid_available = Decimal(bid_accounts[0].available)
        ask_available = Decimal(ask_accounts[0].available)
        buy_order.amount = Decimal(min(buy_order.amount, bid_available))
        sell_order.amount = Decimal(min(sell_order.amount, ask_available))
        return [buy_order, sell_order]
    
    def print_order_info(self, order):
        try:
            order_result = self._spot_api.get_order(order.order_id, order.trading_pair)
            print("[INFO]:", "order {} filled {}, left: {}".format(order_result.id, order_result.filled_total, order_result.left))
        except GateApiException as e:
            if e.label == "ORDER_NOT_ENOUGH":
                return
            else:
                raise GateApiException(str(e))
            