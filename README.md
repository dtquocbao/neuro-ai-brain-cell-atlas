# Neuro-AI Brain Cell Atlas

Single-cell brain atlas workflow for identifying major brain cell types from gene expression and interpreting their biological identity — with a focus on **forebrain-enriched astrocyte heterogeneity**, **Alzheimer's disease–associated gene programs**, **donor-aware cell-state prediction**, and **SEA-AD disease comparison**.

**Start date:** 06/20/2026

## Goal

Build a reproducible analysis pipeline that goes from raw single-cell RNA-seq data to cell-type discovery, astrocyte subtype characterization, predictive modeling, and disease-cohort validation:

```
cell × gene matrix → cell embeddings → cell type discovery → astrocyte subtype characterization
  → AD gene program analysis → scVI + ML classification → WHB taxonomy + donor metadata
  → SEA-AD disease comparison (normal vs dementia)
```

## Research Questions

- Which genes define hippocampus, cortex, and cerebellum?
- Does the Allen WHB atlas resolve distinct astrocyte subtypes beyond canonical astrocytes?
- Is **Astrocyte_2** — a cortex/hippocampus-enriched population — enriched for neuroprotective and AD-associated transcriptional programs?
- Do regional and donor-level patterns in AD support scores replicate across the atlas, or reflect batch artifacts?
- Can a **donor-aware scVI + MLP classifier** predict Astrocyte_2 identity on held-out donors, and which latent dimensions drive the prediction?
- Does official Allen WHB taxonomy confirm Astrocyte_2 as a genuine astrocyte state, and how does AD score vary with donor age/sex?
- Does the WHB neuroprotective astrocyte program **decline in SEA-AD** astrocytes with dementia, Braak stage, ADNC, and APOE4 status?

## Analysis Pipeline

| Step | Notebook | Summary |
|------|----------|---------|
| **01** | `01_load_brain_data.ipynb` | Load WHB non-neuron h5ad → subsample 50k → Leiden → annotate glia → discover **Astrocyte_2** → GO/KEGG enrichment → save processed object |
| **02** | `02_neuroprotective_astrocytes.ipynb` | Neuroprotective Support Score → quartile enrichment → regional mapping → DE (Astrocyte_2 vs Astrocyte) → Mann–Whitney |
| **03** | `03_AD_risk_gene_enrichment_in_Astrocyte_2.ipynb` | AD support score (6-gene panel) → quartile + Mann–Whitney → regional and **donor** stratification → donor × region heatmap |
| **04** | `04_cell_state_prediction_in_human_astrocytes.ipynb` | Donor-aware train/val/test split → **scVI** latent embedding → **MLP** 3-class classifier → SHAP on latent dims → gene correlation |
| **05** | `05_whb_taxonomy_and_donor_stratification.ipynb` | Join Allen donor metadata (age, sex) → map **Astrocyte_2** to official WHB taxonomy → AD score vs age/sex → pseudo-spatial x/y plots |
| **06** | `06_seaad_disease_comparison.ipynb` | SEA-AD MTG astrocytes → AD support score → normal vs dementia → Braak / ADNC / APOE4 → pseudo-progression → Astrocyte_2-like fraction |

**Shared input for notebooks 02–05:**

```
data/processed/brain_non_neuronal_50k_annotated_umap.h5ad
```

(50,000 nuclei × 3,000 HVGs — produced by notebook 01; gitignored locally.)

**Input for notebook 06** (SEA-AD MTG; gitignored locally):

```
data/processed/<SEAAD_MTG>.h5ad
```

Full SEA-AD MTG release: ~1.38M nuclei × 35,483 genes (use `backed="r"`). Notebook subsets to **Astrocyte** subclass (~70k nuclei, 84 donors). Download via [CELLxGENE](https://cellxgene.cziscience.com/) or Allen S3 — see `scripts/download_sea_ad_mtg.py` for available URLs.

**Additional metadata for notebook 05** (from `abc_atlas_access` cache):

```
data/processed/abc_atlas/metadata/WHB-10Xv3/<version>/donor.csv
data/processed/abc_atlas/metadata/WHB-10Xv3/<version>/cell_metadata.csv
data/processed/abc_atlas/metadata/WHB-taxonomy/<version>/cluster.csv
data/processed/abc_atlas/metadata/WHB-taxonomy/<version>/cluster_annotation_term.csv
```

## Repository Structure

```
neuro-ai-brain-cell-atlas/
├── README.md
├── environment.yml                 # Conda env: neuro-ai-brain-cell-atlas
├── requirements.txt                # Pip fallback
├── .gitignore
├── scripts/
│   ├── download_whb_data.py        # Download Allen WHB-10Xv3 h5ad + metadata
│   └── download_sea_ad_mtg.py      # List available SEA-AD MTG S3 download URLs
├── notebooks/
│   ├── 01_load_brain_data.ipynb
│   ├── 02_neuroprotective_astrocytes.ipynb
│   ├── 03_AD_risk_gene_enrichment_in_Astrocyte_2.ipynb
│   ├── 04_cell_state_prediction_in_human_astrocytes.ipynb
│   ├── 05_whb_taxonomy_and_donor_stratification.ipynb
│   └── 06_seaad_disease_comparison.ipynb
├── reports/
│   ├── brain_cell_atlas_report.qmd           # Conference summary — Notebook 01
│   └── neuroprotective_astrocytes_report.qmd # Conference summary — Notebook 02
├── results/
│   └── astrocyte2_vs_astrocyte_markers.csv  # DE table from Notebook 02
├── models/                                   # scVI checkpoints (local; gitignored)
│   └── scvi_nb04/
└── data/
    ├── raw/
    └── processed/
        ├── abc_atlas/              # Allen WHB cache (metadata + h5ad; gitignored)
        │   ├── metadata/WHB-10Xv3/
        │   ├── metadata/WHB-taxonomy/
        │   └── expression_matrices/WHB-10Xv3/
        └── <SEAAD_MTG>.h5ad        # SEA-AD MTG (gitignored; ~6–70 GB depending on release)
```

| Path | Purpose |
|------|---------|
| `notebooks/` | Exploratory analysis — run in order (01 → 06) |
| `scripts/` | Data download utilities (WHB + SEA-AD URL discovery) |
| `reports/` | Conference-style Quarto summaries (`.qmd`; PDF/HTML rendered locally) |
| `results/` | Exported tables and analysis outputs |
| `models/` | Trained model checkpoints (e.g. scVI from NB04) |
| `data/processed/abc_atlas/` | Allen Brain Cell Atlas cache (CSVs + h5ad) |
| `data/processed/*.h5ad` | WHB subsample + SEA-AD MTG (local only) |
| `data/raw/` | Optional raw inputs — not tracked in git |

Large files (`*.h5ad`, `data/processed/*`, `models/`) and rendered reports (`reports/*.pdf`, `reports/*.html`) are gitignored; download or render locally.

## Tools

| Package | Role |
|---------|------|
| [Scanpy](https://scanpy.readthedocs.io/) | Single-cell analysis (PCA, neighbors, UMAP, Leiden, markers, `score_genes`) |
| [AnnData](https://anndata.readthedocs.io/) | Annotated expression matrices |
| [scvi-tools](https://docs.scvi-tools.org/) | Variational autoencoder latent embeddings (Notebook 04) |
| [SHAP](https://shap.readthedocs.io/) | Latent-dimension interpretability (Notebook 04) |
| `python-igraph`, `leidenalg` | Leiden clustering |
| [GSEApy](https://gseapy.readthedocs.io/) | GO / KEGG enrichment via Enrichr |
| [abc_atlas_access](https://alleninstitute.github.io/abc_atlas_access/) | Allen WHB data download + metadata (Notebooks 04–05) |
| scikit-learn | MLP classifier, train/test splits, metrics |
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

**Notes:**

- If you use an older env named `brain-cell-atlas`, install missing packages manually or recreate from `environment.yml`.
- **GSEApy** and **abc_atlas_access** are installed via **pip** inside the conda env (PyPI / GitHub; bioconda builds unreliable on Windows).
- **abc_atlas_access** must be installed from GitHub (import name uses underscores):

```bash
pip install "git+https://github.com/AllenInstitute/abc_atlas_access.git"
```

**Pip alternative:** `pip install -r requirements.txt`

### 2. Data

#### Allen Whole Human Brain (Notebooks 01–05)

Dataset: [WHB-10X clustering](https://alleninstitute.github.io/abc_atlas_access/descriptions/WHB-10X-clustering.html) + [WHB-10Xv3 expression](https://alleninstitute.github.io/abc_atlas_access/descriptions/WHB-10Xv3.html) (~3.4M nuclei, CC BY-NC 4.0).

| Component | Location after download |
|-----------|-------------------------|
| Clustering metadata | `data/processed/abc_atlas/metadata/WHB-10Xv3/` |
| Cell-type taxonomy | `data/processed/abc_atlas/metadata/WHB-taxonomy/` |
| h5ad matrices | `data/processed/abc_atlas/expression_matrices/WHB-10Xv3/<version>/` |

```bash
python scripts/download_whb_data.py --list
python scripts/download_whb_data.py --metadata --matrix nonneurons-log2
```

Expected h5ad for notebook 01:

```
data/processed/abc_atlas/expression_matrices/WHB-10Xv3/20240330/WHB-10Xv3-Nonneurons-log2.h5ad
```

#### SEA-AD MTG (Notebook 06)

Dataset: [Seattle Alzheimer's Disease Brain Cell Atlas](https://portal.brain-map.org/explore/seattle-alzheimers-disease) — Gabitto et al., *Nature Neuroscience* 2024. MTG snRNA-seq with clinical metadata (ADNC, Braak stage, APOE4, cognitive status).

List available Allen S3 URLs and file sizes:

```bash
python scripts/download_sea_ad_mtg.py
```

Recommended: download the full MTG h5ad via [CELLxGENE](https://cellxgene.cziscience.com/) (search “SEA-AD MTG”) or stream from S3 using `requests` (avoid `urllib` on Windows — SSL cert store issues). Place the file under `data/processed/` and update the path in notebook 06.

### 3. Run the notebooks

Select kernel **neuro-ai-brain-cell-atlas** (or your equivalent conda env) for all notebooks.

#### Notebook 01 — `01_load_brain_data.ipynb`

1. Load `WHB-10Xv3-Nonneurons-log2.h5ad`
2. Explore anatomical divisions (cortex, hippocampus, thalamus, …)
3. Subsample to 50,000 cells for interactive analysis
4. HVG selection → PCA → neighbors → UMAP
5. Leiden clustering → manual glial annotations → UMAP by cell type
6. Region × cell-type composition tables; discover **Astrocyte_2**
7. Marker genes (`rank_genes_groups`) → validation plots
8. GO Biological Process / KEGG enrichment (`gseapy.enrichr`) — requires internet
9. Save `data/processed/brain_non_neuronal_50k_annotated_umap.h5ad`

#### Notebook 02 — `02_neuroprotective_astrocytes.ipynb`

Requires processed h5ad from notebook 01.

1. Compute **Neuroprotective Support Score** (10-gene astrocyte-support panel)
2. Quartile enrichment across all non-neuronal cell types
3. Regional composition of Astrocyte_2 (cortex + hippocampus enrichment)
4. Differential expression: Astrocyte_2 vs Astrocyte
5. Mann–Whitney U test on score separation
6. Export markers → `results/astrocyte2_vs_astrocyte_markers.csv`

#### Notebook 03 — `03_AD_risk_gene_enrichment_in_Astrocyte_2.ipynb`

Requires processed h5ad from notebook 01.

1. Compute **AD support score** (*APOE*, *CLU*, *CST3*, *AQP4*, *SLC1A2*, *SPARCL1*)
2. Quartile enrichment and Mann–Whitney vs canonical astrocytes
3. Regional stratification within Astrocyte_2
4. Donor stratification via `library_label` (368 donors)
5. Donor × region heatmap — test for batch vs biology
6. Correlation with Neuroprotective Support Score

#### Notebook 04 — `04_cell_state_prediction_in_human_astrocytes.ipynb`

Requires processed h5ad from notebook 01. Needs **scvi-tools** and **shap**.

1. Define 3-class target: Astrocyte_2 / Astrocyte / Other
2. **Donor-aware** train/validation/test split (by `library_label`)
3. Train **scVI** on astrocyte subset → 20-dim latent embedding
4. Train **MLP classifier** (64→32) on latent space
5. Evaluate on held-out test donors (AUROC, confusion matrix)
6. **SHAP** on latent dims → correlate top dims with genes (*SLC1A2*, *SPARCL1*, …)
7. Save scVI model → `models/scvi_nb04/`

#### Notebook 05 — `05_whb_taxonomy_and_donor_stratification.ipynb`

Requires processed h5ad + Allen metadata CSVs. Needs **abc_atlas_access** metadata cache.

1. Join donor metadata (age, sex) onto `adata.obs` via `library_label`
2. Map cells to official WHB taxonomy (`whb_subcluster`, `whb_supercluster`) via `cluster_alias`
3. Confirm Astrocyte_2 maps to official **Astrocyte** supercluster
4. AD support score vs donor age and sex (with pseudoreplication caveats)
5. Pseudo-spatial plots using x/y coordinates from Allen cell metadata
6. WHB taxonomy heatmap (cell type × supercluster)

#### Notebook 06 — `06_seaad_disease_comparison.ipynb`

Requires SEA-AD MTG h5ad under `data/processed/`. Uses same 6-gene **AD support score** as NB02/03.

1. Load SEA-AD MTG (`backed="r"`) → subset to **Astrocyte** subclass (~70k nuclei)
2. Compute AD support score on shared gene panel
3. **Normal vs dementia** comparison (Mann–Whitney)
4. Stratify by **Braak stage**, **ADNC**, and **APOE4 status**
5. Correlate score with **Continuous Pseudo-progression Score**
6. Classify Astrocyte_2-like vs Astrocyte-like cells (score threshold from NB04)
7. UMAP of SEA-AD astrocytes by AD score and disease status

### 4. Conference reports

Render Quarto summaries as PDF or HTML:

```bash
# Notebook 01 report
quarto render reports/brain_cell_atlas_report.qmd --to pdf
quarto render reports/brain_cell_atlas_report.qmd --to html

# Notebook 02 report
quarto render reports/neuroprotective_astrocytes_report.qmd --to pdf
quarto render reports/neuroprotective_astrocytes_report.qmd --to html
```

Output (gitignored):

- `reports/brain_cell_atlas_report.pdf` / `.html`
- `reports/neuroprotective_astrocytes_report.pdf` / `.html`

On Windows, if `quarto` is not on PATH:

```powershell
& "C:\Program Files\Quarto\bin\quarto.exe" render reports/brain_cell_atlas_report.qmd --to pdf
& "C:\Program Files\Quarto\bin\quarto.exe" render reports/neuroprotective_astrocytes_report.qmd --to pdf
```

## Current Status

| Item | Status |
|------|--------|
| Conda env + kernel | Done (`environment.yml`; includes scvi-tools, shap) |
| WHB metadata + taxonomy | Downloaded under `data/processed/abc_atlas/` |
| WHB non-neuron h5ad | Used in notebook 01 (local; gitignored) |
| SEA-AD MTG h5ad | Used in notebook 06 (local; gitignored) |
| Notebook 01 | Load → UMAP → Leiden → Astrocyte_2 discovery → enrichment → save h5ad |
| Notebook 02 | Neuroprotective score, regional DE, Mann–Whitney; markers exported |
| Notebook 03 | AD support score; regional + donor stratification |
| Notebook 04 | Donor-aware scVI + MLP classifier; SHAP interpretability; model saved |
| Notebook 05 | WHB taxonomy mapping; donor age/sex join; pseudo-spatial plots |
| Notebook 06 | SEA-AD disease comparison; Braak/ADNC/APOE4 stratification |
| Download scripts | `download_whb_data.py`, `download_sea_ad_mtg.py` (S3 URL probe) |
| Quarto reports | NB01 + NB02 conference summaries (`.qmd`) |
| Results export | `results/astrocyte2_vs_astrocyte_markers.csv` |
| Reusable `src/` module | Not started |

## Key Findings (so far)

- **Astrocyte_2** (*n* ≈ 4,081 / 50,000) is a forebrain-enriched astrocyte state: ~52% cerebral cortex, ~28% hippocampus, absent from cerebellum and spinal cord.
- Top markers include *SLC1A2*, *SPARCL1*, *SLC4A4*, *AQP4*, *APOE*, and *CLU* — consistent with synaptic-support astrocyte biology.
- **Neuroprotective Support Score:** ~99.9% of Astrocyte_2 nuclei in Q4 vs ~2.9% of canonical astrocytes (NB02).
- **AD support score (WHB):** ~96% of Astrocyte_2 in Q4; regional gradient replicates across donors (NB03).
- **ML classifier (NB04):** Donor-held-out MLP on scVI latent space achieves macro AUROC ≈ 0.999; SHAP top latent dims correlate with *SLC1A2*, *SPARCL1*, *SLC4A4*.
- **Official taxonomy (NB05):** Astrocyte_2 maps to Allen **Astrocyte** supercluster; 50k subsample spans only 4 donors — age/sex inference underpowered.
- **SEA-AD disease (NB06):** AD support score lower in dementia (median 0.197 vs 0.300 normal; Mann–Whitney *p* ≈ 4×10⁻¹⁷⁷, *r* ≈ −0.126); declines with Braak stage and High ADNC; APOE4 carriers score lower; Astrocyte_2-like fraction ↓ ~22% in dementia.

## Planned Next Steps

- Quarto conference reports for Notebooks 03–06
- Donor-level mixed models (SEA-AD: 84 donors; WHB full atlas) for valid statistical inference
- Cross-dataset scVI retraining on shared gene space (replace threshold-based Astrocyte_2-like labeling)
- MapMyCells formal reference mapping for Astrocyte_2 validation
- Hippocampal SEA-AD or MERFISH spatial validation (MTG-only limitation in NB06)
- Blog post, poster, whitepaper, conference submission
