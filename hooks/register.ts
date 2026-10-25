import type { Register } from 'claude-code'

// grill-me and grill-with-docs hand off to the `grilling` skill today, but an
// older or forked copy may carry the question format itself, so all three are
// rewritten (as `name` or `<plugin>:name`).
const isGrilling = (skill: string) =>
  /(^|:)(grilling|grill-me|grill-with-docs)$/.test(skill)

// Marks text this mod already rewrote, so a second copy of the mod (or a
// skill loaded twice) leaves it alone.
const MARK = '<!-- grill-buttons -->'

// The skill's own markdown format block ("Format a round like so:" plus its
// fenced example) and its "yes accepts the recommendation" line. Both are
// replaced by the button instructions below.
const FORMAT_BLOCK = /Format a round like so:\s*```[\s\S]*?```\s*/
const YES_LINE = /Word each question so "yes" accepts your recommended answer\.\s*/

export const BUTTON_FORMAT = `${MARK}
Ask each round through the AskUserQuestion tool, never as plain text in your reply: the user answers by clicking buttons.

- One AskUserQuestion entry per frontier question. The tool takes at most 4 questions per call: if the frontier is larger, ask the first 4, then call AskUserQuestion again right away with the next ones, all in the same round.
- \`question\`: start with its number ("Q1. ..."), end with a question mark. Put the context the user needs to decide (what you found, why it matters, the trade-off) in the question text, in a few sentences at most.
- \`header\`: a one- or two-word label for the decision, 12 characters at most.
- \`options\`: 2 to 4 distinct, concrete answers. The first option is your recommended answer, its label ending in " (Recommended)". Keep labels to 1-5 words so they fit a phone or narrow terminal; the detail goes in the description. Each option's \`description\` says what choosing it means and its main consequence. Don't add an "Other" option: the dialog adds one for free-text answers.
- Use \`multiSelect: true\` only when the answers genuinely combine. Use an option's \`preview\` when comparing code, schemas or layouts side by side helps.
- Before the call, write at most one short line saying which part of the design tree this round covers. Don't repeat the questions as text.
- The tool result holds the user's answers. Read any free-text "Other" answer carefully: it may reshape the tree. If the user dismisses the dialog, stop and ask in plain text how they want to continue.

`

export function rewrite(text: string): string {
  if (text.includes(MARK)) return text
  const replaced = text.replace(FORMAT_BLOCK, BUTTON_FORMAT).replace(YES_LINE, '')
  if (replaced !== text) return replaced
  // The skill's wording changed upstream: keep it and add ours as an override.
  return `${text.trimEnd()}\n\n## How to ask (overrides any question format above)\n\n${BUTTON_FORMAT}`
}

export const register: Register = on => {
  on('skill.prompt', async ($, e, next) => {
    const out = await next(e)
    if (!isGrilling(e.skill)) return out
    $.ui.toast('Grilling questions will use buttons')
    return { ...out, text: rewrite(out.text) }
  })
}
