// config
function getConfig(network) {
  switch (network) {
    case "mainnet":
      return {
        gatewayDomain: "openweb.build",
        ownerId: "openwebbuild.near",
        discoveryAccountId: "near",
        eugeneId: "mob.near",
      };
    case "testnet":
      return {
        gatewayDomain: "dev.openweb.build",
        ownerId: "openwebbuild.testnet",
        discoveryAccountId: "one.testnet",
        eugeneId: "eugenethedream",
      };
    default:
      throw Error(`Unconfigured environment '${network}'.`);
  }
}
const config = getConfig(context.networkId);

const accountId = props.accountId;
let permalink = props.permalink;
let blockHeight =
  props.blockHeight === "now" ? "now" : parseInt(props.blockHeight);
const subscribe = !!props.subscribe;
const notifyAccountId = accountId;

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

const content =
  props.content ??
  (accountId && permalink
    ? queryPostByPermalink(accountId, permalink)
    : accountId && blockHeight
    ? queryPostByBlockHeight(accountId, blockHeight)
    : null);

if (!blockHeight && content) {
  blockHeight = content.blockHeight;
}
if (!permalink && content) {
  permalink = content.permalink;
}

const postUrl = `https://${config.gatewayDomain}/blog/${accountId}/${permalink}`;
const editUrl = `/${config.ownerId}/widget/Post.Editor?permalink=${permalink}`;

const item = {
  type: "social",
  path: `${accountId}/post/main`,
  permalink,
};

const Post = styled.div`
  position: relative;

  &::before {
    content: "";
    display: ${props.hideBorder ? "none" : "block"};
    position: absolute;
    left: 19px;
    top: ${props.hideAvatar ? "0px" : "52px"};
    bottom: 12px;
    width: 2px;
    background: #eceef0;
  }
`;

const Header = styled.div`
  margin-bottom: 0;
  display: inline-flex;
  width: 100%;
`;

const Body = styled.div`
  padding-left: ${props.hideBorder ? "0px" : "52px"};
  padding-bottom: 1px;
`;

const Content = styled.div`
  img {
    display: block;
    max-width: 100%;
    max-height: 80vh;
    margin: 0 0 12px;
  }
  margin: 24px 0;
`;

const Text = styled.p`
  display: block;
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: #687076;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: -6px -6px 6px;
`;

const Comments = styled.div`
  > div > div:first-child {
    padding-top: 12px;
  }
`;

const EditButton = styled.div`
  margin: 0 0 0 auto;
  border: 0.5px solid #e3e3e0;
  background-color: #f3f3f2;
  height: 46px;
  width: 46px;
  border-radius: 50%;

  > div,
  a {
    width: 100%;
    height: 100%;
  }

  a {
    color: #1b1b18 !important;
    background-color: #f3f3f2 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    i {
      font-size: 18px !important;
    }
  }

  button {
    border-width: 0;
  }
`;

return (
  <Post>
    {!props.hideAvatar && (
      <Header>
        <Widget
          src={`${config.ownerId}/widget/Account.Profile`}
          props={{
            accountId,
            hideAccountId: true,
            inlineContent: (
              <>
                <Text as="span">･</Text>
                <Text>
                  {blockHeight === "now" ? (
                    "now"
                  ) : (
                    <>
                      <Widget
                        src={`${
                          context.networkId === "mainnet"
                            ? "mob.near"
                            : "one.testnet"
                        }/widget/TimeAgo`}
                        props={{ blockHeight }}
                      />{" "}
                      ago
                    </>
                  )}
                </Text>
              </>
            ),
          }}
        />
        {accountId === context.accountId && permalink && content.permalink && (
          <EditButton>
            <Widget
              src={`${config.ownerId}/widget/Post.WriteButton`}
              props={{
                link: editUrl,
                title: "Edit",
              }}
            />
          </EditButton>
        )}
      </Header>
    )}

    <Body>
      <Content>
        {content.text && (
          <Widget
            src={`${config.ownerId}/widget/Post.Markdown`}
            props={{ text: content.text }}
          />
        )}

        {content.image && (
          <Widget
            src={`${config.eugeneId}/widget/Image`}
            props={{
              image: content.image,
            }}
          />
        )}
      </Content>

      {blockHeight !== "now" && (
        <Actions>
          <Widget
            src={`${config.discoveryAccountId}/widget/LikeButton`}
            props={{
              item,
              notifyAccountId,
            }}
          />
          <Widget
            src={`${config.discoveryAccountId}/widget/CommentButton`}
            props={{
              item,
              onClick: () => State.update({ showReply: !state.showReply }),
            }}
          />
          <Widget
            src={`${config.discoveryAccountId}/widget/CopyUrlButton`}
            props={{
              url: postUrl,
            }}
          />
        </Actions>
      )}

      {state.showReply && (
        <div className="mb-2">
          <Widget
            src={`${config.discoveryAccountId}/widget/Comments.Compose`}
            props={{
              notifyAccountId,
              item,
              onComment: () => State.update({ showReply: false }),
            }}
          />
        </div>
      )}

      {!props.hideComments && (
        <Comments>
          <Widget
            src={`${config.ownerId}/widget/Comment.Feed`}
            props={{
              item,
              highlightComment: props.highlightComment,
              limit: props.commentsLimit,
              subscribe,
              raw,
            }}
          />
        </Comments>
      )}
    </Body>
  </Post>
);
