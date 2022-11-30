import logging
from decimal import Decimal
from enum import Enum
from typing import List
from src.strategy.script_strategy_base import ScriptStrategyBase
from src.order_candidate import TradeType, OrderType, PriceType, OrderCandidate

class SimplePMM(ScriptStrategyBase):
    bid_spread = 0.1
    ask_spread = 0.1
    order_refresh_time = 10
    order_amount = 0.005
    create_timestamp = 0
    trading_pair = "BNB_USDT"
    exchange = "gate_io"
    # Here you can use for example the LastTrade price to use in your strategy
    price_source = PriceType.MidPrice

    markets = {exchange: {trading_pair}}
    
    def on_tick(self):
        # print('-'*100)
        # print(self.create_timestamp <= self.current_timestamp)
        # print(self.create_timestamp)
        # print(self.current_timestamp)
        if self.create_timestamp <= self.current_timestamp:
            self.cancel_all_orders()
            proposal: List[OrderCandidate] = self.create_proposal()
            proposal_adjusted: List[OrderCandidate] = self.adjust_proposal_to_budget(proposal)
            self.place_orders(proposal_adjusted)
            self.create_timestamp = self.order_refresh_time + self.current_timestamp
            
    def create_proposal(self) -> List[OrderCandidate]:
        ref_price = self.connectors[self.exchange].get_last_price(self.trading_pair)
        buy_price = ref_price * Decimal(1 - self.bid_spread)
        sell_price = ref_price * Decimal(1 + self.ask_spread)

        buy_order = OrderCandidate(trading_pair=self.trading_pair, is_maker=True, order_type=OrderType.LIMIT,
                                   order_side=TradeType.BUY, amount=Decimal(self.order_amount), price=buy_price)

        sell_order = OrderCandidate(trading_pair=self.trading_pair, is_maker=True, order_type=OrderType.LIMIT,
                                    order_side=TradeType.SELL, amount=Decimal(self.order_amount), price=sell_price)

        return [buy_order, sell_order]

    def adjust_proposal_to_budget(self, proposal: List[OrderCandidate]) -> List[OrderCandidate]:
        proposal_adjusted = self.connectors[self.exchange].adjust_candidates(proposal)
        return proposal_adjusted

    def place_orders(self, proposal: List[OrderCandidate]) -> None:
        for order in proposal:
            self.place_order(connector_name=self.exchange, order=order)

    def cancel_all_orders(self):
        for orders in self.get_active_orders(connector_name=self.exchange):
            lorders = [order for order in orders.values()] #TODO: handle dictionary change during iteration error
            for order in lorders:
                self.cancel(self.exchange, order.trading_pair, order.order_id)
