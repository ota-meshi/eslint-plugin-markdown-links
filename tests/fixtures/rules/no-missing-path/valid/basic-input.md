# Valid: Existing Path

- [target](target.md)
- [target](./target.md)
- [target](../test-target.md)
- [target](/tests/fixtures/rules/no-missing-path/test-target.md)

# Valid: Url-encoded Existing Path

- [target](File%20With%20Space.md)
- [target](File%20With%20Space.md#section)
- [target](hash%23target.md)
- [target](percent%25target.md)
- [target](%E6%97%A5%E6%9C%AC%E8%AA%9E.md)
- [target](%E6%97%A5%E6%9C%AC%E8%AA%9E.md#section)

# Valid: Existing Path Without Encoding

- [target](<File With Space.md>)
- [target](<File With Space.md#section>)
- [target](percent%target.md)
- [target](日本語.md)
- [target](日本語.md#section)

# Valid: Existing Anchor

- [target](../test-target.md#a)
- [target](../test-target.md#custom-id)
- [target](../test-target.md#html-id)
- [target](../test-target.md#%E3%83%86%E3%82%B9%E3%83%88)
- [target](../test-target.md#日本語)
- [target](../test-target.md#%E6%97%A5%E6%9C%AC%E8%AA%9E)
- [target](../test-target.md#html)
- [target](../test-target.md#dupe)
- [target](../test-target.md#dupe-1)

# Valid: GitHub Line Reference

- [target](../test-target.md#L42)
- [target](../test-target.md#L1-L5)
- [target](../test-target.md#L1C4)
- [target](../test-target.md#L1C4-L1C5)

# Valid: HTML Reference

- [target](../test-target.html#test-target)

# Valid: External Link

- [external](https://example.com)

# Valid: Anchor Only

- [anchor](#section)
