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

State.init({
  selectedTab: props.tab || "posts",
});

if (props.tab && props.tab !== state.selectedTab) {
  State.update({
    selectedTab: props.tab,
  });
}

const Wrapper = styled.div`
  margin-top: calc(var(--body-top-padding) * -1);
  padding-bottom: 48px;
`;

const Main = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 290px;
  grid-gap: 16px;

  @media (max-width: 1200px) {
    display: block;
  }
`;

const Section = styled.div`
  padding-top: 24px;
  border-left: ${(p) => (p.primary ? "1px solid #ECEEF0" : "none")};
  border-right: ${(p) => (p.primary ? "1px solid #ECEEF0" : "none")};

  flex: ${(p) => (p.primary ? "3" : "1")};

  > div {
    padding-bottom: 24px;
    margin-bottom: 24px;
    border-bottom: 1px solid #eceef0;

    &:last-child {
      padding-bottom: 0;
      margin-bottom: 0;
      border-bottom: none;
    }
  }

  @media (max-width: 1200px) {
    padding-top: 0px;
    border-left: none;
    border-right: none;
    display: ${(p) => (p.active ? "block" : "none")};
    margin: ${(p) => (p.negativeMargin ? "0 -12px" : "0")};
  }
`;

return (
  <Wrapper negativeMargin={state.selectedTab === "posts"}>
    <Main>
      {/* <Section active={state.selectedTab === "apps"}>
        <Widget src={`${config.discoveryAccountId}/widget/FeaturedComponents`} />
        <Widget src={`${config.discoveryAccountId}/widget/LatestComponents`} />
      </Section> */}
      <Section primary active={state.selectedTab === "posts"}>
        <Widget src={`${config.ownerId}/widget/Page.Posts`} />
      </Section>
      <Section active={state.selectedTab === "explore"}>
        <Widget src={`${config.discoveryAccountId}/widget/ExploreWidgets`} />
      </Section>
    </Main>
  </Wrapper>
);
