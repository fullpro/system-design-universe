/**
 * Smart Glossary — Wikipedia-style inline term definitions.
 *
 * Every technical term in the app can be looked up here. Each entry has a
 * beginner and intermediate definition, a "why it exists" explanation, and
 * links to related terms. The glossary is pure data — rendering is handled
 * by the GlossaryTooltip component.
 */

export interface GlossaryEntry {
  term: string;
  fullForm?: string;
  beginner: string;
  intermediate: string;
  whyItExists: string;
  related: string[];
  /** If this term maps to an existing concept id, link to it. */
  conceptId?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  dns: {
    term: "DNS",
    fullForm: "Domain Name System",
    beginner: "Translates website names like google.com into IP addresses that computers understand.",
    intermediate: "A hierarchical, distributed naming system that resolves human-readable domain names to IP addresses via recursive and iterative queries through root, TLD, and authoritative nameservers.",
    whyItExists: "Humans remember names, not numbers. DNS lets us type google.com instead of 142.250.80.46.",
    related: ["ip-address", "cdn", "load-balancer"],
    conceptId: "dns",
  },
  cdn: {
    term: "CDN",
    fullForm: "Content Delivery Network",
    beginner: "A network of servers around the world that stores copies of your content closer to users.",
    intermediate: "A geographically distributed network of edge servers that cache and serve static (and sometimes dynamic) content from the nearest point of presence, reducing latency and origin load.",
    whyItExists: "If your server is in New York, a user in Tokyo waits for data to travel across the world. A CDN puts a copy near Tokyo.",
    related: ["cache", "latency", "ttl"],
    conceptId: "cdn",
  },
  api: {
    term: "API",
    fullForm: "Application Programming Interface",
    beginner: "A contract that lets two pieces of software talk to each other — like a menu at a restaurant.",
    intermediate: "A defined interface (often HTTP-based with REST or RPC conventions) that exposes operations and data models, allowing clients to interact with a service without knowing its internals.",
    whyItExists: "Software systems need a structured way to communicate. Without APIs, every integration would be custom-built from scratch.",
    related: ["rest", "http", "rpc", "server"],
    conceptId: "rest",
  },
  ttl: {
    term: "TTL",
    fullForm: "Time To Live",
    beginner: "How long cached data can be reused before it must be refreshed.",
    intermediate: "A duration (in seconds or absolute timestamp) after which a cached entry is considered stale and must be revalidated or evicted. Applies to DNS records, HTTP caches, CDN edges, and application-level caches.",
    whyItExists: "Data changes over time. TTL balances freshness against performance — short TTLs mean more up-to-date data but more load; long TTLs mean better speed but potentially stale content.",
    related: ["cache", "cdn", "dns"],
  },
  tcp: {
    term: "TCP",
    fullForm: "Transmission Control Protocol",
    beginner: "A reliable way to send data over the internet — it makes sure everything arrives in order.",
    intermediate: "A connection-oriented transport protocol that provides reliable, ordered delivery of byte streams through sequence numbers, acknowledgments, and retransmission. Includes flow and congestion control.",
    whyItExists: "The internet can lose, duplicate, or reorder packets. TCP guarantees your data arrives complete and in order.",
    related: ["udp", "http", "tls"],
    conceptId: "tcp",
  },
  udp: {
    term: "UDP",
    fullForm: "User Datagram Protocol",
    beginner: "A fast way to send data — it doesn't wait to confirm delivery, so it's quicker but less reliable.",
    intermediate: "A connectionless transport protocol that sends datagrams without handshakes, acknowledgments, or ordering guarantees. Minimal overhead makes it ideal for latency-sensitive applications.",
    whyItExists: "Sometimes speed matters more than reliability — video calls, gaming, and DNS lookups use UDP because a late packet is worse than a lost one.",
    related: ["tcp", "latency"],
    conceptId: "udp",
  },
  http: {
    term: "HTTP",
    fullForm: "HyperText Transfer Protocol",
    beginner: "The language browsers and servers use to communicate — every time you load a webpage, HTTP is involved.",
    intermediate: "An application-layer request/response protocol built on TCP (or QUIC for HTTP/3). Uses methods (GET, POST, PUT, DELETE), status codes, headers, and content negotiation to transfer hypermedia resources.",
    whyItExists: "The web needed a standard way for browsers to request pages and for servers to respond. HTTP is that standard.",
    related: ["tcp", "tls", "rest", "api"],
    conceptId: "http",
  },
  tls: {
    term: "TLS",
    fullForm: "Transport Layer Security",
    beginner: "Encryption that keeps your data private as it travels over the internet — the 'S' in HTTPS.",
    intermediate: "A cryptographic protocol layered over TCP that provides confidentiality (encryption), integrity (MACs), and authentication (certificates) through a handshake that negotiates cipher suites and exchanges keys.",
    whyItExists: "Without encryption, anyone between you and the server can read or modify your data — passwords, credit cards, everything.",
    related: ["tcp", "http", "certificate"],
    conceptId: "tls",
  },
  cache: {
    term: "Cache",
    fullForm: undefined,
    beginner: "A fast temporary storage that saves frequently used data so you don't have to fetch it from the slow source every time.",
    intermediate: "An in-memory or near-compute data store (like Redis or Memcached) that serves hot data with sub-millisecond latency, absorbing read traffic that would otherwise hit the primary database.",
    whyItExists: "Databases are durable but slow. If 80% of requests ask for the same 20% of data, caching that data in memory avoids redundant disk reads.",
    related: ["redis", "ttl", "database", "cdn"],
    conceptId: "cache",
  },
  redis: {
    term: "Redis",
    fullForm: "Remote Dictionary Server",
    beginner: "A super-fast database that lives in memory (RAM) instead of on disk, used to cache data for quick access.",
    intermediate: "An open-source, in-memory data structure server supporting strings, hashes, lists, sets, sorted sets, streams, and more. Used as a cache, session store, rate limiter, pub/sub broker, and leaderboard backend.",
    whyItExists: "Reading from RAM is ~100x faster than reading from disk. Redis gives applications a shared, network-accessible memory layer.",
    related: ["cache", "database", "ttl", "replication"],
  },
  kafka: {
    term: "Kafka",
    fullForm: "Apache Kafka",
    beginner: "A system for sending messages between applications — like a durable conveyor belt that never loses items.",
    intermediate: "A distributed, append-only commit log that provides durable, ordered, replayable event streaming. Producers write to topic partitions; consumer groups read in parallel with at-least-once or exactly-once semantics.",
    whyItExists: "When many services need to react to the same events, point-to-point calls create tight coupling. Kafka decouples producers from consumers and retains history for replay.",
    related: ["queue", "consumer-group", "event-streaming", "partition"],
  },
  latency: {
    term: "Latency",
    fullForm: undefined,
    beginner: "How long it takes for data to travel from point A to point B — the delay you feel.",
    intermediate: "The elapsed time between sending a request and receiving the first byte of the response. Includes network transit, queuing, processing, and serialization delays. Often measured as p50, p95, or p99.",
    whyItExists: "Users perceive delay. A page that loads in 100ms feels instant; 3 seconds feels broken. Understanding latency is the first step to reducing it.",
    related: ["cdn", "cache", "throughput"],
  },
  throughput: {
    term: "Throughput",
    fullForm: undefined,
    beginner: "How much work a system can do in a given time — like how many customers a restaurant can serve per hour.",
    intermediate: "The rate at which a system processes requests, typically measured in requests per second (RPS) or transactions per second (TPS). Throughput and latency are related but not identical.",
    whyItExists: "Knowing how fast your system is matters less than knowing how much total work it can handle under load.",
    related: ["latency", "scaling", "load-balancer"],
  },
  "load-balancer": {
    term: "Load Balancer",
    fullForm: undefined,
    beginner: "A traffic cop that distributes incoming requests across multiple servers so no single server gets overwhelmed.",
    intermediate: "A reverse proxy (L4 or L7) that distributes client requests across a pool of backend servers using algorithms like round-robin, least connections, or consistent hashing. Provides health checking and automatic failover.",
    whyItExists: "One server has a limit. When traffic exceeds it, you add more servers — but someone needs to split the traffic evenly. That's the load balancer.",
    related: ["server", "scaling", "reverse-proxy", "health-check"],
    conceptId: "load-balancer",
  },
  server: {
    term: "Server",
    fullForm: undefined,
    beginner: "A computer that waits for requests from other computers and sends back responses — it serves data.",
    intermediate: "A process (or machine) that listens on a network port, accepts incoming connections, processes requests according to application logic, and returns responses. Can be a bare-metal machine, a VM, a container, or a serverless function.",
    whyItExists: "Applications need a place to run. A server is the runtime that hosts your code and makes it accessible over the network.",
    related: ["client", "api", "request", "response"],
  },
  client: {
    term: "Client",
    fullForm: undefined,
    beginner: "The application a user interacts with — your browser, mobile app, or desktop program.",
    intermediate: "Any software that initiates requests to a server. In web systems, typically a browser executing JavaScript, but also mobile apps, CLI tools, other services (in service-to-service communication), or IoT devices.",
    whyItExists: "Users don't talk to servers directly. The client is the user-facing interface that translates human actions into network requests.",
    related: ["server", "api", "browser", "request"],
    conceptId: "client",
  },
  request: {
    term: "Request",
    fullForm: undefined,
    beginner: "A message sent from a client to a server asking for something — like asking a waiter for the menu.",
    intermediate: "An HTTP message containing a method (GET/POST/PUT/DELETE), URL, headers (metadata), and optionally a body (payload). The request is the input to the server's processing pipeline.",
    whyItExists: "Communication requires structure. A request is the standardized way to ask a server to do something.",
    related: ["response", "http", "api", "client"],
  },
  response: {
    term: "Response",
    fullForm: undefined,
    beginner: "The answer a server sends back after receiving a request — the data you asked for, or an error message.",
    intermediate: "An HTTP message containing a status code (200, 404, 500, etc.), headers, and a body (HTML, JSON, binary). The response encodes both the result and metadata about how to handle it (caching, content type, etc.).",
    whyItExists: "Every request needs an answer. The response tells the client whether the operation succeeded and delivers the result.",
    related: ["request", "http", "status-code", "server"],
  },
  database: {
    term: "Database",
    fullForm: undefined,
    beginner: "Organized, permanent storage for your application's data — like a smart filing cabinet that can search instantly.",
    intermediate: "A system that provides durable, structured storage with query capabilities, concurrency control (transactions), and crash recovery. Comes in relational (SQL) and non-relational (NoSQL) flavors.",
    whyItExists: "Applications need to remember things between restarts. Databases store data reliably and let you query it efficiently.",
    related: ["sql", "nosql", "cache", "replication", "sharding"],
    conceptId: "database",
  },
  sql: {
    term: "SQL",
    fullForm: "Structured Query Language",
    beginner: "A language for talking to relational databases — you describe what data you want, and the database figures out how to get it.",
    intermediate: "A declarative language for defining schemas (DDL), manipulating data (DML), and querying relational databases. Supports joins, aggregations, subqueries, transactions, and constraints like foreign keys and unique indexes.",
    whyItExists: "Relational databases organize data into tables with relationships. SQL is the standard way to interact with them — every major RDBMS supports it.",
    related: ["database", "nosql", "indexing", "transactions"],
  },
  nosql: {
    term: "NoSQL",
    fullForm: "Not Only SQL",
    beginner: "Databases that don't use traditional tables and rows — they're more flexible and can handle huge amounts of data.",
    intermediate: "A family of non-relational databases (document, key-value, wide-column, graph) that trade some SQL guarantees (joins, ACID across tables) for horizontal scalability, schema flexibility, and specialized data models.",
    whyItExists: "Not all data fits neatly into tables. When you need to scale writes across many machines or store semi-structured data, NoSQL databases offer better fits.",
    related: ["sql", "database", "sharding", "cap-theorem"],
    conceptId: "nosql",
  },
  replication: {
    term: "Replication",
    fullForm: undefined,
    beginner: "Copying data to multiple servers so if one dies, the data is still safe — and reads can be spread across copies.",
    intermediate: "Maintaining synchronized copies of data across multiple nodes. Can be synchronous (strong consistency, higher latency) or asynchronous (lower latency, eventual consistency). Enables fault tolerance and read scaling.",
    whyItExists: "One copy of data is a single point of failure. Replication provides redundancy (survive hardware failures) and read scaling (distribute load).",
    related: ["read-replica", "consistency", "failover", "database"],
    conceptId: "replication",
  },
  sharding: {
    term: "Sharding",
    fullForm: undefined,
    beginner: "Splitting your data across multiple databases based on some rule — like dividing a phonebook into A-M and N-Z.",
    intermediate: "Horizontal partitioning of data across multiple database instances (shards) using a shard key. Each shard holds a subset of the data. Enables write scaling beyond a single machine but complicates cross-shard queries and rebalancing.",
    whyItExists: "A single database has a write throughput ceiling. Sharding distributes writes across machines, but at the cost of complexity.",
    related: ["database", "consistent-hashing", "replication", "partition"],
    conceptId: "sharding",
  },
  "ip-address": {
    term: "IP Address",
    fullForm: "Internet Protocol Address",
    beginner: "A unique number that identifies a device on the internet — like a home address for your computer.",
    intermediate: "A numerical label (IPv4: 32-bit dotted decimal; IPv6: 128-bit hex) assigned to each device on a network. Used by routers to forward packets to the correct destination.",
    whyItExists: "For data to reach the right machine, every machine needs a unique address. IP addresses are the internet's addressing system.",
    related: ["dns", "tcp", "router"],
  },
  queue: {
    term: "Queue",
    fullForm: "Message Queue",
    beginner: "A waiting line for tasks — work goes in one end, and workers process it from the other end.",
    intermediate: "A broker-mediated buffer (like RabbitMQ or SQS) that decouples producers from consumers. Messages are enqueued, persisted, and delivered to workers with at-least-once semantics. Enables async processing and load leveling.",
    whyItExists: "Some tasks (sending emails, processing images) are too slow to do during a user request. A queue lets you defer work without making the user wait.",
    related: ["kafka", "worker", "async", "message-queue"],
    conceptId: "message-queue",
  },
  worker: {
    term: "Worker",
    fullForm: undefined,
    beginner: "A background process that picks up tasks from a queue and processes them — it does the heavy lifting behind the scenes.",
    intermediate: "A long-running process that polls or subscribes to a message queue, processes each message (email sending, image resizing, report generation), and acknowledges completion. Can be scaled horizontally by adding more worker instances.",
    whyItExists: "Not all work needs to happen immediately. Workers handle deferred tasks so the main application stays responsive.",
    related: ["queue", "async", "scaling"],
  },
  "circuit-breaker": {
    term: "Circuit Breaker",
    fullForm: undefined,
    beginner: "A safety switch that stops calling a broken service — instead of waiting and failing, it fails fast and tries again later.",
    intermediate: "A state machine (closed → open → half-open) that monitors failure rates of downstream calls. When failures exceed a threshold, it 'opens' and short-circuits requests, preventing cascade failures. Periodically allows test requests to check recovery.",
    whyItExists: "When a downstream service is down, hammering it with retries makes things worse. A circuit breaker protects both the caller and the failing service.",
    related: ["retry", "timeout", "failover", "resilience"],
    conceptId: "circuit-breaker",
  },
  retry: {
    term: "Retry",
    fullForm: undefined,
    beginner: "Trying a failed request again — sometimes things fail temporarily, and a second attempt succeeds.",
    intermediate: "Re-executing a failed operation, typically with exponential backoff (increasing delays between attempts) and jitter (randomized delay to prevent thundering herd). Must be paired with idempotency to avoid duplicate side effects.",
    whyItExists: "Network errors and transient failures are normal in distributed systems. Retries handle temporary blips without manual intervention.",
    related: ["circuit-breaker", "timeout", "idempotency"],
    conceptId: "retry",
  },
  timeout: {
    term: "Timeout",
    fullForm: undefined,
    beginner: "A time limit on how long to wait for a response — if it takes too long, give up and handle the failure.",
    intermediate: "A deadline (connection timeout, read timeout, or overall request timeout) after which a pending operation is cancelled. Prevents threads and connections from being held indefinitely by unresponsive dependencies.",
    whyItExists: "Without timeouts, a slow or dead service can make your entire system hang. Timeouts bound the blast radius of slowness.",
    related: ["retry", "circuit-breaker", "latency"],
  },
  failover: {
    term: "Failover",
    fullForm: undefined,
    beginner: "Automatically switching to a backup system when the primary one fails — like having a spare tire.",
    intermediate: "The process of detecting a primary node's failure (via health checks or heartbeats) and promoting a standby replica to take over. Can be active-passive (cold standby) or active-active (all nodes serve traffic).",
    whyItExists: "Hardware fails. Software crashes. Failover ensures the system keeps running by having a ready replacement.",
    related: ["replication", "health-check", "availability", "redundancy"],
    conceptId: "failover",
  },
  "microservices": {
    term: "Microservices",
    fullForm: undefined,
    beginner: "Breaking one big application into many small, independent services — each handles one job and can be updated separately.",
    intermediate: "An architectural style where an application is composed of loosely coupled, independently deployable services, each owning its data and communicating via APIs or events. Enables team autonomy and independent scaling.",
    whyItExists: "Monoliths become hard to change as they grow — one team's deployment blocks another. Microservices let teams move independently.",
    related: ["monolith", "api", "service-mesh", "kubernetes"],
  },
  "event-streaming": {
    term: "Event Streaming",
    fullForm: undefined,
    beginner: "A continuous flow of events (things that happened) that multiple systems can read and react to in real time.",
    intermediate: "A pattern where events are published to a durable, ordered log (like Kafka topics) and consumed by multiple independent subscribers. Unlike message queues, events are retained and replayable.",
    whyItExists: "When many services need to know about the same events, broadcasting via a durable log avoids tight coupling and allows new consumers to replay history.",
    related: ["kafka", "queue", "pub-sub", "partition"],
  },
  partition: {
    term: "Partition",
    fullForm: undefined,
    beginner: "A way of splitting data or message streams into smaller pieces that can be processed independently and in parallel.",
    intermediate: "In Kafka, a topic partition is an ordered, append-only log shard. In databases, a partition is a horizontal slice of a table (sharding). Both enable parallelism but complicate ordering guarantees across partitions.",
    whyItExists: "One stream or table can only be processed so fast. Partitioning enables parallelism by dividing work across independent channels.",
    related: ["sharding", "kafka", "scaling"],
  },
  "consumer-group": {
    term: "Consumer Group",
    fullForm: undefined,
    beginner: "A team of workers that split the work of reading from a message stream — each message goes to exactly one member.",
    intermediate: "In Kafka, a named group of consumers where each partition is assigned to exactly one consumer in the group. Adding consumers increases parallelism up to the partition count. Enables horizontal scaling of stream processing.",
    whyItExists: "One consumer can't keep up with a high-throughput stream. Consumer groups distribute the load while ensuring each message is processed once per group.",
    related: ["kafka", "partition", "worker", "scaling"],
  },
  "status-code": {
    term: "Status Code",
    fullForm: "HTTP Status Code",
    beginner: "A number the server sends back to tell you what happened — 200 means OK, 404 means not found, 500 means the server broke.",
    intermediate: "A three-digit integer in the HTTP response indicating the result: 1xx (informational), 2xx (success), 3xx (redirection), 4xx (client error), 5xx (server error). Clients use these to decide how to handle the response.",
    whyItExists: "Machines can't read error messages. Status codes give a standardized, machine-readable summary of the outcome.",
    related: ["http", "response", "api"],
  },
  rest: {
    term: "REST",
    fullForm: "Representational State Transfer",
    beginner: "A style of building APIs where each URL represents a resource, and you use HTTP methods (GET, POST, etc.) to interact with it.",
    intermediate: "An architectural style for APIs that uses HTTP methods as verbs, URLs as resource identifiers, and stateless request/response cycles. Resources are represented as JSON (or other formats) and linked via hypermedia.",
    whyItExists: "APIs need consistent conventions. REST leverages HTTP's existing methods and status codes to create intuitive, predictable interfaces.",
    related: ["api", "http", "rpc"],
    conceptId: "rest",
  },
  rpc: {
    term: "RPC",
    fullForm: "Remote Procedure Call",
    beginner: "Calling a function on another computer as if it were local — you send arguments, it runs, and you get the result back.",
    intermediate: "A protocol that lets a client invoke a function on a remote server as if it were a local call. Modern implementations (gRPC, Thrift) use binary serialization and HTTP/2 for efficiency. Tighter coupling than REST but better for internal service-to-service calls.",
    whyItExists: "Services need to call each other. RPC makes remote calls feel like local function calls, simplifying inter-service communication.",
    related: ["api", "http", "rest", "microservices"],
    conceptId: "rpc",
  },
  scaling: {
    term: "Scaling",
    fullForm: undefined,
    beginner: "Making your system handle more users — either by using a bigger machine (vertical) or adding more machines (horizontal).",
    intermediate: "Increasing a system's capacity. Vertical scaling (scale up): more CPU/RAM on one machine. Horizontal scaling (scale out): adding more machines behind a load balancer. Most production systems use horizontal scaling for resilience and cost efficiency.",
    whyItExists: "Traffic grows. A system that can't scale will eventually fail under load. Scaling strategies determine how you grow capacity.",
    related: ["load-balancer", "sharding", "replication", "horizontal-scaling"],
  },
  "reverse-proxy": {
    term: "Reverse Proxy",
    fullForm: undefined,
    beginner: "A server that sits in front of your real servers and forwards requests to them — clients never talk directly to your backend.",
    intermediate: "A proxy server that accepts client requests on behalf of backend servers. Provides load balancing, SSL termination, caching, compression, and security (hiding backend topology). Nginx and HAProxy are common examples.",
    whyItExists: "You don't want clients connecting directly to your application servers. A reverse proxy adds a security boundary and enables many optimizations.",
    related: ["load-balancer", "cdn", "server", "tls"],
  },
  indexing: {
    term: "Indexing",
    fullForm: "Database Index",
    beginner: "A shortcut that helps a database find data faster — like the index at the back of a book.",
    intermediate: "A data structure (typically B-tree or hash) maintained alongside table data that accelerates lookups by specific columns. Trades write overhead (index maintenance) and storage for dramatically faster reads on indexed columns.",
    whyItExists: "Without an index, finding one row means scanning the entire table. An index turns O(n) scans into O(log n) lookups.",
    related: ["database", "sql", "query"],
  },
  "health-check": {
    term: "Health Check",
    fullForm: undefined,
    beginner: "A regular check to see if a server is still alive and working — if it fails, traffic is routed elsewhere.",
    intermediate: "A periodic probe (HTTP endpoint, TCP connection, or custom script) that load balancers and orchestrators use to determine if a service instance is healthy. Unhealthy instances are removed from the pool until they recover.",
    whyItExists: "You can't route traffic to a dead server. Health checks detect failures automatically so the system can self-heal.",
    related: ["load-balancer", "failover", "kubernetes"],
  },
  availability: {
    term: "Availability",
    fullForm: undefined,
    beginner: "How much of the time your system is working and accessible — usually measured in 'nines' (99.9%, 99.99%).",
    intermediate: "The proportion of time a system is operational and serving requests correctly. Measured as uptime percentage: 99.9% ('three nines') allows ~8.7 hours of downtime per year; 99.99% ('four nines') allows ~52 minutes.",
    whyItExists: "Users expect systems to be always on. Availability targets drive architectural decisions about redundancy, failover, and deployment strategies.",
    related: ["failover", "replication", "redundancy", "sla"],
  },
  consistency: {
    term: "Consistency",
    fullForm: undefined,
    beginner: "Making sure all copies of data show the same value — when you update something, everyone sees the update.",
    intermediate: "A spectrum: strong consistency (linearizability — every read returns the latest write), eventual consistency (all replicas converge given enough time), and various models in between (causal, read-your-writes, monotonic reads).",
    whyItExists: "When data is replicated, updates take time to propagate. Consistency models define what readers can expect to see and when.",
    related: ["replication", "cap-theorem", "database", "eventual-consistency"],
  },
  certificate: {
    term: "Certificate",
    fullForm: "TLS/SSL Certificate",
    beginner: "A digital ID card that proves a website is who it claims to be — your browser checks it before sharing sensitive data.",
    intermediate: "An X.509 document issued by a Certificate Authority (CA) that binds a public key to a domain name. Browsers verify the certificate chain to establish trust before initiating an encrypted TLS session.",
    whyItExists: "Encryption alone isn't enough — you also need to verify you're talking to the right server, not an impostor. Certificates provide that authentication.",
    related: ["tls", "http", "dns"],
  },
  "pub-sub": {
    term: "Pub/Sub",
    fullForm: "Publish/Subscribe",
    beginner: "A messaging pattern where senders (publishers) broadcast messages and receivers (subscribers) listen for the ones they care about.",
    intermediate: "A messaging pattern where publishers emit events to topics without knowing who consumes them. Subscribers register interest in topics and receive matching messages. Enables fan-out and decoupled communication between services.",
    whyItExists: "When multiple services need to react to the same event, direct calls create tight coupling. Pub/sub lets the publisher broadcast once and each subscriber reacts independently.",
    related: ["kafka", "queue", "event-streaming", "microservices"],
  },
  router: {
    term: "Router",
    fullForm: undefined,
    beginner: "A device that directs internet traffic — it figures out the best path for data to travel from source to destination.",
    intermediate: "A network device that forwards packets between networks by examining destination IP addresses and consulting routing tables. Routers at internet exchange points connect ISPs and enable global connectivity.",
    whyItExists: "The internet is a network of networks. Routers connect them and decide how packets hop from source to destination.",
    related: ["ip-address", "dns", "latency"],
  },
  browser: {
    term: "Browser",
    fullForm: "Web Browser",
    beginner: "The application you use to access websites — Chrome, Firefox, Safari. It sends requests and renders the responses as web pages.",
    intermediate: "A client application that resolves URLs via DNS, establishes TCP/TLS connections, sends HTTP requests, parses HTML/CSS/JS responses, and renders interactive web pages. Also executes client-side JavaScript and manages cookies, caching, and service workers.",
    whyItExists: "Humans need a visual interface to the web. Browsers translate HTML, CSS, and JavaScript into the pages you see and interact with.",
    related: ["client", "http", "dns", "request"],
  },
  async: {
    term: "Async",
    fullForm: "Asynchronous Processing",
    beginner: "Doing work in the background instead of making the user wait — like ordering food and sitting down instead of standing at the counter.",
    intermediate: "A processing model where a request triggers work that completes later. The client receives an immediate acknowledgment while the actual work is enqueued and processed by background workers. Common for emails, reports, image processing.",
    whyItExists: "Some operations take seconds or minutes. Making users wait that long kills the experience. Async processing returns immediately and does the work in the background.",
    related: ["queue", "worker", "event-streaming"],
  },
  redundancy: {
    term: "Redundancy",
    fullForm: undefined,
    beginner: "Having backup copies of critical components — if one fails, another takes over seamlessly.",
    intermediate: "Deploying duplicate instances of components (servers, databases, network paths) so that the failure of any single instance doesn't cause system downtime. Redundancy is the physical mechanism behind high availability.",
    whyItExists: "Everything fails eventually. Redundancy ensures no single failure brings down the system.",
    related: ["availability", "failover", "replication"],
  },
  sla: {
    term: "SLA",
    fullForm: "Service Level Agreement",
    beginner: "A promise about how reliable a service will be — like guaranteeing 99.9% uptime.",
    intermediate: "A contract between a service provider and consumer specifying measurable guarantees: availability (uptime percentage), latency (p99 < 200ms), throughput, and the consequences (credits, refunds) of violations.",
    whyItExists: "Users and businesses need reliability promises they can depend on. SLAs formalize those expectations and create accountability.",
    related: ["availability", "latency", "monitoring"],
  },
  monitoring: {
    term: "Monitoring",
    fullForm: undefined,
    beginner: "Watching your system's health in real time — dashboards, alerts, and metrics that tell you when something goes wrong.",
    intermediate: "The practice of collecting, aggregating, and alerting on system telemetry: metrics (CPU, memory, latency, error rates), logs (structured event records), and traces (request paths through distributed services).",
    whyItExists: "You can't fix what you can't see. Monitoring makes system behavior visible so you can detect and respond to problems before users notice.",
    related: ["availability", "latency", "health-check", "observability"],
  },
  "rate-limiting": {
    term: "Rate Limiting",
    fullForm: undefined,
    beginner: "Limiting how many requests a user or client can make in a time period — preventing abuse and protecting the system.",
    intermediate: "A traffic control mechanism (token bucket, sliding window, fixed window) that caps the number of requests per client/IP/API key within a time window. Returns HTTP 429 (Too Many Requests) when exceeded.",
    whyItExists: "Without limits, one misbehaving client can consume all your resources. Rate limiting ensures fair access and protects against abuse and DDoS.",
    related: ["load-balancer", "api", "throttling"],
    conceptId: "rate-limiter",
  },
};

const TERM_PATTERN_CACHE = new Map<string, RegExp>();

export function getGlossaryEntry(term: string): GlossaryEntry | undefined {
  const key = term.toLowerCase().replace(/[\s-]/g, "");
  for (const [k, v] of Object.entries(GLOSSARY)) {
    const normalized = k.toLowerCase().replace(/[\s-]/g, "");
    if (normalized === key) return v;
    if (v.term.toLowerCase().replace(/[\s-]/g, "") === key) return v;
    if (v.fullForm && v.fullForm.toLowerCase().replace(/[\s-]/g, "") === key) return v;
  }
  return undefined;
}

export function findGlossaryTerms(text: string): { term: string; entry: GlossaryEntry; start: number; end: number }[] {
  const results: { term: string; entry: GlossaryEntry; start: number; end: number }[] = [];
  for (const [, entry] of Object.entries(GLOSSARY)) {
    const variants = [entry.term];
    if (entry.fullForm) variants.push(entry.fullForm);

    for (const variant of variants) {
      const cacheKey = variant;
      let re = TERM_PATTERN_CACHE.get(cacheKey);
      if (!re) {
        re = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
        TERM_PATTERN_CACHE.set(cacheKey, re);
      }
      re.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = re.exec(text)) !== null) {
        results.push({ term: match[0], entry, start: match.index, end: match.index + match[0].length });
      }
    }
  }
  results.sort((a, b) => a.start - b.start);
  const deduped: typeof results = [];
  let lastEnd = -1;
  for (const r of results) {
    if (r.start >= lastEnd) {
      deduped.push(r);
      lastEnd = r.end;
    }
  }
  return deduped;
}
