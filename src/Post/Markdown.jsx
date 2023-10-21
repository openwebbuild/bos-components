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

const Wrapper = styled.div`
  font-family: source-serif-pro, Georgia, Cambria, "Times New Roman", Times,
    serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 32px;
  color: #242424;
  word-break: break-word;

  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;

  > * {
    margin-bottom: 12px;
  }

  h1 h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 600;
    font-size: 16px;
    line-height: 1.6em;
    color: #11181c;
  }

  h1 {
    font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 42px;
    font-weight: 700;
  }

  h2 {
    font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 24px;
    font-weight: 600;
    margin-top: 1.95em;
    margin-bottom: -0.28em;
  }

  p {
    white-space: pre-line;
    letter-spacing: -0.003em;
    margin-top: 2em;
    margin-bottom: -0.46em;
  }

  h2 + p {
    margin-top: 0.86em;
    margin-bottom: -0.46em;
  }

  p:first-child {
    margin-top: 0.46em;
    margin-bottom: -0.46em;
  }

  a {
    color: inherit;
    outline: none;
    text-decoration: underline;
  }

  img {
    display: block;
    max-width: 100%;
    max-height: 80vh;
  }

  hr {
    margin: 3em 0;
  }
`;

const Embedded = styled.span`
  white-space: normal;

  p {
    white-space: normal;
  }
`;

const renderMention =
  props.renderMention ??
  ((accountId) => (
    <Widget
      key={accountId}
      src={`${config.ownerId}/widget/Account.ProfileInline`}
      props={{
        accountId,
        hideAvatar: true,
      }}
    />
  ));

const renderWidget =
  props.renderWidget ??
  // URL pattern: scheme://authority/path?query#fragment
  (({ url, scheme, authority, path, query }) => {
    // widget URL now allows "bos" and "near" schemes
    if (url && ["bos", "near"].includes(scheme) && authority && path) {
      const location = authority + path;
      const segments = location.split("/");
      if (segments && segments.length >= 3) {
        const src = segments.slice(segments.length - 3).join("/");
        const props = {
          ...{ markdown: props.text },
          ...(query ?? {}),
        };
        return (
          <Embedded className="embedded-widget">
            <Widget key={url} src={src} props={props} />
          </Embedded>
        );
      }
    }
    // If not a valid widget URL, return the original URL
    return url;
  });

return (
  <Wrapper>
    <Markdown
      text={props.text}
      onMention={renderMention}
      onURL={renderWidget}
    />
  </Wrapper>
);
