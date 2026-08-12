import React, { useState } from 'react';
import { Bell, Shield, Moon, Sun, Globe, Volume2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) { try { return JSON.parse(saved); } catch (e) { /* ignore */ } }
    return {
      notifications: true,
      language: 'English',
      sound: true,
      privacy: { shareData: false, marketing: true }
    };
  });

  React.useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const handlePrivacyToggle = (key) => setSettings(prev => ({
    ...prev, privacy: { ...prev.privacy, [key]: !prev.privacy[key] }
  }));

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', desc: 'Receive order updates', toggle: true, key: 'notifications' },
        { icon: theme === 'dark' ? Moon : Sun, label: 'Dark Mode', desc: 'Toggle dark theme', themeToggle: true },
        { icon: Volume2, label: 'Sound Effects', desc: 'Play sounds on actions', toggle: true, key: 'sound' },
        { icon: Globe, label: 'Language', desc: settings.language, select: true },
      ]
    },
    {
      title: 'Privacy',
      items: [
        { icon: Shield, label: 'Share Usage Data', desc: 'Help us improve', toggle: true, privacyKey: 'shareData' },
        { icon: Bell, label: 'Marketing Communications', desc: 'Promotional emails', toggle: true, privacyKey: 'marketing' },
      ]
    }
  ];

  return (
    <div className="w-full space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-805 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Customize your app preferences</p>
        </div>

        {settingsGroups.map((group, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-955 border border-gray-100 dark:border-neutral-900 rounded-3xl p-5 md:p-6 shadow-sm dark:shadow-none space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-neutral-900 pb-2">{group.title}</h3>
            <div className="divide-y divide-gray-50 dark:divide-neutral-900/50">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div key={itemIdx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-55 dark:bg-neutral-900 flex items-center justify-center text-gray-500 dark:text-neutral-400">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-white">{item.label}</p>
                        {!item.select && <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>}
                      </div>
                    </div>

                    {item.toggle ? (
                      <Toggle
                        checked={item.privacyKey ? settings.privacy[item.privacyKey] : settings[item.key]}
                        onChange={() => item.privacyKey ? handlePrivacyToggle(item.privacyKey) : handleToggle(item.key)}
                      />
                    ) : item.themeToggle ? (
                      <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
                    ) : item.select ? (
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                        className="text-xs text-gray-700 bg-gray-50 dark:bg-neutral-900 border border-gray-250 dark:border-neutral-800 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none dark:text-white"
                      >
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Spanish</option>
                      </select>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Version */}
        <p className="text-center text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest pt-4">Cross v1.0.0</p>
    </div>
  );
};

export default Settings;
