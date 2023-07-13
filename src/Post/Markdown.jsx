// config
function getConfig(network) {
  switch (network) {
    case "mainnet":
      return {
        ownerId: "openwebbuild.near",
      };
    case "testnet":
      return {
        ownerId: "openwebbuild.testnet",
      };
    default:
      throw Error(`Unconfigured environment '${network}'.`);
  }
}
const config = getConfig(context.networkId);

const Wrapper = styled.div`
  font-family: Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #11181c;
  word-break: break-word;

  > * {
    margin-bottom: 12px;
  }

  h1,
  h2,
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
    font-size: 21px;
  }

  h2 {
    font-size: 18px;
  }

  p {
    white-space: pre-line;
  }

  a {
    color: #006adc;
    outline: none;
    font-weight: 600;

    &:hover,
    &:focus {
      color: #006adc;
      text-decoration: underline;
    }
  }

  img {
    display: block;
    max-width: 100%;
    max-height: 80vh;
  }
`;

const Embedded = styled.div`
  white-space: normal;
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
  (({ src, props }) => (
    <Embedded className="embedded-widget">
      <Widget
        key={
          src + props
            ? "?" +
              Object.entries(props)
                .map((p) => p.join("="))
                .join("&")
            : ""
        }
        src={src}
        props={props}
      />
    </Embedded>
  ));

return (
  <Wrapper>
    <Markdown
      text={props.text}
      onMention={renderMention}
      onWidget={renderWidget}
    />
  </Wrapper>
);
