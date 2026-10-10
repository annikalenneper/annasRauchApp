import health from '../content/health.json';
import milestones from '../content/milestones.json';
import sprueche from '../content/sprueche.json';
import ui from '../content/ui.json';
import { fillText, isAnniversary, surpriseTextIndex, type EarnedReward } from '../core/rewards';

export const HEALTH_DAYS = health.facts.map((fact) => fact.day);

export interface RewardText {
  overline: string;
  /** Short line for the treasure box, e.g. "Meilenstein · 150 Tage". */
  label: string;
  /** Headline for rewards without a big number. */
  title?: string;
  text: string;
  source?: { label: string; url: string };
}

function milestoneText(day: number): string {
  const own = milestones.milestones.find((milestone) => milestone.day === day);
  if (own) return own.text;
  const texts = isAnniversary(day) ? milestones.anniversary : milestones.every100;
  const index = isAnniversary(day) ? day / 365 : day / 100;
  return fillText(texts[index % texts.length] ?? '', { jahre: day / 365, tage: day });
}

/** Turns an earned reward into the texts to show. `startDate` is the start of its attempt. */
export function describeReward(reward: EarnedReward, startDate: string): RewardText {
  if (reward.kind === 'milestone') {
    const label =
      reward.day === 1
        ? ui.treasure.milestoneLabelOne
        : fillText(ui.treasure.milestoneLabel, { tage: reward.day });
    return { overline: ui.reward.milestone, label, text: milestoneText(reward.day) };
  }
  if (reward.kind === 'health') {
    const fact = health.facts.find((candidate) => candidate.day === reward.day);
    return {
      overline: ui.reward.health,
      label: fillText(ui.treasure.healthLabel, { wann: fact?.after ?? '' }),
      title: fact?.after,
      text: fact?.text ?? '',
      source: health.source,
    };
  }
  const index = surpriseTextIndex(startDate, reward.day, sprueche.length);
  return {
    overline: ui.reward.surprise,
    label: fillText(ui.treasure.surpriseLabel, { tage: reward.day }),
    title: ui.reward.surpriseTitle,
    text: sprueche[index] ?? '',
  };
}
