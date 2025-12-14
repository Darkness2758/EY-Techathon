"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Mic, Square, Maximize2, Minimize2, ShoppingBag, ExternalLink, Star, Filter, TrendingUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Product } from "../types/products"
import { generateAIResponse } from "../lib/product"
import { IntentDetector, ResponseGenerator } from "../lib/nlp"
import type { NLPResponse, QueryContext, Intent } from "../lib/nlp/types"

type Message = {
  id: number
  text: string
  sender: "user" | "ai"
  timestamp: Date
  relatedProducts?: Product[]
  action?: Intent['type']
  intentData?: NLPResponse
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
  const [conversationContext, setConversationContext] = useState<QueryContext>({
    conversationHistory: [],
    userPreferences: {
      preferredCategories: [],
      priceRange: { min: 0, max: 1000 },
      favoriteBrands: []
    }
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }
        
        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
      }
    }
  }, [])

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
    const userInput = input
    setInput("")
    setIsTyping(true)

    try {
      // Use NLP to detect intent
      const nlpResponse = IntentDetector.detectIntent(userInput, conversationContext)
      
      // Update conversation context
      setConversationContext(prev => ({
        ...prev,
        previousIntent: nlpResponse.intent,
        conversationHistory: [...prev.conversationHistory, userInput],
        // Update user preferences based on detected entities
        userPreferences: {
          ...prev.userPreferences,
          ...(nlpResponse.intent.entities.category && {
            preferredCategories: Array.from(
              new Set([...(prev.userPreferences?.preferredCategories || []), nlpResponse.intent.entities.category!])
            )
          }),
          ...(nlpResponse.intent.entities.brand && {
            favoriteBrands: Array.from(
              new Set([...(prev.userPreferences?.favoriteBrands || []), nlpResponse.intent.entities.brand!])
            )
          }),
          ...(nlpResponse.intent.entities.priceRange && {
            priceRange: {
              min: nlpResponse.intent.entities.priceRange.min || prev.userPreferences?.priceRange?.min || 0,
              max: nlpResponse.intent.entities.priceRange.max || prev.userPreferences?.priceRange?.max || 1000
            }
          })
        }
      }))

      // Get AI response with NLP context
      const aiResponse = await generateAIResponse(userInput, nlpResponse)
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: aiResponse.response,
        sender: "ai",
        timestamp: new Date(),
        relatedProducts: aiResponse.relatedProducts,
        action: aiResponse.action,
        intentData: nlpResponse
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I apologize, but I'm having trouble processing your request. Please try again in a moment.",
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
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsListening(true)
      } else {
        // Fallback to simulated voice input
        setIsListening(true)
        setTimeout(() => {
          setIsListening(false)
          const demoCommands = [
            "Show me jackets under ₹400",
            "What are the best hoodies?",
            "Recommend trending products",
            "Show me Wink brand items"
          ]
          const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)]
          setInput(randomCommand)
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }, 2000)
      }
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
        text: "Hello! I'm your AI fashion assistant. I have access to all products. How can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ])
    setConversationContext({
      conversationHistory: [],
      userPreferences: {
        preferredCategories: [],
        priceRange: { min: 0, max: 1000 },
        favoriteBrands: []
      }
    })
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

  const handleQuickPrompt = async (prompt: string) => {
    setInput(prompt)
    if (inputRef.current) {
      inputRef.current.focus()
    }
    
    // Auto-send after a short delay
    setTimeout(() => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        handleSend()
      }
    }, 100)
  }

  // Get suggested prompts based on conversation context
  const getSuggestedPrompts = () => {
    const basePrompts = [
      "Show me jackets",
      "Products under ₹300",
      "Recommendations",
      "Wink brand products",
    ]
    
    if (conversationContext.userPreferences?.preferredCategories?.length) {
      const lastCategory = conversationContext.userPreferences.preferredCategories.slice(-1)[0]
      return [
        `More ${lastCategory}`,
        `${lastCategory} under ₹500`,
        `Best rated ${lastCategory}`,
        "Show all categories"
      ]
    }
    
    if (conversationContext.previousIntent?.entities?.priceRange) {
      const { min, max } = conversationContext.previousIntent.entities.priceRange
      if (max) {
        return [
          `Products under ₹${max}`,
          `Show me cheaper options`,
          `Best value under ₹${max}`,
          "Clear price filter"
        ]
      }
    }
    
    return basePrompts
  }

  const getIntentIcon = (intentType?: string) => {
    switch (intentType) {
      case 'show_recommendations':
        return <TrendingUp className="w-3 h-3 text-purple-400" />
      case 'price_query':
        return <Filter className="w-3 h-3 text-green-400" />
      case 'comparison':
        return <Star className="w-3 h-3 text-yellow-400" />
      default:
        return <Bot className="w-3 h-3 text-yellow-300" />
    }
  }

  const getIntentColor = (intentType?: string) => {
    switch (intentType) {
      case 'show_recommendations':
        return 'border-purple-500/20 bg-purple-500/5'
      case 'price_query':
        return 'border-green-500/20 bg-green-500/5'
      case 'comparison':
        return 'border-yellow-500/20 bg-yellow-500/5'
      default:
        return 'border-yellow-300/20 bg-yellow-500/5'
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
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-linear-to-br from-purple-600 via-yellow-500 to-pink-600 shadow-2xl border-2 border-yellow-300 flex items-center justify-center group"
      >
        <div className="relative">
          <Bot className="w-7 h-7 text-white" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white">
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
                ? "inset-0 m-4 rounded-2xl" 
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
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-600 to-yellow-500 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-yellow-300">NebulaAI</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Fashion Assistant</span>
                    {conversationContext.conversationHistory.length > 0 && (
                      <span className="text-xs text-purple-400">
                        Context: {conversationContext.conversationHistory.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {conversationContext.previousIntent && (
                  <div className="text-xs px-2 py-1 rounded-full bg-black/50 border border-white/10">
                    {conversationContext.previousIntent.type.replace('_', ' ')}
                  </div>
                )}
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
                      className={`max-w-[80%] rounded-2xl p-4 ${message.sender === "user" 
                        ? "bg-linear-to-r from-blue-900/30 to-blue-800/20 border border-blue-500/30" 
                        : `${getIntentColor(message.intentData?.intent.type)} border`}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.sender === "ai" ? (
                          getIntentIcon(message.intentData?.intent.type)
                        ) : (
                          <User className="w-4 h-4 text-blue-400" />
                        )}
                        <span className="text-xs font-medium text-yellow-300">
                          {message.sender === "ai" ? "AI Assistant" : "You"}
                        </span>
                        {message.intentData && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/50 border border-white/10">
                            {message.intentData.intent.type.replace('_', ' ')}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 mb-3 whitespace-pre-line">{message.text}</p>
                      
                      {message.intentData && message.intentData.intent.confidence < 0.7 && (
                        <div className="text-xs text-gray-500 mb-2">
                          Confidence: {(message.intentData.intent.confidence * 100).toFixed(0)}%
                        </div>
                      )}

                      {message.sender === "ai" && message.relatedProducts && message.relatedProducts.length > 0 && (
                        <div className="mt-3 border-t border-white/10 pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <ShoppingBag className="w-4 h-4 text-yellow-300" />
                            <span className="text-xs font-medium text-yellow-300">
                              {message.action === 'show_recommendations' ? 'Top Recommendations' : 
                               message.action === 'price_query' ? 'Price Matches' :
                               message.action === 'comparison' ? 'Comparison Products' :
                               'Related Products'}
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">
                              {message.relatedProducts.length} products
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {message.relatedProducts.slice(0, 3).map((product) => (
                              <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-black/30 border border-white/10 rounded-lg p-3 hover:border-yellow-300/30 transition-all cursor-pointer hover:scale-[1.02]"
                                onClick={() => viewProductDetails(product)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                    {product.rating >= 4.5 && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <Star className="w-2 h-2 text-black" />
                                      </div>
                                    )}
                                  </div>
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
                                      {message.intentData?.intent.entities.priceRange && (
                                        <span className={`text-xs ml-2 px-1 rounded ${product.price <= (message.intentData.intent.entities.priceRange.max || Infinity) ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                          {product.price <= (message.intentData.intent.entities.priceRange.max || Infinity) ? 'In budget' : 'Over budget'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
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
                      <span className="text-xs text-gray-500">Analyzing with NLP...</span>
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

            {/* Product Details Modal */}
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
                        
                        <div className="pt-4 border-t border-white/10">
                          <button
                            onClick={() => {
                              closeProductDetails()
                              setInput(`Tell me more about ${selectedProduct.name}`)
                              if (inputRef.current) {
                                inputRef.current.focus()
                              }
                            }}
                            className="w-full py-2 border border-yellow-300/30 text-yellow-300 rounded-lg hover:bg-yellow-300/10 transition-colors"
                          >
                            Ask AI about this product
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggested Prompts */}
            {!isFullscreen && messages.length <= 4 && (
              <div className="px-4 pb-3">
                <p className="text-xs text-gray-400 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedPrompts().map((prompt, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-lg transition-all hover:scale-105 active:scale-95"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-900 space-y-3">
              {isListening && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 p-3 bg-linear-to-r from-red-500/10 to-purple-500/10 border border-red-500/30 rounded-lg"
                >
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
                </motion.div>
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
                    title="Voice input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  whileHover={input.trim() ? { scale: 1.05 } : {}}
                  whileTap={input.trim() ? { scale: 0.95 } : {}}
                  className="px-5 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-neutral-700 disabled:to-neutral-800 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all"
                >
                  <Send className="w-5 h-5 text-black" />
                </motion.button>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={clearChat}
                    className="hover:text-yellow-300 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear chat
                  </button>
                  {conversationContext.conversationHistory.length > 0 && (
                    <button
                      onClick={() => {
                        setInput(`Based on my previous questions: ${conversationContext.conversationHistory.slice(-2).join(', ')}`);
                        if (inputRef.current) {
                          inputRef.current.focus();
                        }
                      }}
                      className="hover:text-yellow-300 transition-colors"
                    >
                      Use context
                    </button>
                  )}
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
                    NLP Ready
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