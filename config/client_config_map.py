import os
from dotenv import load_dotenv
load_dotenv()

tick_size = 1

gate_io_api_key = os.environ['APIKEY']
gate_io_secret_key = os.environ['SECRETKEY']
