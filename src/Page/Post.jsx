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

const accountId = props.accountId;
const commentBlockHeight = parseInt(props.commentBlockHeight);
let parentPost = null;

const extractParentPost = (item) => {
  if (!item || item.type !== "social" || !item.path || !item.blockHeight) {
    return undefined;
  }
  const accountId = item.path.split("/")[0];
  return `${accountId}/post/main` === item.path
    ? { accountId, blockHeight: item.blockHeight }
    : undefined;
};

if (commentBlockHeight) {
  const content = JSON.parse(
    Social.get(`${accountId}/post/comment`, commentBlockHeight) ?? "null"
  );

  if (content === null) {
    return "Loading";
  }

  parentPost = extractParentPost(content.item);
}

const Layout = styled.div`
  display: flex;
  justify-content: center;
  box-sizing: inherit;
`;

const Content = styled.div`
  min-width: 0;
  max-width: 680px;
  width: 100%;
  margin: 0 24px;
  box-sizing: inherit;
`;

if (parentPost) {
  return (
    <Layout>
      <Content>
        <Widget
          src={`${config.ownerId}/widget/Post.View`}
          props={{
            ...parentPost,
            highlightComment: { accountId, blockHeight: commentBlockHeight },
            commentsLimit: 30,
            subscribe: true,
            raw: props.raw,
            hideBorder: true,
          }}
        />
      </Content>
    </Layout>
  );
}

return (
  <Layout>
    <Content>
      <Widget
        src={`${config.ownerId}/widget/Post.View`}
        props={{
          ...props,
          commentsLimit: 30,
          subscribe: true,
          hideBorder: true,
        }}
      />
    </Content>
  </Layout>
);
