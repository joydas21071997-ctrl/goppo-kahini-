import React, { useState, useEffect } from "react";
import { 
  doc, 
  setDoc, 
  collection, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig"; // আপনার ফায়ারবেস কনফিগ ফাইল পাথ নিশ্চিত করুন

export interface ReviewItem {
  id: string;
  userId?: string;
  userName?: string;
  userPhoto?: string;
  rating?: number;
  comment?: string;
  createdAt?: any;
  [key: string]: any;
}

export interface ReviewSectionProps {
  storyId: string;
  storyTitle?: string;
  className?: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ storyId, storyTitle, className = "" }) => {
  const [rating, setRating] = useState<number | string>(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ১. ফায়ারস্টোর থেকে রিভিউগুলো লোড করে দেখানো
  useEffect(() => {
    if (!storyId) return;

    try {
      // stories/{storyId}/reviews সাব-কালেকশন থেকে ডাটা নেওয়া
      const reviewsRef = collection(db, "stories", storyId, "reviews");
      const q = query(reviewsRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          const reviewData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as ReviewItem[];
          setReviews(reviewData);
        },
        (error) => {
          console.warn("রিভিউ লোড করতে সমস্যা (ফলব্যাক কোয়েরি চেষ্টা করা হচ্ছে):", error);
          // Fallback in case createdAt index is not yet built
          const unsubFallback = onSnapshot(reviewsRef, (snap) => {
            const list = snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as ReviewItem[];
            setReviews(list);
          });
          return () => unsubFallback();
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Review listener error:", err);
    }
  }, [storyId]);

  // ২. নতুন রিভিউ সেভ করার ফাংশন
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert("রিভিউ দেওয়ার জন্য অনুগ্রহ করে প্রথমে লগইন করুন!");
      return;
    }

    if (!comment.trim()) {
      alert("অনুগ্রহ করে কিছু মন্তব্য লিখুন!");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // সঠিক সাব-কালেকশন পাথ: stories/{storyId}/reviews/{userId}
      const reviewRef = doc(db, "stories", storyId, "reviews", user.uid);

      await setDoc(reviewRef, {
        userId: user.uid,
        userName: user.displayName || "শ্রোতা",
        userPhoto: user.photoURL || "",
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      alert("আপনার রিভিউটি সফলভাবে জমা হয়েছে!");
      setMessage({ type: 'success', text: "আপনার রিভিউটি সফলভাবে জমা হয়েছে!" });
      setComment("");
      setRating(5);
    } catch (error) {
      console.error("রিভিউ সেভ করতে সমস্যা হয়েছে:", error);
      alert("রিভিউ সেভ করা যায়নি! আবার চেষ্টা করুন।");
      setMessage({ type: 'error', text: "রিভিউ সেভ করা যায়নি! আবার চেষ্টা করুন।" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`rounded-2xl bg-white/90 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 p-5 shadow-sm backdrop-blur-sm ${className}`}
      style={{ marginTop: "20px", padding: "15px", borderRadius: "12px" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-purple-100 flex items-center gap-2">
          <span>গল্পের মন্তব্য ও রেটিং</span>
          {storyTitle && <span className="text-xs font-normal text-purple-600 dark:text-purple-400">({storyTitle})</span>}
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300">
          মোট {reviews.length} টি মন্তব্য
        </span>
      </div>

      {message && (
        <div className={`mb-3 p-2.5 rounded-xl text-xs font-medium ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* রিভিউ সাবমিট ফর্ম */}
      <form onSubmit={handleReviewSubmit} style={{ marginBottom: "20px" }} className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-700 dark:text-purple-200">রেটিং: </label>
          <select 
            value={rating} 
            onChange={(e) => setRating(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-900/60 text-gray-800 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
          >
            <option value="5">⭐⭐⭐⭐⭐ (৫)</option>
            <option value="4">⭐⭐⭐⭐ (৪)</option>
            <option value="3">⭐⭐⭐ (৩)</option>
            <option value="2">⭐⭐ (২)</option>
            <option value="1">⭐ (১)</option>
          </select>
        </div>

        <div style={{ marginTop: "10px" }}>
          <textarea
            rows={3}
            cols={40}
            placeholder="গল্পটি কেমন লাগলো লিখুন..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            className="w-full text-xs text-gray-900 dark:text-purple-100 placeholder-gray-400 dark:placeholder-purple-400/60 bg-purple-50/50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/80 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition resize-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ marginTop: "10px", padding: "8px 16px", cursor: "pointer" }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 transition shadow-sm"
        >
          {loading ? "সেভ হচ্ছে..." : "রিভিউ জমা দিন"}
        </button>
      </form>

      <hr className="border-purple-100 dark:border-purple-900/50 my-4" />

      {/* আগের রিভিউগুলোর তালিকা */}
      <h4 className="text-xs font-bold text-gray-800 dark:text-purple-200 mb-3">
        সকল মন্তব্য ({reviews.length})
      </h4>
      {reviews.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-purple-400 py-3 italic">
          এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!
        </p>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {reviews.map((rev) => (
            <div 
              key={rev.id} 
              style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}
              className="border-b border-purple-100 dark:border-purple-900/40 py-2.5 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <strong className="text-xs font-semibold text-gray-900 dark:text-purple-100">
                  {rev.userName || "শ্রোতা"}
                </strong>
                <span className="text-xs text-amber-500" title={`রেটিং: ${rev.rating || 5}`}>
                  {"⭐".repeat(Math.min(5, Math.max(1, Number(rev.rating) || 5)))}
                </span>
              </div>
              <p style={{ margin: "5px 0" }} className="text-xs text-gray-700 dark:text-purple-300/90 mt-1 whitespace-pre-wrap">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
