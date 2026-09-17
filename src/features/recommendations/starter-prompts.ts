export const starterPromptPool = [
  'I miss one person more than I want to admit',
  'Everything is finally going right for me',
  'I love them, but we’re not good together',
  'I want my ex back even though I know better',
  'Someone I trusted completely betrayed me',
  'I feel lonely even when everyone is around',
  'I proved everyone who doubted me wrong',
  'Success came fast and it’s overwhelming me',
  'I miss who I was before everything changed',
  'I feel guilty because I’m doing fine after the breakup',
  'We both care, but the timing is wrong',
  'I can’t stop overthinking what they meant',
  'I’m ready to leave the past behind',
  'Nobody understands the pressure I’m under',
  'I need confidence before I make my next move',
  'My family and I aren’t seeing eye to eye',
  'A friendship I cared about is falling apart',
  'I’m ambitious, but I’m exhausted from chasing it',
  'I regret how I handled things with someone I love',
  'I’m grieving someone and don’t know what to do with it',
  'She always looks polished and expensive',
  'The attraction was immediate when they walked in',
  'Things between us are complicated and undefined',
  'I’m happy, but part of me is waiting for it to go wrong',
  'I know I should move on, but I still check on them',
  'I’m proud of myself and want to celebrate how far I came',
] as const;

export function chooseStarterPrompts(random: () => number = Math.random, count = 6) {
  const prompts = [...starterPromptPool];
  for (let index = prompts.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [prompts[index], prompts[swapIndex]] = [prompts[swapIndex], prompts[index]];
  }
  return prompts.slice(0, Math.min(count, prompts.length));
}
