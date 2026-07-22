/**
 * ui/components/WeeklySnapshotWidget.js
 *
 * Classroom Dashboard widget: a quick pulse on this week, built
 * entirely on services/studentProgressService.js (the Progress Engine
 * — see docs/PROGRESS_ENGINE.md). Three pieces, per the approved
 * Phase 2 layout:
 *   - Weekly Stars: total stars awarded classroom-wide this week (a
 *     quick "how much star activity happened" pulse, not a per-student
 *     figure — that's what the leaderboard preview below is for).
 *   - Weekly Leaderboard: the top 3 by rank (ties included in full —
 *     e.g. two students tied for #1 both show, which may show more
 *     than 3 names; see getRankInRange's tie handling).
 *   - Team Champion: whichever team(s) are rank 1 this week.
 */

import * as studentProgressService from '../../services/studentProgressService.js';
import { getWeekRange } from '../../utils/dateHelpers.js';
import { createEmptyStateElement } from './EmptyState.js';

export function createWeeklySnapshotWidgetElement({ classroom }) {
  const widget = document.createElement('div');
  widget.className = 'dashboard-widget';

  const heading = document.createElement('h2');
  heading.className = 'dashboard-widget__heading';
  heading.textContent = '\ud83d\udcc8 Weekly Snapshot';
  widget.appendChild(heading);

  const weekRange = getWeekRange();
  const rank = studentProgressService.getRankInRange(classroom, weekRange);
  const teamRank = studentProgressService.getTeamRankInRange(classroom, weekRange);

  const totalWeeklyStars = rank.reduce((sum, entry) => sum + entry.stars, 0);

  if (totalWeeklyStars === 0) {
    widget.appendChild(createEmptyStateElement({ message: 'No stars awarded yet this week.' }));
    return widget;
  }

  const starsLine = document.createElement('p');
  starsLine.className = 'dashboard-widget__stat-line';
  starsLine.textContent = `\ud83d\udcd2 ${totalWeeklyStars} ${totalWeeklyStars === 1 ? 'star' : 'stars'} awarded this week`;
  widget.appendChild(starsLine);

  const topThree = rank.filter((entry) => entry.rank <= 3 && entry.stars > 0);
  if (topThree.length > 0) {
    const leaderboardHeading = document.createElement('h3');
    leaderboardHeading.className = 'dashboard-widget__subheading';
    leaderboardHeading.textContent = 'Weekly Leaderboard';
    widget.appendChild(leaderboardHeading);

    const list = document.createElement('ol');
    list.className = 'dashboard-widget__rank-list';
    topThree.forEach((entry) => {
      const item = document.createElement('li');
      item.textContent = `#${entry.rank} \u00b7 ${entry.studentName} \u2014 ${entry.stars} \u2b50`;
      list.appendChild(item);
    });
    widget.appendChild(list);
  }

  const championTeams = teamRank.filter((entry) => entry.rank === 1 && entry.stars > 0);
  if (championTeams.length > 0) {
    const championHeading = document.createElement('h3');
    championHeading.className = 'dashboard-widget__subheading';
    championHeading.textContent = '\ud83e\udd1d Team Champion';
    widget.appendChild(championHeading);

    const championLine = document.createElement('p');
    championLine.className = 'dashboard-widget__stat-line';
    championLine.textContent = championTeams.map((team) => `${team.teamName} (${team.stars} \u2b50)`).join(' \u00b7 ');
    widget.appendChild(championLine);
  }

  return widget;
}
