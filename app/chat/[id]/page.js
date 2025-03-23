"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, doc, getDoc, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, updateDoc, deleteDoc, where, Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { FaArrowLeft, FaSync, FaPencilAlt, FaTrash, FaTimesCircle } from "react-icons/fa";
import { FaFemale, FaMale } from "react-icons/fa";
import { FaUser, FaUserTie } from "react-icons/fa";
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
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editMessage, setEditMessage] = useState("");
    const editTextareaRef = useRef(null);
    
    // Local state to track comments deleted only for current user
    const [hiddenComments, setHiddenComments] = useState([]);

    const fetchReview = async () => {
        try {
            const reviewDoc = await getDoc(doc(db, "reviews", id));
            if (reviewDoc.exists()) {
                const reviewData = reviewDoc.data();
                setReview({
                    id: reviewDoc.id,
                    ...reviewData,
                    clientStatus: reviewData.clientStatus || "In Progress", // Default status
                    priority: reviewData.priority || "Low", // Default priority
                });
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

    const deleteOldComments = async () => {
        try {
            // Calculate timestamp from 1 week ago
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const oneWeekAgoTimestamp = Timestamp.fromDate(oneWeekAgo);
            
            const commentsRef = collection(db, "comments");
            const q = query(
                commentsRef,
                where("timestamp", "<", oneWeekAgoTimestamp),
                where("reviewId", "==", id)
            );
            
            const snapshot = await getDocs(q);
            
            let deleteCount = 0;
            const batch = [];
            
            snapshot.forEach((doc) => {
                batch.push(deleteDoc(doc.ref));
                deleteCount++;
            });
            
            // Execute all delete operations
            await Promise.all(batch);
            
            if (deleteCount > 0) {
                console.log(`Deleted ${deleteCount} comments older than 1 week`);
            }
        } catch (error) {
            console.error("Error deleting old comments:", error);
        }
    };

    const syncData = async () => {
        setSyncing(true);
        try {
            await fetchReview();
            const commentsData = await fetchComments();
            await deleteOldComments();
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
        deleteOldComments(); // Delete old comments when component mounts

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

        // Set up a daily check to delete old comments
        const interval = setInterval(deleteOldComments, 86400000); // 24 hours in milliseconds
        
        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [id, router]);

    // Focus on edit textarea when editing starts
    useEffect(() => {
        if (editingCommentId && editTextareaRef.current) {
            editTextareaRef.current.focus();
        }
    }, [editingCommentId]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault(); 
          handleSubmit(e); 
        }
    };
    
    const handleEditKeyDown = (e, comment) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault(); 
          handleUpdateComment(comment);
        } else if (e.key === "Escape") {
          cancelEdit();
        }
    };
      
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
                adminGender: admin.gender || "other", // Store the gender with the comment
                timestamp: serverTimestamp(),
                edited: false
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

    const startEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditMessage(comment.message);
    };

    const cancelEdit = () => {
        setEditingCommentId(null);
        setEditMessage("");
    };

    const handleUpdateComment = async (comment) => {
        if (editMessage.trim() === comment.message) {
            cancelEdit();
            return;
        }

        if (!editMessage.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }

        try {
            const commentRef = doc(db, "comments", comment.id);
            await updateDoc(commentRef, {
                message: editMessage.trim(),
                edited: true
            });
            cancelEdit();
            toast.success("Comment updated successfully");
        } catch (error) {
            console.error("Error updating comment:", error);
            toast.error("Failed to update comment");
        }
    };

    const handleDeleteForAll = async (commentId) => {
        if (!confirm("Are you sure you want to delete this comment for everyone?")) {
            return;
        }

        try {
            await deleteDoc(doc(db, "comments", commentId));
            toast.success("Comment deleted successfully");
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment");
        }
    };

    const handleDeleteForYou = (commentId) => {
        setHiddenComments(prev => [...prev, commentId]);
        toast.success("Comment Deleted For You");
    };

    // Function to render the appropriate avatar based on gender
    const renderAvatar = (gender) => {
        if (gender === "female") {
            return (
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                    <FaUser className="text-xl" />
                </div>
            );
        } else {
            return (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    <FaUserTie className="text-xl" />
                </div>
            );
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
                    onClick={() => router.push("/review-panel")}
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
                            onKeyDown={handleKeyDown}
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
                        comments
                            .filter(comment => !hiddenComments.includes(comment.id))
                            .map((comment) => (
                                <div
                                    key={comment.id}
                                    className={`p-4 rounded-lg ${
                                        comment.adminId === admin?.id
                                            ? "bg-green-100 ml-12"
                                            : "bg-gray-100 mr-12"
                                    }`}
                                >
                                    <div className="flex items-start gap-3 mb-2">
                                        {renderAvatar(comment.adminGender)}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold text-green-800">
                                                    {comment.adminName}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-gray-500">
                                                        {comment.timestamp
                                                            ? new Date(comment.timestamp.seconds * 1000).toLocaleString()
                                                            : "Just now"}
                                                        {comment.edited && <span className="ml-1 italic">(edited)</span>}
                                                    </p>
                                                    
                                                    {comment.adminId === admin?.id && (
                                                        <div className="flex items-center">
                                                            <button 
                                                                onClick={() => startEdit(comment)}
                                                                className="text-green-600 hover:text-green-800 ml-2"
                                                                title="Edit comment"
                                                            >
                                                                <FaPencilAlt size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteForAll(comment.id)}
                                                                className="text-red-600 hover:text-red-800 ml-2"
                                                                title="Delete for everyone"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteForYou(comment.id)}
                                                                className="text-gray-600 hover:text-gray-800 ml-2"
                                                                title="Delete For You"
                                                            >
                                                                <FaTimesCircle size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {editingCommentId === comment.id ? (
                                                <div className="mt-2">
                                                    <textarea
                                                        ref={editTextareaRef}
                                                        value={editMessage}
                                                        onChange={(e) => setEditMessage(e.target.value)}
                                                        onKeyDown={(e) => handleEditKeyDown(e, comment)}
                                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[80px]"
                                                    />
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateComment(comment)}
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-700">{comment.message}</p>
                                            )}
                                        </div>
                                    </div>
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