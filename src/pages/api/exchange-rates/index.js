export async function GET({ locals, url }) {
  const userId = locals.user?.id
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const from = url.searchParams.get('from') || 'USD'
    const to = url.searchParams.get('to') || 'THB'

    // If same currency, return rate 1
    if (from === to) {
      return new Response(
        JSON.stringify({
          from,
          to,
          rate: 1,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const pair = `${from}${to}=X`
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${pair}?interval=1d&range=1d`

    const response = await fetch(yahooUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate')
    }

    const data = await response.json()
    const result = data?.chart?.result?.[0]
    const rate = result?.meta?.regularMarketPrice

    if (!rate) {
      throw new Error('Exchange rate not found')
    }

    return new Response(
      JSON.stringify({
        from,
        to,
        rate,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch exchange rate' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
