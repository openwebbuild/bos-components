// MIT License: https://github.com/openwebbuild/bos-components/blob/main/LICENSE

// config
function getConfig(network) {
  switch (network) {
    case "mainnet":
      return {
        ownerId: "openwebbuild.near",
        nodeUrl: "https://rpc.mainnet.near.org",
      };
    case "testnet":
      return {
        ownerId: "openwebbuild.testnet",
        nodeUrl: "https://rpc.testnet.near.org",
      };
    default:
      throw Error(`Unconfigured environment '${network}'.`);
  }
}
const config = getConfig(context.networkId);

const ComposeWrapper = styled.div`
  border-top: 1px solid #eceef0;
  height: 80vh;
`;

return (
  <>
    <ComposeWrapper>
      <Widget src={`${config.ownerId}/widget/Post.Compose`} />
    </ComposeWrapper>
  </>
);
