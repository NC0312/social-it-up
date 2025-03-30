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
  X,
  Plus,
  Users,
} from "lucide-react"
import Picker from "emoji-picker-react"
import Avatar from "boring-avatars"

const AdminChat = () => {
  const { admin: currentAdmin, isAuthenticated, loading } = useAdminAuth()
  const router = useRouter()

  const [admins, setAdmins] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedChat, setSelectedChat] = useState(null) // Can be admin or group
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
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [showGroupCreator, setShowGroupCreator] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupParticipants, setGroupParticipants] = useState([])

  const avatarVariants = ["marble", "beam", "pixel", "sunset", "ring", "bauhaus"]
  const colorPalettes = [
    ["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"],
    ["#D6E6F3", "#769ECB", "#9D65C9", "#5D54A4", "#2A3D66"],
    ["#F4D8CD", "#EFB1B3", "#D77A61", "#2A3D66", "#182335"],
    ["#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"],
    ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D"],
    ["#FF9F1C", "#FFBF69", "#CBF3F0", "#2EC4B6", "#FFFFFF"],
  ]

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

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
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
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

  // Fetch admins and groups
  useEffect(() => {
    if (!isAuthenticated) return

    // Fetch admins
    const adminsRef = collection(db, "admins")
    const adminsUnsubscribe = onSnapshot(
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
      }
    )

    // Fetch groups
    const groupsRef = collection(db, "groups")
    const groupsUnsubscribe = onSnapshot(
      query(groupsRef, where("participants", "array-contains", currentAdmin.id)),
      (snapshot) => {
        const groupList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setGroups(groupList)
      },
      (error) => {
        console.error("Error fetching groups:", error)
        toast.error("Failed to load groups")
      }
    )

    return () => {
      adminsUnsubscribe()
      groupsUnsubscribe()
    }
  }, [isAuthenticated, currentAdmin])

  // Fetch messages for selected chat
  useEffect(() => {
    if (!currentAdmin || (!selectedChat && !admins.length && !groups.length)) return

    let unsubscribe
    if (selectedChat) {
      const chatId = selectedChat.isGroup
        ? selectedChat.id
        : [currentAdmin.id, selectedChat.id].sort().join("_")
      const messagesRef = collection(
        db,
        selectedChat.isGroup ? "groupMessages" : "conversations",
        chatId,
        "messages"
      )

      unsubscribe = onSnapshot(
        query(messagesRef, orderBy("timestamp", "asc")),
        (snapshot) => {
          const messageList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
          }))

          setMessages(messageList)
          scrollToBottom()

          // Mark messages as read
          messageList.forEach(async (message) => {
            if (!message.readBy?.includes(currentAdmin.id)) {
              const messageRef = doc(
                db,
                selectedChat.isGroup ? "groupMessages" : "conversations",
                chatId,
                "messages",
                message.id
              )
              await updateDoc(messageRef, {
                readBy: arrayUnion(currentAdmin.id),
                readAt: serverTimestamp(),
              })
            }
          })

          // Process unread counts
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const messageId = change.doc.id
              const messageData = change.doc.data()

              if (processedMessages[selectedChat.id]?.includes(messageId)) return

              setProcessedMessages((prev) => ({
                ...prev,
                [selectedChat.id]: [...(prev[selectedChat.id] || []), messageId],
              }))

              if (
                messageData.senderId !== currentAdmin.id &&
                !messageData.readBy?.includes(currentAdmin.id)
              ) {
                setUnreadCounts((prev) => ({
                  ...prev,
                  [selectedChat.id]: (prev[selectedChat.id] || 0) + 1,
                }))
              }
            }
          })
        },
        (error) => {
          console.error("Error fetching messages:", error)
          toast.error("Failed to load messages")
        }
      )
    }

    return () => unsubscribe && unsubscribe()
  }, [selectedChat, currentAdmin, admins, groups])

  // Reset unread count when selecting a chat
  useEffect(() => {
    if (selectedChat) {
      setUnreadCounts((prev) => ({
        ...prev,
        [selectedChat.id]: 0,
      }))
    }
  }, [selectedChat])

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  const handleSelectChat = (chat) => {
    setSelectedChat(chat)
    setMessages([])
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    const chatId = selectedChat.isGroup
      ? selectedChat.id
      : [currentAdmin.id, selectedChat.id].sort().join("_")
    const messagesRef = collection(
      db,
      selectedChat.isGroup ? "groupMessages" : "conversations",
      chatId,
      "messages"
    )

    try {
      await addDoc(messagesRef, {
        senderId: currentAdmin.id,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        edited: false,
        deletedFor: [],
        readBy: [currentAdmin.id],
        readAt: serverTimestamp(),
      })

      setNewMessage("")
      scrollToBottom()
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    }
  }

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji)
    setShowEmojiPicker(false)
  }

  const handleEditMessage = async (messageId) => {
    if (!editedText.trim()) return

    const chatId = selectedChat.isGroup
      ? selectedChat.id
      : [currentAdmin.id, selectedChat.id].sort().join("_")
    const messageRef = doc(
      db,
      selectedChat.isGroup ? "groupMessages" : "conversations",
      chatId,
      "messages",
      messageId
    )

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

  const handleDeleteForMe = async (messageId) => {
    const chatId = selectedChat.isGroup
      ? selectedChat.id
      : [currentAdmin.id, selectedChat.id].sort().join("_")
    const messageRef = doc(
      db,
      selectedChat.isGroup ? "groupMessages" : "conversations",
      chatId,
      "messages",
      messageId
    )

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

  const handleDeleteForEveryone = async (messageId) => {
    const chatId = selectedChat.isGroup
      ? selectedChat.id
      : [currentAdmin.id, selectedChat.id].sort().join("_")
    const messageRef = doc(
      db,
      selectedChat.isGroup ? "groupMessages" : "conversations",
      chatId,
      "messages",
      messageId
    )

    try {
      await updateDoc(messageRef, {
        text: "This message was deleted",
        deletedFor: selectedChat.isGroup
          ? selectedChat.participants
          : [currentAdmin.id, selectedChat.id],
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

  const handleClearChat = async () => {
    if (!selectedChat) return

    const chatId = selectedChat.isGroup
      ? selectedChat.id
      : [currentAdmin.id, selectedChat.id].sort().join("_")
    const messagesRef = collection(
      db,
      selectedChat.isGroup ? "groupMessages" : "conversations",
      chatId,
      "messages"
    )

    try {
      const querySnapshot = await getDocs(messagesRef)
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      const chatRef = doc(
        db,
        selectedChat.isGroup ? "groupMessages" : "conversations",
        chatId
      )
      await deleteDoc(chatRef)

      setMessages([])
      setShowChatOptions(false)
      toast.success("Chat cleared successfully")
    } catch (error) {
      console.error("Error clearing chat:", error)
      toast.error("Failed to clear chat")
    }
  }

  const handleAvatarSelect = async (avatarConfig) => {
    if (!currentAdmin) return

    try {
      const adminRef = doc(db, "admins", currentAdmin.id)
      await updateDoc(adminRef, { avatar: avatarConfig })

      currentAdmin.avatar = avatarConfig
      setShowAvatarPicker(false)
      toast.success("Avatar updated successfully")
    } catch (error) {
      console.error("Error updating avatar:", error)
      toast.error("Failed to update avatar")
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || groupParticipants.length < 1) {
      toast.error("Please provide a group name and at least one participant")
      return
    }

    const participants = [currentAdmin.id, ...groupParticipants]
    try {
      const groupRef = await addDoc(collection(db, "groups"), {
        name: groupName.trim(),
        participants,
        createdBy: currentAdmin.id,
        createdAt: serverTimestamp(),
      })

      setGroupName("")
      setGroupParticipants([])
      setShowGroupCreator(false)
      toast.success("Group created successfully")
    } catch (error) {
      console.error("Error creating group:", error)
      toast.error("Failed to create group")
    }
  }

  const toggleParticipant = (adminId) => {
    setGroupParticipants((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId]
    )
  }

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
          <h2 className={`text-lg font-bold text-[#36302A] ${!sidebarOpen && "hidden"}`}>Chats</h2>
          <div className="flex gap-2">
            <motion.button
              onClick={() => setShowGroupCreator(true)}
              className="p-2 rounded-full hover:bg-[#F8F2EA]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={20} />
            </motion.button>
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full hover:bg-[#F8F2EA]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </motion.button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-[#86807A]">Loading chats...</div>
          ) : (
            <>
              {/* Groups */}
              {groups.map((group) => (
                <motion.div
                  key={group.id}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors duration-200 ${
                    selectedChat?.id === group.id ? "bg-[#F8F2EA]" : "bg-white"
                  } hover:bg-[#F8F2EA]`}
                  onClick={() => handleSelectChat({ ...group, isGroup: true })}
                >
                  <div className="h-10 w-10 flex-shrink-0 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium">
                    <Users size={20} />
                  </div>
                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-[#36302A]">{group.name}</span>
                        <p className="text-xs text-[#86807A]">{group.participants.length} members</p>
                      </div>
                      <AnimatePresence>
                        {unreadCounts[group.id] > 0 && (
                          <motion.div
                            className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full shadow-md"
                            variants={notificationVariants}
                            initial="hidden"
                            animate={["visible", "pulse"]}
                            exit="hidden"
                          >
                            <Mail size={12} />
                            <span>{unreadCounts[group.id]}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}
              {/* Admins */}
              {admins.map((admin) => (
                <motion.div
                  key={admin.id}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors duration-200 ${
                    selectedChat?.id === admin.id && !selectedChat?.isGroup ? "bg-[#F8F2EA]" : "bg-white"
                  } hover:bg-[#F8F2EA]`}
                  onClick={() => handleSelectChat({ ...admin, isGroup: false })}
                >
                  <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden">
                    {admin.avatar ? (
                      <Avatar
                        size={40}
                        name={admin.username || admin.id}
                        variant={admin.avatar.variant}
                        colors={admin.avatar.colors}
                        square={false}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium">
                        {admin.username?.charAt(0).toUpperCase() || "A"}
                      </div>
                    )}
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
              ))}
            </>
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
        <div className="bg-white p-4 border-b border-[#E2D9CE] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#36302A]">Admin Chat</h2>
          <motion.div
            className="cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAvatarPicker(true)}
          >
            {currentAdmin?.avatar ? (
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <Avatar
                  size={40}
                  name={currentAdmin.username || currentAdmin.id}
                  variant={currentAdmin.avatar.variant}
                  colors={currentAdmin.avatar.colors}
                  square={false}
                />
              </div>
            ) : (
              <div className="h-10 w-10 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium">
                {currentAdmin?.username?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
          </motion.div>
        </div>
        {selectedChat ? (
          <>
            <div className="p-4 bg-white border-b border-[#E2D9CE] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedChat.isGroup ? (
                  <div className="h-10 w-10 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium">
                    <Users size={20} />
                  </div>
                ) : (
                  <div className="relative">
                    {selectedChat.avatar ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <Avatar
                          size={40}
                          name={selectedChat.username || selectedChat.id}
                          variant={selectedChat.avatar.variant}
                          colors={selectedChat.avatar.colors}
                          square={false}
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium">
                        {selectedChat.username?.charAt(0).toUpperCase() || "A"}
                      </div>
                    )}
                    <div
                      className={`h-2 w-2 rounded-full ${selectedChat.isOnline ? "bg-green-500" : "bg-gray-300"}`}
                      style={{ position: "absolute", bottom: 0, right: 0, border: "1px solid white" }}
                    ></div>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-[#36302A]">
                    {selectedChat.isGroup ? selectedChat.name : `@${selectedChat.username}`}
                  </h3>
                  <p className="text-sm text-[#86807A]">
                    {selectedChat.isGroup
                      ? `${selectedChat.participants.length} members`
                      : `${selectedChat.email} (${selectedChat.role})`}
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

            <div
              ref={messagesContainerRef}
              className="flex-1 p-4 overflow-y-auto bg-[#FAF4ED]"
              style={{ maxHeight: "calc(100vh - 140px)" }}
            >
              <AnimatePresence>
                {messages.map((message) => {
                  const isSender = message.senderId === currentAdmin.id
                  const isDeletedForMe = message.deletedFor?.includes(currentAdmin.id)
                  const isRead = message.readBy?.includes(selectedChat.isGroup ? currentAdmin.id : selectedChat.id)
                  const messageAdmin = admins.find((a) => a.id === message.senderId) || currentAdmin

                  return (
                    !isDeletedForMe && (
                      <motion.div
                        key={message.id}
                        className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4 relative group`}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {!isSender && (
                          <div className="mr-2">
                            {messageAdmin.avatar ? (
                              <div className="h-8 w-8 rounded-full overflow-hidden">
                                <Avatar
                                  size={32}
                                  name={messageAdmin.username || messageAdmin.id}
                                  variant={messageAdmin.avatar.variant}
                                  colors={messageAdmin.avatar.colors}
                                  square={false}
                                />
                              </div>
                            ) : (
                              <div className="h-8 w-8 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium text-xs">
                                {messageAdmin.username?.charAt(0).toUpperCase() || "A"}
                              </div>
                            )}
                          </div>
                        )}
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
                              {selectedChat.isGroup && !isSender && (
                                <p className="text-xs font-medium text-[#86807A] mb-1">
                                  @{messageAdmin.username}
                                </p>
                              )}
                              <p>
                                {message.text.split(/\b(https?:\/\/\S+)/g).map((part, index) => {
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
              <h3 className="text-xl font-medium text-[#36302A]">Select a Chat</h3>
              <p className="text-[#86807A] mt-2">Choose an admin or group from the sidebar to start a conversation.</p>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 w-[90%] max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#36302A]">Select Avatar</h3>
              <button onClick={() => setShowAvatarPicker(false)} className="p-1 rounded-full hover:bg-[#F8F2EA]">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {avatarVariants
                .map((variant, variantIndex) =>
                  colorPalettes.map((colors, colorIndex) => (
                    <div
                      key={`${variant}-${colorIndex}`}
                      className="cursor-pointer hover:scale-110 transition-transform flex flex-col items-center"
                      onClick={() => handleAvatarSelect({ variant, colors })}
                    >
                      <div className="rounded-full overflow-hidden border-2 border-transparent hover:border-[#36302A] mb-1">
                        <Avatar
                          size={60}
                          name={currentAdmin?.username || currentAdmin?.id || "User"}
                          variant={variant}
                          colors={colors}
                          square={false}
                        />
                      </div>
                    </div>
                  ))
                )
                .slice(0, 18)}
            </div>
          </motion.div>
        </div>
      )}

      {/* Group Creator Modal */}
      {showGroupCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 w-[90%] max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#36302A]">Create Group</h3>
              <button onClick={() => setShowGroupCreator(false)} className="p-1 rounded-full hover:bg-[#F8F2EA]">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group Name"
                className="w-full p-2 rounded border border-[#E2D9CE] focus:outline-none focus:ring-2 focus:ring-[#36302A]"
              />
            </div>
            <div className="mb-4 max-h-64 overflow-y-auto">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center gap-3 p-2 hover:bg-[#F8F2EA] cursor-pointer"
                  onClick={() => toggleParticipant(admin.id)}
                >
                  <input
                    type="checkbox"
                    checked={groupParticipants.includes(admin.id)}
                    onChange={() => {}}
                    className="h-4 w-4"
                  />
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    {admin.avatar ? (
                      <Avatar
                        size={32}
                        name={admin.username || admin.id}
                        variant={admin.avatar.variant}
                        colors={admin.avatar.colors}
                        square={false}
                      />
                    ) : (
                      <div className="h-8 w-8 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium text-xs">
                        {admin.username?.charAt(0).toUpperCase() || "A"}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-[#36302A]">@{admin.username}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleCreateGroup}
              className="w-full bg-[#36302A] text-white p-2 rounded hover:bg-[#4A4035]"
            >
              Create Group
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminChat