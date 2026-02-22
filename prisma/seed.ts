// prisma/seed.ts
// Run: npm run db:seed
// Seeds curated resources, pre-built flashcards, and starter knowledge pages

import { PrismaClient, KnowledgeCategory, ResourceType, Difficulty, SourceType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // ─── Resources ─────────────────────────────────────────────────────────────
  const resources = [
    // FOUNDRY
    { category: KnowledgeCategory.FOUNDRY, title: 'Foundry Documentation Home', url: 'https://www.palantir.com/docs/foundry/', description: 'Official Palantir Foundry documentation — complete reference for all Foundry features, concepts, and APIs.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true, isPinned: true },
    { category: KnowledgeCategory.FOUNDRY, title: 'Foundry Transforms Reference', url: 'https://www.palantir.com/docs/foundry/transforms-python/overview/', description: 'Complete guide to Python and PySpark transforms in Foundry Code Repositories.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.FOUNDRY, title: 'Foundry Data Connection Docs', url: 'https://www.palantir.com/docs/foundry/data-connection/overview/', description: 'Magritte-based data ingestion: connectors, sources, and sync configuration.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.FOUNDRY, title: 'Contour Analytics Reference', url: 'https://www.palantir.com/docs/foundry/contour/overview/', description: 'Visual data analytics in Foundry — charts, pivots, and interactive dashboards.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.FOUNDRY, title: 'Workshop App Builder Docs', url: 'https://www.palantir.com/docs/foundry/workshop/overview/', description: 'Build operational applications with Workshop — widgets, layouts, and data binding.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.FOUNDRY, title: 'Slate Application Framework', url: 'https://www.palantir.com/docs/foundry/slate/overview/', description: 'Low-code application development with Slate — queries, transforms, and UI widgets.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.FOUNDRY, title: 'Foundry ML Documentation', url: 'https://www.palantir.com/docs/foundry/machine-learning/overview/', description: 'End-to-end machine learning in Foundry: model training, live deployment, and MLflow integration.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.FOUNDRY, title: 'Blueprint React UI Library', url: 'https://blueprintjs.com/', description: 'Palantir-maintained React UI toolkit used throughout Foundry applications.', resourceType: ResourceType.SDK, isOfficial: true },
    { category: KnowledgeCategory.FOUNDRY, title: 'palantir/blueprint GitHub', url: 'https://github.com/palantir/blueprint', description: 'Source code for Blueprint — the UI library powering Foundry frontend applications.', resourceType: ResourceType.GITHUB, isOfficial: true },
    { category: KnowledgeCategory.FOUNDRY, title: 'palantir/conjure GitHub', url: 'https://github.com/palantir/conjure', description: 'Interface definition language for Palantir APIs. Used to define typed service contracts.', resourceType: ResourceType.GITHUB, isOfficial: true },
    { category: KnowledgeCategory.FOUNDRY, title: 'palantir/conjure-typescript GitHub', url: 'https://github.com/palantir/conjure-typescript', description: 'TypeScript generator for Conjure-defined API contracts.', resourceType: ResourceType.GITHUB, isOfficial: true },
    { category: KnowledgeCategory.FOUNDRY, title: 'PySpark in Foundry Overview', url: 'https://www.palantir.com/docs/foundry/transforms-python/pyspark/', description: 'Guide to using PySpark within Foundry Python transforms for large-scale data processing.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },

    // ONTOLOGY
    { category: KnowledgeCategory.ONTOLOGY, title: 'Ontology Overview', url: 'https://www.palantir.com/docs/foundry/ontology/overview/', description: 'Core concepts of the Palantir Ontology — Object Types, Links, Actions, and the semantic data model.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true, isPinned: true },
    { category: KnowledgeCategory.ONTOLOGY, title: 'Ontology SDK (TypeScript)', url: 'https://www.palantir.com/docs/foundry/ontology-sdk/overview/', description: 'TypeScript SDK for querying and mutating the Ontology from external applications.', resourceType: ResourceType.SDK, isOfficial: true, isPinned: true },
    { category: KnowledgeCategory.ONTOLOGY, title: 'Ontology SDK (Python)', url: 'https://www.palantir.com/docs/foundry/osdk-python/', description: 'Python SDK for programmatic access to Ontology objects, actions, and queries.', resourceType: ResourceType.SDK, isOfficial: true, isPinned: true },
    { category: KnowledgeCategory.ONTOLOGY, title: 'palantir/osdk-ts GitHub', url: 'https://github.com/palantir/osdk-ts', description: 'Open-source TypeScript Ontology SDK — source code, examples, and release notes.', resourceType: ResourceType.GITHUB, isOfficial: true },
    { category: KnowledgeCategory.ONTOLOGY, title: 'Object Types Reference', url: 'https://www.palantir.com/docs/foundry/ontology/object-types/', description: 'Deep reference for defining and managing Object Types in the Ontology Editor.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.ONTOLOGY, title: 'Actions & Validation Rules', url: 'https://www.palantir.com/docs/foundry/ontology/actions/', description: 'Define Actions that create, modify, or delete Ontology objects with validation rules and webhooks.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.ONTOLOGY, title: 'Ontology Links Reference', url: 'https://www.palantir.com/docs/foundry/ontology/link-types/', description: 'Configure relationships between Object Types — cardinality, directionality, and display.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.ONTOLOGY, title: 'Time Series Properties', url: 'https://www.palantir.com/docs/foundry/ontology/time-series/', description: 'Temporal data in the Ontology: time series properties, sync configurations, and metric derivation.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },

    // AIP
    { category: KnowledgeCategory.AIP, title: 'AIP Documentation Home', url: 'https://www.palantir.com/docs/foundry/aip/overview/', description: 'AI Platform complete reference — AIP Logic, Copilot, Studio, and agent development.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true, isPinned: true },
    { category: KnowledgeCategory.AIP, title: 'AIP Logic Reference', url: 'https://www.palantir.com/docs/foundry/aip/logic/', description: 'Define AI-powered functions in AIP Logic that call LLMs and interact with the Ontology.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true, isPinned: true },
    { category: KnowledgeCategory.AIP, title: 'AIP Copilot Overview', url: 'https://www.palantir.com/docs/foundry/aip/copilot/', description: 'Deploy AI copilots into Workshop and other surfaces using AIP Logic functions.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.AIP, title: 'AIP Studio (Agent Builder)', url: 'https://www.palantir.com/docs/foundry/aip/studio/', description: 'Build, test, and deploy AI agents with drag-and-drop visual tooling in AIP Studio.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.AIP, title: 'Function Repository Docs', url: 'https://www.palantir.com/docs/foundry/aip/functions/', description: 'Write TypeScript functions that extend the Ontology and power AIP Logic behaviors.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.AIP, title: 'Palantir AIP Blog Posts', url: 'https://blog.palantir.com/tagged/aip', description: 'Official blog articles covering AIP capabilities, customer use cases, and technical details.', resourceType: ResourceType.ARTICLE, isOfficial: true },

    // APOLLO
    { category: KnowledgeCategory.APOLLO, title: 'Apollo Documentation Home', url: 'https://www.palantir.com/docs/apollo/', description: 'Complete Apollo reference — software distribution, fleet management, and configuration policies.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true, isPinned: true },
    { category: KnowledgeCategory.APOLLO, title: 'Apollo Fleet Management', url: 'https://www.palantir.com/docs/apollo/fleet-management/', description: 'Manage distributed deployments of Foundry — enrollment, health monitoring, and lifecycle.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.APOLLO, title: 'Apollo Configuration Policies', url: 'https://www.palantir.com/docs/apollo/configuration/', description: 'Policy-based configuration management for Apollo-managed environments.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.APOLLO, title: 'Air-Gapped Deployment Guide', url: 'https://www.palantir.com/docs/apollo/air-gapped/', description: 'Deploying Palantir software in disconnected, air-gapped government and enterprise environments.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },

    // GENERAL
    { category: KnowledgeCategory.GENERAL, title: 'Palantir Blog', url: 'https://blog.palantir.com/', description: 'Official Palantir engineering blog — product announcements, engineering deep dives, and customer stories.', resourceType: ResourceType.ARTICLE, isOfficial: true, isPinned: true },
    { category: KnowledgeCategory.GENERAL, title: 'Palantir Developer Hub', url: 'https://www.palantir.com/docs/', description: 'Central documentation portal for all Palantir products and SDKs.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true, isPinned: true },
    { category: KnowledgeCategory.GENERAL, title: 'Palantir YouTube Channel', url: 'https://www.youtube.com/@palantirtechnologies', description: 'Official Palantir YouTube — product demos, conference talks, and Palantir Forward keynotes.', resourceType: ResourceType.YOUTUBE, isOfficial: true, isPinned: true },
    { category: KnowledgeCategory.GENERAL, title: 'Palantir Community Forum', url: 'https://community.palantir.com/', description: 'Official Palantir developer community — Q&A, product feedback, and technical discussions.', resourceType: ResourceType.COMMUNITY, isOfficial: true },
    { category: KnowledgeCategory.GENERAL, title: 'palantir GitHub Organization', url: 'https://github.com/palantir', description: 'All open-source Palantir repositories — Blueprint, Conjure, OSDK, and more.', resourceType: ResourceType.GITHUB, isOfficial: true, isPinned: true },
    { category: KnowledgeCategory.GENERAL, title: 'Palantir SEC Filings (EDGAR)', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=PLTR&type=10-K&dateb=&owner=include&count=40', description: '10-K, 10-Q, and 8-K filings for PLTR — earnings, risk factors, and business updates.', resourceType: ResourceType.DOCUMENTATION, isOfficial: true },
    { category: KnowledgeCategory.GENERAL, title: 'Palantir Forward Conference Talks (2023)', url: 'https://www.youtube.com/watch?v=YWVf1MAQEFQ', description: 'Palantir Forward 2023 keynote and technical sessions — AIP launch and Foundry demonstrations.', resourceType: ResourceType.YOUTUBE, isOfficial: true },
    { category: KnowledgeCategory.GENERAL, title: 'r/palantir Subreddit', url: 'https://www.reddit.com/r/palantir/', description: 'Community discussion of Palantir technologies — includes criticism, use cases, and career advice.', resourceType: ResourceType.COMMUNITY, isOfficial: false },
    { category: KnowledgeCategory.GENERAL, title: 'Palantir on Hacker News', url: 'https://hn.algolia.com/?dateRange=all&page=0&prefix=true&query=palantir&sort=byPopularity&type=story', description: 'Aggregated Hacker News discussions about Palantir — technical criticism, comparisons, and community perspectives.', resourceType: ResourceType.COMMUNITY, isOfficial: false },
  ]

  for (const r of resources) {
    await prisma.resource.upsert({
      where: { url: r.url },
      update: r,
      create: r,
    })
  }
  console.log(`✅ Seeded ${resources.length} resources`)

  // ─── Starter Knowledge Pages ─────────────────────────────────────────────────
  const knowledgePages = [
    {
      category: KnowledgeCategory.FOUNDRY,
      slug: 'foundry-platform-overview',
      title: 'Palantir Foundry — Platform Overview',
      subCategory: 'Core Concepts',
      sourceType: SourceType.SEEDED,
      tags: ['foundry', 'platform', 'overview', 'core-concepts'],
      content: `# Palantir Foundry — Platform Overview

## What is Foundry?

Palantir Foundry is an enterprise data integration and analysis platform that provides a unified operating system for data. It enables organizations to integrate, transform, analyze, and act on data at scale. Foundry sits at the core of Palantir's commercial offerings and is used by governments, defense agencies, healthcare systems, and Fortune 500 companies.

## Core Architecture

Foundry is built on three foundational pillars:

### 1. Data Integration Layer
The data layer handles ingestion from hundreds of source types via **Magritte** connectors. Data lands in Foundry as **Datasets** — immutable, versioned snapshots with branch-based development (similar to Git).

- **Raw Datasets**: Ingested directly from connectors
- **Derived Datasets**: Produced by transforms (Python, PySpark, SQL)
- **Branches**: Isolated development environments — merge changes with confidence

### 2. Transformation & Logic Layer
Code Repositories house Python and PySpark transform logic. The platform handles compute scheduling, dependency resolution, and incremental computation automatically.

\`\`\`python
# Example: Python Transform
from transforms.api import transform, Input, Output

@transform(
    output=Output('/path/to/output/dataset'),
    source=Input('/path/to/source/dataset'),
)
def compute(output, source):
    df = source.dataframe()
    result = df.groupBy('entity_id').agg({'value': 'sum'})
    output.write_dataframe(result)
\`\`\`

### 3. Ontology Layer
The Ontology translates raw data into business objects — **Patients**, **Orders**, **Missions**, **Equipment**. Applications built in Foundry query the Ontology rather than raw datasets, creating a clean separation of concerns.

## Key Products Within Foundry

| Product | Purpose |
|---------|---------|
| **Magritte** | Data connectors and ingestion scheduling |
| **Code Repositories** | Python/PySpark/SQL transform authoring |
| **Contour** | Visual analytics and self-serve exploration |
| **Workshop** | Operational application builder |
| **Slate** | Low-code application development |
| **Foundry ML** | Model training, evaluation, and live deployment |
| **Quill** | AI-powered document analysis |

## Foundry Security Model

Foundry implements column-level, row-level, and dataset-level access controls through **Markings**. Sensitive data can be restricted to specific groups, roles, or clearance levels. All data operations are audited.

## Deployment Models

- **Cloud-hosted SaaS**: Palantir-managed on AWS/Azure/GCP
- **Customer-hosted**: Deployed in customer VPC via Apollo
- **Air-gapped / JWICS**: Disconnected environments via Apollo (common in DoD)

## Getting Started

1. Request access to your Foundry enrollment URL
2. Navigate to the **Data Catalog** to browse available datasets
3. Open **Code Repositories** to write your first transform
4. Use **Contour** to explore transformed data visually
5. Define Ontology objects in the **Ontology Manager**
`,
      excerpt: 'Palantir Foundry is an enterprise data integration platform providing a unified operating system for data. This overview covers the core architecture, key products, security model, and deployment options.',
    },
    {
      category: KnowledgeCategory.FOUNDRY,
      slug: 'pyspark-transforms-guide',
      title: 'PySpark Transforms in Foundry — Complete Guide',
      subCategory: 'Transforms',
      sourceType: SourceType.SEEDED,
      tags: ['pyspark', 'transforms', 'python', 'spark', 'data-processing'],
      content: `# PySpark Transforms in Foundry — Complete Guide

## Overview

PySpark transforms are the primary way to process large-scale data in Foundry. They run on managed Apache Spark clusters and support the full PySpark API plus Foundry-specific extensions.

## Basic Transform Structure

\`\`\`python
from transforms.api import transform, Input, Output
from pyspark.sql import functions as F, types as T

@transform(
    output=Output('/path/to/output'),
    input_data=Input('/path/to/input'),
)
def compute_transform(output, input_data):
    df = input_data.dataframe()
    
    result = (
        df
        .filter(F.col('status') == 'ACTIVE')
        .groupBy('department', F.year('created_date').alias('year'))
        .agg(
            F.count('*').alias('count'),
            F.sum('amount').alias('total_amount'),
            F.avg('amount').alias('avg_amount'),
        )
        .orderBy('department', 'year')
    )
    
    output.write_dataframe(result)
\`\`\`

## Incremental Transforms

For large datasets, use incremental processing to only compute changed data:

\`\`\`python
from transforms.api import incremental, transform, Input, Output

@incremental()
@transform(
    output=Output('/my/output'),
    source=Input('/my/source'),
)
def incremental_transform(output, source):
    # Only processes new/changed records since last run
    new_data = source.dataframe()
    output.write_dataframe(new_data)
\`\`\`

## Working with Multiple Inputs

\`\`\`python
@transform(
    output=Output('/path/to/joined_output'),
    orders=Input('/data/orders'),
    customers=Input('/data/customers'),
    products=Input('/data/products'),
)
def join_transform(output, orders, customers, products):
    orders_df = orders.dataframe()
    customers_df = customers.dataframe()
    products_df = products.dataframe()
    
    result = (
        orders_df
        .join(customers_df, 'customer_id', 'left')
        .join(products_df, 'product_id', 'left')
        .select(
            'order_id', 'order_date',
            'customer_name', 'customer_email',
            'product_name', 'quantity', 'unit_price',
            (F.col('quantity') * F.col('unit_price')).alias('line_total')
        )
    )
    
    output.write_dataframe(result)
\`\`\`

## Schema Definition

Define explicit schemas to avoid type inference overhead on large datasets:

\`\`\`python
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, TimestampType, DoubleType

output_schema = StructType([
    StructField('id',          StringType(),    False),
    StructField('name',        StringType(),    True),
    StructField('value',       DoubleType(),    True),
    StructField('updated_at',  TimestampType(), True),
    StructField('count',       IntegerType(),   True),
])

@transform(
    output=Output('/path/to/output', schema=output_schema),
    source=Input('/path/to/source'),
)
def typed_transform(output, source):
    df = source.dataframe(schema=output_schema)
    output.write_dataframe(df)
\`\`\`

## UDFs (User-Defined Functions)

\`\`\`python
from pyspark.sql.functions import udf
from pyspark.sql.types import StringType
import re

@udf(returnType=StringType())
def clean_text(text):
    if not text:
        return None
    return re.sub(r'[^a-zA-Z0-9\\s]', '', text.strip().lower())

@transform(output=Output('/clean/text'), source=Input('/raw/text'))
def clean_transform(output, source):
    df = source.dataframe()
    result = df.withColumn('clean_text', clean_text(F.col('raw_text')))
    output.write_dataframe(result)
\`\`\`

## Performance Best Practices

1. **Partition your output** by high-cardinality columns used in filters
2. **Cache intermediate DataFrames** used more than once
3. **Avoid UDFs** when built-in Spark functions exist (10-100x faster)
4. **Use broadcast joins** for small lookup tables (<100MB)
5. **Filter early** — reduce data volume before joins and aggregations

\`\`\`python
# ✅ Good: filter early, broadcast small table
small_lookup = F.broadcast(lookup_df)
result = large_df.filter(F.col('active') == True).join(small_lookup, 'id')

# ❌ Bad: join first, filter after
result = large_df.join(lookup_df, 'id').filter(F.col('active') == True)
\`\`\`

## Common Patterns

### Slowly Changing Dimensions (SCD Type 2)
\`\`\`python
from pyspark.sql import Window

window = Window.partitionBy('entity_id').orderBy(F.desc('effective_date'))

scd2 = (
    df
    .withColumn('rn', F.row_number().over(window))
    .withColumn('is_current', F.col('rn') == 1)
    .drop('rn')
)
\`\`\`

### Deduplication
\`\`\`python
deduplicated = (
    df
    .withColumn('rn', F.row_number().over(
        Window.partitionBy('id').orderBy(F.desc('updated_at'))
    ))
    .filter(F.col('rn') == 1)
    .drop('rn')
)
\`\`\`
`,
      excerpt: 'Complete guide to PySpark transforms in Foundry — basic structure, incremental processing, multi-input joins, schema definition, UDFs, and performance best practices.',
    },
    {
      category: KnowledgeCategory.ONTOLOGY,
      slug: 'ontology-core-concepts',
      title: 'Palantir Ontology — Core Concepts & Architecture',
      subCategory: 'Core Concepts',
      sourceType: SourceType.SEEDED,
      tags: ['ontology', 'object-types', 'actions', 'links', 'semantic-layer'],
      content: `# Palantir Ontology — Core Concepts & Architecture

## What is the Ontology?

The Palantir Ontology is a semantic layer that sits above raw data and represents your organization's domain model as typed, connected business objects. Instead of working with raw tables and datasets, applications and AI agents interact with **Objects** that have meaning: Patients, Orders, Missions, Assets, Contracts.

The Ontology is the foundation of AIP — every AI function, every Copilot action, and every Workshop application reads from and writes to the Ontology.

## Core Building Blocks

### Object Types

Object Types define the schema of your business entities. Each Object Type has:

- **Primary Key**: Unique identifier property
- **Properties**: Typed attributes (string, integer, boolean, timestamp, geopoint, time-series)
- **Display Name**: Human-readable label
- **Icon & Color**: Visual representation in UIs

\`\`\`
Object Type: Patient
├── Properties:
│   ├── patient_id (string, primary key)
│   ├── first_name (string)
│   ├── last_name (string)
│   ├── date_of_birth (date)
│   ├── diagnosis_codes (string[])
│   └── admission_timestamp (timestamp)
└── Backed by: /clinical/patients dataset
\`\`\`

### Link Types

Link Types define typed relationships between Object Types:

- **One-to-Many**: Order → OrderLineItems
- **Many-to-Many**: Patient ↔ Physician
- **Self-referential**: Employee → Manager (Employee)

\`\`\`
Link Type: PatientAdmissions
├── Object Type A: Patient
├── Object Type B: HospitalAdmission
├── Cardinality: One Patient → Many Admissions
└── Display: "Admissions" (from Patient) / "Patient" (from Admission)
\`\`\`

### Actions

Actions are typed, audited operations that create, modify, or delete Ontology objects. They enforce validation rules before applying changes.

\`\`\`typescript
// Action Definition (TypeScript Function Repository)
import { Action } from '@osdk/foundry';

export const updatePatientDiagnosis = Action({
  apiName: 'update-patient-diagnosis',
  parameters: {
    patient: { type: 'object', objectType: 'Patient' },
    diagnosisCode: { type: 'string' },
    notes: { type: 'string', nullable: true },
  },
  validation: [
    ({ diagnosisCode }) => diagnosisCode.startsWith('ICD-') || 'Must be a valid ICD code',
  ],
});
\`\`\`

## The Ontology SDK (OSDK)

The OSDK provides TypeScript and Python clients for querying and mutating the Ontology from external applications.

### TypeScript OSDK Example

\`\`\`typescript
import { createClient } from '@osdk/client';
import { createPalantirJwtTokenProvider } from '@osdk/oauth';

const client = createClient(
  'https://your-stack.palantirfoundry.com',
  'my-app-client-id',
  createPalantirJwtTokenProvider({ token: process.env.FOUNDRY_TOKEN }),
);

// Query objects
const patients = await client(Patient)
  .where({ diagnosisCodes: { $contains: 'ICD-10-E11' } })
  .orderBy({ lastName: 'asc' })
  .limit(50)
  .all();

// Navigate links
const admissions = await patient.$link.admissions.all();

// Apply an action
await client(UpdatePatientDiagnosis)({
  patient: patientObject,
  diagnosisCode: 'ICD-10-E11.9',
  notes: 'Type 2 diabetes, well-controlled',
});
\`\`\`

### Python OSDK Example

\`\`\`python
from foundry_sdk import FoundryClient

client = FoundryClient(
    hostname="https://your-stack.palantirfoundry.com",
    auth=UserTokenAuth(token=os.environ['FOUNDRY_TOKEN']),
)

# Query
patients = client.ontology.objects.Patient.filter(
    Patient.diagnosis_codes.contains('ICD-10-E11')
).all()

# Apply action
client.ontology.actions.update_patient_diagnosis(
    patient=patient_obj,
    diagnosis_code='ICD-10-E11.9',
)
\`\`\`

## Ontology Search & Filtering

\`\`\`typescript
// Full-text search
const results = await client(Asset)
  .search('F-35 maintenance')
  .limit(20)
  .all();

// Property filters
const activeContracts = await client(Contract)
  .where({
    $and: [
      { status: { $eq: 'ACTIVE' } },
      { value: { $gt: 1_000_000 } },
      { expirationDate: { $gt: new Date() } },
    ]
  })
  .all();

// Aggregations
const summary = await client(Order)
  .groupBy({ department: 'exact' })
  .aggregate({
    total: { $sum: 'amount' },
    count: { $count: '*' },
  });
\`\`\`

## Why the Ontology Matters for AI

AIP Logic functions receive objects from the Ontology as context. When an LLM is asked "What is the status of Order #12345?", AIP automatically fetches the Order object and provides it as grounded context — preventing hallucination by giving the model real, live data.

This is the core Palantir advantage: **AI with grounded, real-time enterprise context**.
`,
      excerpt: 'Deep dive into Palantir Ontology architecture — Object Types, Link Types, Actions, and the OSDK. Includes working TypeScript and Python code examples.',
    },
    {
      category: KnowledgeCategory.AIP,
      slug: 'aip-platform-overview',
      title: 'AIP (AI Platform) — Complete Overview & Architecture',
      subCategory: 'Core Concepts',
      sourceType: SourceType.SEEDED,
      tags: ['aip', 'ai-platform', 'logic', 'copilot', 'studio', 'llm', 'agents'],
      content: `# AIP (AI Platform) — Complete Overview & Architecture

## What is AIP?

Palantir AIP (AI Platform) is the AI layer built on top of Foundry and the Ontology. It enables organizations to deploy production-grade AI agents, copilots, and AI-powered workflows that act on real enterprise data — all with built-in governance, auditability, and security.

AIP was announced at Palantir Forward 2023 and has become Palantir's fastest-growing product, driving significant commercial revenue.

## AIP Architecture Components

### 1. AIP Logic

AIP Logic is a serverless function environment where TypeScript functions call LLMs and interact with the Ontology. Functions can:

- Retrieve Ontology objects as context for LLM prompts
- Apply Ontology Actions to update business data
- Chain multiple LLM calls in a pipeline
- Return structured outputs consumed by Workshop, Copilot, or external APIs

\`\`\`typescript
// AIP Logic Function Example
import { Function, Context } from '@osdk/aip';
import { MissionPlan, ThreatAssessment } from './ontology-objects';

export const analyzeThreatAndSuggestAction = Function({
  name: 'analyze-threat',
  description: 'Analyzes a threat assessment and suggests a mission response',
  parameters: {
    threatId: { type: 'string', description: 'Threat assessment object ID' },
  },
  
  async execute({ threatId }, context: Context) {
    // 1. Fetch Ontology object — real, live data
    const threat = await context.ontology.ThreatAssessment.get(threatId);
    
    // 2. Call LLM with grounded context
    const analysis = await context.llm.complete({
      model: 'gpt-4o',
      system: 'You are a military planning assistant. Analyze the threat and recommend action.',
      user: \`Threat Data: \${JSON.stringify(threat)}\n\nProvide: severity rating, recommended response, estimated timeline.\`,
      outputFormat: { severity: 'string', response: 'string', timeline: 'string' },
    });
    
    // 3. Apply an Action to record the analysis
    await context.ontology.actions.recordThreatAnalysis({
      threat,
      aiAnalysis: analysis.response,
      severity: analysis.severity,
    });
    
    return analysis;
  },
});
\`\`\`

### 2. AIP Copilot

Copilots are AI assistants embedded into Workshop applications. They use AIP Logic functions as tools, allowing users to ask natural-language questions and trigger business operations.

**Copilot Anatomy:**
- **Trigger**: User types a message in a Workshop Copilot widget
- **Intent Detection**: LLM identifies which AIP Logic function to invoke
- **Function Call**: AIP executes the function with extracted parameters
- **Response**: Structured output formatted as a natural-language response

### 3. AIP Studio

AIP Studio is a visual agent builder — drag and drop LLM nodes, data retrieval steps, actions, and conditional branches to create multi-step AI workflows without code.

**Studio Node Types:**
- **LLM Node**: Call any configured LLM model
- **Ontology Query Node**: Retrieve objects by filter
- **Action Node**: Apply an Ontology action
- **Branch Node**: Conditional logic based on LLM output
- **Loop Node**: Iterate over a list of objects

### 4. Function Repository

TypeScript functions that extend the Ontology — callable from AIP Logic, Workshop widgets, Copilot, and external APIs via the OSDK.

## Supported LLMs in AIP

| Provider | Models |
|----------|--------|
| OpenAI | GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus |
| Meta | Llama 3.1 (via Azure/AWS) |
| Google | Gemini 1.5 Pro, Gemini 1.0 |
| Azure OpenAI | All GPT-4 variants |
| Palantir-hosted | Fine-tuned models in secure enclaves |

## AIP Security & Governance

**Critical for enterprise adoption:**
- All LLM inputs/outputs are logged and auditable
- Markings are enforced — LLMs only see data the user can access
- No training on customer data (explicit Palantir policy)
- RBAC controls which users can access which AIP functions
- PII/PHI masking can be applied before LLM calls

## Real-World AIP Use Cases

1. **Defense**: Autonomous mission planning with threat assessment data from the Ontology
2. **Healthcare**: AI-assisted clinical decision support with live patient data
3. **Finance**: Automated regulatory compliance review of contracts and filings
4. **Supply Chain**: Predictive disruption alerts with AI-generated mitigation plans
5. **Government**: Benefits eligibility determination with auditability for appeals

## Getting Started with AIP Logic

\`\`\`bash
# Install Palantir CLI
npm install -g @osdk/cli

# Authenticate to your Foundry stack
osdk auth login --foundry-url https://your-stack.palantirfoundry.com

# Create a new Function Repository
osdk function create my-aip-functions

# Develop locally with live Ontology access
osdk function dev
\`\`\`

## AIP vs. Direct LLM API Calls

| Feature | Direct LLM API | Palantir AIP |
|---------|---------------|--------------|
| Live enterprise data | ❌ Manual RAG | ✅ Automatic via Ontology |
| Audit trail | ❌ None | ✅ Full audit log |
| Access controls | ❌ None | ✅ Marking-aware |
| Action execution | ❌ Custom code | ✅ Built-in via Actions |
| Hallucination risk | ⚠️ High | ✅ Low — grounded data |
| Deployment | ❌ Custom infra | ✅ Managed by Foundry |
`,
      excerpt: 'Complete AIP architecture overview — Logic functions, Copilot, Studio, Function Repository, supported LLMs, and security model. Includes working TypeScript code examples.',
    },
    {
      category: KnowledgeCategory.APOLLO,
      slug: 'apollo-platform-overview',
      title: 'Apollo — Software Distribution & Fleet Management',
      subCategory: 'Core Concepts',
      sourceType: SourceType.SEEDED,
      tags: ['apollo', 'deployment', 'fleet-management', 'air-gapped', 'government'],
      content: `# Apollo — Software Distribution & Fleet Management

## What is Apollo?

Palantir Apollo is the software delivery and lifecycle management platform that powers how Foundry, AIP, and other Palantir products are deployed, updated, and managed across diverse and often sensitive environments.

Apollo enables continuous software delivery to environments that may be air-gapped, classified, or under strict change control — including JWICS (Joint Worldwide Intelligence Communications System), SIPRNet, and commercial cloud environments.

## Core Apollo Concepts

### Software Distribution

Apollo uses a pull-based distribution model. Software packages are published to an Apollo **Software Channel**, and enrolled environments pull updates on their own schedule, with optional approval gates.

\`\`\`
Apollo Software Channel
├── Channel: production-stable
├── Channel: staging
└── Channel: experimental

Enrolled Environments (pull from channels):
├── Environment: DoD-JWICS-1 (air-gapped, manual approval)
├── Environment: Commercial-Prod (auto-update on stable)
└── Environment: GovCloud-Stage (auto-update on staging)
\`\`\`

### Fleet Management

A Fleet is a logical grouping of environments with shared configuration policies. Fleet operators can:

- View health status of all environments
- Trigger software updates
- Apply configuration changes
- Set update schedules and approval workflows
- Monitor compliance status

### Enrollment

Enrolling a new environment into Apollo:

\`\`\`bash
# On the target environment (may require operator approval)
apollo-agent enroll \\
  --channel production-stable \\
  --environment-id "my-org-prod-01" \\
  --fleet "my-org-fleet"
\`\`\`

### Configuration Policies

Apollo policies define environment-specific configuration that overrides defaults:

\`\`\`yaml
# Example Apollo Configuration Policy
apiVersion: apollo/v1
kind: ConfigurationPolicy
metadata:
  name: high-security-policy
spec:
  network:
    egress: deny-all
    ingress:
      allowedCIDRs:
        - 10.0.0.0/8
  storage:
    encryption: AES-256-GCM
    keyRotationDays: 30
  auth:
    sessionTimeoutMinutes: 15
    mfaRequired: true
\`\`\`

## Air-Gapped Deployments

For environments with no internet connectivity (common in DoD classified networks):

1. **Software Bundle Export**: Apollo generates a signed, compressed bundle of all required packages
2. **Physical Transfer**: Bundle transferred via approved media (e.g., NSA-approved removable drive)
3. **Import & Install**: Local Apollo agent validates the bundle signature and installs
4. **Update Cycle**: Repeats on operator-defined schedule (weekly, monthly, or on demand)

\`\`\`
Offline Update Flow:
[Palantir Apollo Cloud]
    │ 1. Generate signed bundle
    │ 2. Export to removable media
    ▼
[Physical Transport] ──────────────────────────
    │ 3. Approved transfer (PKI-signed media)   │
    ▼                                            │
[Air-Gapped Environment]                         │
    │ 4. Validate signature                      │
    │ 5. Import bundle                           │
    │ 6. Health check & smoke test               │
    ▼                                            │
[Reporting] → Health status queued for          │
              next data diode export ─────────────
\`\`\`

## Health Monitoring

Apollo tracks environment health across multiple dimensions:

| Metric | Description |
|--------|-------------|
| Service Status | All Foundry services running and healthy |
| Disk Usage | Storage utilization and thresholds |
| Memory / CPU | Compute resource consumption |
| Certificate Expiry | TLS cert expiration countdown |
| Software Version | Current version vs available |
| Last Check-In | Time since last heartbeat |

## Apollo CLI

\`\`\`bash
# List all environments in your fleet
apollo fleet list --fleet my-org-fleet

# Check environment health
apollo env health --environment my-org-prod-01

# Trigger a software update
apollo env update --environment my-org-prod-01 --version 2024.12.1

# View update history
apollo env history --environment my-org-prod-01 --days 30

# Export offline bundle (air-gapped)
apollo bundle export \\
  --channel production-stable \\
  --version 2024.12.1 \\
  --output /media/approved-drive/apollo-bundle.tar.gz
\`\`\`

## Apollo in DoD Context

Apollo is central to Palantir's government contracts. It enables:

- **USAF / Army / Navy deployments**: Foundry in classified environments without internet exposure
- **FedRAMP compliance**: Apollo manages the delivery of FedRAMP-authorized software versions
- **ATO (Authority to Operate)**: Apollo's audit trail supports ATO documentation
- **STIG compliance**: Configuration policies enforce DISA STIG requirements automatically

## Apollo vs. Traditional Software Delivery

| Aspect | Traditional | Apollo |
|--------|-------------|--------|
| Update mechanism | Manual, version-by-version | Automated pull-based |
| Air-gapped support | Custom one-off solutions | Built-in bundle export |
| Configuration management | Scripts / Ansible / Terraform | Declarative policies |
| Audit trail | Manual logging | Automatic, cryptographically signed |
| Rollback | Manual restoration | One-command rollback |
`,
      excerpt: 'Apollo platform overview covering software distribution, fleet management, air-gapped deployments, configuration policies, and DoD use cases with CLI examples.',
    },
  ]

  for (const page of knowledgePages) {
    await prisma.knowledgePage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    })
  }
  console.log(`✅ Seeded ${knowledgePages.length} knowledge pages`)

  // ─── Starter Flashcards ──────────────────────────────────────────────────────
  const flashcards = [
    // FOUNDRY
    { category: KnowledgeCategory.FOUNDRY, subCategory: 'Core Concepts', difficulty: Difficulty.EASY, tags: ['foundry', 'datasets'], question: 'What is a Foundry Dataset?', answer: 'A Foundry Dataset is an immutable, versioned snapshot of data. Datasets support branching (similar to Git) — you develop transforms on a branch and merge changes back to master. Raw datasets come from connectors; derived datasets are produced by transforms.' },
    { category: KnowledgeCategory.FOUNDRY, subCategory: 'Core Concepts', difficulty: Difficulty.EASY, tags: ['foundry', 'transforms'], question: 'What are the three types of transforms in Foundry?', answer: '1. Python Transforms (pandas/PySpark), 2. SQL Transforms, 3. TypeScript Transforms. Python/PySpark are most common for large-scale data processing. SQL transforms are simpler for aggregations and joins. TypeScript transforms are used for specific typed operations.' },
    { category: KnowledgeCategory.FOUNDRY, subCategory: 'Transforms', difficulty: Difficulty.MEDIUM, tags: ['pyspark', 'transforms', 'python'], question: 'What decorator do you use to define a PySpark transform in Foundry?', answer: 'The @transform decorator from transforms.api. You specify Input() and Output() objects as parameters. Example: @transform(output=Output(\'/path/out\'), source=Input(\'/path/in\')) def compute(output, source): ...' },
    { category: KnowledgeCategory.FOUNDRY, subCategory: 'Transforms', difficulty: Difficulty.MEDIUM, tags: ['incremental', 'transforms'], question: 'What is an incremental transform in Foundry and when should you use it?', answer: 'An incremental transform only processes new or changed records since the last run, rather than recomputing the entire output. Use @incremental() decorator alongside @transform. Use when: source dataset grows continuously (append-only), full recompute is expensive, and semantics allow incremental processing (e.g., no global aggregations that require seeing all data).' },
    { category: KnowledgeCategory.FOUNDRY, subCategory: 'Transforms', difficulty: Difficulty.HARD, tags: ['pyspark', 'performance'], question: 'What is the difference between DataFrame.cache() and DataFrame.persist() in PySpark within Foundry?', answer: 'cache() stores the DataFrame in memory (MEMORY_AND_DISK storage level). persist() allows you to specify the storage level: MEMORY_ONLY, MEMORY_AND_DISK, DISK_ONLY, etc. In Foundry transforms, use persist() when you need fine-grained control. For most transforms, avoid caching intermediate results unless you reference the same DataFrame 3+ times — Spark\'s optimizer often handles this better.' },
    { category: KnowledgeCategory.FOUNDRY, subCategory: 'Security', difficulty: Difficulty.MEDIUM, tags: ['markings', 'security', 'access-control'], question: 'What are Foundry Markings?', answer: 'Markings are security labels applied to datasets and columns that control who can access the data. They work at dataset, column, and row level. Users must hold the appropriate marking to read marked data. Common in government contexts: TOP SECRET, SECRET, CUI, etc. Markings are enforced throughout the platform — in transforms, Contour, Workshop, and AIP.' },

    // ONTOLOGY
    { category: KnowledgeCategory.ONTOLOGY, subCategory: 'Core Concepts', difficulty: Difficulty.EASY, tags: ['ontology', 'objects'], question: 'What is a Palantir Ontology Object Type?', answer: 'An Object Type defines the schema for a category of business entity — like Patient, Order, or Mission. It has a primary key, typed properties (string, int, timestamp, geopoint, etc.), display configuration, and is backed by a Foundry dataset. Objects are the primary unit applications and AI agents interact with.' },
    { category: KnowledgeCategory.ONTOLOGY, subCategory: 'Core Concepts', difficulty: Difficulty.EASY, tags: ['ontology', 'actions'], question: 'What is an Ontology Action?', answer: 'An Action is a typed, audited operation that creates, modifies, or deletes Ontology objects. Actions have parameters with types, validation rules that run before execution, and produce an audit trail. They can write to back-end datasets, trigger webhooks, or both. Applied via OSDK: client.ontology.actions.myAction({...}).' },
    { category: KnowledgeCategory.ONTOLOGY, subCategory: 'OSDK', difficulty: Difficulty.MEDIUM, tags: ['osdk', 'typescript'], question: 'How do you create an OSDK client in TypeScript?', answer: 'Import createClient from @osdk/client and createPalantirJwtTokenProvider from @osdk/oauth. Call: const client = createClient(foundryUrl, clientId, tokenProvider). Then query objects: await client(MyObjectType).where({...}).all()' },
    { category: KnowledgeCategory.ONTOLOGY, subCategory: 'Core Concepts', difficulty: Difficulty.MEDIUM, tags: ['ontology', 'links'], question: 'What is the difference between a one-to-many and many-to-many Link Type in the Ontology?', answer: 'One-to-Many: Each object of Type A can link to many objects of Type B, but each Type B has only one Type A (e.g., Order → OrderLineItems). Many-to-Many: Both sides can have multiple links (e.g., Patient ↔ Physician). The cardinality determines UI presentation and how links are traversed in OSDK: $link.lineItems.all() vs $link.physicians.all().' },
    { category: KnowledgeCategory.ONTOLOGY, subCategory: 'OSDK', difficulty: Difficulty.HARD, tags: ['osdk', 'aggregations'], question: 'How do you perform aggregations using the TypeScript OSDK?', answer: 'Use .groupBy() chained with .aggregate(). Example: const result = await client(Order).groupBy({ department: "exact" }).aggregate({ total: { $sum: "amount" }, count: { $count: "*" } }). The groupBy specifies property and grouping type ("exact", "ranges", "duration" for timestamps), and aggregate defines metric computations.' },

    // AIP
    { category: KnowledgeCategory.AIP, subCategory: 'Core Concepts', difficulty: Difficulty.EASY, tags: ['aip', 'overview'], question: 'What are the four main components of Palantir AIP?', answer: '1. AIP Logic — serverless TypeScript functions that call LLMs and interact with the Ontology. 2. AIP Copilot — AI assistants embedded in Workshop apps. 3. AIP Studio — visual drag-and-drop agent builder. 4. Function Repository — TypeScript functions extending the Ontology callable from any AIP surface.' },
    { category: KnowledgeCategory.AIP, subCategory: 'Core Concepts', difficulty: Difficulty.MEDIUM, tags: ['aip', 'grounding', 'hallucination'], question: 'How does Palantir AIP reduce LLM hallucination risk compared to direct API calls?', answer: 'AIP fetches live Ontology objects as grounded context before calling the LLM. Instead of relying on training data, the model receives real enterprise data. Access controls ensure the LLM only sees data the requesting user is authorized to see. Markings are enforced automatically — no risk of sensitive data leaking across security boundaries.' },
    { category: KnowledgeCategory.AIP, subCategory: 'Security', difficulty: Difficulty.MEDIUM, tags: ['aip', 'security', 'governance'], question: 'What are Palantir\'s data protection guarantees for AIP LLM calls?', answer: 'Palantir guarantees: (1) Customer data is never used to train third-party LLMs, (2) All LLM inputs/outputs are logged with full audit trail, (3) Markings are enforced before data is sent to any model, (4) PII/PHI masking can be configured, (5) Models can be deployed in private Palantir-managed infrastructure for highest-sensitivity use cases.' },

    // APOLLO
    { category: KnowledgeCategory.APOLLO, subCategory: 'Core Concepts', difficulty: Difficulty.EASY, tags: ['apollo', 'overview'], question: 'What is Palantir Apollo\'s primary function?', answer: 'Apollo is Palantir\'s software delivery and lifecycle management platform. It handles automated distribution of Foundry and AIP software to diverse environments (cloud, on-premise, air-gapped, classified). It provides fleet management, health monitoring, configuration policies, and cryptographically-signed update bundles for disconnected environments.' },
    { category: KnowledgeCategory.APOLLO, subCategory: 'Air-Gapped', difficulty: Difficulty.MEDIUM, tags: ['apollo', 'air-gapped', 'government'], question: 'How does Apollo handle software updates for air-gapped classified networks?', answer: 'Apollo generates a signed, compressed software bundle containing all required packages. The bundle is exported to approved removable media, physically transported to the air-gapped environment, validated by the local Apollo agent using cryptographic signatures, and installed. Health status is queued and exported via approved one-way data links.' },
  ]

  for (const card of flashcards) {
    await prisma.flashcard.create({ data: card }).catch(() => {})
  }
  console.log(`✅ Seeded ${flashcards.length} flashcards`)

  console.log('\n🎉 Database seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
