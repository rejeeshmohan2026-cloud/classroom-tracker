/**
 * ui/components/LeaderboardList.js
 *
 * A reusable, generic ranked list — used today by the Recognition
 * Screen (one leaderboard per selected category/period), and available
 * for anywhere else a ranked list needs rendering later (e.g. a future
 * dedicated Group Leaderboard). Deliberately knows nothing about
 * recognition categories or the Progress Engine: it only renders
 * whatever `entries` and `formatValue` it's given, so it stays reusable
 * without needing to import config/recognitionCategories.js itself.
 *
 * Shows the top 3 by default; "Show all" expands the remaining entries
 * in place, and toggles back to "Show less" — never a separate page or
 * route, so the Recognition Screen stays self-contained.
 */

const COLLAPSED_COUNT = 3;

export function createLeaderboardListElement({ entries, formatValue }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'leaderboard-list';

  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state__message';
    empty.textContent = 'No students in this classroom yet.';
    wrapper.appendChild(empty);
    return wrapper;
  }

  const list = document.createElement('ol');
  list.className = 'leaderboard-list__rows';
  wrapper.appendChild(list);

  let expanded = false;

  function renderRows() {
    list.innerHTML = '';
    const visibleEntries = expanded ? entries : entries.slice(0, COLLAPSED_COUNT);

    visibleEntries.forEach((entry) => {
      const row = document.createElement('li');
      row.className = 'leaderboard-list__row';

      const rank = document.createElement('span');
      rank.className = 'leaderboard-list__rank';
      rank.textContent = `#${entry.rank}`;

      const name = document.createElement('span');
      name.className = 'leaderboard-list__name';
      name.textContent = entry.studentName || entry.teamName;

      const value = document.createElement('span');
      value.className = 'leaderboard-list__value';
      value.textContent = formatValue(entry);

      row.append(rank, name, value);
      list.appendChild(row);
    });
  }

  renderRows();

  if (entries.length > COLLAPSED_COUNT) {
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'btn btn--text leaderboard-list__toggle';
    toggleButton.textContent = 'Show all';
    toggleButton.addEventListener('click', () => {
      expanded = !expanded;
      toggleButton.textContent = expanded ? 'Show less' : 'Show all';
      renderRows();
    });
    wrapper.appendChild(toggleButton);
  }

  return wrapper;
}
