import logging
from typing import List, Optional, Tuple
from datetime import datetime
from config import settings

log = logging.getLogger("chatbot-service")

# Try importing Gemini API SDK
try:
    import google.generativeai as genai
    _HAS_GEMINI = True
except ImportError:
    _HAS_GEMINI = False
    genai = None

class ChatbotService:
    _gemini_initialized = False

    @classmethod
    def initialize(cls):
        if not settings.GEMINI_API_KEY:
            log.warning("Gemini API key not found — using demo mode")
            return

        if _HAS_GEMINI and not cls._gemini_initialized:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                cls._gemini_initialized = True
                log.info("[SUCCESS] Gemini API initialized successfully")
            except Exception as e:
                log.error(f"[ERROR] Failed to initialize Gemini API: {e}")

    @classmethod
    async def generate_response(
        cls, 
        message: str, 
        chat_history: Optional[List[dict]] = None, 
        prediction_history: Optional[List[dict]] = None
    ) -> Tuple[str, bool]:
        """
        Generate AI chatbot response using Gemini API, with a context-aware fallback.
        Returns:
            Tuple[response_text, context_used]
        """
        cls.initialize()
        
        # Prepare context from prediction history if available
        context_str = ""
        context_used = False
        if prediction_history and len(prediction_history) > 0:
            context_used = True
            history_lines = []
            for i, p in enumerate(prediction_history[:3]): # last 3 predictions
                title = p.get('title') or "Untitled"
                label = p.get('label')
                conf = p.get('confidence', 0.0) * 100
                snippet = p.get('text_snippet', '')[:100]
                history_lines.append(
                    f"- \"{title}\" (Snippet: {snippet}...): Classified as {label} with {conf:.1f}% confidence."
                )
            
            context_str = (
                "\n\n[USER PREDICTION CONTEXT]\n"
                "The user has recently analyzed the following articles using our classifier:\n"
                + "\n".join(history_lines) + "\n"
                "Use this history to answer any of their questions about their results, or reference it to explain why certain indicators (like loaded language or formatting) might cause an article to be flagged."
            )

        # 1. Use real Gemini API if initialized
        if cls._gemini_initialized and _HAS_GEMINI:
            try:
                # System prompt instructions (Truth Lens AI Identity & Answer Style)
                system_instruction = (
                    "You are Truth Lens AI, a professional AI analyst specialized in Fake News Detection, "
                    "Misinformation, Source Credibility, Fact Checking, Media Literacy, Journalism Ethics, "
                    "Explainable AI, AI Predictions, and News Verification.\n\n"
                    "Crucial Guidelines:\n"
                    "1. Always introduce yourself as: 'Truth Lens AI'.\n"
                    "2. Never behave like ChatGPT or a generic AI assistant. Maintain your professional identity as a dedicated news verification analyst.\n"
                    "3. Keep your focus entirely on news verification, credibility assessment, and media literacy.\n"
                    "4. If a user asks a question unrelated to news, fact-checking, or credibility, answer it briefly and then redirect naturally back to the Truth Lens domain (e.g., 'While I can help you with that, my primary role is to analyze news credibility. Let's redirect to verifying claims or headlines. What news statement can I analyze for you today?').\n"
                    "5. Do not claim absolute certainty. Acknowledge that machine learning models provide probability-based indicators, and explain any uncertainty clearly.\n"
                    "6. Never fabricate sources, links, or facts. If you do not know or do not have enough information, say so clearly.\n\n"
                    "Answer Style Requirements:\n"
                    "Every answer MUST contain the following structured sections (use Markdown headings, bold text, and bullet points):\n"
                    "### 📝 Short Summary\n"
                    "[A brief summary of your answer]\n\n"
                    "### 🔍 Detailed Explanation\n"
                    "[A thorough analysis, explanation, or context]\n\n"
                    "### 💡 Professional Advice\n"
                    "[Your advice as a professional news analyst]\n\n"
                    "### 🚀 Next Steps\n"
                    "[Actionable steps the user should take to verify or learn more]\n\n"
                    "### 🛡 Trusted Sources (when appropriate)\n"
                    "[List trusted fact-checking platforms, databases, or outlets if relevant to the query]\n\n"
                    "Never answer in a single sentence. Use professional formatting."
                )
                
                # We use gemini-1.5-flash as it is fast and supports system instructions
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=system_instruction
                )
                
                # Format and clean up the last 15 messages for conversational history
                formatted_history = []
                if chat_history:
                    # Slice to last 15 messages
                    history_window = chat_history[-15:]
                    for msg in history_window:
                        role = "user" if msg.get("role") == "user" else "model"
                        content = (msg.get("content") or "").strip()
                        if not content:
                            continue
                        # Prevent duplicate consecutive messages
                        if formatted_history and formatted_history[-1]["role"] == role and formatted_history[-1]["parts"][0] == content:
                            continue
                        formatted_history.append({
                            "role": role,
                            "parts": [content]
                        })

                # Combine the current message with user prediction context if available
                full_message = message
                if context_str:
                    full_message = f"{context_str}\n\nUser Question: {message}"

                # Native Gemini multi-turn chat session with system_instruction and history
                chat = model.start_chat(history=formatted_history)
                response = chat.send_message(full_message)
                return response.text.strip(), context_used
                
            except Exception as e:
                log.error(f"Gemini generation error: {e}. Falling back to demo mode.")

        # 2. Local Fallback Demo Mode (Keyword Matching)
        response_text, context_used = cls._demo_response(message, context_str, context_used)
        log.info("Using demo fallback response for message: %s", message)
        return response_text, context_used

    @classmethod
    def _demo_response(cls, message: str, context_str: str, context_used: bool) -> Tuple[str, bool]:
        msg_lower = message.lower().strip()
        
        # 1. "What is fake news?"
        if any(p in msg_lower for p in ["what is fake news", "define fake news", "explain fake news"]):
            reply = (
                "### 📝 Short Summary\n"
                "Fake news refers to false, misleading, or manipulated content presented as news, designed to deceive or manipulate audiences.\n\n"
                "### 🔍 Detailed Explanation\n"
                "* **Definition**: Fabricated stories, imposter content, manipulated media, or biased propaganda disguised as objective journalism.\n"
                "* **Examples**: Altered video clips, fabricated health cures (e.g. bleach as a cure), or false political statements.\n"
                "* **Risks**: It erodes public trust, causes social division, and leads to real-world harm.\n"
                "* **How AI Detects It**: Deep learning models (like our fine-tuned RoBERTa engine) analyze text semantics, emotional intensity, structural cues, and clickbait patterns.\n"
                "* **How Users Can Verify It**: Perform lateral reading, check credentials of authors/publishers, and verify citations.\n\n"
                "### 💡 Professional Advice\n"
                "Adopt a 'verify-first' attitude. Never rely on the headline alone; read the content and inspect who is funding or sponsoring the source.\n\n"
                "### 🚀 Next Steps\n"
                "1. Cross-reference the headline on major search engines.\n"
                "2. Evaluate the publisher's history on media bias databases.\n"
                "3. Scan the author's prior publications for standard editorial compliance.\n\n"
                "### 🛡 Trusted Sources\n"
                "* [Snopes](https://www.snopes.com)\n"
                "* [PolitiFact](https://www.politifact.com)\n"
                "* [FactCheck.org](https://www.factcheck.org)"
            )
        # 2. "Why was my article predicted as fake?" or "Why is this fake?"
        elif any(p in msg_lower for p in ["why is this fake", "why was my article predicted as fake", "why fake", "why flagged"]):
            reply = (
                "### 📝 Short Summary\n"
                "Articles are classified as fake when the model detects syntactic, semantic, or structural markers commonly associated with misleading reporting.\n\n"
                "### 🔍 Detailed Explanation\n"
                "* **Prediction & Confidence**: Your article was evaluated by the classifier, resulting in a specific prediction and confidence score.\n"
                "* **Credibility Score**: Computed based on language quality, objectivity, and reliability patterns.\n"
                "* **Indicators & Top Keywords**: Misleading articles typically display indicators like clickbait phrasing, biased emotional hooks, loaded vocabulary, and lack of named sources.\n"
                "* **Explainable AI**: The system highlights these specific keyword markers to explain why the model made its decision.\n\n"
                "### 💡 Professional Advice\n"
                "Analyze the flagged keywords. If they consist of emotional modifiers or unsupported assertions, the content is likely opinion or propaganda rather than objective reporting.\n\n"
                "### 🚀 Next Steps\n"
                "1. Inspect the 'AI Insights' panel on your dashboard.\n"
                "2. Review the highlighted phrases and keywords.\n"
                "3. Compare the writing style with standard news agency guidelines (e.g., Reuters, AP).\n\n"
                "### 🛡 Trusted Sources\n"
                "* [Reuters Fact Check](https://www.reuters.com/fact-check/)\n"
                "* [AP Fact Check](https://apnews.com/hub/ap-fact-check)"
            )
        # 3. "What does confidence mean?" or "Explain confidence."
        elif any(p in msg_lower for p in ["explain confidence", "what does confidence mean", "what is confidence"]):
            reply = (
                "### 📝 Short Summary\n"
                "In Truth Lens, confidence represents the model's statistical certainty when classifying text—it is not a guarantee of absolute accuracy.\n\n"
                "### 🔍 Detailed Explanation\n"
                "* **Confidence vs. Accuracy**: Confidence measures how strongly the patterns in your text align with the dataset patterns the model was trained on. A model can be highly confident but wrong, or have low confidence on new, unseen language styles.\n"
                "* **Model Certainty**: Higher confidence scores (e.g., 90%+) indicate a clear match with known signals, while lower scores (e.g., under 60%) indicate ambiguous patterns or missing context.\n"
                "* **Low Confidence Handling**: Any analysis with low confidence requires immediate manual cross-referencing and verification.\n\n"
                "### 💡 Professional Advice\n"
                "Treat AI predictions as helpful signals, not absolute truth. Low-confidence results should be treated with heightened skepticism.\n\n"
                "### 🚀 Next Steps\n"
                "1. Check the detailed indicators and top keywords.\n"
                "2. Cross-reference the article's claims with trusted primary sources.\n"
                "3. Run a manual search on reputable fact-checking platforms."
            )
        # 4. "Can I trust this source?" or "Recommend trusted sources."
        elif any(p in msg_lower for p in ["can i trust this source", "recommend trusted sources", "trusted sources", "trust sources"]):
            reply = (
                "### 📝 Short Summary\n"
                "Evaluating source credibility involves checking publisher reputation, transparency, and standard professional ethics.\n\n"
                "### 🔍 Detailed Explanation\n"
                "* **Source Credibility**: Credible news sources have editorial oversight, corrections policies, and clearly distinguish between opinion and fact.\n"
                "* **Publisher Reputation**: Established outlets have a history of reliable reporting and are transparent about their funding and authorship.\n"
                "* **Verification Methods**: Cross-checking claims across multiple independent outlets is the most reliable way to verify a story.\n\n"
                "### 💡 Professional Advice\n"
                "A trustworthy source is transparent about its mistakes. Look for correction logs and author bios before trusting a site's reporting.\n\n"
                "### 🚀 Next Steps\n"
                "1. Perform an 'About us' check on the source.\n"
                "2. Search for the publisher on media bias databases.\n"
                "3. Cross-reference the claim with other verified news agencies.\n\n"
                "### 🛡 Trusted Sources\n"
                "* [Associated Press (AP)](https://apnews.com)\n"
                "* [Reuters](https://www.reuters.com)\n"
                "* [FactCheck.org](https://www.factcheck.org)"
            )
        # 5. "What did I ask previously?"
        elif any(p in msg_lower for p in ["what did i ask previously", "previous question", "remember what"]):
            reply = (
                "### 📝 Short Summary\n"
                "I am tracking our ongoing conversation session. You can ask me to refer back to any of our previous topics.\n\n"
                "### 🔍 Detailed Explanation\n"
                "Our interactive chat session retains conversational context. If you previously asked about a specific claim, source, or confidence score, we can continue that analysis here without starting over.\n\n"
                "### 💡 Professional Advice\n"
                "Keeping a consistent thread of questions helps you build a structured investigation into complex news stories.\n\n"
                "### 🚀 Next Steps\n"
                "* Let me know if you would like me to expand on one of the topics we discussed earlier in this session.\n"
                "* Feel free to ask: 'What was the confidence score of the last claim we analyzed?'"
            )
        # 6. "Analyze this article."
        elif any(p in msg_lower for p in ["analyze this article", "analyze article", "check article"]):
            reply = (
                "### 📝 Short Summary\n"
                "To analyze an article, please provide its headline, text body, or claim.\n\n"
                "### 🔍 Detailed Explanation\n"
                "You can paste any text you would like evaluated directly into this chat, or enter it into the main analyzer input on the Dashboard. I will look for stylistic indicators of misinformation, highlight critical keywords, and report on credibility.\n\n"
                "### 💡 Professional Advice\n"
                "For the most accurate assessment, include the complete claim or major paragraphs of the article rather than just a single name or word.\n\n"
                "### 🚀 Next Steps\n"
                "1. Paste your article content in the message input below.\n"
                "2. Wait for me to parse and score the text patterns."
            )
        # 7. Greeting / Hello
        elif any(p in msg_lower for p in ["hello", "hi", "hey"]):
            reply = (
                "### 📝 Short Summary\n"
                "Welcome! I am **Truth Lens AI**, your specialized news credibility and fact-checking analyst.\n\n"
                "### 🔍 Detailed Explanation\n"
                "I am designed to help you navigate today's complex media landscape. Using machine learning insights and structured credibility assessments, I can analyze articles, explain model confidence, and guide you on fact-checking methodologies.\n\n"
                "### 💡 Professional Advice\n"
                "Always verify sensational headlines before sharing. Misinformation thrives on emotional reactions.\n\n"
                "### 🚀 Next Steps\n"
                "* Submit an article headline or body text for credibility analysis.\n"
                "* Ask me questions like: 'What is fake news?' or 'Explain confidence.'\n"
                "* Provide a news source to evaluate its reputation."
            )
        # 8. Unrelated / general question redirect
        else:
            reply = (
                "### 📝 Short Summary\n"
                "I am **Truth Lens AI**, your news credibility and fact-checking assistant.\n\n"
                "### 🔍 Detailed Explanation\n"
                "While I can provide brief general answers, my system is optimized to help you analyze news articles, detect misinformation, interpret AI predictions, and understand source credibility.\n\n"
                "### 💡 Professional Advice\n"
                "In an era of digital information overload, adopting a critical mindset and fact-checking regular claims is essential.\n\n"
                "### 🚀 Next Steps\n"
                "* Let's redirect our session to evaluating a news claim. Please paste a statement or headline you would like to analyze.\n"
                "* Ask me: 'What is fake news?' or 'Explain confidence.'\n\n"
                "### 🛡 Trusted Sources\n"
                "* [PolitiFact](https://www.politifact.com)"
            )
            
            if context_used:
                reply += (
                    "\n\n*I also noticed your recent predictions: they can help me explain this kind of question more accurately if you want to share a specific example.*"
                )

        return reply, context_used
