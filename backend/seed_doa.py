"""Seed DOA knowledge base with Sri Lanka Department of Agriculture crop recommendations."""

from sqlalchemy.orm import Session
from models.db_models import DOAKnowledgeBase

DOA_ROWS = [
    {
        "crop_name_sinhala": "වී",
        "crop_name_english": "Paddy",
        "suitable_districts": "Polonnaruwa, Anuradhapura, Ampara, Kurunegala, Hambantota",
        "soil_type": "Clay loam, alluvial or medium soils with good moisture retention",
        "season": "Maha primary; Yala secondary",
        "fertilizer_rec": "Basal: 55kg TSP + 30kg MOP per acre, plus 5kg Zinc Sulphate. Top dress Urea 60-80kg per acre in two splits at tillering and panicle initiation.",
        "pest_info": "Brown Planthopper, White Backed Planthopper, Stem Borer, Paddy Bug, Blast and Sheath Blight.",
        "planting_tips": "Use certified seed, maintain puddled soil at establishment, and manage standing water through tillering before controlled drainage.",
    },
    {
        "crop_name_sinhala": "පොල්",
        "crop_name_english": "Coconut",
        "suitable_districts": "Kurunegala, Puttalam, Gampaha (Coconut Triangle)",
        "soil_type": "Sandy loam, gravelly loam or alluvial soils",
        "season": "Year round",
        "fertilizer_rec": "CRI Adult Palm Mixture (APM) 3kg per palm annually plus 10kg organic manure. Apply in three splits during the growing season.",
        "pest_info": "Red Palm Weevil, Black Beetle, Coconut Mite and Leaf Miner.",
        "planting_tips": "Plant at 26x26 feet spacing, provide shade to young palms, and keep weeds away during the first two years.",
    },
    {
        "crop_name_sinhala": "තේ",
        "crop_name_english": "Tea",
        "suitable_districts": "Nuwara Eliya, Kandy, Badulla, Ratnapura, Galle",
        "soil_type": "Well-drained acidic soil (pH 4.5-5.5)",
        "season": "Year round",
        "fertilizer_rec": "TRI General Mixture 300-400kg per acre annually in split dressings, with extra nitrogen in the second wet season.",
        "pest_info": "Shot-hole Borer, Tea Tortrix, Blister Blight and Red Spider Mite.",
        "planting_tips": "Plant along contour lines on hill slopes, maintain good shade and prune every 3-4 years for vigour.",
    },
    {
        "crop_name_sinhala": "මිරිස්",
        "crop_name_english": "Chili",
        "suitable_districts": "Anuradhapura, Vavuniya, Puttalam, Kurunegala",
        "soil_type": "Well-drained sandy loam",
        "season": "Maha preferred",
        "fertilizer_rec": "Basal: 100-150kg NPK 15:15:15 per hectare. Top dressing Urea 50kg/ha at 2 and 5 weeks after planting.",
        "pest_info": "Thrips, Spider Mites, Aphids and Anthracnose.",
        "planting_tips": "Use raised beds with good drainage, avoid waterlogging, and maintain regular staking and pruning.",
    },
    {
        "crop_name_sinhala": "තක්කාලි",
        "crop_name_english": "Tomato",
        "suitable_districts": "Badulla, Kandy, Matale, Nuwara Eliya",
        "soil_type": "Well-drained rich loam with high organic matter",
        "season": "Yala and Maha",
        "fertilizer_rec": "Basal: Compost 10-15t/ha + TSP 150kg/ha + MOP 100kg/ha. Top dress Urea 100-120kg/ha in split applications.",
        "pest_info": "Whitefly, Fruit Borer, Aphids and Late Blight.",
        "planting_tips": "Use staking or trellising to support plants, remove lower leaves, and space plants to improve air circulation.",
    },
    {
        "crop_name_sinhala": "අර්තාපල්",
        "crop_name_english": "Potato",
        "suitable_districts": "Nuwara Eliya, Badulla (Welimada)",
        "soil_type": "Loose, well-drained acidic sandy loam",
        "season": "Maha preferred (November to February)",
        "fertilizer_rec": "Basal: Potato Mixture (APM) 1500kg/ha + 100kg Urea/ha. Apply Urea 100kg/ha at 4 weeks.",
        "pest_info": "Potato Tuber Moth, Late Blight and Aphids.",
        "planting_tips": "Use certified seed tubers, form ridges, and maintain uniform soil moisture without waterlogging.",
    },
    {
        "crop_name_sinhala": "කැරට්",
        "crop_name_english": "Carrot",
        "suitable_districts": "Nuwara Eliya, Badulla (Welimada, Bandarawela)",
        "soil_type": "Deep, loose, well-drained sandy loam without stones",
        "season": "Maha preferred",
        "fertilizer_rec": "Basal: 200kg NPK 15:15:15 per hectare. Top dress MOP 100kg/ha at 4 weeks after sowing.",
        "pest_info": "Root-knot Nematodes, Leaf Blight and Carrot Rust Fly.",
        "planting_tips": "Prepare a fine seedbed, sow seeds thinly, and maintain consistent moisture for even root development.",
    },
    {
        "crop_name_sinhala": "කුරුඳු",
        "crop_name_english": "Cinnamon",
        "suitable_districts": "Galle, Matara, Hambantota, Kalutara",
        "soil_type": "Sandy or light loam soils",
        "season": "Year round",
        "fertilizer_rec": "Cinnamon Mixture 500kg/ha annually in two splits plus 10t/ha organic manure.",
        "pest_info": "Cinnamon Gall Mite, Rough Bark Disease and Stem Borer.",
        "planting_tips": "Plant in pits with good drainage, maintain weed control, and follow correct harvesting and peeling methods.",
    },
    {
        "crop_name_sinhala": "ලොකු ළූණු",
        "crop_name_english": "Big Onion",
        "suitable_districts": "Matale (Dambulla), Anuradhapura, Polonnaruwa",
        "soil_type": "Clay loam or sandy loam with good drainage",
        "season": "Yala preferred",
        "fertilizer_rec": "Basal: TSP 150-200kg/ha + MOP 100kg/ha. Top dress Urea 150kg/ha in two splits.",
        "pest_info": "Thrips, Purple Blotch and Onion Smut.",
        "planting_tips": "Use raised beds, transplant healthy seedlings, and reduce irrigation 10-14 days before harvest.",
    },
    {
        "crop_name_sinhala": "ගම්මිරිස්",
        "crop_name_english": "Pepper",
        "suitable_districts": "Matale, Kandy, Kegalle, Kurunegala",
        "soil_type": "Well-drained clay loam with high organic matter",
        "season": "Year round",
        "fertilizer_rec": "NPK 14:14:14 1kg per vine annually plus 10kg compost per vine.",
        "pest_info": "Quick Wilt, Root-knot Nematode and Mealy Bugs.",
        "planting_tips": "Train vines on live supports, prune regularly, and keep the base shaded and moist.",
    },
]


def seed_doa_if_empty(db: Session) -> None:
    try:
        for row in DOA_ROWS:
            existing = (
                db.query(DOAKnowledgeBase)
                .filter(DOAKnowledgeBase.crop_name_english == row["crop_name_english"])
                .one_or_none()
            )
            if existing:
                for key, value in row.items():
                    setattr(existing, key, value)
            else:
                db.add(DOAKnowledgeBase(**row))
        db.commit()
    except Exception:
        db.rollback()
        raise
