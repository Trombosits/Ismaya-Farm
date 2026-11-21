# Taste

## Workflow

- Expects the agent to read the referenced implementation guide/panduan document before starting any work on the task. Confidence: 0.55
- Wants work kept strictly within the layer/files/modules specified: when asked to fix back-end logic, do not touch UI/front-end (`.tsx`) files; when asked to migrate one module (e.g. produk/penjualan), leave neighbouring modules (e.g. laporan) untouched — confirm before expanding scope to other files. Confidence: 0.9

## Communication

- Writes in Indonesian and expects replies/explanations in Indonesian. Confidence: 0.6

## Code

- Dislikes components/pages relying on imported mock or dummy data; expects real Supabase-backed data instead, with components kept data-driven (lists such as species, breeds, livestock received via props from the parent). Confidence: 0.8
