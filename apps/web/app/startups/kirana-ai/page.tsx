const terms = [
  ["Allocation", "10%"],
  ["KIRA offered", "1,000,000"],
  ["FDV range", "4M–6M USDC"],
  ["Minimum raise", "400,000 USDC"],
];
export default function Kirana() {
  return (
    <>
      <section className="hero">
        <p>SIMULATED COMPANY · ARBITRUM SEPOLIA</p>
        <h1>Kirana AI</h1>
        <p>A sealed maximum-FDV auction with a uniform clearing price.</p>
        <div className="terms">
          {terms.map(([label, value]) => (
            <div key={label}>
              <small>{label}</small>
              <br />
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>How bidding works</h2>
        <p>
          Approve test USDC, then commit your deposit and sealed maximum FDV.
          Your maximum valuation stays sealed until reveal. Your onchain deposit
          amount may be visible.
        </p>
        <button disabled>Connect a configured testnet wallet to invest</button>
        <p>
          <small>
            Transactions are only shown as confirmed after a canonical receipt.
            This deployment has not yet been configured.
          </small>
        </p>
      </section>
    </>
  );
}
