import React, { useState } from 'react';
import { Bell, Shield, Moon, Sun, Globe, Volume2, ChevronRight } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) { try { return JSON.parse(saved); } catch (e) { /* ignore */ } }
    return {
      notifications: true,
      darkMode: false,
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
        { icon: settings.darkMode ? Moon : Sun, label: 'Dark Mode', desc: 'Toggle dark theme', toggle: true, key: 'darkMode' },
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your preferences</p>
        </div>

        {settingsGroups.map((group) => (
          <div key={group.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{group.title}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {group.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/5 rounded-xl flex items-center justify-center">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                        <p className="text-[11px] text-gray-400">{item.desc}</p>
                      </div>
                    </div>

                    {item.toggle && item.privacyKey ? (
                      <Toggle
                        checked={settings.privacy[item.privacyKey]}
                        onChange={() => handlePrivacyToggle(item.privacyKey)}
                      />
                    ) : item.toggle ? (
                      <Toggle
                        checked={settings[item.key]}
                        onChange={() => handleToggle(item.key)}
                      />
                    ) : item.select ? (
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                        className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
        <p className="text-center text-[11px] text-gray-400 pt-4">Fuel Supplements v1.0.0</p>
      </div>
    </div>
  );
};

export default Settings;