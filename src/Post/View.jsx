// config
function getConfig(network) {
  switch (network) {
    case "mainnet":
      return {
        ownerId: "openwebbuild.near",
        discoveryAccountId: "near",
        eugeneId: "mob.near",
      };
    case "testnet":
      return {
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
const blockHeight =
  props.blockHeight === "now" ? "now" : parseInt(props.blockHeight);
const subscribe = !!props.subscribe;
const notifyAccountId = accountId;
const postUrl = `https://${config.gatewayDomain}/${config.discoveryAccountId}/widget/PostPage?accountId=${accountId}&blockHeight=${blockHeight}`;

const content =
  props.content ??
  JSON.parse(Social.get(`${accountId}/post/main`, blockHeight) ?? "null");

const item = {
  type: "social",
  path: `${accountId}/post/main`,
  blockHeight,
};

const Post = styled.div`
  position: relative;

  &::before {
    content: "";
    display: block;
    position: absolute;
    left: 19px;
    top: 0px;
    bottom: 12px;
    width: 2px;
    background: #eceef0;
  }
`;

const Header = styled.div`
  margin-bottom: 0;
  display: inline-flex;
`;

const Body = styled.div`
  padding-left: 52px;
  padding-bottom: 1px;
`;

const Content = styled.div`
  img {
    display: block;
    max-width: 100%;
    max-height: 80vh;
    margin: 0 0 12px;
  }
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

return (
  <Post>
    {props.showAvatar && (
      <Header>
        <Widget
          src={`${config.discoveryAccountId}/widget/AccountProfile`}
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
                        src={`${config.discoveryAccountId}/widget/TimeAgo`}
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

      {props.showComments && (
        <Comments>
          <Widget
            src={`${config.discoveryAccountId}/widget/Comments.Feed`}
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
