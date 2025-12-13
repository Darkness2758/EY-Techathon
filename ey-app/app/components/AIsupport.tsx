"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Mic, Square, Maximize2, Minimize2, ShoppingBag, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Product } from "../types/products"
import { generateAIResponse } from "../lib/product"

type Message = {
  id: number
  text: string
  sender: "user" | "ai"
  timestamp: Date
  relatedProducts?: Product[]
  action?: 'show_products' | 'show_categories' | 'show_recommendations'
}

export default function AISupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI fashion assistant. I have access to all products including SKULL PRINTED JACKET (₹399), BLACK HOODIE (₹155), ARM GLOVES (₹250), and TRACK PANTS (₹150). How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle escape key for fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isFullscreen])

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Get AI response
      const aiResponse = await generateAIResponse(input)
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: aiResponse.response,
        sender: "ai",
        timestamp: new Date(),
        relatedProducts: aiResponse.relatedProducts,
        action: aiResponse.action
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I apologize, but I'm having trouble accessing the product data. Please try again in a moment.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false)
    } else {
      setIsListening(true)
      setTimeout(() => {
        setIsListening(false)
        setInput("Show me jackets under ₹400")
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your AI fashion assistant. How can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ])
    setSelectedProduct(null)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product)
  }

  const closeProductDetails = () => {
    setSelectedProduct(null)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Suggested prompts
  const suggestedPrompts = [
    "Show me jackets",
    "Products under ₹300",
    "Recommendations",
    "Wink brand products",
  ]

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 shadow-2xl border-2 border-yellow-300 flex items-center justify-center group"
      >
        <div className="relative">
          <Bot className="w-7 h-7 text-black" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-black">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="absolute -top-12 right-0 bg-black/90 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-yellow-300">
          AI Fashion Assistant
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-black/90 rotate-45"></div>
        </div>
      </motion.button>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed z-50 bg-neutral-900 border border-yellow-300/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col
              ${isFullscreen 
                ? "ins-0 m-4 rounded-2xl" 
                : "bottom-24 right-8 w-96 h-[600px]"
              }`}
            style={isFullscreen ? {
              position: 'fixed',
              top: '1rem',
              left: '1rem',
              right: '1rem',
              bottom: '1rem',
              height: 'auto'
            } : undefined}
          >
            <div className="p-5 bg-linear-to-r from-neutral-800 to-neutral-900 border-b border-yellow-300/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-yellow-300">NebulaAI</h3>
                  <p className="text-xs text-gray-400">Always There For You</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/50 ${isFullscreen ? "min-h-0" : ""}`}>
              {messages.map((message) => (
                <div key={message.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${message.sender === "user" ? "bg-yellow-500/10 border border-yellow-300/30" : "bg-neutral-800/50 border border-neutral-700"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.sender === "ai" ? (
                          <Bot className="w-4 h-4 text-yellow-300" />
                        ) : (
                          <User className="w-4 h-4 text-yellow-300" />
                        )}
                        <span className="text-xs font-medium text-yellow-300">
                          {message.sender === "ai" ? "AI Assistant" : "You"}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 mb-3">{message.text}</p>

                      {message.sender === "ai" && message.relatedProducts && message.relatedProducts.length > 0 && (
                        <div className="mt-3 border-t border-white/10 pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <ShoppingBag className="w-4 h-4 text-yellow-300" />
                            <span className="text-xs font-medium text-yellow-300">
                              {message.action === 'show_recommendations' ? 'Top Recommendations' : 'Related Products'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {message.relatedProducts.slice(0, 3).map((product) => (
                              <div
                                key={product.id}
                                className="bg-black/30 border border-white/10 rounded-lg p-3 hover:border-yellow-300/30 transition-colors cursor-pointer"
                                onClick={() => viewProductDetails(product)}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="text-xs font-medium text-white">{product.name}</h4>
                                        <p className="text-xs text-gray-400">{product.brand} • {product.category}</p>
                                      </div>
                                      <span className="text-xs font-bold text-yellow-300">₹{product.price}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                      <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                          <div
                                            key={i}
                                            className={`w-2 h-2 rounded-full ${i < Math.floor(product.rating) ? 'bg-yellow-400' : 'bg-gray-700'}`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs text-gray-400 ml-1">{product.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {message.relatedProducts.length > 3 && (
                            <p className="text-xs text-gray-400 mt-2">
                              +{message.relatedProducts.length - 3} more products
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-neutral-800/50 border border-neutral-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-yellow-300" />
                      <span className="text-xs font-medium text-yellow-300">AI Assistant</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Product Details Wait I will change this */}
            <AnimatePresence>
              {selectedProduct && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={closeProductDetails}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-neutral-900 border border-yellow-300/30 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedProduct.name}</h3>
                          <p className="text-sm text-gray-400">{selectedProduct.brand} • {selectedProduct.category}</p>
                        </div>
                        <button
                          onClick={closeProductDetails}
                          className="p-2 hover:bg-white/10 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="mb-6">
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-2xl font-bold text-yellow-300">₹{selectedProduct.price}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${i < Math.floor(selectedProduct.rating) ? 'bg-yellow-400' : 'bg-gray-700'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-300">{selectedProduct.rating}/5</span>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium rounded-lg flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Add to Cart
                          </button>
                        </div>
                        
                        {selectedProduct.description && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
                            <p className="text-sm text-gray-400">{selectedProduct.description}</p>
                          </div>
                        )}
                        
                        <div className="pt-4 border-t border-white/10">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Product Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-400">Category</div>
                            <div className="text-white">{selectedProduct.category}</div>
                            <div className="text-gray-400">Brand</div>
                            <div className="text-white">{selectedProduct.brand}</div>
                            <div className="text-gray-400">Price</div>
                            <div className="text-white">₹{selectedProduct.price}</div>
                            <div className="text-gray-400">Rating</div>
                            <div className="text-white">{selectedProduct.rating}/5</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isFullscreen && messages.length <= 3 && (
              <div className="px-4 pb-3">
                <p className="text-xs text-gray-400 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-lg transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="p-4 border-t border-neutral-800 bg-neutral-900 space-y-3">
              {isListening && (
                <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="relative">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                    <Mic className="w-5 h-5 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-sm text-red-300">Listening... Speak now</span>
                  <button
                    onClick={toggleVoiceInput}
                    className="ml-auto p-1 hover:bg-red-500/20 rounded"
                  >
                    <Square className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about products, prices, recommendations..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/30"
                  />
                  <button
                    onClick={toggleVoiceInput}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${isListening ? "text-red-400" : "text-gray-400 hover:text-yellow-300"}`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="px-5 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-neutral-700 disabled:to-neutral-800 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all"
                >
                  <Send className="w-5 h-5 text-black" />
                </button>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={clearChat}
                    className="hover:text-yellow-300 transition-colors"
                  >
                    Clear chat
                  </button>
                  {isFullscreen && (
                    <button
                      onClick={toggleFullscreen}
                      className="hover:text-yellow-300 transition-colors"
                    >
                      Exit fullscreen (ESC)
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Connected to Products
                  </span>
                  <span>Press Enter to send</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}