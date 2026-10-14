import React, { useState } from 'react';
import { 
  Volume2, 
  Flame, 
  Download, 
  Upload, 
  Trash2, 
  Check
} from 'lucide-react';
import { UserStats } from '../../types/vocabulary';
import { StorageService } from '../../services/storageService';

interface SettingsViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onDataReset: () => void;
  showToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  stats,
  onUpdateStats,
  onDataReset,
  showToast,
}) => {
  const [dailyGoal, setDailyGoal] = useState(stats.dailyGoal);
  const [audioSpeed, setAudioSpeed] = useState(stats.audioSpeed || 1.0);
  const [audioVoiceLang, setAudioVoiceLang] = useState(stats.audioVoiceLang || 'en-GB');

  const handleSavePreferences = () => {
    const updated: UserStats = {
      ...stats,
      dailyGoal,
      audioSpeed,
      audioVoiceLang,
    };
    StorageService.saveUserStats(updated);
    onUpdateStats(updated);
    showToast('Sozlamalar saqlandi!');
  };

  const handleExport = () => {
    const dataStr = StorageService.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sarbon_vocab_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('O\'quv ma\'lumotlari yuklab olindi!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importData(content);
        if (success) {
          onUpdateStats(StorageService.getUserStats());
          showToast('Ma\'lumotlar muvaffaqiyatli tiklandi!');
        } else {
          showToast('Xatolik: Fayl formati noto\'g\'ri.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("Haqiqatan ham barcha o'qish natijalari va takrorlash statistikasini tozalashni xohlaysizmi?")) {
      StorageService.resetAll();
      onDataReset();
      showToast('Barcha ma\'lumotlar tozalandi.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
          Ilova Sozlamalari
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
          O'qish rejalari, talaffuz tezligi va ma'lumotlar boshqaruvi.
        </p>
      </div>

      {/* Learning Goals */}
      <section className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame size={20} color="var(--amber)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>
            Kunlik O'rganish Maqsadi
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[10, 20, 30, 50].map(val => (
            <button
              key={val}
              className={`btn-secondary ${dailyGoal === val ? 'btn-primary' : ''}`}
              onClick={() => setDailyGoal(val)}
              style={{
                borderRadius: 'var(--radius-md)',
                flexDirection: 'column',
                gap: '2px',
                padding: '12px 6px',
                minHeight: '52px',
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 800 }}>{val}</span>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>so'z / kun</span>
            </button>
          ))}
        </div>
      </section>

      {/* Audio & Pronunciation Preferences */}
      <section className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Volume2 size={20} color="var(--gold-light)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>
            Ovoz va Talaffuz Sozlamalari
          </h2>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Aksent tanlovi:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn-secondary ${audioVoiceLang === 'en-GB' ? 'btn-primary' : ''}`}
              onClick={() => setAudioVoiceLang('en-GB')}
              style={{ flex: 1 }}
            >
              British English (UK)
            </button>
            <button
              className={`btn-secondary ${audioVoiceLang === 'en-US' ? 'btn-primary' : ''}`}
              onClick={() => setAudioVoiceLang('en-US')}
              style={{ flex: 1 }}
            >
              American English (US)
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Talaffuz tezligi: {audioSpeed}x
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[0.8, 1.0, 1.2].map(speed => (
              <button
                key={speed}
                className={`btn-secondary ${audioSpeed === speed ? 'btn-primary' : ''}`}
                onClick={() => setAudioSpeed(speed)}
                style={{ flex: 1 }}
              >
                {speed === 0.8 ? 'Sekin (0.8x)' : speed === 1.0 ? 'Normal (1.0x)' : 'Tez (1.2x)'}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleSavePreferences}
          style={{ marginTop: '8px' }}
        >
          <Check size={16} />
          <span>O'zgarishlarni saqlash</span>
        </button>
      </section>

      {/* Data Backup & Restore */}
      <section className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>
          Zaxira va Ma'lumotlarni Saqlash
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Barcha o'quv natijalaringiz brauzeringiz xotirasida (localStorage) saqlanadi. Qurilmangizni almashtirganda natijalarni saqlab qolish uchun fayl qilib yuklab oling.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button className="btn-secondary" onClick={handleExport} style={{ flex: 1, minWidth: '180px' }}>
            <Download size={16} />
            <span>Zaxirani yuklab olish</span>
          </button>

          <label className="btn-secondary" style={{ flex: 1, minWidth: '180px', cursor: 'pointer', textAlign: 'center' }}>
            <Upload size={16} />
            <span>Zaxiradan tiklash</span>
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
          <button
            className="btn-secondary"
            onClick={handleReset}
            style={{ color: 'var(--rose)', borderColor: 'rgba(224, 109, 136, 0.4)', width: '100%' }}
          >
            <Trash2 size={16} />
            <span>Barcha natijalarni tozalash (Reset)</span>
          </button>
        </div>
      </section>
    </div>
  );
};
