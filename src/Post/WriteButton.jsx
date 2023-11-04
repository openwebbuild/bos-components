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

const link = props.link ?? "/write";
const title = props.title ?? "Write Post";

return (
  <a href={link}>
    <button type="button" className="preview-post-button" title={title}>
      <i className="bi bi-pencil" />
    </button>
  </a>
);
