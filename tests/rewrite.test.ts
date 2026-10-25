import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

const FENCE = '```'
const GRILLING = `Interview the user relentlessly.

Work the tree in **rounds**. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

${FENCE}
❓ **Q1** - **<question title>**: <question body>

➡️ <your recommended answer>
${FENCE}

Word each question so "yes" accepts your recommended answer.

Each round the user answers reshapes the tree.`

// Beneath the plugin, these hooks stand for the engine: it expands the skill
// to the text it was called with, and takes the toast.
const engine = (on: On) => {
  on('skill.prompt', (_, e) => ({ text: e.text }))
  on('ui.toast', () => ({ value: undefined }))
}

test('the grilling skill asks through AskUserQuestion', async ($, on) => {
  engine(on)

  for (const skill of [
    'grilling',
    'mattpocock-skills:grilling',
    'grill-me',
    'mattpocock-skills:grill-with-docs',
  ]) {
    const { text } = await $.skill.prompt({ skill, text: GRILLING })
    expect(text).toContain('AskUserQuestion')
    expect(text).toContain('(Recommended)')
    expect(text).not.toContain('❓')
    expect(text).not.toContain('Word each question so "yes"')
    // The rest of the skill is kept.
    expect(text).toContain('Interview the user relentlessly.')
    expect(text).toContain('Each round the user answers reshapes the tree.')
  }
})

test('a reworded grilling skill gets the override appended', async ($, on) => {
  const reworded = 'Grill the user. Print questions as a numbered list.'
  engine(on)

  const { text } = await $.skill.prompt({ skill: 'grilling', text: reworded })
  expect(text.startsWith(reworded)).toBe(true)
  expect(text).toContain('overrides any question format above')
  expect(text).toContain('AskUserQuestion')
})

test("grill-me's hand-off to grilling gets the override", async ($, on) => {
  const handOff = 'Call the Skill tool with "grilling".'
  engine(on)

  const { text } = await $.skill.prompt({ skill: 'mattpocock-skills:grill-me', text: handOff })
  expect(text.startsWith(handOff)).toBe(true)
  expect(text).toContain('AskUserQuestion')
})

test('text already rewritten is left alone', async ($, on) => {
  engine(on)
  const once = (await $.skill.prompt({ skill: 'grilling', text: GRILLING })).text
  const twice = (await $.skill.prompt({ skill: 'grilling', text: once })).text
  expect(twice).toBe(once)
})

test('other skills pass through untouched', async ($, on) => {
  engine(on)

  for (const skill of ['grill', 'domain-modeling', 'commit']) {
    const { text } = await $.skill.prompt({ skill, text: GRILLING })
    expect(text).toBe(GRILLING)
  }
})
