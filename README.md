# Neuro-AI Brain Cell Atlas

Single-cell brain atlas workflow for identifying major brain cell types from gene expression and interpreting their biological identity.

**Start date:** 06/20/2026

## Goal

Build a reproducible analysis pipeline that goes from raw single-cell RNA-seq data to cell-type discovery and brain biology interpretation:

```
cell × gene matrix → cell embeddings → cell type discovery → brain biology interpretation
```

## Research Questions

- Which genes define hippocampus?
- Which genes define cortex?
- Which genes define cerebellum?

**Active in notebook 01:** non-neuronal cell populations across the whole human brain (Allen WHB dataset).

## First Milestone

Load a brain single-cell dataset and produce a UMAP colored by known or inferred cell types.

**Status:** implemented in `notebooks/01_load_brain_data.ipynb` — load WHB non-neuron h5ad, subsample, cluster (Leiden), annotate glia, UMAP by cell type, marker genes, and GO/KEGG enrichment (GSEApy).

## Repository Structure

```
neuro-ai-brain-cell-atlas/
├── README.md
├── environment.yml                 # Conda env: neuro-ai-brain-cell-atlas
├── requirements.txt                # Pip fallback
├── .gitignore
├── scripts/
│   └── download_whb_data.py        # Download Allen WHB-10Xv3 h5ad + metadata
├── notebooks/
│   └── 01_load_brain_data.ipynb    # WHB load → subset → UMAP → Leiden → markers → enrichment
├── reports/
│   └── brain_cell_atlas_report.qmd # Quarto report (placeholder)
└── data/
    ├── raw/                        # Optional local inputs (.gitkeep)
    └── processed/
        └── abc_atlas/              # Allen cache (metadata + h5ad; gitignored)
            ├── metadata/WHB-10Xv3/
            ├── metadata/WHB-taxonomy/
            └── expression_matrices/WHB-10Xv3/
```

| Path | Purpose |
|------|---------|
| `notebooks/` | Exploratory analysis and milestone notebooks |
| `scripts/` | Data download utilities |
| `reports/` | Conference-style Quarto summary (`brain_cell_atlas_report.qmd`) |
| `data/processed/abc_atlas/` | Allen Brain Cell Atlas cache (CSVs + h5ad) |
| `data/raw/` | Optional raw inputs — not tracked in git |

Large files (`*.h5ad`, `data/processed/*`) are gitignored; download locally with the script below.

## Tools

| Package | Role |
|---------|------|
| [Scanpy](https://scanpy.readthedocs.io/) | Single-cell analysis (PCA, neighbors, UMAP, Leiden, markers) |
| [AnnData](https://anndata.readthedocs.io/) | Annotated expression matrices |
| `python-igraph`, `leidenalg` | Leiden clustering |
| [GSEApy](https://gseapy.readthedocs.io/) | GO / KEGG enrichment via Enrichr |
| [abc_atlas_access](https://alleninstitute.github.io/abc_atlas_access/) | Allen WHB data download |
| scikit-learn | ML utilities (via Scanpy) |
| [Squidpy](https://squidpy.readthedocs.io/) | Spatial omics (planned) |

## Getting Started

### 1. Environment (conda)

Create and activate the conda environment:

```bash
conda env create -f environment.yml
conda activate neuro-ai-brain-cell-atlas
```

Register the Jupyter kernel (once):

```bash
python -m ipykernel install --user --name neuro-ai-brain-cell-atlas --display-name "neuro-ai-brain-cell-atlas"
```

Update after dependency changes:

```bash
conda env update -f environment.yml --prune
```

**Note:** If you created an earlier env named `brain-cell-atlas`, either activate that env or recreate from `environment.yml`. GSEApy is installed via **pip** inside the conda env (PyPI wheel; bioconda build is unreliable on Windows).

**Pip alternative:** `pip install -r requirements.txt`

### 2. Data (Allen Whole Human Brain)

Dataset: [WHB-10X clustering](https://alleninstitute.github.io/abc_atlas_access/descriptions/WHB-10X-clustering.html) + [WHB-10Xv3 expression](https://alleninstitute.github.io/abc_atlas_access/descriptions/WHB-10Xv3.html) (~3.4M nuclei, CC BY-NC 4.0).

| Component | Location after download |
|-----------|-------------------------|
| Clustering metadata | `data/processed/abc_atlas/metadata/WHB-10Xv3/` |
| Cell-type taxonomy | `data/processed/abc_atlas/metadata/WHB-taxonomy/` |
| h5ad matrices | `data/processed/abc_atlas/expression_matrices/WHB-10Xv3/<version>/` |

List files and sizes:

```bash
python scripts/download_whb_data.py --list
```

Download metadata + one h5ad matrix (notebook uses non-neuron log2):

```bash
python scripts/download_whb_data.py --metadata --matrix nonneurons-log2
```

Other matrix options: `neurons-log2`, `neurons-raw`, `nonneurons-raw`, or `all` (~70 GB total).

Expected h5ad path used in the notebook:

```
data/processed/abc_atlas/expression_matrices/WHB-10Xv3/20240330/WHB-10Xv3-Nonneurons-log2.h5ad
```

(888,263 cells × 59,357 genes — use `backed="r"` if memory is tight.)

### 3. Run the notebook

1. Open `notebooks/01_load_brain_data.ipynb`
2. Select kernel **neuro-ai-brain-cell-atlas** (or your equivalent conda env)
3. Run all cells

**Notebook workflow:**

1. Load `WHB-10Xv3-Nonneurons-log2.h5ad`
2. Explore anatomical divisions (cortex, hippocampus, thalamus, …)
3. Subsample to 50,000 cells for interactive analysis
4. HVG selection → PCA → neighbors → UMAP
5. Leiden clustering → manual glial annotations → UMAP by cell type
6. Region × cell-type composition tables
7. Marker genes (`rank_genes_groups`) → validation plots
8. GO Biological Process / KEGG enrichment (`gseapy.enrichr`) — requires internet

### 4. Conference report

Render the Notebook 01 conclusion as PDF or HTML:

```bash
# PDF (requires Quarto + LaTeX — TeX Live or TinyTeX)
quarto render reports/brain_cell_atlas_report.qmd --to pdf

# HTML alternative
quarto render reports/brain_cell_atlas_report.qmd --to html
```

Output:

- `reports/brain_cell_atlas_report.pdf`
- `reports/brain_cell_atlas_report.html`

On Windows, if `quarto` is not on PATH, use: `"C:\Program Files\Quarto\bin\quarto.exe" render reports/brain_cell_atlas_report.qmd --to pdf`

## Current Status

| Item | Status |
|------|--------|
| Conda env + kernel | Done (`environment.yml`) |
| WHB metadata + taxonomy | Downloaded under `data/processed/abc_atlas/` |
| WHB non-neuron h5ad | Used in notebook (local; gitignored) |
| Notebook 01 pipeline | Load → UMAP → Leiden → markers → enrichment |
| Download script | `scripts/download_whb_data.py` |
| Quarto report | `reports/brain_cell_atlas_report.qmd` (conference summary) |
| Reusable `src/` module | Not started |

## Planned Outputs

- Blog post
- Poster
- Whitepaper
- Conference submission
