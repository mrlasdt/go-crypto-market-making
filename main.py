from src.start_command import StartCommand
import logging
from config import client_config_map

class MainApplication(StartCommand):

    def __init__(self, client_config_map):
        self.client_config_map = client_config_map
        self.markets = {}

if __name__ == "__main__":
    script_file = 'simple_market_making'
    app = MainApplication(client_config_map)
    app.start(script_file)