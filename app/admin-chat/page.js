"use client"
import { useState, useEffect, useRef } from "react"
import { useAdminAuth } from "../components/providers/AdminAuthProvider"
import { useRouter } from "next/navigation"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore"
import { db } from "../lib/firebase"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Send,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Check,
  Mail,
  MoreVertical,
  Smile,
} from "lucide-react"
import Picker from "emoji-picker-react"

const AdminChat = () => {
  const { admin: currentAdmin, isAuthenticated, loading } = useAdminAuth()
  const router = useRouter()

  const [admins, setAdmins] = useState([])
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [editingMessage, setEditingMessage] = useState(null)
  const [editedText, setEditedText] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [unreadCounts, setUnreadCounts] = useState({})
  const [processedMessages, setProcessedMessages] = useState({})
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [dropdownMessageId, setDropdownMessageId] = useState(null)
  const [showChatOptions, setShowChatOptions] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  const notificationVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  }

  const chatOptionsVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  }

  // Fetch all admins and set up real-time listener
  useEffect(() => {
    if (!isAuthenticated) return

    const adminsRef = collection(db, "admins")
    const unsubscribe = onSnapshot(
      query(adminsRef, where("status", "==", "approved")),
      (snapshot) => {
        const adminList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isOnline: doc.data().isOnline || false,
          lastActive: doc.data().lastActive?.toDate?.() || null,
        }))
        setAdmins(adminList.filter((admin) => admin.id !== currentAdmin.id))
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching admins:", error)
        toast.error("Failed to load admins")
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [isAuthenticated, currentAdmin])

  // Fetch messages, track unread counts, and mark messages as read
  useEffect(() => {
    if (!currentAdmin || !admins.length) return

    const unsubscribes = admins.map((admin) => {
      const conversationId = [currentAdmin.id, admin.id].sort().join("_")
      const messagesRef = collection(db, "conversations", conversationId, "messages")

      return onSnapshot(
        query(messagesRef, orderBy("timestamp", "asc")),
        (snapshot) => {
          const messageList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
          }))

          // Update messages if this admin is selected
          if (selectedAdmin?.id === admin.id) {
            setMessages(messageList)
            scrollToBottom()

            // Mark messages as read when the conversation is opened
            messageList.forEach(async (message) => {
              if (message.senderId !== currentAdmin.id && !message.readBy?.includes(currentAdmin.id)) {
                const messageRef = doc(db, "conversations", conversationId, "messages", message.id)
                await updateDoc(messageRef, {
                  readBy: arrayUnion(currentAdmin.id),
                  readAt: serverTimestamp(),
                })
              }
            })
          }

          // Process unread messages
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const messageId = change.doc.id
              const messageData = change.doc.data()

              // Skip if message is already processed
              if (processedMessages[admin.id]?.includes(messageId)) {
                return
              }

              // Add message ID to processed messages
              setProcessedMessages((prev) => ({
                ...prev,
                [admin.id]: [...(prev[admin.id] || []), messageId],
              }))

              // Increment unread count if the message is from the other admin and not viewed
              if (
                messageData.senderId !== currentAdmin.id &&
                selectedAdmin?.id !== admin.id &&
                !messageData.readBy?.includes(currentAdmin.id)
              ) {
                setUnreadCounts((prev) => ({
                  ...prev,
                  [admin.id]: (prev[admin.id] || 0) + 1,
                }))
              }
            }
          })
        },
        (error) => {
          console.error("Error fetching messages:", error)
          toast.error("Failed to load messages")
        },
      )
    })

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe())
  }, [admins, selectedAdmin, currentAdmin])

  // Reset unread count when selecting an admin
  useEffect(() => {
    if (selectedAdmin) {
      setUnreadCounts((prev) => ({
        ...prev,
        [selectedAdmin.id]: 0,
      }))
    }
  }, [selectedAdmin])

  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  // Handle admin selection
  const handleSelectAdmin = (admin) => {
    console.log("Selecting admin:", admin)
    setSelectedAdmin(admin)
    setMessages([])
  }

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAdmin) return

    const conversationId = [currentAdmin.id, selectedAdmin.id].sort().join("_")
    const messagesRef = collection(db, "conversations", conversationId, "messages")

    try {
      await addDoc(messagesRef, {
        senderId: currentAdmin.id,
        receiverId: selectedAdmin.id,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        edited: false,
        deletedFor: [],
        readBy: [currentAdmin.id], // Mark as read by sender immediately
        readAt: serverTimestamp(),
      })

      setNewMessage("")
      scrollToBottom()
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    }
  }

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji)
    setShowEmojiPicker(false)
  }

  // Edit a message
  const handleEditMessage = async (messageId) => {
    if (!editedText.trim()) return

    const conversationId = [currentAdmin.id, selectedAdmin.id].sort().join("_")
    const messageRef = doc(db, "conversations", conversationId, "messages", messageId)

    try {
      await updateDoc(messageRef, {
        text: editedText.trim(),
        edited: true,
        editedAt: serverTimestamp(),
      })
      setEditingMessage(null)
      setEditedText("")
      setDropdownMessageId(null)
      toast.success("Message updated successfully")
    } catch (error) {
      console.error("Error editing message:", error)
      toast.error("Failed to edit message")
    }
  }

  // Delete a message for me
  const handleDeleteForMe = async (messageId) => {
    const conversationId = [currentAdmin.id, selectedAdmin.id].sort().join("_")
    const messageRef = doc(db, "conversations", conversationId, "messages", messageId)

    try {
      await updateDoc(messageRef, {
        deletedFor: arrayUnion(currentAdmin.id),
      })
      setDropdownMessageId(null)
      toast.success("Message deleted for you")
    } catch (error) {
      console.error("Error deleting message for me:", error)
      toast.error("Failed to delete message")
    }
  }

  // Delete a message for everyone
  const handleDeleteForEveryone = async (messageId) => {
    const conversationId = [currentAdmin.id, selectedAdmin.id].sort().join("_")
    const messageRef = doc(db, "conversations", conversationId, "messages", messageId)

    try {
      await updateDoc(messageRef, {
        text: "This message was deleted",
        deletedFor: [currentAdmin.id, selectedAdmin.id],
        deletedBy: currentAdmin.id,
        deletedAt: serverTimestamp(),
      })
      setDropdownMessageId(null)
      toast.success("Message deleted for everyone")
    } catch (error) {
      console.error("Error deleting message for everyone:", error)
      toast.error("Failed to delete message")
    }
  }

  // Clear the entire chat
  const handleClearChat = async () => {
    if (!selectedAdmin) return

    const conversationId = [currentAdmin.id, selectedAdmin.id].sort().join("_")
    const messagesRef = collection(db, "conversations", conversationId, "messages")

    try {
      const querySnapshot = await getDocs(messagesRef)
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      const conversationRef = doc(db, "conversations", conversationId)
      await deleteDoc(conversationRef)

      setMessages([])
      setShowChatOptions(false)
      toast.success("Chat cleared successfully")
    } catch (error) {
      console.error("Error clearing chat:", error)
      toast.error("Failed to clear chat")
    }
  }

  // Format timestamp
  const formatTimestamp = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF4ED]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#36302A]"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[#36302A] font-medium">Loading</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF4ED] flex">
      {/* Sidebar */}
      <motion.div
        className={`bg-white shadow-xl h-screen flex flex-col ${sidebarOpen ? "w-72" : "w-16"} transition-all duration-300`}
        initial={{ width: sidebarOpen ? 288 : 64 }}
        animate={{ width: sidebarOpen ? 288 : 64 }}
      >
        <div className="p-4 border-b border-[#E2D9CE] flex justify-between items-center">
          <h2 className={`text-lg font-bold text-[#36302A] ${!sidebarOpen && "hidden"}`}>Admins</h2>
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-[#F8F2EA]"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </motion.button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-[#86807A]">Loading admins...</div>
          ) : admins.length === 0 ? (
            <div className="p-4 text-center text-[#86807A]">No admins available</div>
          ) : (
            admins.map((admin) => (
              <motion.div
                key={admin.id}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors duration-200 ${
                  selectedAdmin?.id === admin.id ? "bg-[#F8F2EA]" : "bg-white"
                } hover:bg-[#F8F2EA]`}
                onClick={() => handleSelectAdmin(admin)}
              >
                <div className="h-10 w-10 flex-shrink-0 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium">
                  {admin.username?.charAt(0).toUpperCase() || "A"}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${admin.isOnline ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <span className="text-sm font-medium text-[#36302A]">@{admin.username}</span>
                      </div>
                      <p className="text-xs text-[#86807A]">{admin.email}</p>
                    </div>
                    <AnimatePresence>
                      {unreadCounts[admin.id] > 0 && (
                        <motion.div
                          className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full shadow-md"
                          variants={notificationVariants}
                          initial="hidden"
                          animate={["visible", "pulse"]}
                          exit="hidden"
                        >
                          <Mail size={12} />
                          <span>{unreadCounts[admin.id]}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Chat Window */}
      <motion.div
        className="flex-1 flex flex-col h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {selectedAdmin ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-[#E2D9CE] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium">
                  {selectedAdmin.username?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${selectedAdmin.isOnline ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                    <h3 className="text-lg font-medium text-[#36302A]">@{selectedAdmin.username}</h3>
                  </div>
                  <p className="text-sm text-[#86807A]">
                    {selectedAdmin.email} <span className="text-[#36302A]">({selectedAdmin.role})</span>
                  </p>
                </div>
              </div>
              <div className="relative">
                <motion.button
                  onClick={() => setShowChatOptions(!showChatOptions)}
                  className="p-2 rounded-full hover:bg-[#F8F2EA]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MoreVertical size={20} />
                </motion.button>
                <AnimatePresence>
                  {showChatOptions && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                      variants={chatOptionsVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <div className="py-1">
                        <button
                          onClick={handleClearChat}
                          className="block w-full text-left px-4 py-2 text-sm text-[#36302A] hover:bg-[#F8F2EA] flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Clear Chat
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 p-4 overflow-y-auto bg-[#FAF4ED]"
              style={{ maxHeight: "calc(100vh - 140px)" }}
            >
              <AnimatePresence>
                {messages.map((message) => {
                  const isSender = message.senderId === currentAdmin.id
                  const isDeletedForMe = message.deletedFor?.includes(currentAdmin.id)
                  const isRead = message.readBy?.includes(selectedAdmin.id)

                  return (
                    !isDeletedForMe && (
                      <motion.div
                        key={message.id}
                        className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4 relative group`}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            isSender ? "bg-[#36302A] text-white" : "bg-white text-[#36302A]"
                          }`}
                        >
                          {editingMessage === message.id ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="w-full p-2 rounded border border-[#E2D9CE] text-[#36302A]"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditMessage(message.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingMessage(null)
                                    setDropdownMessageId(null)
                                  }}
                                  className="bg-gray-300 text-[#36302A] px-3 py-1 rounded hover:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p>
                                {message.text.split(/\b(https?:\/\/\S+)/g).map((part, index) => {
                                  // Check if the part is a URL
                                  if (/^https?:\/\/\S+$/.test(part)) {
                                    return (
                                      <a
                                        key={index}
                                        href={part}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`underline ${isSender ? "text-blue-200" : "text-blue-600"}`}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {part}
                                      </a>
                                    )
                                  }
                                  // Return regular text
                                  return <span key={index}>{part}</span>
                                })}
                              </p>
                              <div className="text-xs mt-1 opacity-75 flex items-center gap-1">
                                {formatTimestamp(message.timestamp)}
                                {message.edited && " (Edited)"}
                                {isSender && (
                                  <span className="ml-1 flex items-center">
                                    {isRead ? (
                                      <span className="relative flex items-center">
                                        <Check size={12} className="inline text-blue-500 animate-glow" />
                                        <Check size={12} className="inline -ml-1.5 text-blue-500 animate-glow" />
                                      </span>
                                    ) : (
                                      <Check size={12} className="inline text-gray-400" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        {isSender && editingMessage !== message.id && (
                          <div className="absolute right-0 top-0 mt-1 mr-1">
                            <motion.button
                              onClick={() => setDropdownMessageId(dropdownMessageId === message.id ? null : message.id)}
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <MoreVertical size={16} />
                            </motion.button>
                            <AnimatePresence>
                              {dropdownMessageId === message.id && (
                                <motion.div
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                                  variants={dropdownVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                >
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        setEditingMessage(message.id)
                                        setEditedText(message.text)
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-[#36302A] hover:bg-[#F8F2EA] flex items-center gap-2"
                                    >
                                      <Edit size={14} /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteForMe(message.id)}
                                      className="block w-full text-left px-4 py-2 text-sm text-[#36302A] hover:bg-[#F8F2EA] flex items-center gap-2"
                                    >
                                      <Trash2 size={14} /> Delete for Me
                                    </button>
                                    <button
                                      onClick={() => handleDeleteForEveryone(message.id)}
                                      className="block w-full text-left px-4 py-2 text-sm text-[#36302A] hover:bg-[#F8F2EA] flex items-center gap-2"
                                    >
                                      <Trash2 size={14} /> Delete for Everyone
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </motion.div>
                    )
                  )
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-[#E2D9CE] flex items-center gap-3 sticky bottom-0 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 p-2 rounded border border-[#E2D9CE] focus:outline-none focus:ring-2 focus:ring-[#36302A]"
              />
              <motion.button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-full hover:bg-[#F8F2EA]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Smile size={20} />
              </motion.button>
              {showEmojiPicker && (
                <div className="absolute bottom-16 right-4 z-10">
                  <Picker onEmojiClick={onEmojiClick} />
                </div>
              )}
              <motion.button
                onClick={handleSendMessage}
                className="bg-[#36302A] text-white p-2 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Send size={20} />
              </motion.button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              className="bg-[#F8F2EA] rounded-xl p-12 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EFE7DD] text-[#86807A] mb-4">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-medium text-[#36302A]">Select an Admin to Chat</h3>
              <p className="text-[#86807A] mt-2">Choose an admin from the sidebar to start a conversation.</p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AdminChat

