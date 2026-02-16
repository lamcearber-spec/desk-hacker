
from ib_insync import *
import datetime

ib = IB()
try:
    ib.connect('127.00.1', 4001, clientId=99)

    # Get account summary
    account_summary = {}
    for item in ib.accountSummary():
        if item.tag in ['TotalCashValue', 'NetLiquidation', 'AvailableFunds']:
            account_summary[item.tag] = f'{float(item.value):.2f} {item.currency}'
    
    print('--- Account Summary ---')
    for tag, value in account_summary.items():
        print(f'{tag}: {value}')

    # Get positions
    positions = ib.positions()
    achr_position = None
    for p in positions:
        # Assuming the contract details are consistent with the status.txt
        if p.contract.symbol == 'ACHR' and p.contract.right == 'P' and p.contract.strike == 7.0 and p.contract.lastTradeDateOrContractMonth == '20260220':
            achr_position = p
            break

    print('\n--- ACHR Position ---')
    if achr_position:
        # Fetch current market data for the option
        # reqMktData for options needs more details than just the contract
        # We need the specific option chain data or a direct ticker for the specific option contract
        # Let's try to get market data for the specific contract first
        ib.qualifyContracts(achr_position.contract) # Ensure contract is qualified

        ib.reqMktData(achr_position.contract, '', False, False)
        ib.sleep(2) # Give some time for market data to arrive
        ticker = ib.ticker(achr_position.contract)
        
        # Check if ticker has valid market data
        if ticker.marketPrice() and ticker.last:
            market_value_per_share = ticker.marketPrice()
            market_value = market_value_per_share * abs(achr_position.position) * 100 # Multiplied by 100 for options contracts
        elif ticker.last: # Use last price if marketPrice is not available immediately
            market_value_per_share = ticker.last
            market_value = market_value_per_share * abs(achr_position.position) * 100
        else:
            market_value_per_share = 0
            market_value = 0
        
        # Fetch current market data for the underlying stock
        achr_stock_contract = Stock('ACHR', 'SMART', 'USD')
        ib.qualifyContracts(achr_stock_contract)
        ib.reqMktData(achr_stock_contract, '', False, False)
        ib.sleep(2)
        stock_ticker = ib.ticker(achr_stock_contract)
        
        achr_stock_price = stock_ticker.marketPrice() if stock_ticker.marketPrice() else stock_ticker.last # Prefer marketPrice, fallback to last

        print(f'Contract: {achr_position.contract.localSymbol}')
        print(f'Quantity: {achr_position.position} contracts')
        print(f'Cost Basis (per contract): ${achr_position.avgCost:.2f}')
        print(f'Market Value (per contract): ${market_value_per_share:.2f}')
        
        cost_basis_total = achr_position.avgCost * abs(achr_position.position) * 100 # Total cost basis for the number of contracts * 100 shares/contract
        unrealized_pnl = market_value - cost_basis_total
        unrealized_pnl_percent = (unrealized_pnl / cost_basis_total) * 100 if cost_basis_total else 0
        
        print(f'Total Cost Basis: ${cost_basis_total:.2f}')
        print(f'Total Market Value: ${market_value:.2f}')
        print(f'Unrealized P&L: ${unrealized_pnl:.2f} ({unrealized_pnl_percent:.1f}%)')
        print(f'ACHR Stock Price: ${achr_stock_price:.2f}')
    else:
        print('No ACHR $7 Put position found.')

finally:
    ib.disconnect()
