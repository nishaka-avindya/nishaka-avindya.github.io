---
title: "Screaming Frog Custom Search: Using Multiple Filters to Find Stale Content"
eyebrow: "Guide · Technical SEO"
description: "How to use Screaming Frog's Custom Search with multiple filters to find content that used to be correct and no longer is — wrong-region currency, old NAP, and discontinued product names."
date: 2026-09-12
keywords:
  - Screaming Frog
  - Custom Search
  - Technical SEO audit
  - Content audit
  - Stale content
meta:
  - label: "Tool"
    value: "Screaming Frog SEO Spider"
  - label: "Level"
    value: "Intermediate"
proficiency: "Intermediate"
---

Most site audits look for things that are missing. Broken links, missing meta tags, thin pages. Fewer audits look for the opposite problem: content that used to be correct and quietly stopped being correct. Nobody searches for it because nothing is technically "wrong" — the page renders, the field isn't empty, the crawler finds no error. The content is just stale.

Three examples of this pattern:

- A price shown in the wrong region's currency after a multi-market rollout
- An old name, address, or phone number left behind after a rebrand or office move
- A discontinued product or service name still referenced in navigation, footers, or old posts

All three share the same root cause and the same fix: **Screaming Frog's Custom Search**, run with multiple filters in a single crawl.

## The method

In Screaming Frog, go to **Configuration > Custom > Search**. Each filter takes:

- A **string or regex** to match
- **Contains** or **Does Not Contain** as the match type

You can add up to 10 filters and run them in the same crawl. This matters more than it sounds: one basket regex with alternation (`LKR|USD|old-phone-number`) will tell you a page matched *something*, but not which thing. Separate filters give you a separate hit count per issue, so you can triage currency errors, NAP errors, and dead product names independently instead of manually re-checking every flagged URL to work out which problem it actually has.

Set the filters up before you crawl — Custom Search only evaluates pages crawled after the filters are active, so a mid-crawl addition means re-crawling to catch pages already visited.

## Example 1 — Currency shown in wrong region

If a market complains prices aren't showing in their local currency, don't wait for more complaints to map the scope. Set a **Does Not Contain** filter for the expected currency symbol or code on that region's URL pattern (e.g. pages under `/lk/` should contain `LKR` or `Rs.`). Any page under that path that doesn't match is a candidate for a leftover default-market price.

## Example 2 — Old NAP after a rebrand or move

After an address or phone number changes, the old one tends to survive in places nobody thinks to check: footer includes that didn't get updated everywhere, old blog posts with the address in body text, schema markup that wasn't touched when the visible page was. Set a **Contains** filter for the old phone number format or old address string. Any match is a page still carrying the previous NAP.

## Example 3 — Discontinued product or service name still referenced

When a product or service is retired, the page itself usually gets removed or redirected — but the *name* often survives in navigation menus, related-post modules, old CTAs, or comparison content that mentions it in passing. Set a **Contains** filter for the discontinued name. This catches internal linking and copy that a redirect on the product page itself won't fix.

## Reference table

<div class="table-scroll" markdown="1">

| Example | Filter type | Match logic | Sample string / pattern | Typically found in |
|---|---|---|---|---|
| Currency shown in wrong region | Does Not Contain | Expected currency missing on region-specific URL | `LKR` or `Rs\.` on `/lk/*` | Product/pricing pages |
| Old NAP after rebrand or move | Contains | Old identifier still present | Old phone format, e.g. `011-XXX-XXXX` | Footer, contact page, blog body, schema |
| Discontinued product/service name | Contains | Retired name still present | Exact old product/service name | Nav, footer, related content, old posts |

</div>

## Where this goes next

This is one method — Custom Search with multiple filters — applied to three examples. The same approach extends to anything else that used to be true and might not be anymore: old team member names, sunset feature mentions, deprecated legal/compliance text. More technique write-ups like this are coming.
