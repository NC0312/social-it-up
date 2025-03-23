"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, doc, getDoc, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { FaArrowLeft, FaSync } from "react-icons/fa";
import { db } from "@/app/lib/firebase";
import { useAdminAuth } from "@/app/components/providers/AdminAuthProvider";

export default function ChatPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const { admin } = useAdminAuth();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState([]);
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchReview = async () => {
    try {
      const reviewDoc = await getDoc(doc(db, "reviews", id));
      if (reviewDoc.exists()) {
        setReview({ id: reviewDoc.id, ...reviewDoc.data() });
      } else {
        toast.error("Review not found");
        router.push("/review-panel");
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      toast.error("Failed to load review details");
    }
  };

  const fetchComments = async () => {
    try {
      const commentsRef = collection(db, "comments");
      const q = query(commentsRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      
      const commentsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((comment) => comment.reviewId === id);
      
      setComments(commentsData);
      return commentsData;
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
      return [];
    }
  };

  const syncData = async () => {
    setSyncing(true);
    try {
      await fetchReview();
      const commentsData = await fetchComments();
      toast.success(`Synced successfully! Retrieved ${commentsData.length} comments.`);
    } catch (error) {
      console.error("Error syncing data:", error);
      toast.error("Failed to sync data");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchReview().finally(() => setLoading(false));

    // Subscribe to comments
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const commentsData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((comment) => comment.reviewId === id);
        setComments(commentsData);
      },
      (error) => {
        console.error("Error fetching comments:", error);
        toast.error("Failed to load comments");
      }
    );

    return () => unsubscribe();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!admin) {
      toast.error("You must be logged in to leave a comment");
      return;
    }

    try {
      setSending(true);
      await addDoc(collection(db, "comments"), {
        reviewId: id,
        message: message.trim(),
        adminId: admin.id,
        adminName: admin.firstName 
          ? `${admin.firstName} ${admin.lastName}`
          : admin.username || "Admin",
        timestamp: serverTimestamp(),
      });
      setMessage("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.push("/review-panel69")}
          className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 hover:translate-x-[-4px]"
        >
          <FaArrowLeft className="text-lg" />
          <span>Back to Review Panel</span>
        </button>

        <button
          onClick={syncData}
          disabled={syncing}
          className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2"
        >
          <FaSync className={`text-lg ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? "Syncing..." : "Sync Data"}</span>
        </button>
      </div>

      {review && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-4">
            Chat for {review.company || "Review"}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">Name:</span> {review.firstName} {review.lastName}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Email:</span> {review.email}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Brand:</span> {review.company}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">Status:</span> {review.clientStatus}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Priority:</span> {review.priority}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Assigned To:</span> {review.assignedToName || "Unassigned"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Comments</h2>
        
        <div className="mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your comment here..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed self-end"
            >
              {sending ? "Sending..." : "Send Comment"}
            </button>
          </form>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg ${
                  comment.adminId === admin?.id
                    ? "bg-green-100 ml-12"
                    : "bg-gray-100 mr-12"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-green-800">
                    {comment.adminName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {comment.timestamp
                      ? new Date(comment.timestamp.seconds * 1000).toLocaleString()
                      : "Just now"}
                  </p>
                </div>
                <p className="text-gray-700">{comment.message}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}