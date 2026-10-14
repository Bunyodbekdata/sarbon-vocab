import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  RotateCcw, 
  HelpCircle, 
  Search, 
  BarChart3, 
  Settings as SettingsIcon, 
  Flame, 
  Moon, 
  Sun 
} from 'lucide-react';
import { SarbonLogo } from '../brand/SarbonLogo';

export type ActiveTab = 'dashboard' | 'courses' | 'flashcards' | 'review' | 'practice' | 'library' | 'progress' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  streak: number;
  dueCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  streak,
  dueCount,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sarbon-nav">
      <div className="nav-inner">
        {/* Brand */}
        <div style={{ cursor: 'pointer' }} onClick={() => onSelectTab('dashboard')}>
          <SarbonLogo size="sm" showSubtitle={true} />
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => onSelectTab('courses')}
          >
            <BookOpen size={17} />
            <span>Courses</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'flashcards' ? 'active' : ''}`}
            onClick={() => onSelectTab('flashcards')}
          >
            <Layers size={17} />
            <span>Flashcards</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => onSelectTab('review')}
            style={{ position: 'relative' }}
          >
            <RotateCcw size={17} />
            <span>Review</span>
            {dueCount > 0 && (
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '99px',
                  background: 'var(--rose)',
                  color: '#FFFFFF',
                  marginLeft: '2px',
                }}
              >
                {dueCount}
              </span>
            )}
          </button>

          <button
            className={`nav-item ${activeTab === 'practice' ? 'active' : ''}`}
            onClick={() => onSelectTab('practice')}
          >
            <HelpCircle size={17} />
            <span>Practice</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => onSelectTab('library')}
          >
            <Search size={17} />
            <span>Library</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => onSelectTab('progress')}
          >
            <BarChart3 size={17} />
            <span>Progress</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => onSelectTab('settings')}
          >
            <SettingsIcon size={17} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          {/* Daily Streak */}
          <div className="streak-badge" title={`${streak} kunlik faoliyat seriyasi`}>
            <Flame size={18} fill="var(--amber)" color="var(--amber)" />
            <span>{streak}d</span>
          </div>

          {/* Theme Switcher */}
          <button
            className="icon-button"
            onClick={onToggleTheme}
            aria-label="Toggle dark/light theme"
            title={theme === 'dark' ? 'Yorug\' rejimga o\'tish' : 'Qorong\'i rejimga o\'tish'}
          >
            {theme === 'dark' ? <Sun size={18} color="var(--gold-light)" /> : <Moon size={18} color="var(--gold-dim)" />}
          </button>
        </div>
      </div>
    </header>
  );
};
