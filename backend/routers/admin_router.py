from fastapi import APIRouter, HTTPException, Depends
from database import get_db_pool
import aiomysql
from typing import Dict, Any, List

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/overview")
async def get_overview(pool: aiomysql.Pool = Depends(get_db_pool)):
    if not pool:
        return {
            "total_users": 1,
            "total_farmers": 0,
            "total_disease_scans": 0,
            "total_crop_analyses": 0,
            "top_crop": "No queries yet",
            "top_district": "-",
            "top_crop_with_district": "No queries yet",
            "top_disease": "No scans yet",
            "recent_activities": []
        }

    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            # Users
            await cur.execute("SELECT COUNT(*) as cnt FROM users")
            total_users = (await cur.fetchone())['cnt']

            await cur.execute("SELECT COUNT(*) as cnt FROM users WHERE role = 'farmer' OR role IS NULL")
            total_farmers = (await cur.fetchone())['cnt']

            # Disease scans
            await cur.execute("SELECT COUNT(*) as cnt FROM diseases")
            total_disease_scans = (await cur.fetchone())['cnt']

            # Crop analyses
            await cur.execute("SELECT COUNT(*) as cnt FROM crops")
            total_crop_analyses = (await cur.fetchone())['cnt']

            # Top crop with district (user demand)
            await cur.execute("""
                SELECT crop_name, district, COUNT(*) as cnt 
                FROM crops 
                WHERE (user_email IS NULL OR user_email != 'Guest Farmer')
                  AND district IS NOT NULL AND district != ''
                GROUP BY crop_name, district 
                ORDER BY cnt DESC, crop_name ASC 
                LIMIT 1
            """)
            top_crop_district_row = await cur.fetchone()
            if top_crop_district_row:
                top_crop = top_crop_district_row['crop_name']
                top_district = top_crop_district_row['district']
                top_crop_with_district = f"{top_crop} ({top_district})"
            else:
                top_crop = "No queries yet"
                top_district = "-"
                top_crop_with_district = "No queries yet"

            # Top disease
            await cur.execute("""
                SELECT disease_name, COUNT(*) as cnt 
                FROM diseases 
                GROUP BY disease_name 
                ORDER BY cnt DESC 
                LIMIT 1
            """)
            top_disease_row = await cur.fetchone()
            top_disease = top_disease_row['disease_name'] if top_disease_row else "No scans yet"

            # Recent activities
            await cur.execute("""

                (SELECT 'disease' as type, disease_name as title, user_name, crop_name as subtitle, created_at 
                 FROM diseases ORDER BY created_at DESC LIMIT 5)
                UNION ALL
                (SELECT 'crop' as type, crop_name as title, user_name, district as subtitle, created_at 
                 FROM crops ORDER BY created_at DESC LIMIT 5)
                ORDER BY created_at DESC LIMIT 8
            """)
            recent_activities = await cur.fetchall()

            return {
                "total_users": total_users,
                "total_farmers": total_farmers,
                "total_disease_scans": total_disease_scans,
                "total_crop_analyses": total_crop_analyses,
                "top_crop": top_crop,
                "top_district": top_district,
                "top_crop_with_district": top_crop_with_district,
                "top_disease": top_disease,
                "recent_activities": recent_activities
            }

@router.get("/users")
async def get_users(pool: aiomysql.Pool = Depends(get_db_pool)):
    if not pool:
        return []

    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("""
                SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    u.phone, 
                    COALESCE(u.role, 'farmer') as role, 
                    u.created_at,
                    (SELECT COUNT(*) FROM diseases d WHERE d.user_email = u.email) as scans_count,
                    (SELECT COUNT(*) FROM crops c WHERE c.user_email = u.email) as crops_count
                FROM users u
                ORDER BY u.created_at DESC
            """)
            users = await cur.fetchall()
            return users

def normalize_canonical_disease(name: str):
    if not name:
        return None
    n = name.lower().strip()
    if 'unable to identify' in n or 'not a valid leaf' in n or 'healthy' in n:
        return None
    if 'downy mildew' in n:
        return 'Downy Mildew'
    if 'powdery mildew' in n:
        return 'Powdery Mildew'
    if 'anthracnose' in n or "bird's eye rot" in n:
        return 'Anthracnose'
    if 'early blight' in n:
        return 'Early Blight'
    if 'late blight' in n:
        return 'Late Blight'
    if 'blast' in n:
        return 'Paddy Blast'
    if 'sheath blight' in n:
        return 'Sheath Blight'
    if 'bacterial leaf blight' in n or 'blb' in n:
        return 'Bacterial Leaf Blight'
    if 'leaf curl' in n:
        return 'Leaf Curl'
    if 'brown spot' in n:
        return 'Brown Spot'
    if 'leaf spot' in n or 'leaf blotch' in n or 'frogeye' in n:
        return 'Leaf Spot'
    if 'mosaic' in n:
        return 'Mosaic Virus'
    if 'rust' in n:
        return 'Rust'
    if 'wilt' in n:
        return 'Bacterial Wilt'
    if 'bud rot' in n:
        return 'Bud Rot'
    import re
    clean = re.split(r'[\(/\-]', name)[0].strip()
    return clean or name

def normalize_canonical_crop(crop: str) -> str:
    if not crop:
        return ""
    c = crop.lower().strip()
    if 'rice' in c or 'paddy' in c:
        return 'Rice (Paddy)'
    if 'chili' in c or 'chilli' in c or 'pepper' in c:
        return 'Chili'
    if 'corn' in c or 'maize' in c:
        return 'Corn/Maize'
    if 'grape' in c:
        return 'Grapes'
    if 'mango' in c:
        return 'Mango'
    if 'tomato' in c:
        return 'Tomato'
    if 'potato' in c:
        return 'Potato'
    if 'turmeric' in c:
        return 'Turmeric'
    if 'banana' in c:
        return 'Banana'
    if 'tea' in c:
        return 'Tea'
    if 'coconut' in c:
        return 'Coconut'
    if 'okra' in c or 'ladiesfinger' in c:
        return 'Okra'
    import re
    clean = re.split(r'[\(/\-]', crop)[0].strip()
    return clean or crop

DISEASE_KNOWN_CROPS = {
    'Anthracnose': ['Grapes', 'Chili', 'Mango'],
    'Leaf Spot': ['Turmeric', 'Banana', 'Chili'],
    'Downy Mildew': ['Grapes', 'Cucumber', 'Pumpkin'],
    'Paddy Blast': ['Rice (Paddy)', 'Finger Millet', 'Barley'],
    'Early Blight': ['Tomato', 'Potato', 'Brinjal'],
    'Late Blight': ['Potato', 'Tomato', 'Brinjal'],
    'Powdery Mildew': ['Chili', 'Grapes', 'Pumpkin'],
    'Bacterial Leaf Blight': ['Rice (Paddy)', 'Betel', 'Beans'],
    'Leaf Curl': ['Chili', 'Tomato', 'Papaya'],
    'Mosaic Virus': ['Okra', 'Chili', 'Papaya'],
    'Bacterial Wilt': ['Tomato', 'Brinjal', 'Potato']
}

DEFAULT_TOP_5_DISEASES = [
    {
        "rank": 1,
        "disease_name": "Anthracnose",
        "crops": ["Grapes", "Chili", "Mango"],
        "severity": "Moderate"
    },
    {
        "rank": 2,
        "disease_name": "Leaf Spot",
        "crops": ["Turmeric", "Banana", "Chili"],
        "severity": "Moderate"
    },
    {
        "rank": 3,
        "disease_name": "Downy Mildew",
        "crops": ["Grapes", "Cucumber", "Pumpkin"],
        "severity": "Severe"
    },
    {
        "rank": 4,
        "disease_name": "Paddy Blast",
        "crops": ["Rice (Paddy)", "Finger Millet", "Barley"],
        "severity": "Severe"
    },
    {
        "rank": 5,
        "disease_name": "Early Blight",
        "crops": ["Tomato", "Potato", "Brinjal"],
        "severity": "Moderate"
    }
]

@router.get("/disease-logs")
async def get_disease_logs(pool: aiomysql.Pool = Depends(get_db_pool)):
    if not pool:
        return {
            "logs": [], 
            "disease_distribution": [], 
            "severity_counts": {}, 
            "top_5_diseases": DEFAULT_TOP_5_DISEASES,
            "total_detections": 0
        }

    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            # All logs
            await cur.execute("""
                SELECT id, user_email, user_name, crop_name, district, disease_name, confidence, severity, symptoms, treatment, created_at
                FROM diseases
                ORDER BY created_at DESC
            """)
            logs = await cur.fetchall()

            # Disease distribution
            await cur.execute("""
                SELECT disease_name, crop_name, COUNT(*) as count, ROUND(AVG(confidence)*100, 1) as avg_confidence
                FROM diseases
                GROUP BY disease_name, crop_name
                ORDER BY count DESC
            """)
            disease_dist = await cur.fetchall()

            # Severity counts
            await cur.execute("""
                SELECT severity, COUNT(*) as count
                FROM diseases
                GROUP BY severity
            """)
            severity_rows = await cur.fetchall()
            severity_counts = {r['severity']: r['count'] for r in severity_rows}

            # Calculate aggregated top 5 diseases
            stats = {}
            total_valid = 0
            for r in logs:
                dname = normalize_canonical_disease(r.get('disease_name'))
                if not dname:
                    continue
                total_valid += 1
                if dname not in stats:
                    stats[dname] = {
                        'count': 0,
                        'crops': [],
                        'districts': [],
                        'severities': []
                    }
                stats[dname]['count'] += 1
                
                raw_crop = r.get('crop_name') or ''
                clean_crop = normalize_canonical_crop(raw_crop)
                if clean_crop and clean_crop not in stats[dname]['crops']:
                    stats[dname]['crops'].append(clean_crop)

                dist = r.get('district')
                if dist and isinstance(dist, str) and dist.strip():
                    dist_clean = dist.strip().title()
                    if dist_clean not in stats[dname]['districts']:
                        stats[dname]['districts'].append(dist_clean)

                if r.get('severity'):
                    stats[dname]['severities'].append(r['severity'])

            top_5_diseases = []
            if stats and total_valid > 0:
                sorted_d = sorted(stats.items(), key=lambda x: x[1]['count'], reverse=True)
                for rank, (name, d) in enumerate(sorted_d[:5], 1):
                    crops_list = list(d['crops'])
                    if not crops_list:
                        crops_list = ['General Plant']
                    
                    districts_list = list(d['districts'])
                    
                    sev = max(set(d['severities']), key=d['severities'].count) if d['severities'] else 'Moderate'
                    top_5_diseases.append({
                        "rank": rank,
                        "disease_name": name,
                        "crops": crops_list[:3],
                        "districts": districts_list,
                        "severity": sev
                    })
            else:
                top_5_diseases = []

            return {
                "logs": logs,
                "disease_distribution": disease_dist,
                "severity_counts": severity_counts,
                "top_5_diseases": top_5_diseases,
                "total_detections": len(logs)
            }

@router.get("/crop-analytics")
async def get_crop_analytics(pool: aiomysql.Pool = Depends(get_db_pool)):
    if not pool:
        return {"logs": [], "top_crops": [], "districts": [], "crops_by_district": []}

    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            # All logs
            await cur.execute("""
                SELECT id, user_email, user_name, crop_name, district, land_size, planting_month, is_recommended, suitability_score, created_at
                FROM crops
                ORDER BY created_at DESC
            """)
            logs = await cur.fetchall()

            # Top crops ranking
            await cur.execute("""
                SELECT 
                    crop_name, 
                    COUNT(*) as search_count,
                    SUM(CASE WHEN is_recommended = 1 THEN 1 ELSE 0 END) as recommended_count,
                    SUM(CASE WHEN is_recommended = 0 THEN 1 ELSE 0 END) as rejected_count,
                    ROUND(AVG(suitability_score), 1) as avg_score,
                    ROUND(AVG(land_size), 2) as avg_land_size
                FROM crops
                GROUP BY crop_name
                ORDER BY search_count DESC
            """)
            top_crops = await cur.fetchall()

            # Most requested crops by district (crops + district pairs)
            await cur.execute("""
                SELECT 
                    crop_name, 
                    district, 
                    COUNT(*) as search_count,
                    SUM(CASE WHEN is_recommended = 1 THEN 1 ELSE 0 END) as recommended_count,
                    SUM(CASE WHEN is_recommended = 0 THEN 1 ELSE 0 END) as rejected_count,
                    ROUND(AVG(suitability_score), 1) as avg_score,
                    ROUND(AVG(land_size), 2) as avg_land_size
                FROM crops
                GROUP BY crop_name, district
                ORDER BY search_count DESC, crop_name ASC
            """)
            crops_by_district = await cur.fetchall()

            # District distribution
            await cur.execute("""
                SELECT district, COUNT(*) as count, COUNT(DISTINCT crop_name) as distinct_crops
                FROM crops
                GROUP BY district
                ORDER BY count DESC
            """)
            districts = await cur.fetchall()

            # District-wise top requested crops (only genuine user inquiries, sorted by popularity)
            await cur.execute("""
                SELECT district, crop_name, COUNT(*) as cnt
                FROM crops
                WHERE district IS NOT NULL AND district != '' 
                  AND crop_name IS NOT NULL AND crop_name != ''
                  AND (user_email IS NULL OR user_email != 'Guest Farmer')
                GROUP BY district, crop_name
                ORDER BY district ASC, cnt DESC
            """)
            raw_district_crops = await cur.fetchall()
            district_top_map = {}
            for row in raw_district_crops:
                dist = row['district']
                if not dist:
                    continue
                if dist not in district_top_map:
                    district_top_map[dist] = {
                        'district': dist,
                        'crop_name': row['crop_name'],
                        'crops': [row['crop_name']],
                        'inquiries_count': row['cnt']
                    }
                elif len(district_top_map[dist]['crops']) < 5:
                    if row['crop_name'] not in district_top_map[dist]['crops']:
                        district_top_map[dist]['crops'].append(row['crop_name'])
                        district_top_map[dist]['inquiries_count'] += row['cnt']
            district_top_crops = list(district_top_map.values())

            return {
                "logs": logs,
                "top_crops": top_crops,
                "crops_by_district": crops_by_district,
                "district_top_crops": district_top_crops,
                "districts": districts,
                "total_queries": len(logs)
            }



@router.delete("/users/{user_id}")
async def delete_user(user_id: int, pool: aiomysql.Pool = Depends(get_db_pool)):
    if not pool:
        raise HTTPException(status_code=503, detail="Database unavailable")

    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id, role, email FROM users WHERE id = %s", (user_id,))
            user = await cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            if user.get('role') == 'admin' or user.get('email') == 'admin@agrisense.lk':
                raise HTTPException(status_code=400, detail="Cannot delete default admin account")

            await cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
            await conn.commit()
            return {"success": True, "message": f"User {user_id} removed successfully"}
