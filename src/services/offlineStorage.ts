import { UserProgressState } from '../types/curriculum';
import { ERAS_CURRICULUM } from '../data/curriculumData';

const STORAGE_KEY = 'chronos_earth_user_state_v1';

export const loadStoredUserState = (): Partial<UserProgressState> | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Unable to read localStorage:', err);
  }
  return null;
};

export const saveUserStateToStorage = (state: UserProgressState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Unable to write localStorage:', err);
  }
};

export const exportOfflineStudyGuide = () => {
  const markdownContent = `# ChronosEarth: The Epic Journey of Earth & Life (Offline Field Guide)
Generated on: ${new Date().toLocaleDateString()}

${ERAS_CURRICULUM.map(
  (era, idx) => `
## ${idx + 1}. ${era.title} (${era.timeframe})
**Key Overview:**
${era.overview}

**Atmosphere & Conditions:**
- Temperature: ${era.temperatureEstimate}
- Gas Composition: ${era.atmosphericComposition.map((g) => `${g.gas}: ${g.percentage}%`).join(', ')}

**Key Innovations & Milestones:**
${era.milestones.map((m) => `- **${m.timeAgo} - ${m.title}**: ${m.summary} (${m.keyFact})`).join('\n')}

**Key Study Points for Examinations:**
${era.quizQuestions.map((q, i) => `${i + 1}. ${q.question} -> Answer: ${q.options[q.correctIndex]} (${q.explanation})`).join('\n\n')}
`
).join('\n---\n')}
`;

  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ChronosEarth_Complete_Offline_Curriculum_${new Date().toISOString().split('T')[0]}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
