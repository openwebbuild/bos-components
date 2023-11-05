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

function parseTitle(text) {
  let title = text.split("\n")[0];
  if (title && title.startsWith("# ")) {
    title = title.slice(2).trim();
    return title;
  } else {
    return "";
  }
}

function parsePermalink(title) {
  if (title) {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  } else {
    return "";
  }
}

State.init({
  image: {},
  text: "",
  title: "",
  permalink: "",
  published: !!props.text,
});

const profile = Social.getr(`${context.accountId}/profile`);
const autocompleteEnabled = true;

const title = parseTitle(state.text);
// If the post already exists with the permalink, it's not allowed to change it.
const parsedPermalink = parsePermalink(title);
const permalink = props.permalink
  ? parsedPermalink === props.permalink && parsedPermalink
  : parsedPermalink;
const published = !!props.text || state.published;
const permalinkChanged =
  props.permalink &&
  parsedPermalink &&
  parsedPermalink !== props.permalink &&
  published;

const content = {
  type: "md",
  image: state.image.cid ? { ipfs_cid: state.image.cid } : undefined,
  text: state.text,
  title,
  permalink,
};

const postUrl = `/blog/${context.accountId}/${permalink}`;

function extractMentions(text) {
  const mentionRegex =
    /@((?:(?:[a-z\d]+[-_])*[a-z\d]+\.)*(?:[a-z\d]+[-_])*[a-z\d]+)/gi;
  mentionRegex.lastIndex = 0;
  const accountIds = new Set();
  for (const match of text.matchAll(mentionRegex)) {
    if (
      !/[\w`]/.test(match.input.charAt(match.index - 1)) &&
      !/[/\w`]/.test(match.input.charAt(match.index + match[0].length)) &&
      match[1].length >= 2 &&
      match[1].length <= 64
    ) {
      accountIds.add(match[1].toLowerCase());
    }
  }
  return [...accountIds];
}

function extractTagNotifications(text, item) {
  return extractMentions(text || "")
    .filter((accountId) => accountId !== context.accountId)
    .map((accountId) => ({
      key: accountId,
      value: {
        type: "mention",
        item,
      },
    }));
}

function composeData() {
  const data = {
    post: {
      main: JSON.stringify(content),
    },
    index: {
      post: JSON.stringify({
        key: "main",
        value: {
          type: "md",
        },
      }),
    },
  };

  const notifications = extractTagNotifications(state.text, {
    type: "social",
    path: `${context.accountId}/post/main`,
  });

  if (notifications.length) {
    data.index.notify = JSON.stringify(
      notifications.length > 1 ? notifications : notifications[0]
    );
  }

  return data;
}

function onCommit() {
  State.update({
    image: {},
    text: "",
    published: true,
  });
}

function textareaInputHandler(value) {
  const showAccountAutocomplete = /@[\w][^\s]*$/.test(value);
  State.update({ text: value, showAccountAutocomplete });
}

function autoCompleteAccountId(id) {
  let text = state.text.replace(/[\s]{0,1}@[^\s]*$/, "");
  text = `${text} @${id}`.trim() + " ";
  State.update({ text, showAccountAutocomplete: false });
}

const TEXT_CACHE_KEY = props.permalink ?? "text_cache";

function autoSaveContent(event) {
  Storage.privateSet(TEXT_CACHE_KEY, event.target.value);
}

function init() {
  if (!state.text) {
    const text = Storage.privateGet(TEXT_CACHE_KEY);
    if (props.permalink) {
      if (text) {
        const savedPermalink = parsePermalink(parseTitle(text));
        if (props.permalink === savedPermalink) {
          State.update({ text });
          return;
        }
      }
      if (props.text) {
        State.update({
          text: props.text,
        });
      }
    } else if (text) {
      State.update({ text });
    }
  }
}

init();

const Wrapper = styled.div`
  --padding: 24px;
  position: relative;
  height: 100%;
  border: 1px lightgrey solid;
  border-radius: 10px;

  @media (max-width: 1200px) {
    --padding: 12px;
  }
`;

const Container = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  pointer-events: none;
  position: absolute;
  top: var(--padding);
  left: var(--padding);

  img {
    object-fit: cover;
    border-radius: 40px;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 992px) {
    display: none;
  }
`;

const EditorWrapper = styled.div`
  display: grid;
  vertical-align: top;
  align-items: center;
  position: relative;
  align-items: stretch;
  height: 100%;
  flex: 1 0;

  &::after,
  textarea {
    width: 100%;
    min-width: 1em;
    height: 100%;
    min-height: 164px;
    font: inherit;
    padding: var(--padding) var(--padding) calc(40px + (var(--padding) * 2))
      var(--padding);
    margin: 0;
    resize: none;
    background: none;
    appearance: none;
    border: none;
    grid-area: 1 / 1;
    overflow: hidden;
    outline: none;

    @media (max-width: 1200px) {
      min-height: 124px;
    }

    @media (max-width: 992px) {
      padding-left: var(--padding);
    }
  }

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
    white-space: pre-wrap;
  }

  textarea {
    transition: all 200ms;
    box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
    font-family: "Roboto Mono", Menlo, Consolas, sans-serif;
    font-size: 14px;

    &::placeholder {
      opacity: 1;
      color: #687076;
    }

    &:empty + p {
      display: block;
    }
  }
`;

const EditorDescription = styled.p`
  position: absolute;
  bottom: calc(var(--padding) + 24px);
  left: var(--padding);
  right: var(--padding);
  font-size: 10px;
  line-height: 18px;
  font-weight: 400;
  color: #687076;
  pointer-events: none;
  display: none;

  a {
    color: #000;
    outline: none;
    font-weight: 600;
    pointer-events: auto;

    &:hover,
    &:focus {
      color: #000;
      text-decoration: underline;
    }
  }

  @media (max-width: 992px) {
    left: var(--padding);
  }
`;

const Actions = styled.div`
  display: inline-flex;
  gap: 12px;
  position: absolute;
  bottom: var(--padding);
  right: var(--padding);

  .commit-post-button,
  .preview-post-button {
    background: #59e692;
    color: #09342e;
    border-radius: 40px;
    height: 40px;
    padding: 0 35px;
    font-weight: 600;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: background 200ms, opacity 200ms;

    &:hover,
    &:focus {
      background: rgb(112 242 164);
      outline: none;
    }

    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  .preview-post-button {
    color: #11181c;
    background: #f1f3f5;
    padding: 0;
    width: 40px;

    &:hover,
    &:focus {
      background: #d7dbde;
      outline: none;
    }
  }

  .upload-image-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f3f5;
    color: #11181c;
    border-radius: 40px;
    height: 40px;
    min-width: 40px;
    font-size: 0;
    border: none;
    cursor: pointer;
    transition: background 200ms, opacity 200ms;

    &::before {
      font-size: 16px;
    }

    &:hover,
    &:focus {
      background: #d7dbde;
      outline: none;
    }

    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    span {
      margin-left: 12px;
    }
  }

  .d-inline-block {
    display: flex !important;
    gap: 12px;
    margin: 0 !important;

    .overflow-hidden {
      width: 40px !important;
      height: 40px !important;
    }
  }
`;

const PreviewWrapper = styled.div`
  position: relative;
  padding: var(--padding);
  padding-bottom: calc(40px + (var(--padding) * 2));
  flex: 1 0;
  height: 100%;
  overflow-y: auto;
`;

const LinkPreview = styled.p`
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;
  color: #687076;
  pointer-events: none;
  padding-left: 40px;

  a {
    color: #000;
    outline: none;
    font-weight: 600;
    pointer-events: auto;
    text-decoration: underline;
  }
`;

const AutoComplete = styled.div`
  position: absolute;
  z-index: 5;
  bottom: 0;
  left: 0;
  right: 0;

  > div > div {
    padding: calc(var(--padding) / 2);
  }
`;

return (
  <Wrapper>
    <Container>
      <EditorWrapper data-value={state.text} class="col">
        <textarea
          placeholder="What's happening?"
          onInput={(event) => textareaInputHandler(event.target.value)}
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              State.update({ showAccountAutocomplete: false });
            }
          }}
          onChange={autoSaveContent}
          value={state.text}
        />

        <EditorDescription>
          <a href="https://www.markdownguide.org/basic-syntax/" target="_blank">
            Markdown
          </a>
          is supported
        </EditorDescription>
      </EditorWrapper>
      <PreviewWrapper class="col">
        {permalink ? (
          <LinkPreview>
            Post {published ? "has been" : "will be"} published to{" "}
            <a
              href={postUrl}
              target="_blank"
            >{`/${context.accountId}/${permalink}`}</a>
          </LinkPreview>
        ) : permalinkChanged ? (
          <LinkPreview>
            Modify the post link{" "}
            <a
              href={postUrl}
              target="_blank"
            >{`/${context.accountId}/${props.permalink}`}</a>{" "}
            is not allowed.
          </LinkPreview>
        ) : (
          <LinkPreview>
            To publish post with a permanent link, add a title that starts with
            "# " at the first line.
          </LinkPreview>
        )}

        <Widget
          src={`${config.ownerId}/widget/Post.View`}
          props={{
            accountId: context.accountId,
            blockHeight: "now",
            content,
            hideAvatar: true,
            hideComments: true,
          }}
        />
      </PreviewWrapper>
    </Container>

    {autocompleteEnabled && state.showAccountAutocomplete && (
      <AutoComplete>
        <Widget
          src={`${config.discoveryAccountId}/widget/AccountAutocomplete`}
          props={{
            term: state.text.split("@").pop(),
            onSelect: autoCompleteAccountId,
            onClose: () => State.update({ showAccountAutocomplete: false }),
          }}
        />
      </AutoComplete>
    )}

    <Actions>
      {
        <IpfsImageUpload
          image={state.image}
          className="upload-image-button bi bi-image"
        />
      }

      <CommitButton
        disabled={!state.text || !permalink}
        force
        data={composeData}
        onCommit={onCommit}
        className="commit-post-button"
      >
        Post
      </CommitButton>
    </Actions>
  </Wrapper>
);
