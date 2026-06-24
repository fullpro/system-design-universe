/**
 * Foundations Lessons — structured beginner curriculum content.
 *
 * Each level follows the Problem → Consequence → Solution → Tradeoff pattern.
 * Content is pure data so the rendering layer stays independent.
 */

export interface AnimationStep {
  id: string;
  label: string;
  description: string;
  /** Nodes visible at this step (cumulative). */
  nodes: { id: string; label: string; icon: string; color: string }[];
  /** Edges visible at this step (cumulative). */
  edges: { from: string; to: string; label?: string }[];
}

export interface QuizItem {
  question: string;
  options: { text: string; correct: boolean; explanation: string }[];
}

export interface LessonSection {
  id: string;
  title: string;
  icon: string;
  /** Short hook that poses the problem. */
  problem: string;
  /** What goes wrong if you ignore this. */
  consequence: string;
  /** The concept that addresses the problem. */
  solution: string;
  /** The cost of the solution. */
  tradeoff: string;
  /** One-sentence beginner definition. */
  simpleDefinition: string;
  /** Real-world analogy. */
  mentalModel: string;
  /** The original problem it was invented to solve. */
  whyItExists: string;
  /** How users encounter it in daily life. */
  realExample: string;
  /** Common beginner mistakes. */
  commonMistakes: string[];
  /** Ids of related glossary terms. */
  relatedTerms: string[];
  /** Concept ids that link to existing concept library. */
  linkedConcepts: string[];
}

export interface FoundationLevel {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  /** Interactive animation steps for this level. */
  animation?: AnimationStep[];
  /** Lesson sections within this level. */
  sections: LessonSection[];
  /** Quiz questions for this level. */
  quiz: QuizItem[];
}

export const FOUNDATION_LEVELS: FoundationLevel[] = [
  // ── Level 1: What Happens When You Open a Website? ──────────────
  {
    id: "web-request",
    number: 1,
    title: "What Happens When You Open a Website?",
    subtitle: "The journey of a single request across the internet",
    icon: "Globe",
    accent: "#7dd3fc",
    animation: [
      {
        id: "step-1",
        label: "The simplest picture",
        description: "You type google.com and your browser sends a request to a server, which sends back a response.",
        nodes: [
          { id: "browser", label: "Browser", icon: "Monitor", color: "#7dd3fc" },
          { id: "internet", label: "Internet", icon: "Cloud", color: "#a5b4fc" },
          { id: "server", label: "Server", icon: "Server", color: "#34d399" },
        ],
        edges: [
          { from: "browser", to: "internet", label: "Request" },
          { from: "internet", to: "server" },
          { from: "server", to: "browser", label: "Response" },
        ],
      },
      {
        id: "step-2",
        label: "But how does it find the server?",
        description: "Your browser doesn't know where google.com lives. It asks DNS — the internet's phonebook — to translate the name into an IP address.",
        nodes: [
          { id: "browser", label: "Browser", icon: "Monitor", color: "#7dd3fc" },
          { id: "dns", label: "DNS", icon: "BookOpen", color: "#fbbf24" },
          { id: "server", label: "Server", icon: "Server", color: "#34d399" },
        ],
        edges: [
          { from: "browser", to: "dns", label: "What's google.com?" },
          { from: "dns", to: "browser", label: "142.250.80.46" },
          { from: "browser", to: "server", label: "Request" },
          { from: "server", to: "browser", label: "Response" },
        ],
      },
      {
        id: "step-3",
        label: "What if the server is far away?",
        description: "If you're in Tokyo and the server is in New York, every request travels 14,000 km. A CDN keeps a copy of the content closer to you.",
        nodes: [
          { id: "browser", label: "Browser", icon: "Monitor", color: "#7dd3fc" },
          { id: "dns", label: "DNS", icon: "BookOpen", color: "#fbbf24" },
          { id: "cdn", label: "CDN", icon: "Globe", color: "#22d3ee" },
          { id: "server", label: "Server", icon: "Server", color: "#34d399" },
        ],
        edges: [
          { from: "browser", to: "dns" },
          { from: "dns", to: "browser" },
          { from: "browser", to: "cdn", label: "Nearby copy?" },
          { from: "cdn", to: "browser", label: "Cached!" },
          { from: "cdn", to: "server", label: "Miss → origin" },
        ],
      },
      {
        id: "step-4",
        label: "The full picture",
        description: "A real production system: DNS resolves the address, CDN serves static content, a load balancer splits traffic across servers, and a database stores the data.",
        nodes: [
          { id: "browser", label: "Browser", icon: "Monitor", color: "#7dd3fc" },
          { id: "dns", label: "DNS", icon: "BookOpen", color: "#fbbf24" },
          { id: "cdn", label: "CDN", icon: "Globe", color: "#22d3ee" },
          { id: "lb", label: "Load Balancer", icon: "GitBranch", color: "#a78bfa" },
          { id: "app", label: "Application", icon: "Cpu", color: "#34d399" },
          { id: "db", label: "Database", icon: "Database", color: "#fbbf24" },
        ],
        edges: [
          { from: "browser", to: "dns" },
          { from: "dns", to: "browser" },
          { from: "browser", to: "cdn" },
          { from: "browser", to: "lb" },
          { from: "lb", to: "app", label: "Distributed" },
          { from: "app", to: "db", label: "Query" },
          { from: "db", to: "app", label: "Data" },
        ],
      },
    ],
    sections: [
      {
        id: "browser",
        title: "The Browser",
        icon: "Monitor",
        problem: "Humans can't speak HTTP. We need a translator.",
        consequence: "Without a browser, you'd have to manually craft network packets to view a webpage.",
        solution: "The browser translates your clicks and URLs into HTTP requests and renders the responses as visual pages.",
        tradeoff: "Browsers add overhead — parsing, rendering, JavaScript execution — but make the web usable for humans.",
        simpleDefinition: "The application you use to access the internet — Chrome, Firefox, Safari.",
        mentalModel: "A browser is like a travel agent: you say where you want to go, and it handles all the bookings.",
        whyItExists: "The web was built for humans, but computers speak in packets. The browser bridges that gap.",
        realExample: "Right now, you're using a browser to read this page. It fetched HTML, CSS, and JavaScript, then assembled them into what you see.",
        commonMistakes: [
          "Thinking the browser is the internet — it's just one client.",
          "Assuming the browser only makes one request per page load (it often makes dozens).",
        ],
        relatedTerms: ["client", "http", "request", "response"],
        linkedConcepts: ["client"],
      },
      {
        id: "dns-intro",
        title: "DNS — The Internet's Phonebook",
        icon: "BookOpen",
        problem: "Computers use IP addresses (numbers), but humans remember names. How do we translate?",
        consequence: "Without DNS, you'd need to memorize 142.250.80.46 instead of typing google.com.",
        solution: "DNS translates domain names into IP addresses — a distributed, hierarchical lookup system.",
        tradeoff: "DNS adds a lookup step before every new connection, adding latency. DNS caching mitigates this.",
        simpleDefinition: "A system that translates website names into the numeric addresses computers need.",
        mentalModel: "DNS is the internet's phonebook — you look up a name, it gives you the number.",
        whyItExists: "Humans remember names, not numbers. DNS lets us navigate by names while computers route by numbers.",
        realExample: "When you type google.com, your device asks a DNS server for the IP address before it can connect.",
        commonMistakes: [
          "Thinking DNS only runs once — it runs for every new domain you visit.",
          "Not realizing DNS results are cached, which is why domain changes take time to propagate.",
        ],
        relatedTerms: ["dns", "ip-address", "ttl", "cache"],
        linkedConcepts: ["dns"],
      },
    ],
    quiz: [
      {
        question: "What does DNS do?",
        options: [
          { text: "Translates domain names to IP addresses", correct: true, explanation: "DNS is the internet's phonebook — it converts human-readable names like google.com into numeric IP addresses." },
          { text: "Encrypts data sent over the internet", correct: false, explanation: "That's TLS/SSL, not DNS." },
          { text: "Stores website files closer to users", correct: false, explanation: "That's a CDN (Content Delivery Network)." },
          { text: "Distributes traffic across multiple servers", correct: false, explanation: "That's a load balancer." },
        ],
      },
      {
        question: "Your website loads slowly for users in Australia, but your server is in New York. Which solution helps most?",
        options: [
          { text: "Add a CDN", correct: true, explanation: "A CDN caches content at edge servers worldwide, so Australian users get content from a nearby server instead of New York." },
          { text: "Add more RAM to the server", correct: false, explanation: "More RAM helps if the server is slow, but doesn't fix the 14,000 km distance problem." },
          { text: "Change the DNS provider", correct: false, explanation: "DNS affects name resolution speed, but the main issue is geographic distance to the server." },
          { text: "Restart the server", correct: false, explanation: "The problem is distance, not a server issue." },
        ],
      },
      {
        question: "In the full request flow, what comes right before the application server?",
        options: [
          { text: "Load Balancer", correct: true, explanation: "The load balancer sits in front of application servers and distributes incoming requests across them." },
          { text: "Database", correct: false, explanation: "The database is behind the application server, not in front of it." },
          { text: "DNS", correct: false, explanation: "DNS resolves the address early in the flow, well before the request reaches application servers." },
          { text: "Browser", correct: false, explanation: "The browser is the starting point, not directly before the application server." },
        ],
      },
    ],
  },

  // ── Level 2: Servers ──────────────────────────────────────────────
  {
    id: "servers",
    number: 2,
    title: "Servers",
    subtitle: "The computers that power the internet",
    icon: "Server",
    accent: "#34d399",
    sections: [
      {
        id: "what-is-server",
        title: "What Is a Server?",
        icon: "Server",
        problem: "Your code needs to run somewhere accessible to users around the world.",
        consequence: "Without a server, your application only works on your laptop — nobody else can use it.",
        solution: "A server is a computer that's always on, connected to the internet, and waiting for requests.",
        tradeoff: "Servers cost money to run 24/7, need maintenance, and can fail.",
        simpleDefinition: "A computer that listens for requests and sends back responses.",
        mentalModel: "A server is like a restaurant kitchen — it waits for orders, processes them, and sends out food.",
        whyItExists: "Applications need a permanent home on the internet that's always available, not just running on someone's laptop.",
        realExample: "When you post on Instagram, your phone sends the photo to Instagram's servers, which store it and make it available to your followers.",
        commonMistakes: [
          "Thinking a server is always a physical machine — it can be a VM, container, or serverless function.",
          "Assuming one server handles one thing — a single server can run multiple applications.",
        ],
        relatedTerms: ["server", "client", "request", "response"],
        linkedConcepts: ["services"],
      },
      {
        id: "request-response",
        title: "Requests and Responses",
        icon: "ArrowLeftRight",
        problem: "Clients and servers need a structured way to communicate.",
        consequence: "Without a standard format, every application would invent its own communication protocol.",
        solution: "HTTP provides a standard request/response format: method (GET/POST), URL, headers, and body.",
        tradeoff: "HTTP is text-based and somewhat verbose. Binary protocols like gRPC are more efficient but less human-readable.",
        simpleDefinition: "A request asks the server to do something; a response is the answer.",
        mentalModel: "Like ordering at a restaurant: you place an order (request), the kitchen prepares it, and the waiter brings it to you (response).",
        whyItExists: "Communication needs structure. Without it, the client and server wouldn't understand each other.",
        realExample: "Searching on Google: your browser sends a GET request with your query, and Google responds with search results.",
        commonMistakes: [
          "Thinking every request gets a fast response — some requests trigger long computations.",
          "Not realizing a single page load triggers many requests (HTML, CSS, JS, images, API calls).",
        ],
        relatedTerms: ["request", "response", "http", "status-code"],
        linkedConcepts: ["http"],
      },
      {
        id: "what-is-api",
        title: "APIs — How Software Talks to Software",
        icon: "Plug",
        problem: "Different applications need to share data and functionality, but they're written in different languages and run on different machines.",
        consequence: "Without APIs, every integration between services would require custom, brittle code.",
        solution: "An API is a defined contract — endpoints, data formats, and rules — that lets any authorized client interact with a service.",
        tradeoff: "APIs add a layer of indirection and versioning complexity, but enable interoperability.",
        simpleDefinition: "A contract that allows two pieces of software to communicate.",
        mentalModel: "An API is like a restaurant menu — it tells you what you can order (endpoints), what you need to provide (parameters), and what you'll get back (response).",
        whyItExists: "Software systems need to talk to each other. APIs standardize that conversation.",
        realExample: "Weather apps don't run their own satellites — they call a weather API to get forecast data.",
        commonMistakes: [
          "Thinking APIs are only for web services — they exist at every level (OS, libraries, hardware).",
          "Assuming public APIs are free forever — rate limits and pricing can change.",
        ],
        relatedTerms: ["api", "rest", "http", "server"],
        linkedConcepts: ["rest", "api-gateway"],
      },
    ],
    quiz: [
      {
        question: "What is the main job of a server?",
        options: [
          { text: "Listen for requests and send back responses", correct: true, explanation: "A server's core job is to receive requests, process them, and return responses." },
          { text: "Display web pages to users", correct: false, explanation: "That's the browser's job (the client), not the server's." },
          { text: "Store files on your computer", correct: false, explanation: "That's a file system. Servers can store files, but that's not their defining purpose." },
          { text: "Connect to WiFi", correct: false, explanation: "That's a network adapter, not a server." },
        ],
      },
      {
        question: "What is an API best compared to?",
        options: [
          { text: "A restaurant menu — it lists what you can order", correct: true, explanation: "An API defines what operations are available, what inputs they need, and what they return — just like a menu." },
          { text: "A database — it stores all the data", correct: false, explanation: "APIs don't store data; they provide access to it." },
          { text: "A firewall — it blocks unauthorized access", correct: false, explanation: "Firewalls and authentication handle security, not the API itself." },
          { text: "A cable — it physically connects computers", correct: false, explanation: "APIs are logical contracts, not physical connections." },
        ],
      },
      {
        question: "HTTP status code 404 means:",
        options: [
          { text: "The requested resource was not found", correct: true, explanation: "404 means the server understood your request but couldn't find what you asked for." },
          { text: "The server crashed", correct: false, explanation: "Server errors are 5xx codes, like 500 Internal Server Error." },
          { text: "The request was successful", correct: false, explanation: "Success is 200 OK." },
          { text: "You need to log in first", correct: false, explanation: "Authentication required is 401 Unauthorized." },
        ],
      },
    ],
  },

  // ── Level 3: Databases ────────────────────────────────────────────
  {
    id: "databases",
    number: 3,
    title: "Databases",
    subtitle: "Why servers need permanent memory",
    icon: "Database",
    accent: "#fbbf24",
    sections: [
      {
        id: "why-databases",
        title: "Why Servers Need Storage",
        icon: "HardDrive",
        problem: "When you restart a server, everything in memory disappears. User data, orders, messages — all gone.",
        consequence: "Without persistent storage, your app loses everything every time it restarts or crashes.",
        solution: "Databases provide durable, organized storage that survives restarts and crashes.",
        tradeoff: "Databases are slower than in-memory operations and add operational complexity.",
        simpleDefinition: "A system for storing data permanently and querying it efficiently.",
        mentalModel: "A database is like a smart filing cabinet — it stores documents, remembers where everything is, and can find any file instantly.",
        whyItExists: "Applications need to remember things between restarts. RAM is fast but volatile; databases are durable.",
        realExample: "Your Amazon order history persists because it's stored in a database, not just in server memory.",
        commonMistakes: [
          "Thinking you can just use files — files work for small data but can't handle concurrent access or complex queries efficiently.",
          "Using a database for everything — some data (like session state) may be better in a cache.",
        ],
        relatedTerms: ["database", "sql", "nosql"],
        linkedConcepts: ["database"],
      },
      {
        id: "sql-vs-nosql",
        title: "SQL vs NoSQL",
        icon: "Table",
        problem: "Not all data fits neatly into rows and columns. Some data is hierarchical, some is graph-shaped, some is just key-value pairs.",
        consequence: "Using the wrong database type leads to awkward data models, poor performance, and painful migrations.",
        solution: "SQL databases use structured tables with relationships; NoSQL databases offer flexible schemas for documents, key-value pairs, graphs, and wide columns.",
        tradeoff: "SQL gives you strong consistency and powerful queries but is harder to scale horizontally. NoSQL scales easily but may sacrifice consistency or query flexibility.",
        simpleDefinition: "SQL = structured tables with strict rules. NoSQL = flexible formats for different data shapes.",
        mentalModel: "SQL is like a spreadsheet with strict columns. NoSQL is like a folder of JSON files — flexible but less structured.",
        whyItExists: "Different data has different shapes. A user profile, a social graph, and a time-series log all need different storage strategies.",
        realExample: "Instagram uses PostgreSQL (SQL) for user data and Cassandra (NoSQL) for the activity feed — different data, different needs.",
        commonMistakes: [
          "Thinking NoSQL means 'no SQL at all' — many NoSQL databases have SQL-like query languages.",
          "Choosing NoSQL because it's trendy — SQL is often the right default choice.",
        ],
        relatedTerms: ["sql", "nosql", "database"],
        linkedConcepts: ["database", "nosql"],
      },
    ],
    quiz: [
      {
        question: "Why can't servers just use files to store data?",
        options: [
          { text: "Files can't handle concurrent access or complex queries efficiently", correct: true, explanation: "When thousands of users read and write simultaneously, files become a bottleneck. Databases handle concurrency and indexing." },
          { text: "Files are always slower than databases", correct: false, explanation: "For simple cases, files can be faster. The issue is concurrency, querying, and reliability at scale." },
          { text: "Files can't store large amounts of data", correct: false, explanation: "Files can store huge amounts — the problem is organizing and querying that data efficiently." },
          { text: "Files get deleted when the server restarts", correct: false, explanation: "Files persist across restarts. The issue isn't durability but concurrent access and query capabilities." },
        ],
      },
      {
        question: "When should you prefer a SQL database?",
        options: [
          { text: "When your data has clear relationships and you need complex queries", correct: true, explanation: "SQL excels at structured data with relationships (users, orders, products) and complex joins and aggregations." },
          { text: "When you need to store millions of records", correct: false, explanation: "Both SQL and NoSQL handle millions of records. The choice depends on data shape and query patterns, not size alone." },
          { text: "When you want the fastest possible reads", correct: false, explanation: "A cache (like Redis) is faster for reads. SQL vs NoSQL is about data modeling, not raw speed." },
          { text: "When you need horizontal scaling above all else", correct: false, explanation: "NoSQL databases are typically easier to scale horizontally. SQL databases can scale but it's more complex." },
        ],
      },
      {
        question: "What does 'durable storage' mean?",
        options: [
          { text: "Data survives server restarts and crashes", correct: true, explanation: "Durability means written data is safe even if the power goes out or the process crashes." },
          { text: "Data is encrypted at rest", correct: false, explanation: "Encryption protects confidentiality, not durability. Durable data can still be unencrypted." },
          { text: "Data is replicated to multiple servers", correct: false, explanation: "Replication improves availability and durability, but durability fundamentally means surviving restarts — even a single-node database on disk is durable." },
          { text: "Data can never be deleted", correct: false, explanation: "Durable doesn't mean permanent. You can delete data from a durable store; durability just means it won't vanish unexpectedly." },
        ],
      },
    ],
  },

  // ── Level 4: Scaling ──────────────────────────────────────────────
  {
    id: "scaling",
    number: 4,
    title: "Scaling",
    subtitle: "What happens when one server isn't enough",
    icon: "TrendingUp",
    accent: "#818cf8",
    animation: [
      {
        id: "scale-1",
        label: "100 users — no problem",
        description: "A single server handles 100 users easily. CPU and memory are barely used.",
        nodes: [
          { id: "users", label: "100 Users", icon: "Users", color: "#7dd3fc" },
          { id: "server", label: "Server", icon: "Server", color: "#34d399" },
          { id: "db", label: "Database", icon: "Database", color: "#fbbf24" },
        ],
        edges: [
          { from: "users", to: "server" },
          { from: "server", to: "db" },
        ],
      },
      {
        id: "scale-2",
        label: "10,000 users — getting warm",
        description: "The server starts sweating. Response times climb. Some requests timeout. You need more power.",
        nodes: [
          { id: "users", label: "10K Users", icon: "Users", color: "#fbbf24" },
          { id: "server", label: "Server (HOT)", icon: "Server", color: "#f87171" },
          { id: "db", label: "Database", icon: "Database", color: "#fbbf24" },
        ],
        edges: [
          { from: "users", to: "server", label: "Overloaded!" },
          { from: "server", to: "db" },
        ],
      },
      {
        id: "scale-3",
        label: "Add a load balancer",
        description: "Instead of one huge server, use multiple servers behind a load balancer. Each server handles a portion of the traffic.",
        nodes: [
          { id: "users", label: "10K Users", icon: "Users", color: "#7dd3fc" },
          { id: "lb", label: "Load Balancer", icon: "GitBranch", color: "#a78bfa" },
          { id: "s1", label: "Server 1", icon: "Server", color: "#34d399" },
          { id: "s2", label: "Server 2", icon: "Server", color: "#34d399" },
          { id: "s3", label: "Server 3", icon: "Server", color: "#34d399" },
          { id: "db", label: "Database", icon: "Database", color: "#fbbf24" },
        ],
        edges: [
          { from: "users", to: "lb" },
          { from: "lb", to: "s1" },
          { from: "lb", to: "s2" },
          { from: "lb", to: "s3" },
          { from: "s1", to: "db" },
          { from: "s2", to: "db" },
          { from: "s3", to: "db" },
        ],
      },
      {
        id: "scale-4",
        label: "1,000,000 users",
        description: "At this scale, the database becomes the bottleneck. You'll need caching, read replicas, and eventually sharding.",
        nodes: [
          { id: "users", label: "1M Users", icon: "Users", color: "#7dd3fc" },
          { id: "lb", label: "Load Balancer", icon: "GitBranch", color: "#a78bfa" },
          { id: "s1", label: "Servers (×10)", icon: "Server", color: "#34d399" },
          { id: "cache", label: "Cache", icon: "Zap", color: "#fb7185" },
          { id: "db", label: "Database (HOT)", icon: "Database", color: "#f87171" },
        ],
        edges: [
          { from: "users", to: "lb" },
          { from: "lb", to: "s1" },
          { from: "s1", to: "cache", label: "Hot data" },
          { from: "s1", to: "db", label: "Bottleneck!" },
        ],
      },
    ],
    sections: [
      {
        id: "single-server-limit",
        title: "The Single Server Limit",
        icon: "AlertTriangle",
        problem: "Your server can only handle so many requests. CPU, memory, and network all have limits.",
        consequence: "When traffic exceeds the limit, requests queue up, response times spike, and eventually users get errors.",
        solution: "Add more servers and distribute traffic across them.",
        tradeoff: "Multiple servers mean you need coordination — load balancing, shared state management, and deployment across machines.",
        simpleDefinition: "Every server has a maximum capacity. Beyond it, performance degrades.",
        mentalModel: "One cashier can only serve so many customers per hour. At some point, you need more cashiers.",
        whyItExists: "Physics limits single machines. No amount of optimization makes one server infinitely fast.",
        realExample: "A startup's single server crashes on launch day when 100x expected traffic hits it.",
        commonMistakes: [
          "Thinking you can just 'buy a bigger server' forever — vertical scaling has a ceiling.",
          "Premature scaling — don't add complexity until you actually need it.",
        ],
        relatedTerms: ["server", "scaling", "latency", "throughput"],
        linkedConcepts: ["scaling-types"],
      },
      {
        id: "load-balancer-intro",
        title: "Load Balancers",
        icon: "GitBranch",
        problem: "You have multiple servers, but how does traffic get split between them?",
        consequence: "Without a load balancer, all traffic hits one server while others sit idle.",
        solution: "A load balancer sits in front of your servers and distributes requests using strategies like round-robin or least connections.",
        tradeoff: "The load balancer itself becomes a critical component — if it fails, everything is unreachable. You need redundant load balancers.",
        simpleDefinition: "A traffic cop that distributes requests across multiple servers.",
        mentalModel: "A load balancer is like a traffic police officer at a busy intersection, directing cars to different lanes.",
        whyItExists: "When you have multiple servers, someone needs to decide which one handles each request.",
        realExample: "Netflix uses load balancers to distribute millions of concurrent streams across thousands of servers.",
        commonMistakes: [
          "Forgetting that the load balancer is a single point of failure — always have at least two.",
          "Thinking load balancing is only about splitting traffic evenly — some strategies route by content, session, or server health.",
        ],
        relatedTerms: ["load-balancer", "server", "scaling", "health-check"],
        linkedConcepts: ["load-balancer"],
      },
    ],
    quiz: [
      {
        question: "Your single server is overwhelmed with traffic. What's the best first step?",
        options: [
          { text: "Add more servers behind a load balancer", correct: true, explanation: "Horizontal scaling with a load balancer distributes traffic across multiple machines." },
          { text: "Buy a more powerful server", correct: false, explanation: "Vertical scaling helps short-term but has a ceiling and is more expensive at scale." },
          { text: "Add a database", correct: false, explanation: "If the server itself is the bottleneck, adding a database doesn't help." },
          { text: "Switch to a different programming language", correct: false, explanation: "Language performance differences rarely matter more than architectural decisions like scaling." },
        ],
      },
      {
        question: "What is the main purpose of a load balancer?",
        options: [
          { text: "Distribute incoming requests across multiple servers", correct: true, explanation: "A load balancer's core job is splitting traffic so no single server bears the full load." },
          { text: "Speed up database queries", correct: false, explanation: "Load balancers handle request routing, not database optimization." },
          { text: "Encrypt data in transit", correct: false, explanation: "That's TLS. Load balancers can terminate TLS, but it's not their primary purpose." },
          { text: "Store frequently accessed data in memory", correct: false, explanation: "That's caching (like Redis), not load balancing." },
        ],
      },
      {
        question: "At 1 million users, what typically becomes the bottleneck after adding more app servers?",
        options: [
          { text: "The database", correct: true, explanation: "Once you scale app servers, all the load concentrates on the database — it becomes the new bottleneck." },
          { text: "The load balancer", correct: false, explanation: "Modern load balancers can handle millions of connections. The database is usually the first thing to struggle." },
          { text: "DNS", correct: false, explanation: "DNS handles name resolution and scales well on its own." },
          { text: "The browser", correct: false, explanation: "The browser is the client — it doesn't become a bottleneck on the server side." },
        ],
      },
    ],
  },

  // ── Level 5: Caching ──────────────────────────────────────────────
  {
    id: "caching",
    number: 5,
    title: "Caching",
    subtitle: "Why hit the database when you already know the answer?",
    icon: "Zap",
    accent: "#fb7185",
    sections: [
      {
        id: "caching-problem",
        title: "The Database Is Overloaded",
        icon: "Database",
        problem: "80% of your requests ask for the same 20% of data. The database re-computes the same answer thousands of times per second.",
        consequence: "The database becomes a bottleneck — slow queries, connection exhaustion, and cascading failures.",
        solution: "Cache frequently requested data in memory (Redis) so repeated reads never hit the database.",
        tradeoff: "Now you have two copies of data. When the database changes, the cache might serve stale data. Cache invalidation is notoriously hard.",
        simpleDefinition: "Storing frequently used data in a faster location to avoid repeated slow lookups.",
        mentalModel: "Caching is like keeping a sticky note on your monitor instead of walking to the filing cabinet every time.",
        whyItExists: "Reading from RAM is ~100x faster than reading from disk. If most reads are for the same data, cache it.",
        realExample: "Twitter caches your timeline so it doesn't rebuild it from millions of tweets on every refresh.",
        commonMistakes: [
          "Caching everything — only cache data that's read frequently and changes infrequently.",
          "Forgetting to invalidate — stale cached data causes subtle, hard-to-debug bugs.",
          "Setting TTL too high — users see outdated content. Too low — cache barely helps.",
        ],
        relatedTerms: ["cache", "redis", "ttl", "database"],
        linkedConcepts: ["cache"],
      },
      {
        id: "cache-mechanics",
        title: "Cache Hit, Miss, and TTL",
        icon: "Zap",
        problem: "How does the application decide when to use the cache vs the database?",
        consequence: "Without a clear caching strategy, you get inconsistent data or a cache that doesn't help.",
        solution: "Cache hit: data found in cache (fast). Cache miss: data not in cache, fetch from database and store it. TTL: how long cached data is considered fresh.",
        tradeoff: "Short TTL = more cache misses but fresher data. Long TTL = fewer database calls but potentially stale data.",
        simpleDefinition: "Hit means the cache had the answer. Miss means it didn't, so you ask the database.",
        mentalModel: "Like checking if a book is on the desk (hit) or if you need to walk to the library (miss). The due date is the TTL.",
        whyItExists: "Caching needs rules about what to keep, what to evict, and when data is too old to trust.",
        realExample: "Your browser caches images with a TTL — revisiting a page within the TTL loads images instantly from cache.",
        commonMistakes: [
          "Not handling cache misses gracefully — the system must still work when the cache is empty.",
          "Using cache as the primary data store — caches are ephemeral. The database is the source of truth.",
        ],
        relatedTerms: ["cache", "ttl", "redis", "database"],
        linkedConcepts: ["cache"],
      },
    ],
    quiz: [
      {
        question: "Your database is overloaded with read traffic. Which solution helps reduce read traffic?",
        options: [
          { text: "Redis cache", correct: true, explanation: "Redis stores frequently read data in memory, so repeated reads never reach the database." },
          { text: "DNS", correct: false, explanation: "DNS resolves domain names — it doesn't reduce database load." },
          { text: "TLS", correct: false, explanation: "TLS encrypts traffic — it has nothing to do with database load." },
          { text: "CDN", correct: false, explanation: "CDN helps with static content (images, CSS, JS), not database queries." },
        ],
      },
      {
        question: "What is a 'cache miss'?",
        options: [
          { text: "When the requested data is not found in the cache", correct: true, explanation: "A cache miss means the cache doesn't have the data, so the application falls back to the database." },
          { text: "When the cache server crashes", correct: false, explanation: "A crash is a failure, not a miss. A miss is normal and expected — it just means the data wasn't cached yet." },
          { text: "When the TTL is too long", correct: false, explanation: "Long TTL causes stale data, not cache misses. Actually, longer TTLs reduce misses." },
          { text: "When two caches have different data", correct: false, explanation: "That's a cache consistency issue, not a cache miss." },
        ],
      },
      {
        question: "Why is cache invalidation considered one of the hardest problems in computing?",
        options: [
          { text: "Knowing exactly when cached data becomes stale is extremely difficult", correct: true, explanation: "Data can change at any time. Ensuring the cache always reflects the latest database state — without unnecessary refreshes — is a deep coordination problem." },
          { text: "Caches run out of memory too quickly", correct: false, explanation: "Memory management is a concern, but it's a well-solved problem. Invalidation correctness is much harder." },
          { text: "Caches are too slow for production use", correct: false, explanation: "Caches are extremely fast — that's the whole point. The hard part is keeping them correct." },
          { text: "Caches can't work with databases", correct: false, explanation: "Caches work great with databases. The challenge is keeping them synchronized." },
        ],
      },
    ],
  },

  // ── Level 6: CDN ──────────────────────────────────────────────────
  {
    id: "cdn",
    number: 6,
    title: "CDN",
    subtitle: "Bringing content closer to your users",
    icon: "Globe",
    accent: "#22d3ee",
    sections: [
      {
        id: "distance-problem",
        title: "The Distance Problem",
        icon: "MapPin",
        problem: "Your server is in Virginia, but your users are in Tokyo, Sydney, and Berlin. Physics limits how fast data can travel.",
        consequence: "Users far from the server experience high latency — pages load slowly, images take seconds, and the experience feels broken.",
        solution: "A CDN places copies of your content on edge servers around the world. Users are served from the nearest location.",
        tradeoff: "CDN adds cost and complexity. Dynamic content (personalized pages) can't always be cached at the edge. You also need cache invalidation strategies.",
        simpleDefinition: "A worldwide network of servers that stores copies of your content closer to users.",
        mentalModel: "A CDN is like having local warehouses in every city instead of shipping everything from one factory.",
        whyItExists: "Light travels at ~200km/ms in fiber. New York to Tokyo is ~11,000km = ~55ms minimum. A CDN edge in Tokyo serves content in <5ms.",
        realExample: "Netflix streams from CDN servers near you. Without CDN, all 230 million subscribers would hit servers in one location — impossible.",
        commonMistakes: [
          "Thinking CDN only works for static files — modern CDNs can also cache API responses and dynamic content.",
          "Forgetting to set appropriate cache headers — without them, the CDN won't cache anything.",
          "Not considering CDN cache invalidation when content changes.",
        ],
        relatedTerms: ["cdn", "latency", "cache", "ttl"],
        linkedConcepts: ["cdn"],
      },
    ],
    quiz: [
      {
        question: "Why does a CDN improve website speed for international users?",
        options: [
          { text: "It serves content from a server geographically close to the user", correct: true, explanation: "CDN edge servers around the world mean users fetch content from nearby, reducing the physical distance data must travel." },
          { text: "It compresses all data before sending", correct: false, explanation: "Compression helps, but CDNs primarily help by reducing physical distance. Compression can be done without a CDN." },
          { text: "It uses faster internet cables", correct: false, explanation: "CDNs use the same internet infrastructure. The improvement comes from shorter distances, not faster cables." },
          { text: "It bypasses DNS resolution", correct: false, explanation: "CDNs actually rely on DNS to route users to the nearest edge server." },
        ],
      },
      {
        question: "What type of content benefits most from a CDN?",
        options: [
          { text: "Static content like images, CSS, and JavaScript files", correct: true, explanation: "Static content doesn't change per user, so it can be cached at edge servers and served to everyone in that region." },
          { text: "Real-time chat messages", correct: false, explanation: "Chat messages are dynamic and personalized — they need to go through the backend, not a CDN cache." },
          { text: "Database queries", correct: false, explanation: "Database queries are handled by the backend, not the CDN." },
          { text: "User authentication tokens", correct: false, explanation: "Auth tokens are unique per user and should not be cached in a CDN." },
        ],
      },
    ],
  },

  // ── Level 7: Queues ───────────────────────────────────────────────
  {
    id: "queues",
    number: 7,
    title: "Queues",
    subtitle: "When the answer doesn't need to be instant",
    icon: "ListOrdered",
    accent: "#ec4899",
    sections: [
      {
        id: "slow-tasks",
        title: "Some Tasks Take Too Long",
        icon: "Clock",
        problem: "Sending an email takes 2 seconds. Processing an uploaded image takes 5 seconds. Generating a report takes 30 seconds. Users don't want to stare at a spinner.",
        consequence: "Synchronous processing blocks the response — the user waits, the server thread is tied up, and throughput drops.",
        solution: "Put slow tasks into a queue. Return immediately to the user ('Your report is being generated'). Background workers process the queue.",
        tradeoff: "The user doesn't get immediate results. You need to handle failures, retries, and 'your task is still processing' states.",
        simpleDefinition: "A waiting line for tasks — work goes in one end, workers process it from the other.",
        mentalModel: "A queue is like the ticket counter at a deli — you take a number, and someone calls you when your order is ready.",
        whyItExists: "Not all work needs to happen during the user's request. Queues let you defer heavy work without blocking the user.",
        realExample: "When you upload a video to YouTube, it returns immediately. The video is processed (encoding, thumbnails) by background workers.",
        commonMistakes: [
          "Not handling failed queue items — messages can fail, and you need dead letter queues and retry logic.",
          "Making queues too deep — if workers can't keep up, the queue grows forever and processing delays increase.",
          "Using a queue when synchronous processing is fine — don't add complexity for tasks that take 50ms.",
        ],
        relatedTerms: ["queue", "worker", "async", "kafka"],
        linkedConcepts: ["message-queue", "task-queue"],
      },
      {
        id: "workers",
        title: "Workers — The Behind-the-Scenes Crew",
        icon: "Cog",
        problem: "Tasks are in the queue, but who processes them?",
        consequence: "Without workers, the queue fills up and nothing gets done.",
        solution: "Worker processes poll the queue, pick up tasks, process them, and acknowledge completion. Add more workers to increase throughput.",
        tradeoff: "Workers need monitoring, scaling rules, and failure handling. A stuck worker can block a queue partition.",
        simpleDefinition: "Background processes that pick up and process tasks from a queue.",
        mentalModel: "Workers are like kitchen staff at a busy restaurant — they pick up order tickets and prepare dishes in the back.",
        whyItExists: "Queues store work; workers do the work. Separating them lets you scale each independently.",
        realExample: "Uber uses workers to process ride-matching, ETA calculations, and payment processing asynchronously.",
        commonMistakes: [
          "Not scaling workers with queue depth — if the queue grows, you need more workers.",
          "Not making worker operations idempotent — if a worker crashes mid-task and the message is retried, the operation should be safe to repeat.",
        ],
        relatedTerms: ["worker", "queue", "async", "scaling"],
        linkedConcepts: ["worker-service"],
      },
    ],
    quiz: [
      {
        question: "When should you use a message queue?",
        options: [
          { text: "When tasks are slow and the user doesn't need immediate results", correct: true, explanation: "Queues are ideal for deferring work that takes too long to do during a request — emails, reports, image processing." },
          { text: "When you need to store user data permanently", correct: false, explanation: "That's a database, not a queue. Queues are for transient task processing." },
          { text: "When you want to make your API faster", correct: false, explanation: "Queues don't make the underlying work faster — they move it off the hot path so the API responds quickly." },
          { text: "When you have only one server", correct: false, explanation: "You can use queues with one server, but their main value is in distributed processing across workers." },
        ],
      },
      {
        question: "What happens to a message if its worker crashes mid-processing?",
        options: [
          { text: "The message is retried (redelivered to another worker)", correct: true, explanation: "Most queue systems redeliver unacknowledged messages. This is why worker operations should be idempotent." },
          { text: "The message is permanently lost", correct: false, explanation: "Well-designed queues persist messages until acknowledged. A crash triggers redelivery, not loss." },
          { text: "The entire queue stops processing", correct: false, explanation: "Other workers continue processing. Only the affected message is retried." },
          { text: "The user receives an error immediately", correct: false, explanation: "The user already received a response ('processing…'). Queue failures are handled asynchronously." },
        ],
      },
    ],
  },

  // ── Level 8: Reliability ──────────────────────────────────────────
  {
    id: "reliability",
    number: 8,
    title: "Reliability",
    subtitle: "What happens when things break — and they will",
    icon: "Shield",
    accent: "#ef4444",
    sections: [
      {
        id: "things-fail",
        title: "Everything Fails Eventually",
        icon: "AlertTriangle",
        problem: "Servers crash. Networks partition. Disks fill up. Third-party services go down. Your system must handle all of this.",
        consequence: "Without resilience patterns, a single failure cascades through the system and takes everything down.",
        solution: "Build resilience into the system: retries for transient failures, timeouts to bound waiting, circuit breakers to stop cascading failures, and failover to switch to healthy replicas.",
        tradeoff: "Resilience adds complexity. Every pattern (retry, circuit breaker, failover) has edge cases and failure modes of its own.",
        simpleDefinition: "Designing systems that keep working even when individual components fail.",
        mentalModel: "Reliability engineering is like designing a plane with two engines — it can fly on one if the other fails.",
        whyItExists: "In distributed systems, failures aren't exceptions — they're the norm. Building for reliability means accepting this reality.",
        realExample: "When AWS has an outage in one region, well-designed services fail over to another region automatically.",
        commonMistakes: [
          "Assuming retries always fix the problem — they can make things worse (thundering herd).",
          "Not setting timeouts — a missing timeout means one slow dependency can hang your entire system.",
          "Testing only the happy path — chaos engineering means intentionally breaking things to verify resilience.",
        ],
        relatedTerms: ["retry", "timeout", "circuit-breaker", "failover"],
        linkedConcepts: ["retry", "circuit-breaker", "failover"],
      },
      {
        id: "circuit-breaker-intro",
        title: "Circuit Breakers",
        icon: "ShieldOff",
        problem: "A downstream service is failing. Your service keeps calling it, each call times out after 5 seconds, tying up threads and cascading the failure.",
        consequence: "Your service becomes as slow as the failing service. Users experience timeouts across the board.",
        solution: "A circuit breaker monitors failure rates. When failures exceed a threshold, it 'opens' and immediately returns errors (fast fail) instead of waiting. Periodically, it allows test requests to check if the service recovered.",
        tradeoff: "When the circuit is open, the functionality provided by the downstream service is unavailable — you need fallback behavior.",
        simpleDefinition: "A safety switch that stops calling a broken service and fails fast instead.",
        mentalModel: "Like an electrical circuit breaker in your house — when there's a short circuit, it trips to prevent fire.",
        whyItExists: "Hammering a failing service makes things worse for everyone. Circuit breakers protect both the caller and the failing service.",
        realExample: "Netflix's Hystrix (now resilience4j) circuit breaker prevents one failing microservice from taking down the entire streaming platform.",
        commonMistakes: [
          "Setting thresholds too low — the circuit opens on normal variance and blocks healthy traffic.",
          "Setting thresholds too high — the circuit never opens and failures cascade anyway.",
          "Not having fallback behavior — when the circuit opens, returning a useful degraded response is better than a raw error.",
        ],
        relatedTerms: ["circuit-breaker", "retry", "timeout", "failover"],
        linkedConcepts: ["circuit-breaker"],
      },
    ],
    quiz: [
      {
        question: "A downstream service is intermittently failing. Your application calls it without a timeout. What happens?",
        options: [
          { text: "Your application threads pile up waiting, eventually making your service unresponsive too", correct: true, explanation: "Without timeouts, slow/failing calls block threads indefinitely. Eventually all threads are waiting and your service can't handle any requests." },
          { text: "Your application automatically retries until it succeeds", correct: false, explanation: "Without explicit retry logic, the application just waits forever — it doesn't retry automatically." },
          { text: "The operating system kills the slow connection after 60 seconds", correct: false, explanation: "OS-level TCP timeouts exist but are often very long (minutes). Application-level timeouts should be much shorter." },
          { text: "Nothing happens — failed calls just return null", correct: false, explanation: "Without a timeout, the call doesn't return at all — it hangs indefinitely." },
        ],
      },
      {
        question: "What does a circuit breaker do when it 'opens'?",
        options: [
          { text: "Immediately returns an error without calling the failing service", correct: true, explanation: "An open circuit breaker 'fast fails' — it doesn't even try to call the downstream service, returning an error (or fallback) instantly." },
          { text: "Sends more traffic to the failing service to help it recover", correct: false, explanation: "That's the opposite of what you want. An open circuit breaker stops traffic to the failing service." },
          { text: "Switches to a different server automatically", correct: false, explanation: "That's failover, not a circuit breaker. A circuit breaker stops outbound calls; failover switches to replicas." },
          { text: "Logs the error and continues normally", correct: false, explanation: "A circuit breaker actively changes behavior — it stops calling the failing service, not just logs errors." },
        ],
      },
    ],
  },

  // ── Level 9: Distributed Systems ──────────────────────────────────
  {
    id: "distributed",
    number: 9,
    title: "Distributed Systems",
    subtitle: "When your system spans many machines",
    icon: "Network",
    accent: "#a78bfa",
    sections: [
      {
        id: "replication-intro",
        title: "Replication — Copies for Safety and Speed",
        icon: "Copy",
        problem: "If your single database dies, all data is lost. And one database can't serve millions of reads per second.",
        consequence: "A single database is a single point of failure and a read bottleneck.",
        solution: "Replication copies data to multiple nodes. Read replicas spread read load; replicas in other regions survive regional failures.",
        tradeoff: "Replication introduces consistency challenges — how quickly do all copies reflect a write? Synchronous replication is slow but consistent; asynchronous is fast but eventually consistent.",
        simpleDefinition: "Keeping copies of data on multiple servers for safety and performance.",
        mentalModel: "Replication is like having backup copies of important documents in different safes.",
        whyItExists: "One copy of data is fragile and limited. Multiple copies provide redundancy and read scaling.",
        realExample: "Gmail replicates your emails across multiple data centers. Even if one catches fire, your data survives.",
        commonMistakes: [
          "Assuming replicas are always perfectly in sync — there's always some lag.",
          "Reading from a replica immediately after writing — you might not see your own write (read-after-write consistency).",
        ],
        relatedTerms: ["replication", "consistency", "failover", "database"],
        linkedConcepts: ["replication", "read-replica"],
      },
      {
        id: "sharding-intro",
        title: "Sharding — Splitting Data Across Machines",
        icon: "Layers",
        problem: "Your database has so much data and so many writes that no single machine can handle it all.",
        consequence: "Write throughput hits a ceiling. The database can't grow beyond the capacity of one machine.",
        solution: "Sharding splits data across multiple databases using a shard key (e.g., user_id % 4). Each shard holds a subset of the data.",
        tradeoff: "Cross-shard queries become complex or impossible. Rebalancing shards when adding capacity is operationally painful. The shard key choice is critical and hard to change later.",
        simpleDefinition: "Splitting a large database into smaller pieces, each on its own server.",
        mentalModel: "Sharding is like dividing a phone book into A-M and N-Z volumes — each is smaller and faster to search.",
        whyItExists: "When one database can't handle the write load, you split the data so each piece is manageable.",
        realExample: "Instagram shards user data across thousands of PostgreSQL databases, keyed by user ID.",
        commonMistakes: [
          "Choosing a bad shard key — leads to hot shards (uneven distribution) or impossible queries.",
          "Sharding too early — it's complex. Exhaust simpler scaling options first.",
        ],
        relatedTerms: ["sharding", "database", "partition", "scaling"],
        linkedConcepts: ["sharding", "consistent-hashing"],
      },
      {
        id: "microservices-intro",
        title: "Microservices — Independent Services for Independent Teams",
        icon: "Boxes",
        problem: "Your monolithic application is so large that deploying one change requires coordinating across 10 teams, and a bug in the payment module crashes the search module.",
        consequence: "Slow releases, risky deployments, and tightly coupled failures.",
        solution: "Break the monolith into microservices — each service owns its domain, its data, and its deployment lifecycle.",
        tradeoff: "Network calls between services are slower and less reliable than in-process calls. Debugging distributed systems is harder. Operational overhead (deployment, monitoring, service discovery) increases.",
        simpleDefinition: "Breaking one big application into small, independent services.",
        mentalModel: "Microservices are like a food court — each stall operates independently, but they share the same building.",
        whyItExists: "Large organizations need teams to deploy independently. A monolith forces everyone to coordinate on every release.",
        realExample: "Amazon decomposed their monolith into microservices in the early 2000s, enabling independent team velocity at massive scale.",
        commonMistakes: [
          "Starting with microservices before understanding your domain — you'll draw the wrong boundaries.",
          "Creating too many tiny services — the operational overhead outweighs the benefits.",
          "Ignoring the distributed systems problems that microservices introduce.",
        ],
        relatedTerms: ["microservices", "api", "queue", "event-streaming"],
        linkedConcepts: ["services"],
      },
    ],
    quiz: [
      {
        question: "What is the primary benefit of database replication?",
        options: [
          { text: "Redundancy (data survives if a node fails) and read scaling", correct: true, explanation: "Replication provides fault tolerance and distributes read load across multiple copies." },
          { text: "Making writes faster", correct: false, explanation: "Replication can actually slow writes (synchronous replication). Its benefits are read scaling and fault tolerance." },
          { text: "Reducing storage costs", correct: false, explanation: "Replication increases storage costs because you store multiple copies." },
          { text: "Simplifying the application code", correct: false, explanation: "Replication adds complexity — you need to handle consistency and routing logic." },
        ],
      },
      {
        question: "When should you consider sharding?",
        options: [
          { text: "When a single database can't handle the write load even after other optimizations", correct: true, explanation: "Sharding is a last resort for write scaling. Try indexing, caching, read replicas, and query optimization first." },
          { text: "As the first step in scaling your database", correct: false, explanation: "Sharding is complex. Start with indexing, caching, and read replicas before resorting to sharding." },
          { text: "When you want to make queries simpler", correct: false, explanation: "Sharding makes queries harder — especially cross-shard queries." },
          { text: "When your application has many microservices", correct: false, explanation: "Microservices and sharding are independent decisions. Having microservices doesn't mean you need sharding." },
        ],
      },
    ],
  },

  // ── Level 10: Advanced Architecture ───────────────────────────────
  {
    id: "advanced",
    number: 10,
    title: "What's Next",
    subtitle: "Bridge to the full System Design Universe",
    icon: "Rocket",
    accent: "#6366f1",
    sections: [
      {
        id: "beyond-basics",
        title: "You've Learned the Fundamentals",
        icon: "Award",
        problem: "Real systems combine all these concepts — and more. How do you go deeper?",
        consequence: "Stopping at the basics leaves you unable to design or reason about production systems.",
        solution: "Continue into the full System Design Universe: Explore mode for the full architecture map, Simulate mode for traffic modeling, Evolve mode for step-by-step system growth, and the Reasoning Engine for architectural decision-making.",
        tradeoff: "Deeper knowledge requires more time, but gives you the tools to design systems used by millions.",
        simpleDefinition: "The foundations are just the beginning — now explore how everything fits together in real systems.",
        mentalModel: "You've learned the alphabet. Now it's time to read — and write — full stories.",
        whyItExists: "System design is a journey, not a destination. Each concept you've learned connects to dozens more.",
        realExample: "Every major tech company — Google, Netflix, Uber, Stripe — uses all the concepts you've learned, combined in sophisticated ways.",
        commonMistakes: [
          "Thinking you need to know everything before building — start with what you know and evolve.",
          "Forgetting the fundamentals when learning advanced topics — everything builds on these basics.",
        ],
        relatedTerms: ["scaling", "reliability", "microservices"],
        linkedConcepts: [],
      },
    ],
    quiz: [
      {
        question: "A new social media app expects millions of users. Which concepts from this course apply?",
        options: [
          { text: "All of them — you'll need load balancing, caching, CDN, queues, databases, and resilience patterns", correct: true, explanation: "Real systems at scale use every concept you've learned. The challenge is knowing when and how to apply each one." },
          { text: "Only databases and servers", correct: false, explanation: "At scale, you'll need much more than just servers and databases." },
          { text: "Only caching and CDN", correct: false, explanation: "Caching and CDN help with performance, but you also need reliability, queues, load balancing, and more." },
          { text: "None — social media requires different technology", correct: false, explanation: "Social media companies like Twitter, Instagram, and TikTok use exactly these concepts." },
        ],
      },
    ],
  },
];

export function getLevel(id: string): FoundationLevel | undefined {
  return FOUNDATION_LEVELS.find((l) => l.id === id);
}

export function getLevelByNumber(n: number): FoundationLevel | undefined {
  return FOUNDATION_LEVELS.find((l) => l.number === n);
}
