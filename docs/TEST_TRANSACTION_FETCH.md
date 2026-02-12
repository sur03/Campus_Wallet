# Transaction Fetch Test

## Steps to Debug

1. Open browser console (F12)
2. Paste this code and run it:

```javascript
// Test fetching transactions directly
const testAddress = 'QIQXT3OKU2LWVDZQEXI7UGNQV46652QEZE7JL54TMVBXE66GZTVKWB422Q';
const url = `https://testnet-idx.algonode.cloud/v2/transactions?address=${testAddress}&limit=5`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log('=== RAW API RESPONSE ===');
    console.log('Total transactions:', data.transactions?.length);
    if (data.transactions && data.transactions.length > 0) {
      console.log('First transaction:', data.transactions[0]);
      console.log('Transaction type:', data.transactions[0]['tx-type']);
      console.log('Payment info:', data.transactions[0]['payment-transaction']);
    }
  })
  .catch(err => console.error('Error:', err));
```

3. Check what the console shows
4. Share the output

## Expected Output

You should see:
- Total transactions: (some number)
- First transaction: (object with transaction details)
- Transaction type: "pay" or other type
- Payment info: (object with receiver and amount)

## If Transaction Type is Undefined

The SDK might be transforming the property names. Try this alternative:

```javascript
import algosdk from 'algosdk';

const indexer = new algosdk.Indexer('', 'https://testnet-idx.algonode.cloud', '');
const address = 'QIQXT3OKU2LWVDZQEXI7UGNQV46652QEZE7JL54TMVBXE66GZTVKWB422Q';

indexer.searchForTransactions()
  .address(address)
  .limit(5)
  .do()
  .then(response => {
    console.log('SDK Response:', response);
    console.log('First txn:', response.transactions[0]);
  });
```
