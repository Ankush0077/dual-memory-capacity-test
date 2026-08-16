# Dual-Store Memory Capacity Test

## 1. What I built and why
I chose to build a **Dual-Store Memory Capacity Test**, an interactive cognitive psychology experiment designed to simultaneously evaluate a user's Working Memory (WM) and Long-Term Memory (LTM). 

**Why I chose this:** 
The prompt asked for a complex project that demonstrates critical thinking and problem-solving. Instead of building a standard CRUD application, I wanted to build something that required first-principles thinking around *human behavior and cognitive limits*, and then mapping those psychological constraints into software logic. Testing memory accurately online is notoriously difficult because participants often cheat or find loopholes. I built this to programmatically close those loopholes (like cognitive overload, task evasion, and variable retention intervals) and deliver scientifically valid data in real-time.

## 2. Architecture and design
I intentionally chose a lightweight, highly secure, and fast-to-deploy stack.

*   **Tech Stack:** Plain HTML, CSS, and Vanilla JavaScript.
*   **Architecture Decision:** I initially considered building a Node.js backend with a MongoDB database to store user results. However, from a product perspective, a database is overkill for a standalone frontend assignment. More importantly, I wanted to prioritize the **User Experience (UX)**. Instead of sending data to a void, I built a client-side Single Page Application (SPA) that processes the user's reaction times and accuracy entirely in the browser. 
*   **Design:** I avoided heavy frameworks like React because this application is essentially a timed sequence of screens. I used SPA logic by toggling CSS classes via Vanilla JS. This keeps the bundle size practically zero, ensuring millisecond-accurate timing for the cognitive trials without framework overhead.

## 3. Decision-making
This project required several key decisions to ensure the experiment yielded valid data rather than just frustrating the user.

*   **Decision 1: Pseudowords to prevent "Working Memory Crash"**
    *   *Reasoning:* Human working memory can only hold ~7 items. If a user sees 4 strings of completely random letters (e.g., "XQZPM"), the brain processes that as 20 distinct items, causing an immediate cognitive crash. I wrote a generator that alternates Consonants and Vowels (e.g., C-V-C-C like "ZOMP"). This allows the brain to "chunk" the letters phonologically into a single pronounceable item, making the test challenging but scientifically viable.
*   **Decision 2: Changing from Keyboard Typing to Serial Multiple Choice**
    *   *Reasoning:* Initially, I planned to have users type the sequence back. However, this introduces a massive "Typing Speed confound." Slow typers would artificially delay their own memory retrieval, ruining the data. I switched to a **Serial Position Recognition Task** (asking for Word 1, then Word 2 via buttons). This eliminates the typing variable and allows me to measure **Chronometrics (Reaction Time in milliseconds)**.
*   **Decision 3: Time-Boxing the Distractor Task & Adding a "Pass Quota"**
    *   *Reasoning:* To test Long-Term permanent memory at the end, I had to flush the user's working memory using a distractor task. If the task relies solely on a timer, a smart user will engage in "Task Evasion" (sitting in silence and rehearsing the target words). 
    *   *Solution:* I implemented a "Rapid Word-Match" distractor. The user faces a strict 20-second timer (ensuring an equal retention interval for every participant), but they *must* correctly identify and select at least 7 target words before the time runs out. Flooding their verbal processing centers with new text forces them to abandon rehearsal.
*   **Decision 4: Closing the Product Loop (Instant Cognitive Feedback)**
    *   *Reasoning:* Completing a grueling 5-minute memory test only to see a blank "Thank You" screen is a terrible user experience. I added a final calculation engine that parses the user's 42 data points on the fly. It grades their accuracy, averages their reaction times, and uses normative hardcoded rules to generate a personalized "Cognitive Profile" (e.g., placing them in a top percentile). This turns the experiment into a complete, satisfying product.

## 4. Links
*   **GitHub repository:** `https://github.com/Ankush0077/dual-memory-capacity-test`
*   **Deployment:** `dual-memory-capacity-test-nq035dwwr-ankush-c7de.vercel.app`
