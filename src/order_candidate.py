from enum import Enum
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Type
from decimal import Decimal

class OrderType(Enum):
    MARKET = 1
    LIMIT = "limit"
    LIMIT_MAKER = 3
    def is_limit_type(self):
        return self in (OrderType.LIMIT, OrderType.LIMIT_MAKER)

class TradeType(Enum):
    BUY = "buy"
    SELL = "sell"
    RANGE = 3

class PriceType(Enum):
    MidPrice = 1
    BestBid = 2
    BestAsk = 3
    LastTrade = 4
    LastOwnTrade = 5
    InventoryCost = 6
    Custom = 7

class LimitOrder:
    def __init__(self, order_id, trading_pair):
        self.order_id = order_id
        self.trading_pair = trading_pair

@dataclass
class OrderCandidate:
    """
    WARNING: Do not use this class for sizing. Instead, use the `BudgetChecker`.

    This class contains a full picture of the impact of a potential order on the user account.

    It can return a dictionary with the base collateral required for an order, the percentage-fee collateral
    and the fixed-fee collaterals, and any combination of those. In addition, it contains a field sizing
    the potential return of an order.

    It also provides logic to adjust the order size, the collateral values, and the return based on
    a dictionary of currently available assets in the user account.
    """
    trading_pair: str
    is_maker: bool
    order_type: OrderType
    order_side: TradeType
    amount: Decimal
    price: Decimal
