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

// -- Post Query Helper Functions --

function queryPostByBlockHeight(accountId, blockHeight) {
  return JSON.parse(
    Social.get(`${accountId}/post/main`, blockHeight) ?? "null"
  );
}

const GRAPHQL_ENDPOINT =
  props.GRAPHQL_ENDPOINT || "https://near-queryapi.api.pagoda.co";

function fetchGraphQL(operationsDoc, operationName, variables) {
  return fetch(`${GRAPHQL_ENDPOINT}/v1/graphql`, {
    method: "POST",
    headers: { "x-hasura-role": "openwebbuild_near" },
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName,
    }),
  });
}

function createQuery() {
  const indexerQueries = `
    query QueryPostByPermalink($accountId: String, $permalink: String, $offset: Int, $limit: Int) {
      openwebbuild_near_blog_posts(where: { account_id: { _eq: $accountId }, permalink: { _eq: $permalink } }, order_by: { block_height: desc }, offset: $offset, limit: $limit) {
        id
        permalink
        content
        block_height
        account_id
        block_timestamp
        title
      }
    }
  `;
  return indexerQueries;
}

function queryPostByPermalink(accountId, permalink) {
  if (context.networkId === "mainnet") {
    // query post with Query API
    const result = fetchGraphQL(createQuery(), "QueryPostByPermalink", {
      accountId,
      permalink,
      offset: 0,
      limit: 1,
    });
    if (result.status === 200 && result.body) {
      if (result.body.errors) {
        console.log("error:", result.body.errors);
      } else {
        let data = result.body.data;
        if (data) {
          const posts = data.openwebbuild_near_blog_posts;
          if (posts && posts.length > 0) {
            const p = posts[0];
            const content = JSON.parse(p.content || null);
            if (content) {
              return {
                blockHeight: p.block_height,
                ...content,
              };
            }
          }
        }
      }
      return null;
    }
  } else {
    // query post with NEAR Social indexer
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
}

// -- End of Post Query Helper Functions --

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
