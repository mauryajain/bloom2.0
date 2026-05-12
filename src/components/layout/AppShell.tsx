// ============================================================
// BLOOM — App Shell Layout
// Agent 1 (Full-Stack Lead)
// ============================================================

import Sidebar from './Sidebar';
import Dashboard from '../dashboard/Dashboard';
import SymptomJournal from '../symptoms/SymptomJournal';
import AskBloom from '../ai/AskBloom';
import DoctorPrep from '../ai/DoctorPrep';
import ConditionLibrary from '../conditions/ConditionLibrary';
import SettingsPage from '../settings/SettingsPage';
import { useBloomStore } from '../../store/useBloomStore';

const views: Record<string, React.FC> = {
  dashboard: Dashboard,
  journal: SymptomJournal,
  'ask-bloom': AskBloom,
  'doctor-prep': DoctorPrep,
  conditions: ConditionLibrary,
  settings: SettingsPage,
};

export default function AppShell() {
  const { currentView } = useBloomStore();
  const ViewComponent = views[currentView] || Dashboard;

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-4 md:p-8 pt-16 md:pt-8 main-content">
        <div className="max-w-6xl mx-auto animate-[fade-in_0.5s_ease-out]">
          <ViewComponent />
        </div>
      </main>
    </div>
  );
}
