# describe-icp-for-discolike

Turn a target market into DiscoLike's structured filters, ready to paste. Not prose.

Loads `list-builder`. Company data always comes from DiscoLike; contacts never do.

## What actually moves the pull

Tune the structured filters, not the ICP description. The filters that decide the result:

- **Industry Group** - the primary cut. Pick the group, not the adjective.
- **Business Model** - separates who sells to whom; wrong model is the most common silent miss.
- **Digital Footprint** - the floor that quietly deletes good companies when set too high. Check it against a company you already won before trusting it.
- **Variance** - the auto-stop. It reads the real TAM: when variance halts the pull, that is the market's edge, not a bug.
- **Geography and size** - only as the client's `overrides` row rules them.

**The Count is meaningless.** It reports what the query touches, not what you can use. Judge the pull by sampling real rows.

## Before it ships

**Bullseye it.** Take a company the client already won or would obviously want, and check it passes every condition, one at a time. Thirty seconds, and it has caught both a digital-footprint floor and a country gate that would each have deleted a perfect-fit company silently.

## Done when

The filter set is written out condition by condition, the bullseye company passes, and you have named which conditions are the risky ones and why.
