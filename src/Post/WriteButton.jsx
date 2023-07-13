// config
function getConfig(network) {
  switch (network) {
    case "mainnet":
      return {
        ownerId: "openwebbuild.near",
        discoveryAccountId: "near",
      };
    case "testnet":
      return {
        ownerId: "openwebbuild.testnet",
        discoveryAccountId: "one.testnet",
      };
    default:
      throw Error(`Unconfigured environment '${network}'.`);
  }
}
const config = getConfig(context.networkId);

return (
  // <a href={`/${config.ownerId}/widget/Post.Editor`}>
  <a href="/write">
    <button type="button" className="preview-post-button" title="Write Post">
      <i className="bi bi-pencil" />
    </button>
  </a>
);
