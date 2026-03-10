import psycopg2
import pickle
import numpy as np
import io
import binascii
from fastapi import FastAPI, UploadFile, Form, HTTPException
from pydantic import BaseModel
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import ast
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

app = FastAPI(title="AI Camera Search API", version="1.0")

# ============================================================
# 🧩 DATABASE CONNECTION
# ============================================================
def get_conn():
    """Connect to Supabase PostgreSQL"""
    return psycopg2.connect(
        dbname="postgres",
        user="postgres.zavcdgxjqbkpsafishmg",
        password="gLdv4DObzlTii1RV",
        host="aws-0-ap-southeast-1.pooler.supabase.com",
        port="6543"
    )

# ============================================================
# 🧠 LOAD CLIP MODEL (once at startup)
# ============================================================
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def get_embedding(image_bytes: bytes) -> np.ndarray:
    """Extract normalized CLIP image embedding"""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = clip_processor(images=image, return_tensors="pt")
    with torch.no_grad():
        embedding = clip_model.get_image_features(**inputs)
    embedding = embedding / embedding.norm(p=2, dim=-1, keepdim=True)
    return embedding.squeeze().cpu().numpy()

def embedding_to_hex(embedding: np.ndarray) -> str:
    """Convert numpy embedding to hex string for transmission"""
    return binascii.hexlify(pickle.dumps(embedding)).decode('ascii')

def hex_to_embedding(hex_string: str) -> np.ndarray:
    """Convert hex string back to numpy embedding"""
    return pickle.loads(binascii.unhexlify(hex_string))

def convert_embedding(embedding_data):
    """Convert embedding from any format to numpy array"""
    if embedding_data is None:
        return None
        
    try:
        # Case 1: Already a list
        if isinstance(embedding_data, list):
            return np.array(embedding_data, dtype=np.float32)
        
        # Case 2: String representation of list
        elif isinstance(embedding_data, str):
            # Remove brackets and split by commas
            cleaned = embedding_data.strip('[]')
            values = [float(x.strip()) for x in cleaned.split(',') if x.strip()]
            return np.array(values, dtype=np.float32)
        
        # Case 3: Bytes (pickle)
        elif isinstance(embedding_data, bytes):
            return pickle.loads(embedding_data)
        
        # Case 4: PostgreSQL vector type or other
        else:
            # Try to convert to string and parse
            str_data = str(embedding_data)
            if '[' in str_data and ']' in str_data:
                return convert_embedding(str_data)
            else:
                print(f"⚠️ Unknown embedding format: {type(embedding_data)}")
                return None
                
    except Exception as e:
        print(f"❌ Error converting embedding: {e}")
        return None

# ============================================================
# ✅ TEST ROUTE
# ============================================================
@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Camera Search API running"}

# ============================================================
# 🔍 GET EMBEDDING ONLY
# ============================================================
@app.post("/get_embedding/")
async def get_image_embedding(image: UploadFile):
    """Convert image to embedding hex string for Laravel"""
    try:
        image_bytes = await image.read()
        embedding = get_embedding(image_bytes)
        embedding_hex = embedding_to_hex(embedding)
        
        return {
            "embedding_hex": embedding_hex,
            "embedding_shape": embedding.shape,
            "message": "Embedding generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

# ============================================================
# 🟢 ADD PRODUCT EMBEDDING
# ============================================================
@app.post("/add_product/")
async def add_product(
    product_id: str = Form(...),
    name: str = Form(...),
    category: str = Form(...),
    image: UploadFile = None,
    embedding_vector: str = Form(None)
):
    embedding_list = None
    
    # Option 1: image embedding
    if image:
        image_bytes = await image.read()
        embedding = get_embedding(image_bytes)
        embedding_list = embedding.tolist()
        print(f"✅ Generated embedding from image - shape: {embedding.shape}")

    # Option 2: pre-computed vector
    elif embedding_vector:
        try:
            if embedding_vector.startswith('[') and embedding_vector.endswith(']'):
                embedding_list = ast.literal_eval(embedding_vector)
            else:
                embedding_list = [float(x.strip()) for x in embedding_vector.split(',')]
            
            embedding_array = np.array(embedding_list, dtype=np.float32)
            norm = np.linalg.norm(embedding_array)

            if norm > 0:
                embedding_array = embedding_array / norm
                embedding_list = embedding_array.tolist()

            print(f"✅ Using pre-computed vector - length: {len(embedding_list)}")

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid embedding vector format: {str(e)}")

    # Option 3: category-based embedding
    else:
        print("⚠️ No image/vector, generating category-based embedding")
        try:
            text_inputs = clip_processor(
                text=[category.lower().strip()], 
                return_tensors="pt", 
                padding=True, 
                truncation=True
            )
            with torch.no_grad():
                text_features = clip_model.get_text_features(**text_inputs)
                text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)

            embedding = text_features.squeeze().cpu().numpy()
            embedding_list = embedding.tolist()
            print(f"✅ Generated category-based embedding - shape: {embedding.shape}")

        except Exception as e:
            print(f"❌ Failed to generate category embedding: {e}")
            embedding_list = [0.0] * 512

    category_name = category.lower().strip()
    created_at = datetime.utcnow()
    updated_at = datetime.utcnow()

    try:
        with get_conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO product_embeddings (product_id, name, category, embedding, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (product_id) DO UPDATE
                    SET name = EXCLUDED.name,
                        category = EXCLUDED.category,
                        embedding = EXCLUDED.embedding,
                        updated_at = EXCLUDED.updated_at
                """, (
                    product_id,
                    name,
                    category_name,
                    embedding_list,
                    created_at,
                    updated_at
                ))

        return {
            "message": "✅ Product added/updated successfully",
            "product_id": product_id,
            "embedding_source": "image" if image else "pre_computed_vector" if embedding_vector else "category_based",
            "created_at": created_at.isoformat(),
            "updated_at": updated_at.isoformat(),
            "embedding_length": len(embedding_list),
            "embedding_norm": round(np.linalg.norm(np.array(embedding_list)), 4)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")



# ============================================================
# 🧩 REQUEST BODY (Product Recommendation)
# ============================================================
class RecommendRequest(BaseModel):
    product_id: str
    top_k: int = 5

# ============================================================
# 🧩 GET SIMILAR PRODUCTS (BY PRODUCT ID)
# ============================================================
class RecommendRequest(BaseModel):
    product_id: str
    top_k: Optional[int] = 5
    similarity_threshold: Optional[float] = 0.70

@app.post("/recommend/")
async def recommend_items(request: RecommendRequest = None):
    """Recommend similar products - accepts both JSON and form-data"""
    try:
        # Handle both JSON and form-data
        if request:
            # JSON input
            product_id = request.product_id
            top_k = request.top_k or 5
            similarity_threshold = request.similarity_threshold or 0.70
        else:
            # This handles form-data if needed, but your Laravel sends JSON
            raise HTTPException(status_code=400, detail="JSON payload required")
        
        print(f"🔍 Recommendation request for: {product_id}")
        print(f"📊 Top K: {top_k}, Threshold: {similarity_threshold}")

        with get_conn() as conn:
            with conn.cursor() as cursor:
                # Get the source product's embedding and category
                cursor.execute(
                    "SELECT embedding, category, name FROM product_embeddings WHERE product_id = %s",
                    (product_id,)
                )
                row = cursor.fetchone()

                if not row:
                    return {
                        "error": "Product not found",
                        "message": f"Product with ID {product_id} not found in database"
                    }

                embedding_data, source_category, source_product_name = row
                
                # Handle embedding data conversion
                if embedding_data is None:
                    return {
                        "error": "No embedding found",
                        "message": f"Product {source_product_name} has no embedding data"
                    }
                
                # Convert embedding based on type
                if isinstance(embedding_data, bytes):
                    target_embedding = pickle.loads(embedding_data)
                elif isinstance(embedding_data, str):
                    if embedding_data.startswith('[') and embedding_data.endswith(']'):
                        embedding_list = ast.literal_eval(embedding_data)
                        target_embedding = np.array(embedding_list, dtype=np.float32)
                    else:
                        embedding_list = [float(x) for x in embedding_data.replace(',', ' ').split()]
                        target_embedding = np.array(embedding_list, dtype=np.float32)
                elif isinstance(embedding_data, list):
                    target_embedding = np.array(embedding_data, dtype=np.float32)
                else:
                    return {
                        "error": "Unknown embedding format",
                        "message": f"Unsupported embedding format for product {source_product_name}"
                    }

                print(f"🎯 Source product: {source_product_name}")
                print(f"📊 Source category: {source_category}")
                print(f"🔢 Embedding shape: {target_embedding.shape}")

                # Get all products with embeddings
                cursor.execute("""
                    SELECT pe.product_id, pe.name, pe.category, pe.embedding,
                           p.product_price, pi.image_path
                    FROM product_embeddings pe
                    LEFT JOIN products p ON pe.product_id = p.product_id::text
                    LEFT JOIN product_images pi ON p.product_id = pi.product_id
                    WHERE pe.embedding IS NOT NULL AND pe.product_id != %s
                """, (product_id,))
                rows = cursor.fetchall()

        print(f"📊 Total products to compare: {len(rows)}")

        # Calculate similarities
        similarities = []
        valid_products = 0
        
        for row in rows:
            pid, name, category, emb_data, price, image_path = row
            
            try:
                if emb_data is None:
                    continue
                
                # Convert product embedding
                if isinstance(emb_data, bytes):
                    product_embedding = pickle.loads(emb_data)
                elif isinstance(emb_data, str):
                    if emb_data.startswith('[') and emb_data.endswith(']'):
                        embedding_list = ast.literal_eval(emb_data)
                        product_embedding = np.array(embedding_list, dtype=np.float32)
                    else:
                        embedding_list = [float(x) for x in emb_data.replace(',', ' ').split()]
                        product_embedding = np.array(embedding_list, dtype=np.float32)
                elif isinstance(emb_data, list):
                    product_embedding = np.array(emb_data, dtype=np.float32)
                else:
                    continue
                
                # Handle shape mismatches
                if product_embedding.shape != target_embedding.shape:
                    min_dim = min(product_embedding.shape[0], target_embedding.shape[0])
                    product_embedding_trimmed = product_embedding[:min_dim]
                    target_embedding_trimmed = target_embedding[:min_dim]
                else:
                    product_embedding_trimmed = product_embedding
                    target_embedding_trimmed = target_embedding
                
                # Calculate similarity
                sim = float(np.dot(target_embedding_trimmed, product_embedding_trimmed))
                
                # Category bonus
                final_similarity = sim
                if category == source_category:
                    final_similarity += 0.03
                    final_similarity = min(final_similarity, 1.0)
                
                similarities.append({
                    "product_id": pid,
                    "name": name,
                    "category": category,
                    "similarity": round(final_similarity, 4),
                    "price": float(price) if price else 0.0,
                    "image_path": image_path or "/default-product-image.jpg",
                    "is_same_category": category == source_category
                })
                
                valid_products += 1
                
            except Exception as e:
                print(f"❌ Error processing product {pid}: {e}")
                continue

        print(f"✅ Successfully processed {valid_products} products")

        # Sort and filter
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        filtered_recommendations = [
            rec for rec in similarities 
            if rec["similarity"] >= similarity_threshold
        ][:top_k]

        print(f"🎯 Found {len(filtered_recommendations)} recommendations")
        
        # Search metrics
        search_metrics = {
            "total_products_searched": len(rows),
            "products_with_valid_embeddings": valid_products,
            "products_found": len(filtered_recommendations),
            "top_similarity_score": filtered_recommendations[0]["similarity"] if filtered_recommendations else 0,
            "similarity_threshold": similarity_threshold,
            "same_category_matches": len([r for r in filtered_recommendations if r["is_same_category"]])
        }

        # Return response
        if not filtered_recommendations:
            top_similarity = similarities[0]["similarity"] if similarities else 0
            return {
                "error": "No similar products found",
                "message": f"No products meet the {similarity_threshold*100}% similarity threshold",
                "source_product": source_product_name,
                "source_category": source_category,
                "closest_match_similarity": round(top_similarity, 4),
                "similarity_threshold": similarity_threshold,
                "search_metrics": search_metrics
            }

        return {
            "source_product": source_product_name,
            "source_category": source_category,
            "recommendations": filtered_recommendations,
            "similarity_threshold": similarity_threshold,
            "search_metrics": search_metrics,
            "total_found": len(filtered_recommendations)
        }

    except Exception as e:
        print(f"❌ Recommendation error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

# ============================================================
# 📸 CAMERA SEARCH (Image → Similar Products)
# ============================================================
@app.post("/camera_recommend/")
async def camera_recommend(image: UploadFile, top_k: int = Form(10)):
    """Search for visually similar products using a photo - returns only product IDs"""
    try:
        # -----------------------------
        # STEP 1: Get image embedding
        # -----------------------------
        image_bytes = await image.read()
        query_embedding = get_embedding(image_bytes)
        print(f"[INFO] Query embedding shape: {query_embedding.shape}")

        # -----------------------------
        # STEP 2: Predict category (optional)
        # -----------------------------
# In your camera_recommend function, update the predict_category function:
        def predict_category(image_embedding, categories):
            sims = []
            
            # Add common category variations
            category_variations = {}
            for cat in categories:
                variations = [cat.lower()]
                # Add common variations
                if 'electronic' in cat.lower():
                    variations.extend(['electronics', 'tech', 'technology', 'gadgets'])
                elif 'cloth' in cat.lower():
                    variations.extend(['clothing', 'fashion', 'apparel'])
                elif 'sport' in cat.lower():
                    variations.extend(['sports', 'fitness', 'outdoor'])
                elif 'home' in cat.lower():
                    variations.extend(['home', 'household', 'furniture'])
                elif 'beauty' in cat.lower():
                    variations.extend(['beauty', 'cosmetics', 'skincare'])
                
                category_variations[cat] = variations

            for cat, variations in category_variations.items():
                best_sim = 0
                for variation in variations:
                    try:
                        text_inputs = clip_processor(
                            text=[variation], 
                            return_tensors="pt", 
                            padding=True, 
                            truncation=True
                        )
                        with torch.no_grad():
                            text_features = clip_model.get_text_features(**text_inputs)
                            text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
                        text_embedding = text_features.squeeze().cpu().numpy()
                        sim = float(np.dot(image_embedding, text_embedding))
                        if sim > best_sim:
                            best_sim = sim
                    except Exception as e:
                        continue
                
                sims.append(best_sim)
                print(f"[DEBUG] Category: {cat}, best similarity: {best_sim:.4f}")
            
            if not sims:
                return "unknown", 0.0
            
            best_idx = int(np.argmax(sims))
            best_category = list(category_variations.keys())[best_idx]
            return best_category, sims[best_idx]

        # Get all categories
        with get_conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT DISTINCT category FROM product_embeddings WHERE category IS NOT NULL")
                categories = [r[0] for r in cursor.fetchall()]

        predicted_category, category_confidence = "unknown", 0.0
        if categories:
            predicted_category, category_confidence = predict_category(query_embedding, categories)
            print(f"[INFO] Predicted category: {predicted_category} (confidence {category_confidence:.4f})")

        # -----------------------------
        # STEP 3: Fetch products with embeddings
        # -----------------------------
        products_data = []
        with get_conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT product_id, name, category, embedding
                    FROM product_embeddings 
                    WHERE embedding IS NOT NULL
                """)
                products_data = cursor.fetchall()
                print(f"[INFO] Found {len(products_data)} products with embeddings")

        # -----------------------------
        # STEP 4: Compute similarities
        # -----------------------------
        similarities = []
        query_embedding = np.array(query_embedding, dtype=np.float32).flatten()  # ensure 1D

        for row in products_data:
            product_id, name, category, emb_data = row
            try:
            # Convert stored embedding to numpy array
                if isinstance(emb_data, str):
                    emb = np.array(ast.literal_eval(emb_data), dtype=np.float32)
                elif isinstance(emb_data, list):
                    emb = np.array(emb_data, dtype=np.float32)
                elif isinstance(emb_data, bytes):
                    emb = np.array(pickle.loads(emb_data), dtype=np.float32)
                else:
                    raise ValueError("Unknown embedding format")
        
                emb = emb.flatten()  # ensure 1D

                # Ensure embeddings have the same dimension
                if emb.shape != query_embedding.shape:
                    print(f"[WARN] Skipping {product_id}, shape mismatch {emb.shape} vs {query_embedding.shape}")
                    continue

                # Cosine similarity (dot product, embeddings should be normalized)
                sim = float(np.dot(query_embedding, emb))

                # Optional category boost
                if category == predicted_category:
                    sim += 0.05

                similarities.append({
                "product_id": product_id,
                "name": name,
                "category": category or "unknown",
                "similarity": round(sim, 4)
                })
            except Exception as e:
                print(f"[WARN] Cannot process product {product_id}: {e}")
            continue

        # Sort by similarity
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        recommendations = similarities[:top_k]

        if not recommendations:
            return {
                "error": "No similar products found",
                "detected_category": predicted_category,
                "category_confidence": round(category_confidence, 4)
            }

        return {
            "detected_category": predicted_category,
            "category_confidence": round(category_confidence, 4),
            "recommendations": recommendations,
            "search_metrics": {
                "top_similarity_score": recommendations[0]["similarity"] if recommendations else 0,
                "total_products_searched": len(products_data),
                "products_found": len(recommendations),
            }
        }

    except Exception as e:
        print(f"[ERROR] Camera recommend failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


# ============================================================
# 🔍 SEARCH WITH EMBEDDING HEX
# ============================================================
@app.post("/search_by_embedding/")
async def search_by_embedding(embedding_hex: str = Form(...), top_k: int = Form(10)):
    """Search using pre-computed embedding hex string (for Laravel direct search)"""
    try:
        # Convert hex back to embedding
        query_embedding = hex_to_embedding(embedding_hex)
        
        with get_conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT pe.product_id, pe.name, pe.category, pe.embedding,
                           p.product_price, p.product_quantity,
                           pi.image_path, s.store_name
                    FROM product_embeddings pe
                    LEFT JOIN products p ON pe.product_id = p.product_id::text
                    LEFT JOIN product_images pi ON p.product_id = pi.product_id
                    LEFT JOIN sellers s ON p.seller_id = s.seller_id
                    WHERE pe.embedding IS NOT NULL
                """)
                rows = cursor.fetchall()

        # Calculate similarities
        similarities = []
        for row in rows:
            pid, name, category, emb_blob, price, quantity, image_path, store_name = row
            try:
                emb = pickle.loads(emb_blob)
                sim = np.dot(query_embedding, emb)
                
                if sim >= 0.6:  # Only include similar products
                    product_data = {
                        "product_id": pid,
                        "name": name,
                        "category": category,
                        "similarity": round(sim, 4),
                        "price": float(price) if price else 0.0,
                        "quantity": quantity or 0,
                        "image_path": image_path or "/default-product-image.jpg",
                        "store_name": store_name or "Unknown Store"
                    }
                    similarities.append((sim, product_data))
            except Exception as e:
                continue

        # Sort by similarity
        similarities.sort(key=lambda x: x[0], reverse=True)
        recommendations = [product_data for _, product_data in similarities[:top_k]]

        if not recommendations:
            return {
                "error": "No similar products found",
                "closest_match": similarities[0][0] if similarities else 0
            }

        return {
            "recommendations": recommendations,
            "search_metrics": {
                "top_similarity_score": similarities[0][0] if similarities else 0,
                "products_found": len(recommendations)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching with embedding: {str(e)}")

# ============================================================
# 📊 GET CATEGORY STATISTICS
# ============================================================
@app.get("/categories/")
async def get_categories():
    """Get all available categories and their product counts"""
    try:
        with get_conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT category, COUNT(*) as product_count
                    FROM product_embeddings
                    GROUP BY category
                    ORDER BY product_count DESC
                """)
                rows = cursor.fetchall()

        categories = [{"category": row[0], "product_count": row[1]} for row in rows]
        return {"categories": categories}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")