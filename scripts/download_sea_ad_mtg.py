# The SEA-AD disease dataset is on CZ CELLxGENE
# Direct h5ad download URL from the Gabitto et al. 2024 Nature Neuroscience paper
urls_to_try = [
    # AWS bucket current paths
    "https://sea-ad-single-cell-profiling.s3.amazonaws.com/MTG/RNAseq/SEAAD_MTG_RNAseq_all-nuclei.2024-02-13.h5ad",
    "https://sea-ad-single-cell-profiling.s3.amazonaws.com/MTG/RNAseq/SEAAD_MTG_RNAseq_final-nuclei.2023-05-08.h5ad",
    "https://sea-ad-single-cell-profiling.s3.amazonaws.com/MTG/RNAseq/SEAAD_MTG_RNAseq_all-nuclei.2023-05-08.h5ad",
    # Older path that still works per recent papers
    "https://sea-ad-single-cell-profiling.s3.amazonaws.com/MTG/RNAseq/SEAAD_MTG_RNAseq_final-nuclei.2022-06-07.h5ad",
]

import requests
for url in urls_to_try:
    r = requests.head(url, timeout=10)
    size = int(r.headers.get("content-length", 0)) / 1024**3
    print(f"{r.status_code} | {size:.2f} GB | {url.split('/')[-1]}")