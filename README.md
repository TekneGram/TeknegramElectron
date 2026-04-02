# Teknegram

Teknegram is a local corpus linguistics application for researchers. It allows researchers to upload a folder of corpus files, parse them with UDPipe, and run scientific computation and analysis on the corpus. The overall goal is to improve corpus linguistics analysis locally and at scale.

## Getting Started

### Clone The Repository

Clone the repository from the `Teknegram` organization:

```bash
git clone https://github.com/TekneGram/TeknegramElectron.git
cd TeknegramElectron
```

### Get The Submodules

This repository uses Git submodules for native components in:

- `native/corpus_builder`
- `native/corpus_lexbuns`
- `native/corpus_metadata`

After cloning, initialize and fetch them with:

```bash
git submodule update --init --recursive
```

If you prefer to clone everything in one step, you can use:

```bash
git clone --recurse-submodules https://github.com/TekneGram/TeknegramElectron.git
cd TeknegramElectron
```

## Setup

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env
```

Update `.env` with the values needed for your environment.

## Run The App

Start the development app:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Submodule Workflow

If you pull new parent-repo changes, update the submodules to the commits referenced by the parent repo:

```bash
git pull
git submodule update --init --recursive
```

If you make changes inside a native submodule, commit and push the submodule first, then commit the updated submodule pointer in the parent repo.

Example:

```bash
git -C native/corpus_builder status
git -C native/corpus_builder add .
git -C native/corpus_builder commit -m "Describe native change"
git -C native/corpus_builder push

git add native/corpus_builder
git commit -m "Update corpus_builder submodule"
git push
```

The same workflow applies to `native/corpus_lexbuns` and `native/corpus_metadata`.

## Architecture Summary

- `electron/`: Electron main process, IPC handlers, runtime setup, and native process orchestration.
- `src/`: React frontend organized by features and app-layer adapters.
- `native/`: Native C++ components for corpus building, metadata generation, and lexical bundle analysis.

See [TEMPLATE_SETUP.md](/Users/danielmikaleola/Documents/Development/TeknegramElectron/TEMPLATE_SETUP.md) for the post-clone checklist.
