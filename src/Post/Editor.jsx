// MIT License: https://github.com/openwebbuild/bos-components/blob/main/LICENSE

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

const ComposeWrapper = styled.div`
  border-top: 1px solid #eceef0;
  height: 80vh;
`;

function queryPostByBlockHeight(accountId, blockHeight) {
  return JSON.parse(
    Social.get(`${accountId}/post/main`, blockHeight) ?? "null"
  );
}

function queryPostByPermalink(accountId, permalink) {
  const index = {
    action: "post",
    key: "main",
    options: {
      limit: 50,
      order: "desc",
      accountId,
    },
  };
  const posts = Social.index(index.action, index.key, index.options);
  if (posts) {
    for (const p of posts) {
      const content = queryPostByBlockHeight(accountId, p.blockHeight);
      if (content && content.permalink === permalink) {
        return {
          blockHeight: p.blockHeight,
          ...content,
        };
      }
    }
  }
  return null;
}

const accountId = context.accountId;
const permalink = props.permalink;
const content =
  accountId && permalink ? queryPostByPermalink(accountId, permalink) : null;
const text = content && content.text;

return (
  <>
    <ComposeWrapper>
      <Widget
        src={`${config.ownerId}/widget/Post.Compose`}
        props={{ text, ...props }}
      />
    </ComposeWrapper>
  </>
);
