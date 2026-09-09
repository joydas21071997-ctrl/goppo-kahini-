import React, { useState } from 'react';
import {
  Building,
  Save,
  CheckCircle2,
  Users,
  Plus,
  Trash2,
  Heart
} from 'lucide-react';
import { AboutMissionData, TeamMember } from '../../types';
import { INITIAL_ABOUT_MISSION_DATA } from '../../data/aboutMission';

export const AdminAboutMissionManager: React.FC = () => {
  const [data, setData] = useState<AboutMissionData>(() => {
    try {
      const stored = localStorage.getItem('goppo_about_mission');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_ABOUT_MISSION_DATA;
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('goppo_about_mission', JSON.stringify(data));
    window.dispatchEvent(new Event('goppo_about_mission_updated'));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addMember = () => {
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: 'নতুন সদস্য',
      role: 'কণ্ঠশিল্পী / এডিটর',
      bio: 'দলের অন্যতম দক্ষ সহযোগী...',
      photoUrl: '',
      joinedDate: '২০২৬',
    };
    setData((prev) => ({ ...prev, teamMembers: [...prev.teamMembers, newMember] }));
  };

  const removeMember = (id: string) => {
    setData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => m.id !== id),
    }));
  };

  const updateMember = (id: string, field: keyof TeamMember, val: any) => {
    setData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((m) => (m.id === id ? { ...m, [field]: val } : m)),
    }));
  };

  return (
    <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">আমাদের লক্ষ্য, মিশন ও টিম পরিচালনা</h2>
            <p className="text-xs text-purple-300/80">শ্রোতাদের জন্য প্রদর্শনীয় প্ল্যাটফর্মের মিশন ও কথক দলের প্রোফাইল সম্পাদনা করুন</p>
          </div>
        </div>

        {saved && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" /> সংরক্ষিত হয়েছে!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-purple-200 mb-1.5">
            মিশন শিরোনাম (Mission Title)
          </label>
          <input
            type="text"
            value={data.missionTitle}
            onChange={(e) => setData({ ...data, missionTitle: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-purple-200 mb-1.5">
            মিশন বার্তা (Mission Statement)
          </label>
          <textarea
            rows={3}
            value={data.missionStatement}
            onChange={(e) => setData({ ...data, missionStatement: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-purple-200 mb-1.5">
            ইউটিউব শ্রোতাদের উদ্দেশ্যে বার্তা (YouTube Audience Note)
          </label>
          <textarea
            rows={3}
            value={data.youtubeAudienceNote}
            onChange={(e) => setData({ ...data, youtubeAudienceNote: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Team Members */}
        <div className="pt-3 border-t border-purple-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-400" />
              টিম মেম্বার ও কথকবৃন্দ
            </h3>
            <button
              type="button"
              onClick={addMember}
              className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>সদস্য যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                    placeholder="নাম"
                    className="font-bold text-white text-sm bg-transparent border-b border-purple-700/60 focus:outline-none focus:border-pink-500 pb-0.5"
                  />
                  {!member.isFounder && (
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="text-purple-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                  placeholder="পদবী"
                  className="w-full text-xs text-pink-300 bg-transparent border-b border-purple-800/40 focus:outline-none pb-0.5"
                />

                <textarea
                  rows={2}
                  value={member.bio}
                  onChange={(e) => updateMember(member.id, 'bio', e.target.value)}
                  placeholder="সংক্ষিপ্ত ভূমিকা"
                  className="w-full text-xs text-purple-300 bg-purple-950/50 rounded-lg p-2 border border-purple-800/30 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-pink-600/30"
          >
            <Save className="w-4 h-4" />
            <span>মিশন ও টিম তথ্য সেভ করুন</span>
          </button>
        </div>
      </form>
    </div>
  );
};
