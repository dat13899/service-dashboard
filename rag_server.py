#!/usr/bin/env python3
"""Agentic RAG server — Chroma + all-MiniLM-L6-v2, port 3001"""
import os, sys, json, time, glob, re
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware

# ── Config ──────────────────────────────────────────────────
PORT = 3001
VAULT = r"C:\Users\datel\Documents\Obsidian Vault"
CHROMA_DIR = r"C:\Users\datel\service-dashboard\rag_chroma"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

# ── Init ────────────────────────────────────────────────────
model = SentenceTransformer('all-MiniLM-L6-v2')
chroma = chromadb.PersistentClient(path=CHROMA_DIR)
collection = None

app = FastAPI(title="Agentic RAG")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── Indexing ─────────────────────────────────────────────────
def chunk_text(text, size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    words = text.split()
    chunks = []
    for i in range(0, len(words), size - overlap):
        chunk = ' '.join(words[i:i+size])
        if chunk:
            chunks.append(chunk)
    return chunks

def index_vault():
    global collection
    try:
        chroma.delete_collection("vault")
    except:
        pass
    collection = chroma.create_collection("vault")

    vault = VAULT
    md_files = []
    for root, dirs, files in os.walk(vault):
        for f in files:
            if f.endswith('.md'):
                md_files.append(os.path.join(root, f))

    if not md_files:
        print("No .md files found in vault")
        return 0

    all_chunks = []
    all_ids = []
    all_metas = []
    idx = 0

    for fp in md_files:
        try:
            with open(fp, 'r', encoding='utf-8', errors='replace') as f:
                text = f.read()
        except:
            continue
        rel = os.path.relpath(fp, vault)
        if text.startswith('---'):
            end = text.find('---', 3)
            if end != -1:
                text = text[end+3:]
        chunks = chunk_text(text)
        for c in chunks:
            all_chunks.append(c)
            all_ids.append(f'{rel}#{idx}')
            all_metas.append({'source': rel})
            idx += 1

    batch_size = 128
    for i in range(0, len(all_chunks), batch_size):
        batch = all_chunks[i:i+batch_size]
        emb = model.encode(batch, show_progress_bar=False)
        ids = all_ids[i:i+batch_size]
        metas = all_metas[i:i+batch_size]
        collection.add(embeddings=emb.tolist(), documents=batch, ids=ids, metadatas=metas)

    return len(all_chunks)

# ── FastAPI ──────────────────────────────────────────────────
class QueryRequest(BaseModel):
    query: str
    top_k: int = 5

@app.on_event("startup")
async def startup():
    global collection
    try:
        chroma.delete_collection("vault")
    except:
        pass
    collection = chroma.create_collection("vault")
    n = index_vault()
    print(f"Indexed {n} chunks from vault")

@app.get("/status")
def status():
    c = collection.count() if collection else 0
    return {"ok": True, "chunks": c, "model": "all-MiniLM-L6-v2"}

@app.post("/query")
def query(req: QueryRequest):
    if not collection or collection.count() == 0:
        return {"answer": "Chưa có dữ liệu. Cần index vault trước.", "sources": [], "total_chunks": 0}

    q_emb = model.encode([req.query])[0]
    results = collection.query(query_embeddings=q_emb.tolist(), n_results=req.top_k)

    if not results['documents'] or not results['documents'][0]:
        return {"answer": "Không tìm thấy thông tin liên quan.", "sources": [], "total_chunks": collection.count()}

    docs = results['documents'][0]
    metas = results['metadatas'][0]
    distances = results['distances'][0] if results.get('distances') else [0]*len(docs)

    context = '\n\n'.join(docs)
    sources = [{'source': m['source'], 'score': round(1-d, 3)} for m, d in zip(metas, distances)]

    return {"answer": context, "sources": sources, "total_chunks": collection.count()}

@app.post("/reindex")
def reindex():
    global collection
    try:
        chroma.delete_collection("vault")
    except:
        pass
    collection = chroma.create_collection("vault")
    n = index_vault()
    return {"ok": True, "chunks": n}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")
