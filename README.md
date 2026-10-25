# grill-buttons

A Claude Code mod that makes Matt Pocock's grilling skills (`/grill-me`, `/grill-with-docs`) ask each round of questions in Claude Code's own question dialog, with a button per answer and the recommended answer first, instead of as `❓ **Q1**` markdown text. Free-text answers still work through the dialog's "Other" option.

It hooks `skill.prompt` and rewrites the `grilling` skill's question format as the skill loads, so it works wherever Claude Code draws that dialog: terminal, desktop app and mobile (Remote Control). It needs the [mattpocock-skills](https://github.com/mattpocock/skills) plugin installed.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install grill-buttons --marketplace majinmarco/claude-grill-buttons
```

Answer `y` to add the marketplace, then pick a scope (user is the first one offered).

From a shell:

```
claude plugin install grill-buttons --marketplace majinmarco/claude-grill-buttons
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `majinmarco/claude-grill-buttons`, then Add plugin.

## Test

```
claude plugin test .
```
