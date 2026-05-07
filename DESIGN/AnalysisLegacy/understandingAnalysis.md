# Understanding Analysis Services (Legacy Notes)

This note summarizes what these two Electron services return:

- `electron/services/analyses/getAnalysisList.ts`
- `electron/services/analyses/createAnalysisMetadataInspection.ts`

It also includes real data examples from local `electron/db/dev-app.sqlite` so I can quickly remember the exact shapes.

## 1) `getAnalysisList.ts`

### Purpose
Returns all analysis artifacts for a given `activityId`.

### Output shape
`AnalysisArtifactList` (array of objects):

- `uuid: string`
- `analysisName: string`
- `analysisType: "metadata_inspection" | "corpus_sampler" | "lb_extraction" | "lb_analysis"`
- `config: string | null`
- `displayName: string`
- `description: string`

### Real example (from local DB)
For `activityId = "a6cefe21-c488-4c1f-89a4-61eb983c238b"`:

```json
[
  {
    "uuid": "2d7a2d41-1813-4629-806f-f755a6ece05e",
    "analysisName": "analysis_1",
    "analysisType": "metadata_inspection",
    "config": null,
    "displayName": "Corpus metadata inspection",
    "description": "Inspect the document, lemma and word counts for the corpus you built."
  },
  {
    "uuid": "5d40e383-f993-43f2-b46a-2933ecb5b9c2",
    "analysisName": "analysis_2",
    "analysisType": "metadata_inspection",
    "config": null,
    "displayName": "Corpus metadata inspection",
    "description": "Inspect the document, lemma and word counts for the corpus you built."
  },
  {
    "uuid": "29059f8a-652c-4f2c-ba38-74dfa74dbe97",
    "analysisName": "analysis_3",
    "analysisType": "metadata_inspection",
    "config": null,
    "displayName": "Corpus metadata inspection",
    "description": "Inspect the document, lemma and word counts for the corpus you built."
  }
]
```

## 2) `createAnalysisMetadataInspection.ts`

### Purpose
Creates a new analysis row (for metadata inspection) and returns:

- the created analysis artifact metadata
- the corpus metadata payload used by that analysis

### Output shape
`CorpusMetadataInspectionResponse` object:

- `analysis`
  - `uuid: string`
  - `analysisName: string`
  - `analysisType: AnalysisType`
  - `config: string | null`
  - `displayName: string`
  - `description: string`
- `analysisData`
  - `corpusUuid: string`
  - `metadataJson: string` (JSON string, not parsed object)
  - `summaryText: string`
  - `llmProvider: string | null`
  - `llmModel: string | null`
  - `binaryFilesPath: string | null`

### Real example (from local DB values)
For the same activity context (`activityId = "a6cefe21-c488-4c1f-89a4-61eb983c238b"`), representative payload:

```json
{
  "analysis": {
    "uuid": "29059f8a-652c-4f2c-ba38-74dfa74dbe97",
    "analysisName": "analysis_3",
    "analysisType": "metadata_inspection",
    "config": null,
    "displayName": "Corpus metadata inspection",
    "description": "Inspect the document, lemma and word counts for the corpus you built."
  },
  "analysisData": {
    "corpusUuid": "91b23bc1-7641-4865-856f-adae70aa11c9",
    "metadataJson": "{\"corpus_name\":\"CheckTest\",\"docs\":54,\"lemmas\":11631,\"subcorpora\":[{\"docs\":13,\"lemmas\":4683,\"name\":\"S courtroom\",\"subcorpora\":[],\"types\":5918,\"words\":129129},{\"docs\":6,\"lemmas\":2451,\"name\":\"S demonstratn\",\"subcorpora\":[],\"types\":2993,\"words\":32072},{\"docs\":16,\"lemmas\":6572,\"name\":\"S pub debate\",\"subcorpora\":[],\"types\":8376,\"words\":287246},{\"docs\":18,\"lemmas\":5989,\"name\":\"S tutorial\",\"subcorpora\":[],\"types\":7533,\"words\":144784}],\"types\":14593,\"words\":593231}",
    "summaryText": "CheckTest contains 54 documents totaling 593,231 words, 11,631 lemmas, and 14,593 types. It is organized into four top-level subcorpora—S courtroom (13 docs, 129,129 words, 4,683 lemmas), S demonstratn (6 docs, 32,072 words, 2,451 lemmas), S pub debate (16 docs, 287,246 words, 6,572 lemmas), and S tutorial (18 docs, 144,784 words, 5,989 lemmas)—with S pub debate containing the most words and S demonstratn the fewest.",
    "llmProvider": "openai",
    "llmModel": "gpt-5-mini-2025-08-07",
    "binaryFilesPath": "/Users/danielmikaleola/Documents/Development/TeknegramElectron/electron/bin/corpus-binaries/CheckTest"
  }
}
```

Note: actual calls to `createAnalysisMetadataInspection` create a new analysis row each time, so `analysis.uuid` / `analysisName` increment over time.

## Quick interpretation of `metadata_inspection`

From service behavior and analysis type metadata, this analysis type appears to be an analysis artifact that surfaces precomputed corpus metadata (counts/hierarchy summary) for inspection in the activity UI, rather than running a transformation pipeline itself.

## Activity type for the sample activity

For `activityId = "a6cefe21-c488-4c1f-89a4-61eb983c238b"`:

- `activity_type`: `lb_activities`
- display name: `Lexical Bundles Activity`
