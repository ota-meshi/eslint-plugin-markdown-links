# Valid Cases

<!-- ✓ GOOD: Fragment only -->
[link](#fragment)

<!-- ✓ GOOD: Different file -->
[link](./other.md#fragment)
[link](../other.md#fragment)
[link](/path/to/other.md#fragment)

<!-- ✓ GOOD: External links -->
[external](https://example.com)
[external](http://example.com/path#fragment)

<!-- ✓ GOOD: Other protocols -->
[mailto](mailto:test@example.com)
[ftp](ftp://example.com/file.txt)

<!-- ✓ GOOD: Protocol-relative -->
[external](//example.com)

<!-- ✓ GOOD: Absolute paths to different files -->
[absolute](/different/file.md)

<!-- ✓ GOOD: Query parameters only -->
[query](?param=value)

<!-- ✓ GOOD: Empty link -->
[empty]()

<!-- ✓ GOOD: No URL -->
[text]