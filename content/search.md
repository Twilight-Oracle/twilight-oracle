---
title: Search
layout: search
outputs:
  - html
---

# Search Syntax

Entering words or numbers into the search bar will search for cards containing all of those terms.

```
remove 3 influence early war
```

Enclose a phrase in quotes to search for exactly that list of words.

```
remove "3 influence" "early war"
```

Combine search terms with "or" to search for either one or the other.

```
(place or remove) 3 influence ("early war" or "mid war")
```

Modify search terms with "not" to filter out containing those terms.

```
not (place influence)
```

Combine terms with "and" to require all of them (the default behavior).

```
influence and not place
```

## Card Number

Filter cards by number:

```
number=109
```
```
number>=103
```

## Card Name

Filter cards by name:

```
name:China
```
```
name="The China Card"
```

## Card Type

Filter cards by type:

```
type:scoring
```
```
type:war
```
```
type:"ongoing effect" and type:"removed after event"
```

## Operations Value

Filter cards by operations value:

```
ops>3
```
```
ops<=2
```
```
ops=1
```
```
ops=1 or ops=4
```

## War Period

Filter cards by war period:

```
period:early
```
```
period:"Mid War"
```
```
period=L
```

## Side

Filter cards by side:

```
side:USA
```
```
side:USSR
```
```
not side:Neutral
```

## Card Text

Filter cards by text:

```
text:place and text:influence
```

## Card Version

Filter cards by version (oracle or printed):

```
version:oracle
```
```
version:printed and text:replace
```
