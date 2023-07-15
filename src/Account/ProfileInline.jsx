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
const profile = props.profile || Social.get(`${accountId}/profile/**`, "final");

const Wrapper = styled.a`
  --avatar-size: 24px;
  display: inline-flex;
  position: relative;
  padding-left: ${props.hideAvatar ? "0" : "calc(var(--avatar-size) + 6px)}"};
  gap: 6px;
  align-items: center;
  cursor: pointer;
  margin: 0;
  color: #006adc !important;
  outline: none;
  text-decoration: none;
  max-width: 100%;
  white-space: normal;

  > * {
    min-width: 0;
  }

  &:hover,
  &:focus {
    text-decoration: underline;

    div:first-child {
      border-color: #d0d5dd;
    }
  }
`;

const Text = styled.span`
  display: inline-flex;
  margin: 0;
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  overflow: ${(p) => (p.ellipsis ? "hidden" : "")};
  text-overflow: ${(p) => (p.ellipsis ? "ellipsis" : "")};
  white-space: ${(p) => (p.ellipsis ? "nowrap" : "")};
`;

const Avatar = styled.div`
  display: inline-flex;
  width: var(--avatar-size);
  height: var(--avatar-size);
  position: absolute;
  left: 0;
  right: 0;
  flex-shrink: 0;
  border: 1px solid #eceef0;
  overflow: hidden;
  border-radius: 24px;
  transition: border-color 200ms;

  img {
    display: inline-flex;
    object-fit: cover;
    width: 100%;
    height: 100%;
    margin: 0;
  }
`;

const AccountProfile = (
  <Wrapper
    href={`/#/${config.ownerId}/widget/Page.Profile?accountId=${accountId}`}
  >
    {!props.hideAvatar && (
      <Avatar>
        <Widget
          src={`${config.eugeneId}/widget/Image`}
          props={{
            image: profile.image,
            alt: profile.name,
            fallbackUrl:
              "https://ipfs.near.social/ipfs/bafkreibiyqabm3kl24gcb2oegb7pmwdi6wwrpui62iwb44l7uomnn3lhbi",
          }}
        />
      </Avatar>
    )}

    <Text ellipsis>{profile.name || accountId.split(".near")[0]}</Text>
  </Wrapper>
);

if (props.noOverlay) return AccountProfile;

return (
  <Widget
    src={`${config.discoveryAccountId}/widget/AccountProfileOverlay`}
    props={{
      accountId: props.accountId,
      profile,
      children: AccountProfile,
      inline: true,
    }}
  />
);
