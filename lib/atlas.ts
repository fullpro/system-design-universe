import type {
  CompanyProfile,
  TechOrigin,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
  ConfidenceLevel,
} from "./types";

export const CONFIDENCE_META: Record<
  ConfidenceLevel,
  { label: string; color: string; bg: string; border: string; description: string }
> = {
  verified: {
    label: "Verified",
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.3)",
    description: "Based on RFCs, official specs, documentation, or open-source code.",
  },
  "publicly-disclosed": {
    label: "Publicly Disclosed",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
    border: "rgba(96,165,250,0.3)",
    description: "Based on engineering blogs, conference talks, academic papers, or official architecture writeups.",
  },
  "industry-pattern": {
    label: "Industry Pattern",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.3)",
    description: "This architecture represents a common industry pattern and does not describe a specific company's implementation.",
  },
  "educational-simulation": {
    label: "Educational Simulation",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.12)",
    border: "rgba(192,132,252,0.3)",
    description: "This simulation is simplified for educational purposes.",
  },
};

export const COMPANIES: CompanyProfile[] = [
  {
    id: "google",
    name: "Google",
    icon: "Search",
    accent: "#4285f4",
    scale: "Billions of queries/day, 100+ data centers worldwide",
    coreProducts: ["Search", "Gmail", "YouTube", "Cloud Platform", "Maps", "Android"],
    knownInfra: ["Borg", "Spanner", "Bigtable", "MapReduce", "Colossus", "Chubby"],
    technologies: [
      {
        name: "Spanner",
        description: "Globally distributed, strongly consistent database with external consistency via TrueTime.",
        confidence: { level: "publicly-disclosed", rationale: "Published in OSDI 2012 paper and subsequent updates." },
        sources: [
          { type: "academic-paper", title: "Spanner: Google's Globally-Distributed Database", url: "https://research.google/pubs/pub39966/", date: "2012", publication: "OSDI 2012" },
        ],
        conceptIds: ["database", "consistency-models"],
      },
      {
        name: "Bigtable",
        description: "Distributed wide-column store designed for petabyte-scale structured data.",
        confidence: { level: "publicly-disclosed", rationale: "Published in OSDI 2006 paper." },
        sources: [
          { type: "academic-paper", title: "Bigtable: A Distributed Storage System for Structured Data", url: "https://research.google/pubs/pub27898/", date: "2006", publication: "OSDI 2006" },
        ],
        conceptIds: ["database", "nosql"],
      },
      {
        name: "Borg",
        description: "Cluster management system that schedules and runs Google's workloads across fleets of machines.",
        confidence: { level: "publicly-disclosed", rationale: "Published in EuroSys 2015 paper." },
        sources: [
          { type: "academic-paper", title: "Large-scale cluster management at Google with Borg", url: "https://research.google/pubs/pub43438/", date: "2015", publication: "EuroSys 2015" },
        ],
      },
      {
        name: "MapReduce",
        description: "Programming model for processing large data sets in parallel across a cluster.",
        confidence: { level: "publicly-disclosed", rationale: "Published in OSDI 2004 paper." },
        sources: [
          { type: "academic-paper", title: "MapReduce: Simplified Data Processing on Large Clusters", url: "https://research.google/pubs/pub62/", date: "2004", publication: "OSDI 2004" },
        ],
      },
      {
        name: "Chubby",
        description: "Distributed lock service providing coarse-grained locking and reliable low-volume storage.",
        confidence: { level: "publicly-disclosed", rationale: "Published in OSDI 2006 paper." },
        sources: [
          { type: "academic-paper", title: "The Chubby lock service for loosely-coupled distributed systems", url: "https://research.google/pubs/pub27897/", date: "2006", publication: "OSDI 2006" },
        ],
      },
    ],
    timeline: [
      {
        year: 2003,
        event: "Google File System published",
        problem: "Needed a file system for commodity hardware handling massive crawl data.",
        solution: "GFS — append-optimized distributed file system with single-master architecture.",
        why: "Commodity hardware fails constantly; GFS assumed failures are normal and replicated chunks across machines.",
        confidence: { level: "publicly-disclosed", rationale: "SOSP 2003 paper." },
        sources: [{ type: "academic-paper", title: "The Google File System", url: "https://research.google/pubs/pub51/", date: "2003", publication: "SOSP 2003" }],
      },
      {
        year: 2004,
        event: "MapReduce published",
        problem: "Engineers needed to process TB-scale data without writing complex distributed code.",
        solution: "MapReduce — a simple map-then-reduce abstraction hiding parallelism, fault tolerance, and data distribution.",
        why: "Let thousands of engineers run massive batch jobs without being distributed systems experts.",
        confidence: { level: "publicly-disclosed", rationale: "OSDI 2004 paper." },
        sources: [{ type: "academic-paper", title: "MapReduce: Simplified Data Processing on Large Clusters", url: "https://research.google/pubs/pub62/", date: "2004", publication: "OSDI 2004" }],
      },
      {
        year: 2006,
        event: "Bigtable published",
        problem: "Needed structured storage for web indexing, Maps, and other products at petabyte scale.",
        solution: "Bigtable — sparse, distributed, persistent sorted map built on GFS.",
        why: "Relational databases couldn't scale to Google's data volumes or provide the flexible schema needed.",
        confidence: { level: "publicly-disclosed", rationale: "OSDI 2006 paper." },
        sources: [{ type: "academic-paper", title: "Bigtable: A Distributed Storage System for Structured Data", url: "https://research.google/pubs/pub27898/", date: "2006", publication: "OSDI 2006" }],
      },
      {
        year: 2012,
        event: "Spanner published",
        problem: "Global applications needed strong consistency across continents without sacrificing availability.",
        solution: "Spanner — TrueTime API using atomic clocks and GPS to assign globally meaningful timestamps.",
        why: "External consistency across data centers enables global transactions — something no existing system offered.",
        confidence: { level: "publicly-disclosed", rationale: "OSDI 2012 paper." },
        sources: [{ type: "academic-paper", title: "Spanner: Google's Globally-Distributed Database", url: "https://research.google/pubs/pub39966/", date: "2012", publication: "OSDI 2012" }],
      },
      {
        year: 2015,
        event: "Borg paper published",
        problem: "Needed efficient scheduling for heterogeneous workloads across massive compute clusters.",
        solution: "Borg — centralized cluster manager with cells of ~10K machines, preemptive scheduling, and alloc sets.",
        why: "Running Google-scale services on raw hardware without a scheduler is impossible; Borg became the template for Kubernetes.",
        confidence: { level: "publicly-disclosed", rationale: "EuroSys 2015 paper." },
        sources: [{ type: "academic-paper", title: "Large-scale cluster management at Google with Borg", url: "https://research.google/pubs/pub43438/", date: "2015", publication: "EuroSys 2015" }],
      },
    ],
    unknowns: [
      { area: "Search ranking algorithm details", note: "Core ranking signals and weights are proprietary. Only high-level signals are publicly known." },
      { area: "Internal networking architecture", note: "Jupiter fabric papers exist but full internal topology is not publicly documented." },
    ],
    sources: [
      { type: "academic-paper", title: "Google Research Publications", url: "https://research.google/pubs/", publication: "Google Research" },
    ],
  },

  {
    id: "netflix",
    name: "Netflix",
    icon: "Tv",
    accent: "#e50914",
    scale: "200M+ subscribers, thousands of microservices, 15%+ of global internet traffic",
    coreProducts: ["Streaming Platform", "Content Delivery (Open Connect)", "Studio Tools"],
    knownInfra: ["Eureka", "Hystrix", "Zuul", "EVCache", "Atlas", "Open Connect", "Conductor"],
    technologies: [
      {
        name: "Eureka",
        description: "REST-based service discovery for mid-tier load balancing and failover.",
        confidence: { level: "verified", rationale: "Open-sourced on GitHub with full documentation." },
        sources: [
          { type: "open-source", title: "Netflix/eureka", url: "https://github.com/Netflix/eureka" },
          { type: "engineering-blog", title: "Netflix Eureka at a Glance", url: "https://netflixtechblog.com/netflix-shares-cloud-load-balancing-and-failover-tool-eureka-c10647ef95e5", publication: "Netflix Tech Blog" },
        ],
        conceptIds: ["service-discovery"],
      },
      {
        name: "Hystrix",
        description: "Latency and fault tolerance library providing circuit breaker, fallback, and bulkhead patterns.",
        confidence: { level: "verified", rationale: "Open-sourced on GitHub (now in maintenance mode)." },
        sources: [
          { type: "open-source", title: "Netflix/Hystrix", url: "https://github.com/Netflix/Hystrix" },
        ],
        conceptIds: ["circuit-breaker"],
      },
      {
        name: "Zuul",
        description: "Edge service gateway providing dynamic routing, monitoring, resiliency, and security.",
        confidence: { level: "verified", rationale: "Open-sourced on GitHub." },
        sources: [
          { type: "open-source", title: "Netflix/zuul", url: "https://github.com/Netflix/zuul" },
          { type: "engineering-blog", title: "Zuul 2: The Netflix Journey to Asynchronous, Non-Blocking Systems", url: "https://netflixtechblog.com/zuul-2-the-netflix-journey-to-asynchronous-non-blocking-systems-45947377fb5c", publication: "Netflix Tech Blog" },
        ],
        conceptIds: ["api-gateway"],
      },
      {
        name: "EVCache",
        description: "Distributed caching solution based on Memcached, optimized for Netflix's AWS infrastructure.",
        confidence: { level: "verified", rationale: "Open-sourced on GitHub." },
        sources: [
          { type: "open-source", title: "Netflix/EVCache", url: "https://github.com/Netflix/EVCache" },
          { type: "engineering-blog", title: "Caching for a Global Netflix", url: "https://netflixtechblog.com/caching-for-a-global-netflix-7bcc457012f1", publication: "Netflix Tech Blog" },
        ],
        conceptIds: ["cache"],
      },
      {
        name: "Open Connect",
        description: "Netflix's purpose-built CDN that delivers streaming content from ISP-embedded appliances.",
        confidence: { level: "publicly-disclosed", rationale: "Architecture described in official Open Connect documentation and blog posts." },
        sources: [
          { type: "documentation", title: "Netflix Open Connect", url: "https://openconnect.netflix.com/" },
          { type: "engineering-blog", title: "How Netflix works with ISPs around the globe", url: "https://netflixtechblog.com/how-netflix-works-with-isps-around-the-globe-to-deliver-a-great-viewing-experience-a7485ac4f72f", publication: "Netflix Tech Blog" },
        ],
        conceptIds: ["cdn"],
      },
    ],
    timeline: [
      {
        year: 2008,
        event: "Major database corruption incident",
        problem: "A corrupted database caused a 3-day outage of DVD shipping.",
        solution: "Decision to migrate from monolithic data center to AWS cloud.",
        why: "Single points of failure in owned infrastructure were unacceptable for a growing streaming service.",
        confidence: { level: "publicly-disclosed", rationale: "Described in multiple Netflix engineering talks and blog posts." },
        sources: [{ type: "engineering-blog", title: "Completing the Netflix Cloud Migration", url: "https://about.netflix.com/en/news/completing-the-netflix-cloud-migration", publication: "Netflix" }],
      },
      {
        year: 2011,
        event: "Chaos Monkey and Simian Army",
        problem: "Cloud infrastructure fails unpredictably; needed to build resilience into every service.",
        solution: "Chaos Monkey — randomly terminates instances in production to force services to handle failures.",
        why: "If you want to find failures, cause them intentionally during business hours when engineers are watching.",
        confidence: { level: "verified", rationale: "Open-sourced on GitHub." },
        sources: [{ type: "open-source", title: "Netflix/chaosmonkey", url: "https://github.com/Netflix/chaosmonkey" }],
      },
      {
        year: 2012,
        event: "Open-sourced Netflix OSS stack",
        problem: "The cloud-native patterns Netflix invented had no off-the-shelf equivalents.",
        solution: "Released Eureka, Hystrix, Zuul, Ribbon as open-source projects.",
        why: "Open-sourcing attracted contributions, built community trust, and helped recruit engineers.",
        confidence: { level: "verified", rationale: "All projects available on GitHub." },
        sources: [{ type: "open-source", title: "Netflix OSS", url: "https://netflix.github.io/" }],
      },
      {
        year: 2016,
        event: "Completed full cloud migration to AWS",
        problem: "Running two environments (data center + cloud) doubled operational complexity.",
        solution: "Shut down the last data center and went 100% AWS (except Open Connect CDN).",
        why: "Cloud provided the elasticity to handle massive traffic spikes and global expansion.",
        confidence: { level: "publicly-disclosed", rationale: "Announced in Netflix blog post." },
        sources: [{ type: "engineering-blog", title: "Completing the Netflix Cloud Migration", url: "https://about.netflix.com/en/news/completing-the-netflix-cloud-migration", publication: "Netflix" }],
      },
    ],
    unknowns: [
      { area: "Recommendation algorithm internals", note: "High-level approaches published; exact model architectures and training pipelines are proprietary." },
      { area: "Content encoding pipeline details", note: "Per-title encoding methodology is described at a high level; exact encoder configurations are not public." },
    ],
    sources: [
      { type: "engineering-blog", title: "Netflix Tech Blog", url: "https://netflixtechblog.com/", publication: "Netflix" },
    ],
  },

  {
    id: "uber",
    name: "Uber",
    icon: "Car",
    accent: "#000000",
    scale: "Millions of trips/day across 70+ countries, real-time dispatch at scale",
    coreProducts: ["Ride-hailing", "Uber Eats", "Freight", "Maps"],
    knownInfra: ["Ringpop", "TChannel", "Schemaless", "Peloton", "M3", "H3"],
    technologies: [
      {
        name: "Ringpop",
        description: "Scalable, fault-tolerant application-layer sharding library using consistent hashing and a SWIM gossip protocol.",
        confidence: { level: "verified", rationale: "Open-sourced on GitHub." },
        sources: [
          { type: "open-source", title: "uber-node/ringpop-node", url: "https://github.com/uber-node/ringpop-node" },
          { type: "engineering-blog", title: "Introducing Ringpop", url: "https://www.uber.com/blog/intro-to-ringpop/", publication: "Uber Engineering Blog" },
        ],
        conceptIds: ["consistent-hashing"],
      },
      {
        name: "H3",
        description: "Hexagonal hierarchical geospatial indexing system for partitioning the world into cells.",
        confidence: { level: "verified", rationale: "Open-sourced on GitHub." },
        sources: [
          { type: "open-source", title: "uber/h3", url: "https://github.com/uber/h3" },
          { type: "engineering-blog", title: "H3: Uber's Hexagonal Hierarchical Spatial Index", url: "https://www.uber.com/blog/h3/", publication: "Uber Engineering Blog" },
        ],
      },
      {
        name: "M3",
        description: "Metrics platform built on M3DB, a distributed time series database, for large-scale monitoring.",
        confidence: { level: "verified", rationale: "Open-sourced on GitHub." },
        sources: [
          { type: "open-source", title: "m3db/m3", url: "https://github.com/m3db/m3" },
          { type: "engineering-blog", title: "M3: Uber's Open Source, Large-scale Metrics Platform", url: "https://www.uber.com/blog/m3/", publication: "Uber Engineering Blog" },
        ],
        conceptIds: ["observability"],
      },
    ],
    timeline: [
      {
        year: 2014,
        event: "Dispatch system redesign",
        problem: "Original dispatch couldn't handle exponential growth — city-level sharding hit limits.",
        solution: "Geospatial indexing with supply/demand matching redesigned as a distributed system.",
        why: "Real-time matching of riders and drivers across millions of concurrent sessions required purpose-built infrastructure.",
        confidence: { level: "publicly-disclosed", rationale: "Described in Uber engineering blog posts and QCon talks." },
        sources: [{ type: "engineering-blog", title: "The Uber Engineering Tech Stack", url: "https://www.uber.com/blog/tech-stack-part-one-foundation/", publication: "Uber Engineering Blog" }],
      },
      {
        year: 2016,
        event: "Schemaless datastore",
        problem: "MySQL couldn't scale to Uber's write-heavy, geo-distributed workload.",
        solution: "Schemaless — append-only, sharded datastore built on top of MySQL for trip data.",
        why: "Needed a system that scaled writes horizontally while maintaining per-trip consistency.",
        confidence: { level: "publicly-disclosed", rationale: "Described in detail on Uber Engineering Blog." },
        sources: [{ type: "engineering-blog", title: "Designing Schemaless", url: "https://www.uber.com/blog/schemaless-part-one-mysql-datastore/", publication: "Uber Engineering Blog" }],
      },
    ],
    unknowns: [
      { area: "Pricing algorithm internals", note: "Surge pricing methodology is described at a conceptual level; exact models are proprietary." },
      { area: "Full dispatch architecture", note: "High-level dispatch design is public; real-time matching heuristics are not fully documented." },
    ],
    sources: [
      { type: "engineering-blog", title: "Uber Engineering Blog", url: "https://www.uber.com/blog/engineering/", publication: "Uber" },
    ],
  },

  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "Linkedin",
    accent: "#0a66c2",
    scale: "900M+ members, millions of connections and content interactions/day",
    coreProducts: ["Professional Network", "Job Marketplace", "LinkedIn Learning", "Sales Navigator"],
    knownInfra: ["Kafka", "Voldemort", "Espresso", "Brooklin", "Rest.li", "Venice"],
    technologies: [
      {
        name: "Kafka",
        description: "Distributed event streaming platform for high-throughput, fault-tolerant publish-subscribe messaging.",
        confidence: { level: "verified", rationale: "Created at LinkedIn, open-sourced and donated to Apache. Full source code available." },
        sources: [
          { type: "open-source", title: "apache/kafka", url: "https://github.com/apache/kafka" },
          { type: "engineering-blog", title: "The Log: What every software engineer should know", url: "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying", publication: "LinkedIn Engineering" },
          { type: "academic-paper", title: "Kafka: a Distributed Messaging System for Log Processing", url: "https://www.microsoft.com/en-us/research/wp-content/uploads/2017/09/Kafka.pdf", date: "2011", publication: "NetDB Workshop" },
        ],
        conceptIds: ["message-queue"],
      },
      {
        name: "Voldemort",
        description: "Distributed key-value store inspired by Amazon Dynamo, used for read-heavy online serving.",
        confidence: { level: "verified", rationale: "Open-sourced on GitHub." },
        sources: [
          { type: "open-source", title: "voldemort/voldemort", url: "https://github.com/voldemort/voldemort" },
        ],
        conceptIds: ["database", "nosql"],
      },
      {
        name: "Espresso",
        description: "LinkedIn's distributed document store supporting strong consistency, change capture, and secondary indexing.",
        confidence: { level: "publicly-disclosed", rationale: "Described in SIGMOD 2013 paper." },
        sources: [
          { type: "academic-paper", title: "Espresso: LinkedIn's Distributed Document Store", url: "https://engineering.linkedin.com/espresso/introducing-espresso-linkedins-hot-new-distributed-document-store", date: "2013", publication: "LinkedIn Engineering" },
        ],
        conceptIds: ["database"],
      },
    ],
    timeline: [
      {
        year: 2010,
        event: "Kafka created",
        problem: "LinkedIn's rapid growth generated massive data pipeline demands — existing messaging systems couldn't keep up.",
        solution: "Kafka — an append-only commit log optimized for throughput, designed as a unified data backbone.",
        why: "Needed a system that could handle both real-time stream processing and offline batch processing from a single source of truth.",
        confidence: { level: "verified", rationale: "Kafka's origin story is extensively documented in papers and talks by Jay Kreps." },
        sources: [{ type: "engineering-blog", title: "The Log: What every software engineer should know", url: "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying", publication: "LinkedIn Engineering" }],
      },
      {
        year: 2012,
        event: "Espresso replaces Oracle for member profiles",
        problem: "Oracle-backed serving layer couldn't scale horizontally for member profile reads.",
        solution: "Espresso — purpose-built document store with horizontal partitioning and change capture.",
        why: "Read-heavy member profile workload needed predictable latency at LinkedIn's scale without Oracle license costs.",
        confidence: { level: "publicly-disclosed", rationale: "Described in LinkedIn engineering publications." },
        sources: [{ type: "engineering-blog", title: "Introducing Espresso", url: "https://engineering.linkedin.com/espresso/introducing-espresso-linkedins-hot-new-distributed-document-store", publication: "LinkedIn Engineering" }],
      },
    ],
    unknowns: [
      { area: "Feed ranking algorithm details", note: "General approach (relevance + engagement) is known; exact signals and model architecture are proprietary." },
      { area: "People You May Know internals", note: "Graph-based approach is public; exact scoring and weighting is not documented." },
    ],
    sources: [
      { type: "engineering-blog", title: "LinkedIn Engineering Blog", url: "https://engineering.linkedin.com/blog", publication: "LinkedIn" },
    ],
  },

  {
    id: "cloudflare",
    name: "Cloudflare",
    icon: "Shield",
    accent: "#f6821f",
    scale: "Processes 20%+ of web traffic, 300+ edge locations globally",
    coreProducts: ["CDN", "DDoS Protection", "Workers (Edge Compute)", "DNS", "Zero Trust"],
    knownInfra: ["Anycast Network", "Workers Runtime", "Durable Objects", "R2", "D1", "Quicksilver"],
    technologies: [
      {
        name: "Workers",
        description: "Edge compute platform running V8 isolates — deploy code to 300+ locations with no cold starts.",
        confidence: { level: "publicly-disclosed", rationale: "Architecture described in Cloudflare blog and documentation." },
        sources: [
          { type: "engineering-blog", title: "How Workers Works", url: "https://blog.cloudflare.com/how-workers-works/", publication: "Cloudflare Blog" },
          { type: "documentation", title: "Cloudflare Workers Docs", url: "https://developers.cloudflare.com/workers/" },
        ],
        conceptIds: ["cdn"],
      },
      {
        name: "Quicksilver",
        description: "Distributed KV store that propagates configuration changes globally in seconds.",
        confidence: { level: "publicly-disclosed", rationale: "Described in Cloudflare blog posts." },
        sources: [
          { type: "engineering-blog", title: "Cloudflare's Distributed KV Store", url: "https://blog.cloudflare.com/introducing-quicksilver-configuration-distribution-at-internet-scale/", publication: "Cloudflare Blog" },
        ],
      },
    ],
    timeline: [
      {
        year: 2010,
        event: "Cloudflare launches reverse proxy CDN",
        problem: "Small websites had no affordable protection against DDoS attacks.",
        solution: "Anycast-based reverse proxy that absorbs attacks while caching and accelerating legitimate traffic.",
        why: "Anycast distributes attack traffic across the entire network — no single point of ingress to overwhelm.",
        confidence: { level: "publicly-disclosed", rationale: "Cloudflare's founding story is well-documented." },
        sources: [{ type: "engineering-blog", title: "Cloudflare Blog", url: "https://blog.cloudflare.com/", publication: "Cloudflare" }],
      },
      {
        year: 2017,
        event: "Workers edge compute platform",
        problem: "Developers needed to run custom logic at the edge without managing servers.",
        solution: "V8 isolates instead of containers — sub-millisecond cold starts, running in every PoP.",
        why: "Containers are too slow to start at the edge; V8 isolates provide strong isolation with microsecond startup.",
        confidence: { level: "publicly-disclosed", rationale: "Architecture detailed in Cloudflare engineering blog." },
        sources: [{ type: "engineering-blog", title: "How Workers Works", url: "https://blog.cloudflare.com/how-workers-works/", publication: "Cloudflare Blog" }],
      },
    ],
    unknowns: [
      { area: "DDoS mitigation rule details", note: "General approach (anycast + traffic analysis) is public; exact detection heuristics and thresholds are proprietary." },
    ],
    sources: [
      { type: "engineering-blog", title: "Cloudflare Blog", url: "https://blog.cloudflare.com/", publication: "Cloudflare" },
    ],
  },

  {
    id: "meta",
    name: "Meta",
    icon: "Users",
    accent: "#1877f2",
    scale: "3B+ users across apps, millions of QPS, exabytes of data",
    coreProducts: ["Facebook", "Instagram", "WhatsApp", "Messenger"],
    knownInfra: ["TAO", "Memcache", "RocksDB", "Cassandra", "React", "GraphQL"],
    technologies: [
      {
        name: "TAO",
        description: "Distributed data store for the social graph — optimized for read-heavy graph queries with strong consistency.",
        confidence: { level: "publicly-disclosed", rationale: "Published in USENIX ATC 2013." },
        sources: [
          { type: "academic-paper", title: "TAO: Facebook's Distributed Data Store for the Social Graph", url: "https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson", date: "2013", publication: "USENIX ATC 2013" },
        ],
        conceptIds: ["cache", "database"],
      },
      {
        name: "Memcache at Scale",
        description: "Largest known memcached deployment — trillions of items, billions of requests per second.",
        confidence: { level: "publicly-disclosed", rationale: "Published in NSDI 2013." },
        sources: [
          { type: "academic-paper", title: "Scaling Memcache at Facebook", url: "https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala", date: "2013", publication: "NSDI 2013" },
        ],
        conceptIds: ["cache"],
      },
      {
        name: "React",
        description: "Declarative UI library for building component-based user interfaces.",
        confidence: { level: "verified", rationale: "Open-sourced and maintained by Meta." },
        sources: [
          { type: "open-source", title: "facebook/react", url: "https://github.com/facebook/react" },
        ],
      },
    ],
    timeline: [
      {
        year: 2011,
        event: "TAO replaces MySQL+Memcache for social graph",
        problem: "Direct MySQL queries with a memcache layer couldn't handle the social graph's read patterns — thundering herds and cache consistency were constant issues.",
        solution: "TAO — a write-through cache with graph semantics baked in, eliminating the application-level caching layer.",
        why: "The social graph is read 99.8% of the time; a purpose-built cache that understands graph associations eliminates whole categories of consistency bugs.",
        confidence: { level: "publicly-disclosed", rationale: "USENIX ATC 2013 paper." },
        sources: [{ type: "academic-paper", title: "TAO: Facebook's Distributed Data Store for the Social Graph", url: "https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson", date: "2013", publication: "USENIX ATC 2013" }],
      },
      {
        year: 2013,
        event: "React open-sourced",
        problem: "Facebook's complex UIs were hard to reason about with two-way data binding and DOM mutation.",
        solution: "React — a declarative, component-based library using a virtual DOM for efficient updates.",
        why: "One-way data flow and declarative rendering made UI state predictable at any scale.",
        confidence: { level: "verified", rationale: "React's origin story is well-documented and the project is fully open-source." },
        sources: [{ type: "open-source", title: "facebook/react", url: "https://github.com/facebook/react" }],
      },
    ],
    unknowns: [
      { area: "News Feed ranking algorithm", note: "General principles (engagement, relevance, integrity) are public; exact model architecture is proprietary." },
      { area: "WhatsApp end-to-end encryption implementation", note: "Signal Protocol usage is documented; server-side key management details are not fully public." },
    ],
    sources: [
      { type: "engineering-blog", title: "Meta Engineering Blog", url: "https://engineering.fb.com/", publication: "Meta" },
    ],
  },

  {
    id: "amazon",
    name: "Amazon",
    icon: "ShoppingCart",
    accent: "#ff9900",
    scale: "Largest e-commerce + cloud provider, millions of TPS during peak events",
    coreProducts: ["E-Commerce", "AWS", "Prime Video", "Alexa"],
    knownInfra: ["Dynamo", "S3", "SQS", "Lambda", "Aurora", "DynamoDB"],
    technologies: [
      {
        name: "Dynamo",
        description: "Highly available key-value store using consistent hashing, vector clocks, and sloppy quorums.",
        confidence: { level: "publicly-disclosed", rationale: "Published in SOSP 2007 paper." },
        sources: [
          { type: "academic-paper", title: "Dynamo: Amazon's Highly Available Key-value Store", url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf", date: "2007", publication: "SOSP 2007" },
        ],
        conceptIds: ["database", "nosql", "consistent-hashing"],
      },
    ],
    timeline: [
      {
        year: 2006,
        event: "AWS launches S3 and EC2",
        problem: "Amazon's internal infrastructure was overbuilt for peak (Christmas) and idle most of the year.",
        solution: "Offer compute and storage as pay-per-use services — AWS was born from Amazon's own infrastructure needs.",
        why: "If Amazon needed elastic infrastructure, so did everyone else. Excess capacity became a business.",
        confidence: { level: "publicly-disclosed", rationale: "AWS launch is extensively documented." },
        sources: [{ type: "engineering-blog", title: "AWS Blog", url: "https://aws.amazon.com/blogs/", publication: "AWS" }],
      },
      {
        year: 2007,
        event: "Dynamo paper published",
        problem: "Amazon's shopping cart needed to be always writable — even during partitions.",
        solution: "Dynamo — always-writable KV store with eventual consistency, consistent hashing, and conflict resolution at read time.",
        why: "A customer adding to cart must never fail — availability trumps consistency for this use case.",
        confidence: { level: "publicly-disclosed", rationale: "SOSP 2007 paper by DeCandia et al." },
        sources: [{ type: "academic-paper", title: "Dynamo: Amazon's Highly Available Key-value Store", url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf", date: "2007", publication: "SOSP 2007" }],
      },
    ],
    unknowns: [
      { area: "Recommendation engine details", note: "Collaborative filtering approach is known; exact implementation is proprietary." },
      { area: "Internal service mesh", note: "AWS services are built on microservices; internal service mesh details are not public." },
    ],
    sources: [
      { type: "engineering-blog", title: "All Things Distributed (Werner Vogels)", url: "https://www.allthingsdistributed.com/", publication: "Amazon CTO Blog" },
    ],
  },

  {
    id: "stripe",
    name: "Stripe",
    icon: "CreditCard",
    accent: "#635bff",
    scale: "Millions of businesses, processes hundreds of billions $/year",
    coreProducts: ["Payments API", "Billing", "Connect", "Radar (Fraud)", "Atlas"],
    knownInfra: ["Ruby (API)", "Sorbet", "Temporal (Workflows)"],
    technologies: [
      {
        name: "Sorbet",
        description: "Gradual type checker for Ruby — fast enough for interactive use on Stripe's million-line codebase.",
        confidence: { level: "verified", rationale: "Open-sourced on GitHub." },
        sources: [
          { type: "open-source", title: "sorbet/sorbet", url: "https://github.com/sorbet/sorbet" },
          { type: "engineering-blog", title: "Sorbet: Adding type checking to Ruby", url: "https://stripe.com/blog/sorbet-stripes-type-checker-for-ruby", publication: "Stripe Blog" },
        ],
      },
    ],
    timeline: [
      {
        year: 2014,
        event: "API versioning system",
        problem: "Payments API changes could break merchant integrations, costing real money.",
        solution: "Per-request API versioning — merchants pin to a version and Stripe maintains compatibility layers.",
        why: "In payments, a breaking change means lost transactions. Backwards compatibility is a core architectural constraint.",
        confidence: { level: "publicly-disclosed", rationale: "Described in Stripe engineering blog." },
        sources: [{ type: "engineering-blog", title: "APIs as infrastructure: future-proofing Stripe with versioning", url: "https://stripe.com/blog/api-versioning", publication: "Stripe Blog" }],
      },
    ],
    unknowns: [
      { area: "Fraud detection model architecture", note: "Radar's ML approach is described at a high level; model details are proprietary." },
      { area: "Internal payment routing", note: "Multi-processor routing logic is not publicly documented." },
    ],
    sources: [
      { type: "engineering-blog", title: "Stripe Engineering Blog", url: "https://stripe.com/blog/engineering", publication: "Stripe" },
    ],
  },

  {
    id: "discord",
    name: "Discord",
    icon: "MessageCircle",
    accent: "#5865f2",
    scale: "150M+ monthly active users, millions of concurrent voice/text connections",
    coreProducts: ["Text Chat", "Voice Chat", "Video", "Bots Platform"],
    knownInfra: ["Elixir (Real-time)", "Rust (Performance)", "Cassandra → ScyllaDB", "BEAM VM"],
    technologies: [
      {
        name: "Elixir/BEAM for real-time",
        description: "Discord's real-time messaging and presence system runs on Elixir/Erlang BEAM VM for massive concurrency.",
        confidence: { level: "publicly-disclosed", rationale: "Described in Discord engineering blog." },
        sources: [
          { type: "engineering-blog", title: "Using Rust to Scale Elixir for 11 Million Concurrent Users", url: "https://discord.com/blog/using-rust-to-scale-elixir-for-11-million-concurrent-users", publication: "Discord Blog" },
        ],
      },
    ],
    timeline: [
      {
        year: 2017,
        event: "Migrated message storage from MongoDB to Cassandra",
        problem: "MongoDB couldn't handle Discord's read/write patterns as message volume exploded.",
        solution: "Migrated to Cassandra for its write throughput and linear horizontal scaling.",
        why: "Messages are append-heavy with time-ordered reads — a natural fit for Cassandra's LSM-tree architecture.",
        confidence: { level: "publicly-disclosed", rationale: "Detailed in Discord engineering blog." },
        sources: [{ type: "engineering-blog", title: "How Discord Stores Billions of Messages", url: "https://discord.com/blog/how-discord-stores-billions-of-messages", publication: "Discord Blog" }],
      },
      {
        year: 2022,
        event: "Migrated from Cassandra to ScyllaDB",
        problem: "Cassandra's GC pauses caused latency spikes; hot partitions in large servers were problematic.",
        solution: "ScyllaDB — a C++ rewrite of Cassandra with shard-per-core architecture and no GC pauses.",
        why: "ScyllaDB's predictable latency (no JVM GC) and better hardware utilization solved Discord's tail-latency issues.",
        confidence: { level: "publicly-disclosed", rationale: "Detailed in Discord engineering blog." },
        sources: [{ type: "engineering-blog", title: "How Discord Stores Trillions of Messages", url: "https://discord.com/blog/how-discord-stores-trillions-of-messages", publication: "Discord Blog" }],
      },
    ],
    unknowns: [
      { area: "Voice server routing internals", note: "Use of WebRTC and media servers is known; exact routing and quality optimization logic is not public." },
    ],
    sources: [
      { type: "engineering-blog", title: "Discord Engineering Blog", url: "https://discord.com/category/engineering", publication: "Discord" },
    ],
  },

  {
    id: "airbnb",
    name: "Airbnb",
    icon: "Home",
    accent: "#ff5a5f",
    scale: "Millions of listings in 220+ countries, handles booking surges for major events",
    coreProducts: ["Marketplace (Stays)", "Experiences", "Luxe"],
    knownInfra: ["Airflow", "Knowledge Graph", "Minerva (Metrics)"],
    technologies: [
      {
        name: "Airflow",
        description: "Workflow orchestration platform for programmatically authoring, scheduling, and monitoring data pipelines.",
        confidence: { level: "verified", rationale: "Created at Airbnb, donated to Apache. Full source code available." },
        sources: [
          { type: "open-source", title: "apache/airflow", url: "https://github.com/apache/airflow" },
          { type: "engineering-blog", title: "Airflow: a workflow management platform", url: "https://medium.com/airbnb-engineering/airflow-a-workflow-management-platform-46318b977fd8", publication: "Airbnb Engineering" },
        ],
      },
    ],
    timeline: [
      {
        year: 2014,
        event: "Airflow created for data pipeline orchestration",
        problem: "Data pipelines were a tangle of cron jobs with no visibility, retries, or dependency management.",
        solution: "Airflow — DAG-based workflow orchestrator with a web UI, retry logic, and dependency tracking.",
        why: "Data teams needed to define pipelines as code with clear dependency graphs and failure handling.",
        confidence: { level: "verified", rationale: "Airflow is open-source and Airbnb's role as creator is well documented." },
        sources: [{ type: "open-source", title: "apache/airflow", url: "https://github.com/apache/airflow" }],
      },
    ],
    unknowns: [
      { area: "Search ranking algorithm", note: "Machine learning approach is described; exact features and model architecture are proprietary." },
      { area: "Dynamic pricing model", note: "Smart Pricing tool exists; internal pricing algorithms are not public." },
    ],
    sources: [
      { type: "engineering-blog", title: "Airbnb Engineering Blog", url: "https://medium.com/airbnb-engineering", publication: "Airbnb" },
    ],
  },

  {
    id: "dropbox",
    name: "Dropbox",
    icon: "HardDrive",
    accent: "#0061ff",
    scale: "700M+ registered users, exabytes of user data",
    coreProducts: ["File Sync", "Dropbox Paper", "Business Collaboration"],
    knownInfra: ["Magic Pocket", "Edgestore", "Blockstore"],
    technologies: [
      {
        name: "Magic Pocket",
        description: "Exabyte-scale storage system that replaced S3 — custom hardware and software optimized for Dropbox's workload.",
        confidence: { level: "publicly-disclosed", rationale: "Architecture described in Dropbox engineering blog and conference talks." },
        sources: [
          { type: "engineering-blog", title: "Inside the Magic Pocket", url: "https://dropbox.tech/infrastructure/inside-the-magic-pocket", publication: "Dropbox Tech Blog" },
        ],
      },
    ],
    timeline: [
      {
        year: 2016,
        event: "Migrated from AWS S3 to Magic Pocket",
        problem: "At Dropbox's scale, S3 costs were unsustainable and the abstraction didn't match their access patterns.",
        solution: "Magic Pocket — custom-built exabyte-scale storage on owned hardware in co-located data centers.",
        why: "When storage IS your product, owning the stack pays for itself. Dropbox's workload is unique enough to justify custom infrastructure.",
        confidence: { level: "publicly-disclosed", rationale: "Extensively documented in Dropbox engineering blog." },
        sources: [{ type: "engineering-blog", title: "Inside the Magic Pocket", url: "https://dropbox.tech/infrastructure/inside-the-magic-pocket", publication: "Dropbox Tech Blog" }],
      },
    ],
    unknowns: [
      { area: "Sync protocol details", note: "High-level delta-sync approach is public; exact conflict resolution and compression algorithms are proprietary." },
    ],
    sources: [
      { type: "engineering-blog", title: "Dropbox Tech Blog", url: "https://dropbox.tech/", publication: "Dropbox" },
    ],
  },

  {
    id: "pinterest",
    name: "Pinterest",
    icon: "Pin",
    accent: "#e60023",
    scale: "450M+ monthly active users, billions of Pins",
    coreProducts: ["Visual Discovery", "Shopping", "Ads Platform"],
    knownInfra: ["Pinot (Real-time Analytics)", "Xenon", "Terrapin"],
    technologies: [
      {
        name: "Real-time Analytics with Apache Pinot",
        description: "Pinterest uses Apache Pinot for real-time analytics on ad metrics and engagement data.",
        confidence: { level: "publicly-disclosed", rationale: "Described in Pinterest engineering blog." },
        sources: [
          { type: "engineering-blog", title: "Real-time Analytics at Pinterest", url: "https://medium.com/pinterest-engineering/real-time-analytics-at-pinterest-1ef11fdb1099", publication: "Pinterest Engineering" },
        ],
      },
    ],
    timeline: [
      {
        year: 2013,
        event: "Sharded MySQL architecture",
        problem: "Single MySQL instance couldn't handle Pinterest's explosive growth.",
        solution: "Application-level sharding across thousands of MySQL instances, each holding a range of user data.",
        why: "Chose MySQL sharding over NoSQL because the team knew MySQL well and the access patterns were simple enough.",
        confidence: { level: "publicly-disclosed", rationale: "Described in Pinterest engineering blog." },
        sources: [{ type: "engineering-blog", title: "Sharding Pinterest: How we scaled our MySQL fleet", url: "https://medium.com/pinterest-engineering/sharding-pinterest-how-we-scaled-our-mysql-fleet-3f341e96ca6f", publication: "Pinterest Engineering" }],
      },
    ],
    unknowns: [
      { area: "Visual search model architecture", note: "Use of deep learning for visual similarity is known; exact model details are proprietary." },
    ],
    sources: [
      { type: "engineering-blog", title: "Pinterest Engineering Blog", url: "https://medium.com/pinterest-engineering", publication: "Pinterest" },
    ],
  },

  {
    id: "reddit",
    name: "Reddit",
    icon: "MessageSquare",
    accent: "#ff4500",
    scale: "1.7B+ monthly active users, millions of communities",
    coreProducts: ["Forums/Communities", "Chat", "Reddit Premium"],
    knownInfra: ["Memcached", "Cassandra", "PostgreSQL", "RabbitMQ"],
    technologies: [
      {
        name: "Reddit's Caching Architecture",
        description: "Multi-layer caching with Memcached at the core, handling the extreme read-to-write ratio of forum content.",
        confidence: { level: "publicly-disclosed", rationale: "Described in Reddit engineering blog and conference talks." },
        sources: [
          { type: "engineering-blog", title: "Reddit Engineering Blog", url: "https://www.reddit.com/r/RedditEng/", publication: "Reddit" },
        ],
        conceptIds: ["cache"],
      },
    ],
    timeline: [
      {
        year: 2017,
        event: "Migrated from bare-metal to Kubernetes",
        problem: "Managing thousands of bare-metal servers was operationally expensive and slow to scale.",
        solution: "Migrated to Kubernetes on AWS for containerized deployments and auto-scaling.",
        why: "Reddit's traffic is extremely spiky (viral posts, AMAs); Kubernetes auto-scaling handles bursts that bare metal couldn't.",
        confidence: { level: "publicly-disclosed", rationale: "Described in KubeCon presentations." },
        sources: [{ type: "conference-talk", title: "Reddit's Kubernetes Migration", url: "https://www.youtube.com/watch?v=WTbIBqhCFig", publication: "KubeCon" }],
      },
    ],
    unknowns: [
      { area: "Ranking and hot algorithm details", note: "Basic formula is public; full ranking pipeline with ML components is not documented." },
    ],
    sources: [
      { type: "engineering-blog", title: "Reddit Engineering", url: "https://www.reddit.com/r/RedditEng/", publication: "Reddit" },
    ],
  },

  {
    id: "microsoft",
    name: "Microsoft",
    icon: "Monitor",
    accent: "#00a4ef",
    scale: "Cloud revenue $100B+/year, Azure 60+ regions, Office 365 serves 400M+ users",
    coreProducts: ["Azure", "Office 365", "Windows", "GitHub", "LinkedIn", "Teams"],
    knownInfra: ["Azure Service Fabric", "SCOPE (Big Data)", "Cosmos DB"],
    technologies: [
      {
        name: "Azure Service Fabric",
        description: "Distributed systems platform for packaging, deploying, and managing microservices and containers.",
        confidence: { level: "verified", rationale: "Publicly available as Azure service and extensively documented." },
        sources: [
          { type: "documentation", title: "Azure Service Fabric Documentation", url: "https://learn.microsoft.com/en-us/azure/service-fabric/" },
        ],
      },
      {
        name: "Cosmos DB",
        description: "Globally distributed, multi-model database with tunable consistency (five levels from strong to eventual).",
        confidence: { level: "publicly-disclosed", rationale: "Architecture described in VLDB 2019 paper." },
        sources: [
          { type: "academic-paper", title: "Azure Cosmos DB", url: "https://www.vldb.org/pvldb/vol12/p2143-shukla.pdf", date: "2019", publication: "VLDB 2019" },
          { type: "documentation", title: "Cosmos DB Consistency Levels", url: "https://learn.microsoft.com/en-us/azure/cosmos-db/consistency-levels" },
        ],
        conceptIds: ["database", "consistency-models"],
      },
    ],
    timeline: [
      {
        year: 2015,
        event: "Service Fabric powers core Azure services",
        problem: "Azure's own services needed a reliable platform for stateful microservices.",
        solution: "Service Fabric — battle-tested internally on Cortana, Skype, Cosmos DB before being offered publicly.",
        why: "Stateful services need partition-aware scheduling and automatic failover — general-purpose orchestrators didn't support this.",
        confidence: { level: "publicly-disclosed", rationale: "Described in Microsoft engineering talks and Azure documentation." },
        sources: [{ type: "documentation", title: "Azure Service Fabric Overview", url: "https://learn.microsoft.com/en-us/azure/service-fabric/service-fabric-overview" }],
      },
    ],
    unknowns: [
      { area: "Teams real-time architecture", note: "General use of WebRTC and media relays is known; internal routing details are not fully public." },
    ],
    sources: [
      { type: "engineering-blog", title: "Microsoft Engineering Blog", url: "https://devblogs.microsoft.com/", publication: "Microsoft" },
    ],
  },

  {
    id: "hashicorp",
    name: "HashiCorp",
    icon: "Box",
    accent: "#000000",
    scale: "Infrastructure tooling used by thousands of enterprises",
    coreProducts: ["Terraform", "Vault", "Consul", "Nomad", "Packer", "Vagrant"],
    knownInfra: ["Raft (Consensus)", "Memberlist (Gossip)", "Go-based ecosystem"],
    technologies: [
      {
        name: "Terraform",
        description: "Infrastructure as Code tool using declarative configuration to provision and manage cloud resources.",
        confidence: { level: "verified", rationale: "Open-source (BSL) on GitHub." },
        sources: [
          { type: "open-source", title: "hashicorp/terraform", url: "https://github.com/hashicorp/terraform" },
          { type: "documentation", title: "Terraform Documentation", url: "https://developer.hashicorp.com/terraform" },
        ],
      },
      {
        name: "Consul",
        description: "Service mesh and service discovery tool with built-in health checking, KV store, and multi-datacenter support.",
        confidence: { level: "verified", rationale: "Open-source (BSL) on GitHub." },
        sources: [
          { type: "open-source", title: "hashicorp/consul", url: "https://github.com/hashicorp/consul" },
          { type: "documentation", title: "Consul Documentation", url: "https://developer.hashicorp.com/consul" },
        ],
        conceptIds: ["service-discovery"],
      },
      {
        name: "Vault",
        description: "Secrets management tool providing dynamic secrets, encryption as a service, and identity-based access.",
        confidence: { level: "verified", rationale: "Open-source (BSL) on GitHub." },
        sources: [
          { type: "open-source", title: "hashicorp/vault", url: "https://github.com/hashicorp/vault" },
        ],
      },
    ],
    timeline: [
      {
        year: 2014,
        event: "Terraform released",
        problem: "Cloud infrastructure was provisioned manually or with provider-specific tools — no unified declarative approach.",
        solution: "Terraform — write HCL, plan changes, apply them idempotently across any provider.",
        why: "Infrastructure as Code needs to be provider-agnostic and declarative to be maintainable at scale.",
        confidence: { level: "verified", rationale: "Terraform is open-source; its creation is well-documented." },
        sources: [{ type: "open-source", title: "hashicorp/terraform", url: "https://github.com/hashicorp/terraform" }],
      },
      {
        year: 2014,
        event: "Consul released for service discovery",
        problem: "Microservices needed to find each other dynamically without hardcoded addresses.",
        solution: "Consul — service discovery with health checking, DNS interface, and distributed KV store.",
        why: "In a dynamic infrastructure, IP addresses change constantly. Services need a registry, not config files.",
        confidence: { level: "verified", rationale: "Consul is open-source." },
        sources: [{ type: "open-source", title: "hashicorp/consul", url: "https://github.com/hashicorp/consul" }],
      },
    ],
    unknowns: [
      { area: "Terraform Cloud internals", note: "The open-source Terraform CLI is fully public; Terraform Cloud's state management and run infrastructure details are proprietary." },
    ],
    sources: [
      { type: "engineering-blog", title: "HashiCorp Blog", url: "https://www.hashicorp.com/blog", publication: "HashiCorp" },
    ],
  },

  {
    id: "elastic",
    name: "Elastic",
    icon: "Search",
    accent: "#fed10a",
    scale: "Used by thousands of organizations for search, logging, and observability",
    coreProducts: ["Elasticsearch", "Kibana", "Logstash", "Beats", "Elastic Cloud"],
    knownInfra: ["Lucene-based indexing", "Distributed shard architecture"],
    technologies: [
      {
        name: "Elasticsearch",
        description: "Distributed search and analytics engine built on Apache Lucene, designed for horizontal scalability.",
        confidence: { level: "verified", rationale: "Open-source (SSPL/Elastic License) with full documentation." },
        sources: [
          { type: "open-source", title: "elastic/elasticsearch", url: "https://github.com/elastic/elasticsearch" },
          { type: "documentation", title: "Elasticsearch Reference", url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html" },
        ],
        conceptIds: ["database"],
      },
    ],
    timeline: [
      {
        year: 2010,
        event: "Elasticsearch first release",
        problem: "Lucene was powerful but hard to use in distributed settings — no built-in clustering or REST API.",
        solution: "Elasticsearch — wrapped Lucene in a distributed, REST-accessible, schema-free package.",
        why: "Developers wanted full-text search without becoming Lucene experts. A JSON API over HTTP made it accessible.",
        confidence: { level: "verified", rationale: "Elasticsearch is open-source; its origin story is well-documented." },
        sources: [{ type: "open-source", title: "elastic/elasticsearch", url: "https://github.com/elastic/elasticsearch" }],
      },
    ],
    unknowns: [
      { area: "Elastic Cloud auto-scaling internals", note: "The managed service's auto-scaling heuristics are not fully public." },
    ],
    sources: [
      { type: "engineering-blog", title: "Elastic Blog", url: "https://www.elastic.co/blog/", publication: "Elastic" },
    ],
  },
];

export const TECH_ORIGINS: TechOrigin[] = [
  {
    id: "kafka",
    name: "Apache Kafka",
    icon: "Radio",
    accent: "#231f20",
    createdBy: "LinkedIn",
    year: 2011,
    problem: "LinkedIn needed a unified platform for both real-time stream processing and offline batch processing of activity data.",
    motivation: "Existing messaging systems (ActiveMQ, RabbitMQ) couldn't handle LinkedIn's throughput, and the company was drowning in point-to-point data pipelines.",
    confidence: { level: "verified", rationale: "Open-source Apache project with extensively documented origin." },
    sources: [
      { type: "academic-paper", title: "Kafka: a Distributed Messaging System for Log Processing", url: "https://www.microsoft.com/en-us/research/wp-content/uploads/2017/09/Kafka.pdf", date: "2011", publication: "NetDB Workshop" },
      { type: "engineering-blog", title: "The Log: What every software engineer should know", url: "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying", publication: "LinkedIn Engineering" },
      { type: "open-source", title: "apache/kafka", url: "https://github.com/apache/kafka" },
    ],
    relatedIds: ["linkedin"],
    failedApproaches: ["Point-to-point pipelines between services", "Traditional message queues (throughput limits)", "Batch-only processing (too much latency)"],
    designDecisions: ["Append-only commit log as the core abstraction", "Consumer groups for parallel processing", "Partitioning for horizontal scalability", "Retention-based (not deletion-based) message lifecycle"],
    tradeoffs: ["High throughput over low latency for individual messages", "At-least-once delivery over exactly-once (later added)", "Sequential I/O optimization over random access patterns"],
    industryImpact: "Kafka redefined data infrastructure. It spawned the event streaming paradigm, influenced hundreds of companies' architectures, and became the backbone of modern data platforms. The 'log as a first-class abstraction' idea influenced database design, CQRS/event sourcing, and change data capture.",
    conceptIds: ["message-queue"],
  },
  {
    id: "dynamo",
    name: "Amazon Dynamo",
    icon: "Database",
    accent: "#ff9900",
    createdBy: "Amazon",
    year: 2007,
    problem: "Amazon's shopping cart needed to be always writable — even during network partitions. No existing database prioritized availability this aggressively.",
    motivation: "A customer adding to cart should never fail. Amazon chose to sacrifice consistency for availability in this use case.",
    confidence: { level: "publicly-disclosed", rationale: "Published in SOSP 2007 paper by DeCandia et al." },
    sources: [
      { type: "academic-paper", title: "Dynamo: Amazon's Highly Available Key-value Store", url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf", date: "2007", publication: "SOSP 2007" },
    ],
    relatedIds: ["amazon"],
    failedApproaches: ["Traditional RDBMS (couldn't guarantee writes during partitions)", "Simple replication (split-brain issues)"],
    designDecisions: ["Consistent hashing for partitioning", "Vector clocks for conflict detection", "Sloppy quorums with hinted handoff", "Anti-entropy via Merkle trees"],
    tradeoffs: ["Always writable over strong consistency", "Client-side conflict resolution over server-side", "Operational simplicity over transactional features"],
    industryImpact: "Dynamo's paper became the blueprint for an entire generation of NoSQL databases: Cassandra, Riak, Voldemort. It proved that relaxing consistency could unlock availability at scale, and popularized the concepts of eventual consistency, consistent hashing, and quorum-based replication.",
    conceptIds: ["database", "nosql", "consistent-hashing", "cap-theorem"],
  },
  {
    id: "bigtable",
    name: "Google Bigtable",
    icon: "Table",
    accent: "#4285f4",
    createdBy: "Google",
    year: 2006,
    problem: "Google needed a storage system for structured data at petabyte scale across thousands of machines — web indexing, Maps, Earth, and more.",
    motivation: "Relational databases couldn't scale to Google's data volumes, and the access patterns (large sequential scans, high write throughput) needed a different architecture.",
    confidence: { level: "publicly-disclosed", rationale: "OSDI 2006 paper." },
    sources: [
      { type: "academic-paper", title: "Bigtable: A Distributed Storage System for Structured Data", url: "https://research.google/pubs/pub27898/", date: "2006", publication: "OSDI 2006" },
    ],
    relatedIds: ["google"],
    designDecisions: ["Sparse, distributed, persistent sorted map", "Tablets as unit of distribution", "Built on GFS for storage, Chubby for coordination", "Bloom filters for read optimization"],
    tradeoffs: ["Wide-column flexibility over relational model", "Scan performance over random-read latency", "Scale-out over strong cross-row transactions"],
    industryImpact: "Bigtable inspired HBase (the open-source clone), influenced Cassandra's data model, and demonstrated that column-family stores could handle web-scale workloads. It was one of the three papers (GFS, MapReduce, Bigtable) that launched the big data era.",
    conceptIds: ["database", "nosql"],
  },
  {
    id: "spanner",
    name: "Google Spanner",
    icon: "Globe",
    accent: "#0f9d58",
    createdBy: "Google",
    year: 2012,
    inspiredBy: "Bigtable + Megastore",
    problem: "Global applications needed strong consistency across continents. Bigtable offered scale but not transactions; Megastore offered transactions but not scale.",
    motivation: "Google wanted a database that was both globally distributed AND strongly consistent — something the CAP theorem seemed to forbid.",
    confidence: { level: "publicly-disclosed", rationale: "OSDI 2012 paper." },
    sources: [
      { type: "academic-paper", title: "Spanner: Google's Globally-Distributed Database", url: "https://research.google/pubs/pub39966/", date: "2012", publication: "OSDI 2012" },
    ],
    relatedIds: ["google"],
    failedApproaches: ["Megastore (cross-region transactions but high latency)", "Bigtable (scale but no cross-row transactions)"],
    designDecisions: ["TrueTime API using atomic clocks + GPS", "External consistency via commit-wait", "Paxos-based replication per partition", "Semi-relational data model with SQL support"],
    tradeoffs: ["Strong consistency over write latency (commit-wait)", "Custom hardware (atomic clocks) over commodity-only", "Global transactions over simplicity"],
    industryImpact: "Spanner proved that strong consistency at global scale is achievable (with atomic clocks). It influenced CockroachDB, YugabyteDB, and TiDB — all of which adopted Spanner's architecture for open-source global databases. It reshaped the CAP theorem conversation.",
    conceptIds: ["database", "consistency-models"],
  },
  {
    id: "borg",
    name: "Google Borg",
    icon: "Container",
    accent: "#4285f4",
    createdBy: "Google",
    year: 2003,
    problem: "Google needed to run diverse workloads (web serving, batch processing, MapReduce) on shared clusters efficiently.",
    motivation: "Without a centralized scheduler, teams would over-provision dedicated machines, wasting massive amounts of compute.",
    confidence: { level: "publicly-disclosed", rationale: "EuroSys 2015 paper." },
    sources: [
      { type: "academic-paper", title: "Large-scale cluster management at Google with Borg", url: "https://research.google/pubs/pub43438/", date: "2015", publication: "EuroSys 2015" },
    ],
    relatedIds: ["google", "kubernetes"],
    designDecisions: ["Centralized controller (Borgmaster) with Paxos", "Cells of ~10K machines", "Alloc sets for co-scheduling related tasks", "Priority-based preemption"],
    tradeoffs: ["Utilization efficiency over isolation simplicity", "Centralized scheduling over distributed coordination", "Complexity for operators over simplicity for users"],
    industryImpact: "Borg is the direct ancestor of Kubernetes. Its lessons about declarative scheduling, container isolation, and cluster management shaped the entire container orchestration industry.",
    conceptIds: ["kubernetes"],
  },
  {
    id: "kubernetes-origin",
    name: "Kubernetes",
    icon: "Ship",
    accent: "#326ce5",
    createdBy: "Google",
    year: 2014,
    inspiredBy: "Borg",
    problem: "The industry needed an open-source container orchestration platform — Borg's ideas were trapped inside Google.",
    motivation: "Google wanted to commoditize container orchestration (making cloud infrastructure portable) while drawing the industry toward its operational model.",
    confidence: { level: "verified", rationale: "Kubernetes is fully open-source under CNCF." },
    sources: [
      { type: "open-source", title: "kubernetes/kubernetes", url: "https://github.com/kubernetes/kubernetes" },
      { type: "academic-paper", title: "Borg, Omega, and Kubernetes", url: "https://research.google/pubs/pub44843/", date: "2016", publication: "ACM Queue" },
    ],
    relatedIds: ["google"],
    failedApproaches: ["Docker Swarm (simpler but less capable)", "Mesos (powerful but complex, not container-native)"],
    designDecisions: ["Declarative desired-state model", "Pods as the atomic unit (not containers)", "Controllers and reconciliation loops", "Extensible API via Custom Resource Definitions"],
    tradeoffs: ["Flexibility and extensibility over simplicity", "Declarative model over imperative commands", "Community-driven development over single-vendor control"],
    industryImpact: "Kubernetes won the container orchestration war and became the de facto standard. It spawned an entire ecosystem (service meshes, operators, GitOps), created the CNCF, and fundamentally changed how software is deployed.",
    conceptIds: ["kubernetes"],
  },
  {
    id: "terraform-origin",
    name: "Terraform",
    icon: "Layers",
    accent: "#7b42bc",
    createdBy: "HashiCorp",
    year: 2014,
    problem: "Cloud infrastructure was provisioned manually or with provider-specific tools (CloudFormation, etc.) — there was no unified, declarative, provider-agnostic approach.",
    motivation: "As organizations adopted multi-cloud, they needed one tool and one language to manage infrastructure across AWS, GCP, Azure, and dozens of SaaS providers.",
    confidence: { level: "verified", rationale: "Open-source on GitHub." },
    sources: [
      { type: "open-source", title: "hashicorp/terraform", url: "https://github.com/hashicorp/terraform" },
      { type: "documentation", title: "Terraform Documentation", url: "https://developer.hashicorp.com/terraform" },
    ],
    relatedIds: ["hashicorp"],
    designDecisions: ["HCL as a human-friendly config language", "Provider plugin architecture", "Plan-then-apply workflow", "State file as source of truth"],
    tradeoffs: ["Provider-agnostic over deep provider integration", "Declarative simplicity over imperative flexibility", "State file management overhead over stateless operation"],
    industryImpact: "Terraform defined Infrastructure as Code for the cloud era. Its provider model became the standard pattern for multi-cloud tooling, and HCL influenced configuration language design across the industry.",
  },
  {
    id: "consul-origin",
    name: "Consul",
    icon: "Network",
    accent: "#dc477d",
    createdBy: "HashiCorp",
    year: 2014,
    problem: "Microservices needed to find each other dynamically without hardcoded addresses or manual configuration.",
    motivation: "In cloud infrastructure, IP addresses are ephemeral. Services need a registry that automatically tracks what's alive and where.",
    confidence: { level: "verified", rationale: "Open-source on GitHub." },
    sources: [
      { type: "open-source", title: "hashicorp/consul", url: "https://github.com/hashicorp/consul" },
    ],
    relatedIds: ["hashicorp"],
    designDecisions: ["Raft consensus for consistency", "Gossip protocol (Serf) for failure detection", "DNS interface for zero-code integration", "Multi-datacenter by design"],
    tradeoffs: ["Consistency (CP) over availability during partitions", "Built-in service mesh over simplicity", "Multi-datacenter support over single-cluster simplicity"],
    industryImpact: "Consul popularized service discovery as a first-class infrastructure concern and helped bridge the gap between traditional infrastructure and microservices.",
    conceptIds: ["service-discovery"],
  },
  {
    id: "redis-origin",
    name: "Redis",
    icon: "Zap",
    accent: "#dc382d",
    createdBy: "Salvatore Sanfilippo",
    year: 2009,
    problem: "Web applications needed a fast data structure server for caching, sessions, leaderboards, and pub/sub — memcached was too limited.",
    motivation: "Antirez wanted a 'data structure server' that could store more than just strings — lists, sets, sorted sets, hashes — all in memory with persistence options.",
    confidence: { level: "verified", rationale: "Redis is fully open-source." },
    sources: [
      { type: "open-source", title: "redis/redis", url: "https://github.com/redis/redis" },
      { type: "documentation", title: "Redis Documentation", url: "https://redis.io/docs/" },
    ],
    relatedIds: [],
    designDecisions: ["Single-threaded event loop (simplicity + no locks)", "Rich data structures as first-class citizens", "RDB snapshots + AOF for persistence", "Lua scripting for atomic operations"],
    tradeoffs: ["Memory-bound capacity over disk-based scale", "Single-threaded simplicity over multi-core utilization", "Speed over durability (configurable)"],
    industryImpact: "Redis became the default caching layer for web applications and expanded into pub/sub, streams, and even primary database use cases. Its 'data structure server' concept influenced how developers think about caching.",
    conceptIds: ["cache"],
  },
  {
    id: "elasticsearch-origin",
    name: "Elasticsearch",
    icon: "Search",
    accent: "#fed10a",
    createdBy: "Shay Banon (Elastic)",
    year: 2010,
    problem: "Apache Lucene was powerful but had no built-in distributed mode, REST API, or easy clustering — it was a library, not a service.",
    motivation: "Developers wanted full-text search without becoming Lucene experts. A distributed, REST-accessible search engine would make search a commodity.",
    confidence: { level: "verified", rationale: "Open-source on GitHub." },
    sources: [
      { type: "open-source", title: "elastic/elasticsearch", url: "https://github.com/elastic/elasticsearch" },
      { type: "documentation", title: "Elasticsearch Guide", url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html" },
    ],
    relatedIds: ["elastic"],
    designDecisions: ["Lucene as the indexing engine", "Automatic sharding and replication", "Schema-free JSON documents", "REST API over HTTP"],
    tradeoffs: ["Near-real-time over real-time indexing", "Search performance over write throughput", "Flexibility (schema-free) over strict data modeling"],
    industryImpact: "Elasticsearch made full-text search accessible to every developer. The ELK stack (Elasticsearch, Logstash, Kibana) became the dominant open-source logging and observability platform.",
  },
];

export function buildKnowledgeGraph(): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } {
  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const seen = new Set<string>();

  const add = (n: KnowledgeGraphNode) => {
    if (seen.has(n.id)) return;
    seen.add(n.id);
    nodes.push(n);
  };

  for (const c of COMPANIES) {
    add({ id: `company-${c.id}`, label: c.name, kind: "company", accent: c.accent === "#000000" ? "#888" : c.accent });
  }

  for (const t of TECH_ORIGINS) {
    add({ id: `tech-${t.id}`, label: t.name, kind: "technology", accent: t.accent === "#000000" ? "#888" : t.accent });
    const companyNode = COMPANIES.find((c) => c.name === t.createdBy || c.id === t.createdBy.toLowerCase());
    if (companyNode) {
      edges.push({ source: `company-${companyNode.id}`, target: `tech-${t.id}`, label: "created" });
    }
    for (const rid of t.relatedIds) {
      if (COMPANIES.find((c) => c.id === rid)) {
        edges.push({ source: `tech-${t.id}`, target: `company-${rid}`, label: "used by" });
      }
    }
    if (t.inspiredBy) {
      const inspired = TECH_ORIGINS.find((o) => o.name.toLowerCase().includes(t.inspiredBy!.toLowerCase()));
      if (inspired) {
        edges.push({ source: `tech-${inspired.id}`, target: `tech-${t.id}`, label: "inspired" });
      }
    }
    for (const cid of t.conceptIds ?? []) {
      const conceptId = `concept-${cid}`;
      add({ id: conceptId, label: cid.replace(/-/g, " "), kind: "concept", accent: "#818cf8" });
      edges.push({ source: `tech-${t.id}`, target: conceptId, label: "implements" });
    }
  }

  for (const c of COMPANIES) {
    for (const tech of c.technologies) {
      for (const cid of tech.conceptIds ?? []) {
        const conceptId = `concept-${cid}`;
        add({ id: conceptId, label: cid.replace(/-/g, " "), kind: "concept", accent: "#818cf8" });
      }
    }
  }

  return { nodes, edges };
}

export function getCompany(id: string): CompanyProfile | undefined {
  return COMPANIES.find((c) => c.id === id);
}

export function getTechOrigin(id: string): TechOrigin | undefined {
  return TECH_ORIGINS.find((t) => t.id === id);
}
