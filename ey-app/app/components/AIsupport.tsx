"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Mic,
  Square,
  Maximize2,
  Minimize2,
  ShoppingBag,
  ExternalLink,
  Star,
  Filter,
  TrendingUp,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Hash,
  Tag,
  Zap,
  Shield,
  Award,
  Crown,
  Sparkles,
} from "lucide-react";
import { SimilarProductFinder } from "../lib/similar";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "../types/products";
import {
  generateAIResponse,
  getProducts,
  searchProducts,
} from "../lib/product";
import { IntentDetector, ResponseGenerator } from "../lib/nlp";
import { ProductRanker } from "../lib/ranking";
import type { NLPResponse, QueryContext, Intent } from "../lib/nlp/types";

type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  relatedProducts?: Product[];
  action?: Intent["type"];
  intentData?: NLPResponse;
  quickReplies?: string[];
  feedback?: {
    helpful: boolean;
    timestamp: Date;
  };
};

type ConversationState = {
  isAskingForPreferences: boolean;
  waitingForResponse: boolean;
  currentQuestion?: string;
  expectedResponse?: "category" | "price" | "brand" | "color" | "style";
};

export default function AISupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! 👋 I'm your personal fashion assistant. I can help you find the perfect products, give recommendations based on your style, and answer any questions you have about our collection. What are you looking for today?",
      sender: "ai",
      timestamp: new Date(),
      quickReplies: [
        "Show me jackets",
        "Recommend something",
        "What's trending?",
        "Help me choose",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [conversationContext, setConversationContext] = useState<QueryContext>({
    conversationHistory: [],
    userPreferences: {
      preferredCategories: [],
      priceRange: { min: 0, max: 1000 },
      favoriteBrands: [],
    },
    currentQuery: "",
    currentIntent: undefined,
  });
  const [conversationState, setConversationState] = useState<ConversationState>(
    {
      isAskingForPreferences: false,
      waitingForResponse: false,
      currentQuestion: undefined,
      expectedResponse: undefined,
    }
  );
  const [userProfile, setUserProfile] = useState({
    name: "",
    stylePreferences: [] as string[],
    budget: { min: 0, max: 1000 },
    savedProducts: [] as number[],
  });
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    async function loadProducts() {
      const products = await getProducts();
      setAllProducts(products);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFullscreen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const nlpResponse = IntentDetector.detectIntent(
        userInput,
        conversationContext
      );
      if (nlpResponse.intent.type === "comparison") {

        const query = userInput.toLowerCase();
        const productsInQuery = allProducts.filter(p =>
          query.includes(p.name.toLowerCase()) ||
          query.includes(p.brand.toLowerCase())
        );

        if (productsInQuery.length > 0) {
          const referenceProduct = productsInQuery[0];
          const similar = await SimilarProductFinder.findSimilarProducts(
            referenceProduct,
            5
          );

          setMessages(prev => [
            ...prev,
            {
              id: prev.length + 2,
              sender: "ai",
              text: `Here are products most similar to ${referenceProduct.name}, based on price, style, and category.`,
              timestamp: new Date(),
              relatedProducts: similar.map(s => s.product),
              action: "comparison",
            }
          ]);

          setIsTyping(false);
          return;
        }
      }

      if (
        conversationState.waitingForResponse &&
        conversationState.expectedResponse
      ) {
        await handleFollowUpResponse(
          userInput,
          conversationState.expectedResponse,
          nlpResponse
        );
        return;
      }

      const updatedContext: QueryContext = {
        ...conversationContext,
        previousIntent: nlpResponse.intent,
        conversationHistory: [
          ...conversationContext.conversationHistory,
          userInput,
        ],
        currentQuery: userInput,
        currentIntent: nlpResponse.intent,
        userPreferences: {
          ...conversationContext.userPreferences,
          ...(nlpResponse.intent.entities.category && {
            preferredCategories: Array.from(
              new Set([
                ...(conversationContext.userPreferences?.preferredCategories ||
                  []),
                nlpResponse.intent.entities.category!,
              ])
            ),
          }),
          ...(nlpResponse.intent.entities.brand && {
            favoriteBrands: Array.from(
              new Set([
                ...(conversationContext.userPreferences?.favoriteBrands || []),
                nlpResponse.intent.entities.brand!,
              ])
            ),
          }),
          ...(nlpResponse.intent.entities.priceRange && {
            priceRange: {
              min:
                nlpResponse.intent.entities.priceRange.min ||
                conversationContext.userPreferences?.priceRange?.min ||
                0,
              max:
                nlpResponse.intent.entities.priceRange.max ||
                conversationContext.userPreferences?.priceRange?.max ||
                1000,
            },
          }),
        },
      };

      setConversationContext(updatedContext);
      const needsMoreInfo = await checkForFollowUpQuestions(
        nlpResponse,
        updatedContext
      );
      if (needsMoreInfo) {
        setIsTyping(false);
        return;
      }
      const aiResponse = await generateAIResponse(userInput, nlpResponse);

      let rankedProducts = aiResponse.relatedProducts || [];
      if (rankedProducts.length > 0) {
        rankedProducts = ProductRanker.rankProducts(
          rankedProducts,
          updatedContext,
          userInput,
          nlpResponse.intent,
          {
            maxResults: nlpResponse.intent.parameters.limit || 5,
            considerSeasonality: true,
            boostNewProducts: true,
            weights: {
              relevance: 3.0,
              rating: 2.0,
              category: 1.5,
              price: 1.2,
              popularity: 1.0,
            },
          }
        );
        rankedProducts.forEach((product, index) => {
          const popularityPoints = 5 - Math.min(index, 4);
          for (let i = 0; i < popularityPoints; i++) {
            ProductRanker.trackPopularity(product.id, "view");
          }
        });
      }

      const quickReplies = generateQuickReplies(
        nlpResponse,
        rankedProducts,
        updatedContext
      );

      const aiMessage: Message = {
        id: messages.length + 2,
        text: aiResponse.response,
        sender: "ai",
        timestamp: new Date(),
        relatedProducts: rankedProducts,
        action: aiResponse.action,
        intentData: nlpResponse,
        quickReplies: quickReplies.slice(0, 4),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I apologize, but I'm having trouble processing your request. Could you try rephrasing that?",
        sender: "ai",
        timestamp: new Date(),
        quickReplies: ["Try again", "Start over", "Help me"],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const checkForFollowUpQuestions = async (
    nlpResponse: NLPResponse,
    context: QueryContext
  ): Promise<boolean> => {
    const intent = nlpResponse.intent;


    if (intent.type === "show_products") {
      if (
        !intent.entities.category &&
        context.userPreferences?.preferredCategories?.length === 0
      ) {
        const question =
          "What type of clothing are you looking for? (jackets, hoodies, pants, gloves, etc.)";
        askFollowUpQuestion(question, "category");
        return true;
      }

      if (
        !intent.entities.priceRange &&
        context.userPreferences?.priceRange?.max === 1000
      ) {
        const question =
          "What's your budget range? (e.g., under ₹500, between ₹200-₹400)";
        askFollowUpQuestion(question, "price");
        return true;
      }
    }


    if (intent.type === "show_recommendations") {
      if (context.userPreferences?.preferredCategories?.length === 0) {
        const question =
          "What's your style? I can recommend based on casual, formal, sporty, or streetwear styles.";
        askFollowUpQuestion(question, "style");
        return true;
      }
    }

    return false;
  };

  const askFollowUpQuestion = (
    question: string,
    expectedResponse: ConversationState["expectedResponse"]
  ) => {
    const aiMessage: Message = {
      id: messages.length + 2,
      text: question,
      sender: "ai",
      timestamp: new Date(),
      quickReplies: getQuickRepliesForQuestion(expectedResponse),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setConversationState({
      isAskingForPreferences: true,
      waitingForResponse: true,
      currentQuestion: question,
      expectedResponse: expectedResponse,
    });
    setIsTyping(false);
  };

  const handleFollowUpResponse = async (
    response: string,
    expectedResponse: ConversationState["expectedResponse"],
    nlpResponse: NLPResponse
  ) => {
    const updatedContext = { ...conversationContext };

    switch (expectedResponse) {
      case "category":
        if (!updatedContext.userPreferences)
          updatedContext.userPreferences = {};
        updatedContext.userPreferences.preferredCategories = [
          ...(updatedContext.userPreferences.preferredCategories || []),
          ...extractCategoriesFromResponse(response),
        ];
        break;

      case "price":
        const priceRange = extractPriceRangeFromResponse(response);
        if (priceRange) {
          if (!updatedContext.userPreferences)
            updatedContext.userPreferences = {};
          updatedContext.userPreferences.priceRange = priceRange;
        }
        break;

      case "style":
        const styles = extractStylesFromResponse(response);
        if (styles.length > 0) {
          setUserProfile((prev) => ({
            ...prev,
            stylePreferences: [...prev.stylePreferences, ...styles],
          }));
        }
        break;
    }

    setConversationContext(updatedContext);
    setConversationState({
      isAskingForPreferences: false,
      waitingForResponse: false,
      currentQuestion: undefined,
      expectedResponse: undefined,
    });


    const aiResponse = await generateAIResponse(response, nlpResponse);

    let rankedProducts = aiResponse.relatedProducts || [];
    if (rankedProducts.length > 0) {
      rankedProducts = ProductRanker.rankProducts(
        rankedProducts,
        updatedContext,
        response,
        nlpResponse.intent
      );
    }

    const aiMessage: Message = {
      id: messages.length + 2,
      text: `Great! Based on your preference for ${response}, here are my suggestions:`,
      sender: "ai",
      timestamp: new Date(),
      relatedProducts: rankedProducts,
      action: aiResponse.action,
      intentData: nlpResponse,
      quickReplies: generateQuickReplies(
        nlpResponse,
        rankedProducts,
        updatedContext
      ),
    };

    setMessages((prev) => [...prev, aiMessage]);
  };

  const generateQuickReplies = (
    nlpResponse: NLPResponse,
    products: Product[],
    context: QueryContext
  ): string[] => {
    const replies: string[] = [];
    const intent = nlpResponse.intent;

    switch (intent.type) {
      case "show_products":
        if (intent.entities.category) {
          replies.push(`More ${intent.entities.category}`);
          replies.push(`Best rated ${intent.entities.category}`);
          replies.push(`${intent.entities.category} under ₹300`);
        }
        if (intent.entities.priceRange?.max) {
          replies.push(`Cheaper than ₹${intent.entities.priceRange.max}`);
        }
        replies.push("Show all categories");
        break;

      case "show_recommendations":
        replies.push("Show trending");
        replies.push("Best sellers");
        replies.push("New arrivals");
        break;

      case "price_query":
        replies.push("Under ₹200");
        replies.push("₹200-₹400");
        replies.push("Premium items");
        break;

      case "comparison":

        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.sender === "user") {
          const userText = lastMessage.text;

          const productKeywords = ["jacket", "hoodie", "pants", "gloves", "shirt", "sweater"];
          const foundKeyword = productKeywords.find(keyword =>
            userText.toLowerCase().includes(keyword)
          );

          if (foundKeyword) {
            replies.push(`More like this ${foundKeyword}`);
            replies.push(`Compare with other ${foundKeyword}s`);
            replies.push(`Alternatives to this ${foundKeyword}`);
          } else if (products.length > 0) {
            replies.push(`More like ${products[0].name}`);
            replies.push(`Compare ${products[0].name} with others`);
          }
        }
        replies.push("Show all comparisons");
        break;

      default:
        replies.push("Show me jackets");
        replies.push("Recommend something");
        replies.push("What's trending?");
        replies.push("Help me choose");
    }

    if (userProfile.stylePreferences.length > 0) {
      replies.push(`More ${userProfile.stylePreferences[0]} style`);
    }


    if (products.length > 0) {
      const firstProduct = products[0];
      replies.push(`Similar to ${firstProduct.name}`);
      replies.push(`More from ${firstProduct.brand}`);
    }

    return [...new Set(replies)].slice(0, 4);
  };

  const getQuickRepliesForQuestion = (
    expectedResponse?: ConversationState["expectedResponse"]
  ): string[] => {
    switch (expectedResponse) {
      case "category":
        return ["Jackets", "Hoodies", "Pants", "Gloves", "All categories"];
      case "price":
        return ["Under ₹200", "₹200-₹400", "₹400-₹600", "Any price"];
      case "style":
        return ["Casual", "Formal", "Sporty", "Streetwear", "Any style"];
      default:
        return ["Yes", "No", "Maybe later"];
    }
  };

  const extractCategoriesFromResponse = (response: string): string[] => {
    const categories = ["Jacket", "Hoodie", "Pants", "Gloves"];
    return categories.filter((category) =>
      response.toLowerCase().includes(category.toLowerCase())
    );
  };

  const extractPriceRangeFromResponse = (
    response: string
  ): { min: number; max: number } | undefined => {
    const underMatch = response.match(/under\s*₹?\s*(\d+)/i);
    if (underMatch) return { min: 0, max: parseInt(underMatch[1]) };

    const betweenMatch = response.match(/(\d+)\s*[-to]+\s*(\d+)/i);
    if (betweenMatch)
      return { min: parseInt(betweenMatch[1]), max: parseInt(betweenMatch[2]) };

    return undefined;
  };

  const extractStylesFromResponse = (response: string): string[] => {
    const styles = [
      "casual",
      "formal",
      "sporty",
      "streetwear",
      "elegant",
      "minimalist",
      "bold",
    ];
    return styles.filter((style) => response.toLowerCase().includes(style));
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          const demoCommands = [
            "Show me jackets under ₹400",
            "What are the best hoodies?",
            "Recommend trending products",
            "Show me Wink brand items",
            "I need something for a party",
            "What should I wear in winter?",
            "Compare Wink hoodie with other brands",
          ];
          const randomCommand =
            demoCommands[Math.floor(Math.random() * demoCommands.length)];
          setInput(randomCommand);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 2000);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hi there! 👋 I'm your personal fashion assistant. What can I help you with today?",
        sender: "ai",
        timestamp: new Date(),
        quickReplies: [
          "Show me jackets",
          "Recommend something",
          "What's trending?",
          "Help me choose",
        ],
      },
    ]);
    setConversationContext({
      conversationHistory: [],
      userPreferences: {
        preferredCategories: [],
        priceRange: { min: 0, max: 1000 },
        favoriteBrands: [],
      },
      currentQuery: "",
      currentIntent: undefined,
    });
    setConversationState({
      isAskingForPreferences: false,
      waitingForResponse: false,
      currentQuestion: undefined,
      expectedResponse: undefined,
    });
    setSelectedProduct(null);
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    setTimeout(() => handleSend(), 100);
  };

  const handleProductAction = async (
    product: Product,
    action: "view" | "like" | "save" | "compare"
  ) => {
    switch (action) {
      case "view":
        setSelectedProduct(product);
        ProductRanker.trackPopularity(product.id, "view");


        const similarViewed = await SimilarProductFinder.findSimilarProducts(
          product,
          3
        );

        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "ai",
            timestamp: new Date(),
            text: `People who liked ${product.name} also explored these.`,
            relatedProducts: similarViewed.map(s => s.product),
          }
        ]);
        break;

      case "like":
        ProductRanker.trackPopularity(product.id, "click");

        const complementary = await SimilarProductFinder.findComplementaryProducts(
          product,
          3
        );

        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "ai",
            timestamp: new Date(),
            text: `Nice pick. These pair well with ${product.name}:`,
            relatedProducts: complementary.map(c => c.product),
          }
        ]);
        break;

      case "save":
        setUserProfile((prev) => ({
          ...prev,
          savedProducts: [...prev.savedProducts, product.id],
        }));
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: `✅ Saved ${product.name} to your favorites! I'll consider this for future recommendations.`,
            sender: "ai",
            timestamp: new Date(),
            quickReplies: [
              "Show my saved items",
              "Find similar",
              "Continue shopping",
            ],
          },
        ]);
        break;

      case "compare":

        const similarForComparison = await SimilarProductFinder.findSimilarProducts(
          product,
          3
        );

        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "ai",
            timestamp: new Date(),
            text: `Comparing ${product.name} with similar alternatives:`,
            relatedProducts: similarForComparison.map(s => s.product),
            action: "comparison",
          }
        ]);
        break;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getSuggestedPrompts = () => {
    const basePrompts = [
      "Show me jackets",
      "Products under ₹300",
      "Recommendations",
      "Wink brand products",
      "What's trending?",
      "Help me choose",
      "Compare products",
    ];

    if (userProfile.stylePreferences.length > 0) {
      return [
        `More ${userProfile.stylePreferences[0]} style`,
        `Best ${userProfile.stylePreferences[0]} items`,
        "Show all styles",
        "New arrivals",
      ];
    }

    return basePrompts;
  };

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
  };

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
  };

  const getRankingBadge = (product: Product, index: number, total: number) => {
    if (total <= 1) return null;

    const topThreeColors = [
      "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
      "bg-gray-500/20 border-gray-500/40 text-gray-400",
      "bg-amber-800/20 border-amber-800/40 text-amber-400",
    ];

    if (index < 3) {
      return (
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${topThreeColors[index]} flex items-center gap-1`}
        >
          <Crown className="w-2.5 h-2.5" />#{index + 1}
        </span>
      );
    }

    return null;
  };

  const getSeasonalBadge = (category: string) => {
    const seasonalMultiplier = ProductRanker.getSeasonalMultiplier(category);
    if (seasonalMultiplier >= 1.5) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full border border-blue-500/40 bg-blue-500/20 text-blue-400 flex items-center gap-1">
          <Zap className="w-2.5 h-2.5" />
          Seasonal
        </span>
      );
    }
    return null;
  };

  const getValueBadge = (product: Product) => {
    const value = ProductRanker.calculateProductValue(product);
    if (value > 0.3) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full border border-green-500/40 bg-green-500/20 text-green-400 flex items-center gap-1">
          <Award className="w-2.5 h-2.5" />
          Best Value
        </span>
      );
    }
    return null;
  };

  const getSimilarityBadge = (similarityScore: number) => {
    if (similarityScore > 0.8) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full border border-purple-500/40 bg-purple-500/20 text-purple-400 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          Highly Similar
        </span>
      );
    } else if (similarityScore > 0.6) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full border border-blue-500/40 bg-blue-500/20 text-blue-400 flex items-center gap-1">
          <Star className="w-2.5 h-2.5" />
          Good Match
        </span>
      );
    }
    return null;
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-linear-to-br from-purple-600 via-yellow-500 to-pink-600 shadow-2xl border-2 border-yellow-300 flex items-center justify-center group"
      >
        <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-spin-slow" />
        <div className="absolute inset-1 rounded-full bg-neutral-950 shadow-inner" />
        <div className="relative z-10 flex items-center justify-center">
          <Bot className="w-7 h-7 text-blue-400 group-hover:text-blue-300 transition-colors" />
        </div>
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400">
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-40" />
        </div>
        <div className="absolute -top-12 right-0 bg-black/90 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-yellow-300">
          AI Fashion Assistant
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-black/90 rotate-45"></div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed z-50 bg-neutral-900 border border-yellow-300/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col
<<<<<<< Updated upstream
              ${isFullscreen 
                ? "inset-0 m-4 rounded-2xl" 
=======
              ${isFullscreen
                ? "inset-0 m-4 rounded-2xl"
>>>>>>> Stashed changes
                : "bottom-24 right-8 w-96 h-[600px]"
              }`}
            style={
              isFullscreen
                ? {
                  position: "fixed",
                  top: "1rem",
                  left: "1rem",
                  right: "1rem",
                  bottom: "1rem",
                  height: "auto",
                }
                : undefined
            }
          >
            <div className="p-5 bg-linear-to-r from-neutral-800 to-neutral-900 border-b border-yellow-300/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold  bg-gradient-to-r from-purple-600 to-blue-300  text-transparent inline-block bg-clip-text">NebulaAI</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Fashion Assistant</span>
                    {conversationContext.conversationHistory.length > 0 && (
                      <span className="text-xs text-purple-400 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {conversationContext.conversationHistory.length}
                      </span>
                    )}
                    {userProfile.savedProducts.length > 0 && (
                      <span className="text-xs text-pink-400 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {userProfile.savedProducts.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {conversationState.waitingForResponse && (
                  <div className="text-xs px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400">
                    ✨ Personalizing...
                  </div>
                )}
                {conversationContext.previousIntent &&
                  !conversationState.waitingForResponse && (
                    <div className="text-xs px-2 py-1 rounded-full bg-black/50 border border-white/10">
                      {conversationContext.previousIntent.type.replace(
                        "_",
                        " "
                      )}
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

            <div
              className={`flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/50 ${isFullscreen ? "min-h-0" : ""
                }`}
            >
              {messages.map((message) => (
                <div key={message.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${message.sender === "user"
                          ? "bg-linear-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30"
                          : `${getIntentColor(
                            message.intentData?.intent.type
                          )} border`
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.sender === "ai" ? (
                          getIntentIcon(message.intentData?.intent.type)
                        ) : (
                          <User className="w-4 h-4 text-blue-400" />
                        )}
                        <span className="text-xs font-medium text-blue-300">
                          {message.sender === "ai" ? "AI Assistant" : "You"}
                        </span>
                        {message.intentData && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/50 border border-white/10">
                            {message.intentData.intent.type.replace("_", " ")}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 mb-3 whitespace-pre-line">
                        {message.text}
                      </p>

                      {message.intentData &&
                        message.intentData.intent.confidence < 0.7 && (
                          <div className="text-xs text-gray-500 mb-2">
                            Confidence:{" "}
                            {(
                              message.intentData.intent.confidence * 100
                            ).toFixed(0)}
                            %
                          </div>
                        )}

<<<<<<< Updated upstream
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
=======
                      {message.sender === "ai" &&
                        message.relatedProducts &&
                        message.relatedProducts.length > 0 && (
                          <div className="mt-3 border-t border-white/10 pt-3">
                            <div className="flex items-center gap-2 mb-2">
                              {message.action === "comparison" ? (
                                <Sparkles className="w-4 h-4 text-purple-300" />
                              ) : message.action === "show_recommendations" ? (
                                <TrendingUp className="w-4 h-4 text-yellow-300" />
                              ) : (
                                <ShoppingBag className="w-4 h-4 text-yellow-300" />
                              )}
                              <span className="text-xs font-medium text-yellow-300">
                                {message.action === "show_recommendations"
                                  ? "Top Recommendations"
                                  : message.action === "price_query"
                                    ? "Price Matches"
                                    : message.action === "comparison"
                                      ? "Comparison Products"
                                      : "Related Products"}
                              </span>
                              <span className="text-xs text-gray-400 ml-auto">
                                {message.relatedProducts.length} products
                              </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {message.relatedProducts.map((product, index) => {

                                const isSimilarityBased = message.text.includes("similar") ||
                                  message.text.includes("also explored") ||
                                  message.text.includes("pair well");

                                return (
                                  <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-black/30 border border-white/10 rounded-lg p-3 hover:border-yellow-300/30 transition-all cursor-pointer hover:scale-[1.02] relative group"
                                  >
                                    { }
                                    <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                                      {getRankingBadge(
                                        product,
                                        index,
                                        message.relatedProducts!.length
                                      )}
                                      {getSeasonalBadge(product.category)}
                                      {getValueBadge(product)}
                                      {isSimilarityBased && (
                                        <span className="text-xs px-2 py-0.5 rounded-full border border-purple-500/40 bg-purple-500/20 text-purple-400">
                                          <Sparkles className="w-2.5 h-2.5 inline mr-1" />
                                          Related
                                        </span>
                                      )}
                                    </div>

                                    { }
                                    <div className="absolute -top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleProductAction(product, "like");
                                        }}
                                        className="p-1 bg-blue-500/20 border border-blue-500/30 rounded hover:bg-blue-500/30"
                                        title="Like"
                                      >
                                        <ThumbsUp className="w-3 h-3 text-blue-400" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleProductAction(product, "save");
                                        }}
                                        className="p-1 bg-pink-500/20 border border-pink-500/30 rounded hover:bg-pink-500/30"
                                        title="Save"
                                      >
                                        <Heart className="w-3 h-3 text-pink-400" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleProductAction(product, "compare");
                                        }}
                                        className="p-1 bg-purple-500/20 border border-purple-500/30 rounded hover:bg-purple-500/30"
                                        title="Compare"
                                      >
                                        <Filter className="w-3 h-3 text-purple-400" />
                                      </button>
                                    </div>

                                    <div
                                      className="flex items-center gap-3"
                                      onClick={() =>
                                        handleProductAction(product, "view")
                                      }
                                    >
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
                                            <h4 className="text-xs font-medium text-white">
                                              {product.name}
                                            </h4>
                                            <p className="text-xs text-gray-400">
                                              {product.brand} • {product.category}
                                            </p>
                                          </div>
                                          <span className="text-xs font-bold text-yellow-300">
                                            ₹{product.price}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                          <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                              <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full ${i < Math.floor(product.rating)
                                                    ? "bg-yellow-400"
                                                    : "bg-gray-700"
                                                  }`}
                                              />
                                            ))}
                                          </div>
                                          <span className="text-xs text-gray-400 ml-1">
                                            {product.rating}
                                          </span>
                                          {message.intentData?.intent.entities
                                            .priceRange && (
                                              <span
                                                className={`text-xs ml-2 px-1 rounded ${product.price <=
                                                    (message.intentData.intent
                                                      .entities.priceRange.max ||
                                                      Infinity)
                                                    ? "text-green-400 bg-green-400/10"
                                                    : "text-red-400 bg-red-400/10"
                                                  }`}
                                              >
                                                {product.price <=
                                                  (message.intentData.intent.entities
                                                    .priceRange.max || Infinity)
                                                  ? "In budget"
                                                  : "Over budget"}
                                              </span>
                                            )}
                                          {isSimilarityBased && (
                                            <span className="text-xs ml-2 px-1 rounded text-purple-400 bg-purple-400/10">
                                              Pairs well
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                            {message.relatedProducts.length > 3 && (
                              <p className="text-xs text-gray-400 mt-2">
                                +{message.relatedProducts.length - 3} more
                                products
                              </p>
                            )}
>>>>>>> Stashed changes
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
                    className="bg-neutral-900 border border-blue-300/30 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {selectedProduct.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {selectedProduct.brand} • {selectedProduct.category}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {getSeasonalBadge(selectedProduct.category)}
                            {getValueBadge(selectedProduct)}
                            <span className="text-xs px-2 py-0.5 rounded-full border border-purple-500/40 bg-purple-500/20 text-purple-400">
                              ⭐ {selectedProduct.rating}/5
                            </span>
                          </div>
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
<<<<<<< Updated upstream
                                    className={`w-3 h-3 rounded-full ${i < Math.floor(selectedProduct.rating) ? 'bg-yellow-400' : 'bg-gray-700'}`}
=======
                                    className={`w-3 h-3 rounded-full ${i < Math.floor(selectedProduct.rating)
                                        ? "bg-yellow-400"
                                        : "bg-gray-700"
                                      }`}
>>>>>>> Stashed changes
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-300">
                                {selectedProduct.rating}/5
                              </span>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium rounded-lg flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Add to Cart
                          </button>
                        </div>

                        {selectedProduct.description && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">
                              Description
                            </h4>
                            <p className="text-sm text-gray-400">
                              {selectedProduct.description}
                            </p>
                          </div>
                        )}

                        <div className="pt-4 border-t border-white/10">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">
                            Product Details
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-400">Category</div>
                            <div className="text-white">
                              {selectedProduct.category}
                            </div>
                            <div className="text-gray-400">Brand</div>
                            <div className="text-white">
                              {selectedProduct.brand}
                            </div>
                            <div className="text-gray-400">Price</div>
                            <div className="text-white">
                              ₹{selectedProduct.price}
                            </div>
                            <div className="text-gray-400">Rating</div>
                            <div className="text-white">
                              {selectedProduct.rating}/5
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 space-y-2">
                          <button
                            onClick={() => {
                              setInput(
                                `Tell me more about ${selectedProduct.name}`
                              );
                              closeProductDetails();
                              if (inputRef.current) {
                                inputRef.current.focus();
                              }
                            }}
                            className="w-full py-2 border border-yellow-300/30 text-yellow-300 rounded-lg hover:bg-yellow-300/10 transition-colors"
                          >
                            <Bot className="w-4 h-4" />
                            Ask AI about this product
                          </button>
                          <button
                            onClick={() => {
                              const similarQuery = `Find products similar to ${selectedProduct.name}`;
                              setInput(similarQuery);
                              closeProductDetails();
                              if (inputRef.current) {
                                inputRef.current.focus();
                              }
                            }}
                            className="w-full py-2 border border-purple-300/30 text-purple-300 rounded-lg hover:bg-purple-300/10 transition-colors flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            Find similar products
                          </button>
                          <button
                            onClick={() => {
                              const compareQuery = `Compare ${selectedProduct.name} with others`;
                              setInput(compareQuery);
                              closeProductDetails();
                              if (inputRef.current) {
                                inputRef.current.focus();
                              }
                            }}
                            className="w-full py-2 border border-blue-300/30 text-blue-300 rounded-lg hover:bg-blue-300/10 transition-colors flex items-center justify-center gap-2"
                          >
                            <Filter className="w-4 h-4" />
                            Compare with alternatives
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {!isFullscreen && messages.length <= 4 && (
              <div className="px-4 pb-3">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedPrompts().map((prompt, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleQuickReply(prompt)}
                      className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-lg transition-all hover:scale-105 active:scale-95"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            <div className="p-4 border-t border-neutral-800 bg-neutral-900 space-y-3">
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 p-3 bg-linear-to-br from-red-500/10 to-purple-500/10 border border-red-500/30 rounded-lg"
                >
                  <div className="relative">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                    <Mic className="w-5 h-5 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-sm text-red-300">
                    Listening... Speak now
                  </span>
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
<<<<<<< Updated upstream
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${isListening ? "text-red-400" : "text-gray-400 hover:text-yellow-300"}`}
=======
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${isListening
                        ? "text-red-400"
                        : "text-gray-400 hover:text-yellow-300"
                      }`}
>>>>>>> Stashed changes
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
                    className="hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear chat
                  </button>
                  {userProfile.savedProducts.length > 0 && (
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
                      className="hover:text-blue-300 transition-colors"
                    >
                      Exit fullscreen (ESC)
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    AI Active
                  </span>
                  <span>Press Enter to send</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}