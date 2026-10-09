import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Play,
  Pause,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  ImageIcon,
  Sparkles,
  Search,
  Bell,
  Check,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Eye,
  Lock,
  Radio,
  FileText
} from 'lucide-react';
import { Series, Episode, EpisodeAccessType, EpisodeStatus, SeriesStatus } from '../../types';
import {
  subscribeSeriesFromFirestore,
  subscribeEpisodesForSeries,
  saveSeriesToFirestore,
  deleteSeriesFromFirestore,
  saveEpisodeToFirestore,
  deleteEpisodeFromFirestore
} from '../../services/firestoreSeries';
import { uploadAudioToFirebaseStorage, uploadCoverToFirebaseStorage } from '../../services/firebaseStorage';
import { notifyNewEpisode } from '../../services/notificationService';
import { getSecureEpisodeStreamUrl } from '../../services/secureStream';
import { ensureAdminFirebaseAuth } from '../../services/adminAuth';

interface AdminSeriesManagerProps {
  themeMode?: 'slate' | 'light';
}

export const AdminSeriesManager: React.FC<AdminSeriesManagerProps> = ({
  themeMode = 'slate',
}) => {
  const isLight = themeMode === 'light';

  // Series List State
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  // Series Modal Form State
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesDescription, setSeriesDescription] = useState('');
  const [seriesThumbnail, setSeriesThumbnail] = useState('');
  const [seriesCategory, setSeriesCategory] = useState('ধারাবাহিক রহস্য ও ভৌতিক সিরিজ');
  const [seriesGenre, setSeriesGenre] = useState('ভৌতিক ও অলৌকিক');
  const [seriesAuthor, setSeriesAuthor] = useState('জয় (Joy)');
  const [seriesStatus, setSeriesStatus] = useState<SeriesStatus>('published');
  const [seriesFeatured, setSeriesFeatured] = useState(false);
  const [seriesSortOrder, setSeriesSortOrder] = useState<number>(1);
  const [seriesThumbnailFile, setSeriesThumbnailFile] = useState<File | null>(null);
  const [isSeriesUploading, setIsSeriesUploading] = useState(false);

  // Episode Modal Form State
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [epNumber, setEpNumber] = useState<number>(1);
  const [epTitle, setEpTitle] = useState('');
  const [epDescription, setEpDescription] = useState('');
  const [epAudioUrl, setEpAudioUrl] = useState('');
  const [epStoragePath, setEpStoragePath] = useState('');
  const [epThumbnail, setEpThumbnail] = useState('');
  const [epDurationSec, setEpDurationSec] = useState<number>(600);
  const [epAccessType, setEpAccessType] = useState<EpisodeAccessType>('free');
  const [epPrice, setEpPrice] = useState<number>(5);
  const [epStatus, setEpStatus] = useState<EpisodeStatus>('published');
  const [epScheduledAt, setEpScheduledAt] = useState('');
  const [epNotificationEnabled, setEpNotificationEnabled] = useState(true);

  // File Upload State for Episode
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);

  // Audio Preview Player
  const [previewingAudioUrl, setPreviewingAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Feedback Messages
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 1. Subscribe to Series from Firestore
  useEffect(() => {
    ensureAdminFirebaseAuth().catch(() => {});
    const unsub = subscribeSeriesFromFirestore((list) => {
      setSeriesList(list);
      if (selectedSeries) {
        const found = list.find((s) => s.id === selectedSeries.id);
        if (found) setSelectedSeries(found);
      }
    });
    return () => unsub();
  }, [selectedSeries?.id]);

  // 2. Subscribe to Episodes for Selected Series
  useEffect(() => {
    if (!selectedSeries) {
      setEpisodes([]);
      return;
    }
    const unsub = subscribeEpisodesForSeries(selectedSeries.id, (eps) => {
      setEpisodes(eps);
    });
    return () => unsub();
  }, [selectedSeries?.id]);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // --- SERIES ACTIONS ---
  const handleOpenCreateSeries = () => {
    setEditingSeries(null);
    setSeriesTitle('');
    setSeriesDescription('');
    setSeriesThumbnail('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80');
    setSeriesCategory('ধারাবাহিক রহস্য ও ভৌতিক সিরিজ');
    setSeriesGenre('ভৌতিক ও অলৌকিক');
    setSeriesAuthor('জয় (Joy)');
    setSeriesStatus('published');
    setSeriesFeatured(false);
    setSeriesSortOrder(seriesList.length + 1);
    setValidationErrors([]);
    setIsSeriesModalOpen(true);
  };

  const handleOpenEditSeries = (series: Series) => {
    setEditingSeries(series);
    setSeriesTitle(series.title);
    setSeriesDescription(series.description);
    setSeriesThumbnail(series.thumbnail);
    setSeriesCategory(series.category);
    setSeriesGenre(series.genre);
    setSeriesAuthor(series.author);
    setSeriesStatus(series.status);
    setSeriesFeatured(Boolean(series.featured));
    setSeriesSortOrder(series.sortOrder || 1);
    setValidationErrors([]);
    setIsSeriesModalOpen(true);
  };

  const handleSeriesThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSeriesUploading(true);
    try {
      const url = await uploadCoverToFirebaseStorage(file);
      setSeriesThumbnail(url);
      showStatus('সিরিজ কভার থাম্বনেইল সফলভাবে আপলোড হয়েছে!');
    } catch (err) {
      showStatus('থাম্বনেইল আপলোড ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSeriesUploading(false);
    }
  };

  const handleSaveSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    const newSeries: Series = {
      id: editingSeries ? editingSeries.id : `series-${Date.now()}`,
      title: seriesTitle.trim(),
      description: seriesDescription.trim(),
      thumbnail: seriesThumbnail.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      category: seriesCategory.trim(),
      genre: seriesGenre.trim(),
      author: seriesAuthor.trim() || 'জয় (Joy)',
      status: seriesStatus,
      featured: seriesFeatured,
      sortOrder: Number(seriesSortOrder) || 1,
      episodesCount: editingSeries ? editingSeries.episodesCount : 0,
      createdAt: editingSeries ? editingSeries.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveSeriesToFirestore(newSeries);
      showStatus(`সিরিজ "${newSeries.title}" সফলভাবে সংরক্ষিত হয়েছে!`);
      setIsSeriesModalOpen(false);
      setSelectedSeries(newSeries);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setValidationErrors([msg]);
    }
  };

  const handleDeleteSeries = async (series: Series) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${series.title}" সিরিজটি এবং এর সব পর্ব স্থায়ীভাবে ডিলিট করতে চান?`)) {
      return;
    }
    try {
      await deleteSeriesFromFirestore(series.id);
      showStatus(`সিরিজ "${series.title}" ডিলিট করা হয়েছে।`);
      if (selectedSeries?.id === series.id) {
        setSelectedSeries(null);
      }
    } catch (err) {
      showStatus('সিরিজ ডিলিট করতে সমস্যা হয়েছে', 'error');
    }
  };

  // --- EPISODE ACTIONS ---
  const handleOpenCreateEpisode = () => {
    if (!selectedSeries) return;
    setEditingEpisode(null);
    const nextEpNum = episodes.length > 0 ? Math.max(...episodes.map(e => e.episodeNumber)) + 1 : 1;
    setEpNumber(nextEpNum);
    setEpTitle('');
    setEpDescription('');
    setEpAudioUrl('');
    setEpStoragePath('');
    setAudioFileName('');
    setAudioFile(null);
    setEpThumbnail(selectedSeries.thumbnail);
    setEpDurationSec(600);
    setEpAccessType('free');
    setEpPrice(5);
    setEpStatus('published');
    setEpScheduledAt('');
    setEpNotificationEnabled(true);
    setValidationErrors([]);
    setIsEpisodeModalOpen(true);
  };

  const handleOpenEditEpisode = (ep: Episode) => {
    setEditingEpisode(ep);
    setEpNumber(ep.episodeNumber);
    setEpTitle(ep.title);
    setEpDescription(ep.description || '');
    setEpAudioUrl(ep.audioUrl || '');
    setEpStoragePath(ep.storagePath || '');
    setAudioFileName(ep.storagePath ? 'সুরক্ষিত ক্লাউড অডিও (Private Cloud Storage)' : (ep.audioUrl ? 'সংরক্ষিত ক্লাউড অডিও' : ''));
    setAudioFile(null);
    setEpThumbnail(ep.thumbnail || selectedSeries?.thumbnail || '');
    setEpDurationSec(ep.duration);
    setEpAccessType(ep.accessType);
    setEpPrice(ep.price || 5);
    setEpStatus(ep.status);
    setEpScheduledAt(ep.scheduledAt || '');
    setEpNotificationEnabled(ep.notificationEnabled !== false);
    setValidationErrors([]);
    setIsEpisodeModalOpen(true);
  };

  const handleAudioFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setAudioFileName(file.name);
    setIsAudioUploading(true);
    setAudioUploadProgress(10);

    // Audio duration detection
    try {
      const audioObj = new Audio(URL.createObjectURL(file));
      audioObj.onloadedmetadata = () => {
        if (audioObj.duration && !isNaN(audioObj.duration)) {
          setEpDurationSec(Math.round(audioObj.duration));
        }
      };
    } catch {}

    try {
      const res = await uploadAudioToFirebaseStorage(
        file,
        (info) => {
          setAudioUploadProgress(Math.round(info.progress));
        },
        epAccessType
      );
      setEpAudioUrl(res.downloadUrl || '');
      setEpStoragePath(res.storagePath || '');
      showStatus(
        epAccessType === 'paid'
          ? 'পেইড পর্বের অডিও সুরক্ষিত ক্লাউড স্টোরেজে (secure_audio) আপলোড হয়েছে!'
          : 'পর্বের অডিও সফলভাবে ফায়ারবেস ক্লাউড স্টোরেজে আপলোড হয়েছে!'
      );
    } catch (err) {
      showStatus('অডিও আপলোড ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsAudioUploading(false);
    }
  };

  const handleEpisodeThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsThumbnailUploading(true);
    try {
      const url = await uploadCoverToFirebaseStorage(file);
      setEpThumbnail(url);
      showStatus('পর্বের থাম্বনেইল সফলভাবে আপলোড হয়েছে!');
    } catch {
      showStatus('থাম্বনেইল আপলোড ব্যর্থ', 'error');
    } finally {
      setIsThumbnailUploading(false);
    }
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries) return;
    setValidationErrors([]);

    const newEpisode: Episode = {
      id: editingEpisode ? editingEpisode.id : `ep-${selectedSeries.id}-${Date.now()}`,
      seriesId: selectedSeries.id,
      episodeNumber: Number(epNumber),
      title: epTitle.trim(),
      description: epDescription.trim(),
      audioUrl: epAccessType === 'paid' ? '' : epAudioUrl.trim(),
      storagePath: epStoragePath.trim(),
      thumbnail: epThumbnail.trim() || selectedSeries.thumbnail,
      duration: Math.round(Number(epDurationSec) || 0),
      accessType: epAccessType,
      price: epAccessType === 'paid' ? Number(epPrice || 5) : 0,
      currency: 'INR',
      status: epStatus,
      publishedAt: epStatus === 'published' ? (editingEpisode?.publishedAt || new Date().toISOString()) : '',
      scheduledAt: epScheduledAt,
      notificationEnabled: epNotificationEnabled,
      notificationSent: editingEpisode ? Boolean(editingEpisode.notificationSent) : false,
      createdAt: editingEpisode ? editingEpisode.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sortOrder: Number(epNumber),
    };

    try {
      await saveEpisodeToFirestore(selectedSeries, newEpisode, episodes);
      showStatus(`পর্ব ${newEpisode.episodeNumber}: "${newEpisode.title}" সফলভাবে সংরক্ষিত হয়েছে!`);
      setIsEpisodeModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setValidationErrors([msg]);
    }
  };

  const handleDeleteEpisode = async (ep: Episode) => {
    if (!selectedSeries) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে পর্ব ${ep.episodeNumber}: "${ep.title}" ডিলিট করতে চান?`)) {
      return;
    }
    try {
      await deleteEpisodeFromFirestore(selectedSeries.id, ep.id, ep.audioUrl, ep.thumbnail, ep.storagePath);
      showStatus(`পর্ব ${ep.episodeNumber} ডিলিট করা হয়েছে।`);
    } catch (err) {
      showStatus('এপিসোড ডিলিট করতে সমস্যা হয়েছে', 'error');
    }
  };

  const toggleAudioPreview = async (targetEp: Episode) => {
    let url = targetEp.audioUrl;
    if (!url && targetEp.storagePath && selectedSeries) {
      try {
        url = await getSecureEpisodeStreamUrl(selectedSeries.id, targetEp.id);
      } catch (err: any) {
        showStatus('অডিও স্ট্রিম লিঙ্ক সংগ্রহ ব্যর্থ: ' + (err.message || ''), 'error');
        return;
      }
    }

    if (!url) {
      showStatus('অডিও ফাইল পাওয়া যায়নি', 'error');
      return;
    }

    if (previewingAudioUrl === url && isPlayingPreview) {
      audioPreviewRef.current?.pause();
      setIsPlayingPreview(false);
    } else {
      setPreviewingAudioUrl(url);
      setIsPlayingPreview(true);
      if (audioPreviewRef.current) {
        audioPreviewRef.current.src = url;
        audioPreviewRef.current.play().catch(() => setIsPlayingPreview(false));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden audio element for preview */}
      <audio
        ref={audioPreviewRef}
        onEnded={() => setIsPlayingPreview(false)}
        onError={() => setIsPlayingPreview(false)}
      />

      {/* Status Toast */}
      {statusMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950 border-rose-500/50 text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
        isLight
          ? 'bg-gradient-to-r from-purple-50 via-white to-pink-50 border-purple-200 shadow-sm'
          : 'bg-gradient-to-r from-[#170c26] via-[#1a0e2e] to-[#12081d] border-purple-900/40 shadow-xl'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                <span>ধারাবাহিক সিরিজ ও এপিসোড ম্যানেজমেন্ট</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {seriesList.length}টি সিরিজ
                </span>
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                বহু-পর্বের ধারাবাহিক অডিও নাটক তৈরি করুন, প্রতিটি পর্বে ফ্রি/পেইড মূল্য নির্ধারণ ও নোটিফিকেশন ম্যানেজ করুন।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateSeries}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-md shadow-purple-950/40 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন সিরিজ যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* View Switch: Series Detail or Series Grid */}
      {selectedSeries ? (
        /* Series Episodes Detail View */
        <div className="space-y-5">
          {/* Breadcrumb & Series Info Header */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isLight ? 'bg-white border-purple-200' : 'bg-[#150a22] border-purple-900/40'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSelectedSeries(null)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  isLight ? 'bg-purple-50 border-purple-200 text-zinc-700 hover:bg-purple-100' : 'bg-black/40 border-purple-900/40 text-zinc-300 hover:bg-purple-900/40'
                }`}
                title="সিরিজ তালিকায় ফিরুন"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img
                src={selectedSeries.thumbnail}
                alt={selectedSeries.title}
                className="w-12 h-12 rounded-xl object-cover border border-purple-500/30 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-base font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    {selectedSeries.title}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {episodes.length}টি পর্ব
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    selectedSeries.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {selectedSeries.status === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}
                  </span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {selectedSeries.genre} • লেখক: {selectedSeries.author}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenEditSeries(selectedSeries)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isLight ? 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100' : 'bg-purple-950/40 border-purple-900/40 text-purple-300 hover:bg-purple-900/40'
                }`}
              >
                সিরিজ সম্পাদনা
              </button>
              <button
                type="button"
                onClick={handleOpenCreateEpisode}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন পর্ব যুক্ত করুন</span>
              </button>
            </div>
          </div>

          {/* Episode List */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-700' : 'text-zinc-400'}`}>
              সিরিজের পর্ব তালিকা ({episodes.length}টি পর্ব)
            </h4>

            {episodes.length === 0 ? (
              <div className={`p-8 text-center rounded-2xl border ${
                isLight ? 'bg-purple-50/50 border-purple-200 text-zinc-600' : 'bg-[#150a22] border-purple-900/30 text-zinc-400'
              }`}>
                <Radio className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold">এই সিরিজে এখনো কোনো পর্ব যুক্ত করা হয়নি।</p>
                <p className="text-xs text-zinc-500 mt-1">প্রথম পর্ব যুক্ত করতে উপরের "নতুন পর্ব যুক্ত করুন" বাটনে ক্লিক করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLight
                        ? 'bg-white border-purple-200/80 hover:border-purple-300 shadow-xs'
                        : 'bg-[#150a22]/80 border-purple-900/30 hover:border-purple-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold shrink-0">
                        <span className="text-[10px] text-pink-400 leading-none">পর্ব</span>
                        <span className="text-sm">{ep.episodeNumber}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className={`text-sm font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                            {ep.title}
                          </h5>

                          {/* Access Tier Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ep.accessType === 'free'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : ep.accessType === 'trailer'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                          }`}>
                            {ep.accessType === 'free' ? 'ফ্রি (Free)' : ep.accessType === 'trailer' ? 'ট্রেলার (Trailer)' : `পেইড ₹${ep.price || 5}`}
                          </span>

                          {/* Status Badge */}
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                            ep.status === 'published' ? 'bg-emerald-950/60 text-emerald-400' : 'bg-amber-950/60 text-amber-300'
                          }`}>
                            {ep.status}
                          </span>

                          {/* Notification Sent indicator */}
                          {ep.notificationSent && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 flex items-center gap-1">
                              <Bell className="w-2.5 h-2.5" /> নোটিফাইড
                            </span>
                          )}
                        </div>

                        <div className={`flex items-center gap-3 text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-purple-400" />
                            {Math.floor(ep.duration / 60)} মিনিট {ep.duration % 60} সে.
                          </span>
                          {ep.description && (
                            <span className="truncate max-w-md hidden md:inline">
                              {ep.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {(ep.audioUrl || ep.storagePath) && (
                        <button
                          type="button"
                          onClick={() => toggleAudioPreview(ep)}
                          className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                            (previewingAudioUrl === ep.audioUrl || (previewingAudioUrl && isPlayingPreview))
                              ? 'bg-pink-600 border-pink-500 text-white'
                              : isLight
                              ? 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100'
                              : 'bg-black/40 border-purple-900/40 text-zinc-300 hover:bg-purple-900/40'
                          }`}
                          title="অডিও প্লে/পজ করুন"
                        >
                          {(previewingAudioUrl === ep.audioUrl || (previewingAudioUrl && isPlayingPreview)) ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditEpisode(ep)}
                        className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100'
                            : 'bg-black/40 border-purple-900/40 text-purple-300 hover:bg-purple-900/40'
                        }`}
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteEpisode(ep)}
                        className="p-2 rounded-xl border border-rose-900/40 bg-rose-950/20 text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 text-xs transition-colors cursor-pointer"
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Series Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seriesList.map((series) => (
            <div
              key={series.id}
              className={`rounded-3xl border overflow-hidden transition-all flex flex-col justify-between ${
                isLight
                  ? 'bg-white border-purple-200 hover:shadow-md'
                  : 'bg-[#150a22]/90 border-purple-900/40 hover:border-purple-600/50'
              }`}
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                <img
                  src={series.thumbnail}
                  alt={series.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/90 text-white backdrop-blur-md">
                    {series.category}
                  </span>
                  {series.featured && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-600/90 text-white backdrop-blur-md">
                      ফিচার্ড
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                  <span className="text-xs font-mono font-bold text-pink-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {series.episodesCount || 0}টি পর্ব
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium backdrop-blur-sm ${
                    series.status === 'published' ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'
                  }`}>
                    {series.status === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className={`text-base font-bold line-clamp-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    {series.title}
                  </h3>
                  <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {series.description}
                  </p>
                </div>

                <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                  isLight ? 'border-purple-100 text-zinc-500' : 'border-purple-900/30 text-zinc-400'
                }`}>
                  <span>লেখক: {series.author}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditSeries(series)}
                      className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                        isLight ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-black/40 border-purple-900/40 text-purple-300'
                      }`}
                      title="সম্পাদনা"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSeries(series)}
                      className="p-1.5 rounded-lg border border-rose-900/40 bg-rose-950/20 text-rose-300 cursor-pointer"
                      title="ডিলিট"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSeries(series)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>পর্বসমূহ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SERIES CREATE / EDIT MODAL */}
      {isSeriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className={`relative w-full max-w-lg rounded-3xl border p-5 sm:p-6 shadow-2xl my-auto ${
            isLight ? 'bg-white border-purple-200 text-zinc-900' : 'bg-[#150a22] border-purple-900/50 text-white'
          }`}>
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>{editingSeries ? 'সিরিজ সম্পাদনা করুন' : 'নতুন ধারাবাহিক সিরিজ তৈরি করুন'}</span>
            </h3>

            {validationErrors.length > 0 && (
              <div className="p-3 mb-4 rounded-xl border border-rose-500/50 bg-rose-950/30 text-rose-200 text-xs space-y-1">
                {validationErrors.map((err, idx) => (
                  <p key={idx} className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{err}</span>
                  </p>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveSeries} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1">সিরিজ শিরোনাম (Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শ্মশানের ওপারে"
                  value={seriesTitle}
                  onChange={(e) => setSeriesTitle(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                    isLight ? 'bg-purple-50/50 border-purple-200 focus:border-purple-600' : 'bg-black/40 border-purple-900/40 text-white focus:border-pink-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">সিরিজের বিবরণ (Description) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="সিরিজের পটভূমি ও আকর্ষণীয় কাহিনি সংক্ষেপ..."
                  value={seriesDescription}
                  onChange={(e) => setSeriesDescription(e.target.value)}
                  className={`w-full p-3 text-xs rounded-xl border focus:outline-none resize-none ${
                    isLight ? 'bg-purple-50/50 border-purple-200 focus:border-purple-600' : 'bg-black/40 border-purple-900/40 text-white focus:border-pink-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={seriesCategory}
                    onChange={(e) => setSeriesCategory(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-black/40 border-purple-900/40 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">জঁর (Genre)</label>
                  <input
                    type="text"
                    value={seriesGenre}
                    onChange={(e) => setSeriesGenre(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-black/40 border-purple-900/40 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">লেখক / নির্মাতা</label>
                  <input
                    type="text"
                    value={seriesAuthor}
                    onChange={(e) => setSeriesAuthor(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-black/40 border-purple-900/40 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">স্ট্যাটাস</label>
                  <select
                    value={seriesStatus}
                    onChange={(e) => setSeriesStatus(e.target.value as SeriesStatus)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-[#180d26] border-purple-900/40 text-white'
                    }`}
                  >
                    <option value="published">প্রকাশিত (Published)</option>
                    <option value="draft">ড্রাফট (Draft)</option>
                    <option value="archived">আর্কাইভড (Archived)</option>
                  </select>
                </div>
              </div>

              {/* Series Thumbnail URL & Upload */}
              <div>
                <label className="block text-xs font-semibold mb-1">কভার থাম্বনেইল</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={seriesThumbnail}
                    onChange={(e) => setSeriesThumbnail(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-black/40 border-purple-900/40 text-white'
                    }`}
                  />
                  <label className="px-3 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isSeriesUploading ? 'আপলোড হচ্ছে...' : 'আপলোড'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSeriesThumbnailUpload}
                      className="hidden"
                      disabled={isSeriesUploading}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={seriesFeatured}
                    onChange={(e) => setSeriesFeatured(e.target.checked)}
                    className="rounded border-purple-500 text-pink-600 focus:ring-0"
                  />
                  <span>হোমপেজে ফিচার্ড সিরিজ হিসেবে দেখান</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setIsSeriesModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-500/30 text-xs font-semibold hover:bg-zinc-500/10 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSeriesUploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {editingSeries ? 'আপডেট করুন' : 'সিরিজ সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EPISODE CREATE / EDIT MODAL */}
      {isEpisodeModalOpen && selectedSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className={`relative w-full max-w-lg rounded-3xl border p-5 sm:p-6 shadow-2xl my-auto ${
            isLight ? 'bg-white border-purple-200 text-zinc-900' : 'bg-[#150a22] border-purple-900/50 text-white'
          }`}>
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-1">
              <Radio className="w-5 h-5 text-pink-400" />
              <span>{editingEpisode ? `পর্ব ${editingEpisode.episodeNumber} সম্পাদনা` : `নতুন পর্ব যোগ — ${selectedSeries.title}`}</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              পর্ব নম্বর, অডিও ফাইল ও অ্যাক্সেস মডেল নির্ধারণ করুন।
            </p>

            {validationErrors.length > 0 && (
              <div className="p-3 mb-4 rounded-xl border border-rose-500/50 bg-rose-950/30 text-rose-200 text-xs space-y-1">
                {validationErrors.map((err, idx) => (
                  <p key={idx} className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{err}</span>
                  </p>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveEpisode} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">পর্ব নম্বর *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={epNumber}
                    onChange={(e) => setEpNumber(Number(e.target.value))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-black/40 border-purple-900/40 text-white'
                    }`}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">পর্বের শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: অমাবস্যার রাত"
                    value={epTitle}
                    onChange={(e) => setEpTitle(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-black/40 border-purple-900/40 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">পর্বের বিবরণ (Description)</label>
                <textarea
                  rows={2}
                  placeholder="এই পর্বে কী ঘটবে তার সংক্ষিপ্ত আভাস..."
                  value={epDescription}
                  onChange={(e) => setEpDescription(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none resize-none ${
                    isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-black/40 border-purple-900/40 text-white'
                  }`}
                />
              </div>

              {/* Audio Upload */}
              <div>
                <label className="block text-xs font-semibold mb-1">পর্বের অডিও ফাইল (MP3) *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="অডিও URL বা ফাইল আপলোড করুন"
                    value={epAudioUrl}
                    onChange={(e) => setEpAudioUrl(e.target.value)}
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-black/40 border-purple-900/40 text-white'
                    }`}
                  />
                  <label className="px-3 py-2 rounded-xl bg-pink-600/20 border border-pink-500/40 text-pink-300 text-xs font-semibold hover:bg-pink-600/30 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
                    <FileAudio className="w-3.5 h-3.5" />
                    <span>{isAudioUploading ? `আপলোড ${audioUploadProgress}%` : 'ফাইল আপলোড'}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileSelect}
                      className="hidden"
                      disabled={isAudioUploading}
                    />
                  </label>
                </div>
                {audioFileName && (
                  <p className="text-[11px] text-pink-400 mt-1 font-mono truncate">
                    ✓ নির্বাচিত ফাইল: {audioFileName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">দৈর্ঘ্য (সেকেন্ড)</label>
                  <input
                    type="number"
                    min={1}
                    value={epDurationSec}
                    onChange={(e) => setEpDurationSec(Number(e.target.value))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-black/40 border-purple-900/40 text-white'
                    }`}
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    = {Math.floor(epDurationSec / 60)} মিনিট {epDurationSec % 60} সেকেন্ড
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">অ্যাক্সেস মডেল *</label>
                  <select
                    value={epAccessType}
                    onChange={(e) => setEpAccessType(e.target.value as EpisodeAccessType)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-[#180d26] border-purple-900/40 text-white'
                    }`}
                  >
                    <option value="free">ফ্রি (Free for all)</option>
                    <option value="paid">পেইড পর্ব (Individual Paid Ticket)</option>
                    <option value="trailer">ট্রেলার (Trailer)</option>
                  </select>
                </div>
              </div>

              {/* Price (if Paid) */}
              {epAccessType === 'paid' && (
                <div className={`p-3 rounded-2xl border ${isLight ? 'bg-pink-50/60 border-pink-200' : 'bg-pink-950/20 border-pink-900/40'}`}>
                  <label className="block text-xs font-bold text-pink-400 mb-1">
                    পর্বের একক টিকিট মূল্য (₹ INR) *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">₹</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      value={epPrice}
                      onChange={(e) => setEpPrice(Number(e.target.value))}
                      className={`w-28 px-3 py-1.5 text-xs font-bold rounded-xl border focus:outline-none ${
                        isLight ? 'bg-white border-pink-300' : 'bg-black/40 border-pink-500/50 text-white'
                      }`}
                    />
                    <span className="text-[11px] text-zinc-400">
                      (শ্রোতার সক্রিয় ২০ টাকার পাস + এই ₹{epPrice} টিকিট থাকলে তবেই শুনবে পারবে)
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">প্রকাশের স্ট্যাটাস</label>
                  <select
                    value={epStatus}
                    onChange={(e) => setEpStatus(e.target.value as EpisodeStatus)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-[#180d26] border-purple-900/40 text-white'
                    }`}
                  >
                    <option value="published">সরাসরি প্রকাশিত (Published)</option>
                    <option value="draft">ড্রাফট (Draft - নোটিফিকেশন যাবে না)</option>
                    <option value="scheduled">শিডিউলড (Scheduled)</option>
                    <option value="archived">আর্কাইভড (Archived)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">শিডিউল সময় (যদি থাকে)</label>
                  <input
                    type="datetime-local"
                    value={epScheduledAt}
                    onChange={(e) => setEpScheduledAt(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-black/40 border-purple-900/40 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Notification Option */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={epNotificationEnabled}
                    onChange={(e) => setEpNotificationEnabled(e.target.checked)}
                    className="rounded border-purple-500 text-pink-600 focus:ring-0"
                  />
                  <span>প্রকাশের সময় শ্রোতাদের কাছে স্বয়ংক্রিয় নোটিফিকেশন পাঠান</span>
                </label>
                <p className="text-[10px] text-zinc-500 ml-5 mt-0.5">
                  (ড্রাফট বা পরবর্তীতে শুধু সম্পাদনা করার সময় কোনো ডুপ্লিকেট নোটিফিকেশন যাবে না)
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setIsEpisodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-500/30 text-xs font-semibold hover:bg-zinc-500/10 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isAudioUploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {editingEpisode ? 'পর্ব আপডেট করুন' : 'পর্ব প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
