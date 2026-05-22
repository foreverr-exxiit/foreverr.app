-- ============================================================
-- FOREVERR: All Remaining Migrations (00013-00034)
-- Consolidated into a single file for one-click deployment
-- Run this in Supabase SQL Editor
-- ============================================================

-- CLEANUP: Remove partial data from previous failed Step 4 attempt
DELETE FROM memorial_hosts WHERE memorial_id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005'
);
DELETE FROM memorials WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005'
);
DELETE FROM profiles WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000013'
);


-- ============================================================
-- 00013_seed_sample_content.sql
-- ============================================================
-- ============================================================================
-- Phase 4B: Seed Sample Content for Content-First UX
-- Populates the app with realistic, emotionally compelling sample data
-- so the app feels alive from first launch for guest users.
-- ============================================================================

-- Create a system user for sample content
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system@eterrn.app',
  '{"username": "eterrn_team", "display_name": "ǝterrn Team"}',
  NOW(), NOW(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create 5 sample contributor profiles
INSERT INTO profiles (id, username, display_name, bio, ribbon_balance, is_verified) VALUES
  ('00000000-0000-0000-0000-000000000001', 'foreverr_team', 'Foreverr Team', 'The official Foreverr team account', 1000, true),
  ('00000000-0000-0000-0000-000000000010', 'sarah_t', 'Sarah Thompson', 'Remembering those we love, one tribute at a time', 150, false),
  ('00000000-0000-0000-0000-000000000011', 'mike_r', 'Michael Rivera', 'Proud son, keeping memories alive', 200, false),
  ('00000000-0000-0000-0000-000000000012', 'priya_o', 'Priya Okafor', 'Community builder. Every life deserves to be remembered.', 175, false),
  ('00000000-0000-0000-0000-000000000013', 'jenny_c', 'Jennifer Chen', 'Music teacher. Jimmy''s mom. Forever grateful.', 250, false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 5 Sample Memorials
-- ============================================================================

INSERT INTO memorials (
  id, created_by, first_name, last_name, date_of_birth, date_of_death,
  biography, obituary, privacy, slug,
  follower_count, tribute_count
) VALUES
-- 1. Eleanor Grace Thompson — Beloved grandmother, teacher
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Eleanor', 'Thompson',
  '1938-03-15', '2023-11-22',
  'Eleanor Grace Thompson was a beacon of warmth and wisdom for everyone who knew her. Born in a small town in Vermont, she grew up with a love for learning that she carried throughout her 85 years. She spent 40 years as an elementary school teacher, touching thousands of young lives with her gentle patience and infectious enthusiasm for reading. Her kitchen was always filled with the aroma of fresh-baked cookies, and her garden was the pride of the neighborhood. Eleanor believed that every child could shine if given enough love, and she lived that belief every single day.',
  'Eleanor Grace Thompson, 85, passed peacefully surrounded by family on November 22, 2023. A devoted wife, mother of three, grandmother of seven, and beloved teacher, Eleanor spent her life nurturing others. She is survived by her children Robert, Margaret, and Susan, and her seven grandchildren who were the light of her life.',
  'public', 'eleanor-thompson',
  47, 12
),
-- 2. Marcus James Rivera — Young father, firefighter
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Marcus', 'Rivera',
  '1985-07-04', '2024-02-14',
  'Marcus James Rivera was a hero in every sense of the word. As a firefighter for 12 years in Station 7, he ran toward danger so others could run to safety. But to his family, Marcus was so much more — he was the dad who never missed a soccer game, the husband who left love notes in lunchboxes, and the friend who would drop everything to help. His laugh could fill an entire room, and his bear hugs made everyone feel safe. Marcus lived by a simple creed: show up, be brave, love hard.',
  'Marcus James Rivera, 38, made the ultimate sacrifice on February 14, 2024, responding to a four-alarm fire in downtown. A decorated firefighter, devoted father to Sofia (8) and Diego (5), and beloved husband to Maria. His courage saved three families that night. He is remembered as a true hero by all who knew him.',
  'public', 'marcus-rivera',
  89, 24
),
-- 3. Dr. Amara Okafor — Community leader, physician
(
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Amara', 'Okafor',
  '1950-12-01', '2022-08-19',
  'Dr. Amara Okafor dedicated her life to healing — not just bodies, but communities. Born in Lagos, Nigeria, she immigrated to the United States at 22 with a dream and $200. She put herself through medical school, became one of the first Black female physicians at City General Hospital, and went on to open a free clinic that served over 10,000 patients in its first decade. Beyond medicine, Amara mentored dozens of young women pursuing careers in science, organized community health fairs, and quietly paid for three students'' college educations. She often said, "When you heal one person, you heal a family. When you heal a family, you heal a community."',
  'Dr. Amara Okafor, 71, beloved physician, community pillar, and mentor, passed away August 19, 2022. Born in Lagos, Nigeria, she built a legacy of healing and service in her adopted home. Survived by her husband David, children Nkechi, Emeka, and Chidera, and a community that will forever carry her mission forward.',
  'public', 'amara-okafor',
  63, 18
),
-- 4. James "Jimmy" Chen — Teenager, musician
(
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'James', 'Chen',
  '2005-09-20', '2023-06-03',
  'James "Jimmy" Chen had a gift for making music that could make you feel things you didn''t have words for. At just 17, he could play guitar, piano, drums, and was teaching himself violin. His YouTube covers had thousands of views, but what he loved most was playing acoustic sets at the local coffee shop where old regulars would request their favorites. Jimmy dreamed of scoring films one day — he said music was the invisible thread that connected all stories. He was kind beyond his years, always the first to stand up for classmates being bullied, and the one who could make anyone laugh on their worst day.',
  'James "Jimmy" Chen, 17, of Millbrook, passed away June 3, 2023. A gifted musician, straight-A student, and gentle soul, Jimmy touched countless lives with his music and kindness. Survived by his parents Lin and David Chen, his sister Lily, and the entire Millbrook High School community that loved him dearly.',
  'public', 'jimmy-chen',
  112, 31
),
-- 5. Rose Marie Williams — Matriarch, WWII era
(
  '10000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'Rose', 'Williams',
  '1932-05-08', '2024-01-15',
  'Rose Marie Williams lived through history and made plenty of her own. Born during the Great Depression, she learned early that tough times required tougher people — and she was the toughest. She worked in a factory during WWII while barely a teenager, married her sweetheart Harold when he returned from Europe in 1946, and together they built a family of five children, twelve grandchildren, and eight great-grandchildren. Rose''s Sunday dinners were legendary — she could feed thirty people from a kitchen the size of a closet. She knitted blankets for every baby born into the family, told stories that could make you cry and laugh in the same breath, and never let anyone leave her house without a full stomach and a warmer heart.',
  'Rose Marie Williams, 91, matriarch of the Williams family, passed peacefully on January 15, 2024. Rose lived a life full of love, resilience, and laughter. Predeceased by her beloved husband Harold (1998). Survived by her five children, twelve grandchildren, and eight great-grandchildren. Her legacy of strength and love endures in all who knew her.',
  'public', 'rose-williams',
  55, 15
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- Memorial Hosts
-- ============================================================================

INSERT INTO memorial_hosts (memorial_id, user_id, role, relationship) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner', 'immediate_family'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'owner', 'immediate_family'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'owner', 'immediate_family'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'owner', 'immediate_family'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'owner', 'immediate_family')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Sample Tributes (20+ across all memorials)
-- ============================================================================

INSERT INTO tributes (id, memorial_id, author_id, type, content, ribbon_type, ribbon_count, like_count, comment_count, created_at) VALUES

-- Eleanor Thompson tributes
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'text',
 'Grandma Eleanor, you taught me that every day is a chance to be kind. I still use the recipe you gave me for your famous chocolate chip cookies, and every time the kitchen fills with that smell, I feel you right here with me. I miss our Sunday phone calls more than words can say.',
 'gold', 3, 8, 2, NOW() - INTERVAL '30 days'),

('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'text',
 'Mrs. Thompson was my third-grade teacher and she changed my life. I was struggling with reading and she stayed after school with me every day for three months until I could read chapter books. Because of her patience, I eventually became a teacher myself. Thank you, Mrs. Thompson, for believing in me.',
 'silver', 1, 12, 3, NOW() - INTERVAL '25 days'),

('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 'text',
 'Eleanor was my neighbor for 30 years. She always brought soup when someone was sick and flowers when someone was celebrating. The neighborhood feels emptier without her smile at the garden fence.',
 'purple', 2, 6, 1, NOW() - INTERVAL '20 days'),

-- Marcus Rivera tributes
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011', 'text',
 'My brother, my best friend, my hero. You ran into that building without a second thought because that is who you were. Sofia drew a picture of you in your gear yesterday and said "Daddy is keeping the angels safe now." I promise you, Maria and the kids will never want for anything. We will make you proud every single day.',
 'eternal', 5, 24, 8, NOW() - INTERVAL '15 days'),

('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'text',
 'Captain Rivera trained me when I was a rookie. He used to say "Fear is fine. Freezing is not." That stuck with me through every call. He didn''t just teach us how to fight fires — he taught us how to be brave. Rest easy, Captain.',
 'gold', 3, 15, 4, NOW() - INTERVAL '14 days'),

('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012', 'text',
 'Marcus coached my son''s soccer team. Every kid on that team felt like they mattered. He had this way of seeing the best in everyone. The whole community is mourning. You are a true hero, Marcus.',
 'silver', 1, 9, 2, NOW() - INTERVAL '10 days'),

('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000013', 'text',
 'I was one of the families Marcus saved that night. My children are alive because of his courage. There are no words big enough to express our gratitude. We light a candle for him every night.',
 'crystal', 4, 31, 6, NOW() - INTERVAL '8 days'),

-- Dr. Amara Okafor tributes
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', 'text',
 'Dr. Okafor delivered both of my children and treated my mother for years. She remembered every patient''s name, every child''s birthday. When we couldn''t afford medication, she quietly made it appear. She wasn''t just a doctor — she was family to this whole neighborhood.',
 'gold', 3, 11, 3, NOW() - INTERVAL '60 days'),

('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'text',
 'Mama Amara mentored me through medical school. She paid for my textbooks when I couldn''t afford them and never told a soul. I found out years later from her husband. I am the doctor I am today because she invested in me. Her clinic will continue serving our community — that is my promise.',
 'eternal', 5, 18, 5, NOW() - INTERVAL '55 days'),

('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', 'text',
 'Dr. Okafor spoke at our school about pursuing your dreams no matter what obstacles you face. Her story of immigrating with $200 and becoming a doctor inspired me to go to college. She proved that determination can change everything.',
 'silver', 1, 7, 1, NOW() - INTERVAL '50 days'),

-- Jimmy Chen tributes
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000013', 'text',
 'My beautiful boy. You came into this world singing and you left it too soon. Your music lives on in every note that plays in this house. Lily plays your guitar every day now — she says it helps her feel close to you. We play your recordings at dinner and pretend you are just in the other room. I love you beyond the stars, Jimmy. Save me a seat at your concert.',
 'eternal', 5, 42, 11, NOW() - INTERVAL '90 days'),

('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'text',
 'Jimmy was my best friend since kindergarten. He always had his earbuds in, humming something no one else could hear yet. I used to tease him about it but now I''d give anything to hear him hum one more time. We started a scholarship in his name at school for music students. Keep playing up there, bro.',
 'gold', 3, 19, 5, NOW() - INTERVAL '85 days'),

('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000011', 'text',
 'I own the coffee shop where Jimmy used to play. Every Friday night, he''d set up in the corner with his guitar and the whole place would go quiet. Regulars would come just to hear him. We still keep his spot open on Fridays. Sometimes when the evening light hits just right, I swear I can hear his music.',
 'purple', 2, 14, 3, NOW() - INTERVAL '80 days'),

('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012', 'text',
 'Jimmy stood up for me when I was being bullied in 9th grade. He didn''t even know me that well, he just saw something wrong and did something about it. That takes real courage at that age. He made high school bearable for so many of us.',
 'silver', 1, 10, 2, NOW() - INTERVAL '75 days'),

-- Rose Williams tributes
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', 'text',
 'Great-Grandma Rose, thank you for the blanket you knitted for my baby. She sleeps with it every night. You put love into every stitch and we feel it. I wish you could have met her — she has your eyes and your stubbornness. We named her middle name Rose.',
 'gold', 3, 13, 4, NOW() - INTERVAL '5 days'),

('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000011', 'text',
 'Mom, your Sunday dinners held this family together. Every argument was settled over your mashed potatoes, every celebration toasted with your lemonade. Now when we gather, we cook your recipes and tell your stories. The table feels bigger without you, but your love fills every empty chair.',
 'eternal', 5, 16, 6, NOW() - INTERVAL '3 days'),

('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000012', 'text',
 'Rose was the strongest woman I ever knew. She worked in a factory during the war at 12 years old, raised five kids, survived losing her husband, and still had a joke for every occasion. She once told me, "Life doesn''t get easier — you just get tougher." I think about that every single day.',
 'purple', 2, 9, 2, NOW() - INTERVAL '2 days'),

('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000013', 'text',
 'Grandma Rose taught me to knit when I was 7. I''m 35 now and I still use the same stitches she taught me. Every time I start a new project, I can hear her voice saying "slow and steady, dear." She had endless patience and even more love.',
 'silver', 1, 7, 1, NOW() - INTERVAL '1 day')

ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- Sample Reactions (50+ across tributes and memorials)
-- ============================================================================

INSERT INTO reactions (id, user_id, target_type, target_id, reaction_type, created_at)
SELECT
  gen_random_uuid(),
  user_id,
  'tribute',
  tribute_id,
  reaction_type,
  NOW() - (random() * INTERVAL '30 days')
FROM (VALUES
  -- Candles
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', 'candle'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', 'candle'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000004', 'candle'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000004', 'candle'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000004', 'candle'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000007', 'candle'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000011', 'candle'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000011', 'candle'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000011', 'candle'),
  -- Hearts
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000005', 'heart'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000005', 'heart'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000005', 'heart'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000008', 'heart'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000008', 'heart'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000011', 'heart'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000016', 'heart'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000016', 'heart'),
  -- Flowers
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', 'flower'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002', 'flower'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000003', 'flower'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000003', 'flower'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000015', 'flower'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000015', 'flower'),
  -- Prayers
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000006', 'prayer'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000006', 'prayer'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000006', 'prayer'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000009', 'prayer'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000009', 'prayer'),
  -- Doves
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000012', 'dove'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000012', 'dove'),
  ('00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000017', 'dove'),
  ('00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000017', 'dove'),
  ('00000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000013', 'dove'),
  ('00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000013', 'dove')
) AS t(user_id, tribute_id, reaction_type)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Sample Followers (so memorials show follower counts)
-- ============================================================================

INSERT INTO followers (memorial_id, user_id) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000013'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000013'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000011')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Sample Events
-- ============================================================================

INSERT INTO events (id, memorial_id, created_by, title, description, type, start_date, location) VALUES
(
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Eleanor''s 1st Anniversary Remembrance',
  'Join us as we gather to celebrate Eleanor''s life and legacy. We''ll share stories, look at photos, and enjoy her famous recipes together. All are welcome.',
  'anniversary',
  '2024-11-22 14:00:00+00',
  'Community Garden, 45 Maple Street, Burlington, VT'
),
(
  '30000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Candle Lighting for Marcus',
  'Station 7 is hosting a community candle lighting ceremony in honor of Captain Marcus Rivera. We invite all who knew him to come share a memory and light a candle for our fallen hero.',
  'candle_lighting',
  '2025-02-14 18:00:00+00',
  'Fire Station 7, 200 Main Street'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- Sample Memory Prompts
-- ============================================================================

INSERT INTO memory_prompts (id, memorial_id, prompt_text, prompt_type, response_count) VALUES
(
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'What is your favorite memory of Eleanor?',
  'remember_when', 3
),
(
  '40000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000004',
  'What song reminds you most of Jimmy?',
  'custom', 2
),
(
  '40000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000005',
  'What was your favorite dish from Rose''s Sunday dinners?',
  'custom', 4
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- Sample Time Capsule (locked, opens in 2027)
-- ============================================================================

INSERT INTO time_capsules (id, memorial_id, created_by, title, content, unlock_date, is_unlocked) VALUES
(
  '50000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000013',
  'Letters to Jimmy - To Open on His 22nd Birthday',
  'A collection of letters, voice notes, and photos from friends and family, written for Jimmy on what would have been his 22nd birthday.',
  '2027-09-20',
  false
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 00014_celebrity_content.sql
-- ============================================================
-- 00014_celebrity_content.sql
-- Celebrity memorials & news items for auto-updating content (Today in History, obituaries, news feed)

-- ============================================================
-- Table: celebrity_memorials
-- Famous people for "Today in History", recent deaths, featured content
-- ============================================================
CREATE TABLE IF NOT EXISTS celebrity_memorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  date_of_death DATE,
  age_at_death INT,
  cause_of_death TEXT,
  nationality TEXT,
  occupation TEXT,
  biography_summary TEXT,
  photo_url TEXT,
  source_url TEXT,
  source TEXT, -- 'wikipedia', 'manual', 'api'
  category TEXT NOT NULL DEFAULT 'historical', -- 'recent_death', 'anniversary', 'historical', 'featured'
  death_month INT, -- 1-12, for "On This Day" queries
  death_day INT, -- 1-31, for "On This Day" queries
  memorial_id UUID REFERENCES memorials(id) ON DELETE SET NULL, -- optional link to user-created memorial
  view_count INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookup
CREATE INDEX idx_celebrity_death_month_day ON celebrity_memorials(death_month, death_day) WHERE is_active = true;
CREATE INDEX idx_celebrity_category ON celebrity_memorials(category) WHERE is_active = true;
CREATE INDEX idx_celebrity_featured ON celebrity_memorials(is_featured) WHERE is_active = true AND is_featured = true;
CREATE INDEX idx_celebrity_created_at ON celebrity_memorials(created_at DESC) WHERE is_active = true;

-- ============================================================
-- Table: news_items
-- General news feed content (obituaries, platform updates, memorial news)
-- ============================================================
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image_url TEXT,
  source_url TEXT,
  source_name TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- 'obituary', 'anniversary', 'memorial_news', 'platform_update', 'general'
  celebrity_memorial_id UUID REFERENCES celebrity_memorials(id) ON DELETE SET NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_category ON news_items(category) WHERE is_active = true;
CREATE INDEX idx_news_published ON news_items(published_at DESC) WHERE is_active = true;
CREATE INDEX idx_news_featured ON news_items(is_featured) WHERE is_active = true AND is_featured = true;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE celebrity_memorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- Everyone (including anon/guest) can read active entries
CREATE POLICY "celebrity_memorials_public_read" ON celebrity_memorials
  FOR SELECT USING (is_active = true);

CREATE POLICY "news_items_public_read" ON news_items
  FOR SELECT USING (is_active = true);

-- Only service_role can insert/update (via edge functions or admin)
-- (no INSERT/UPDATE policies for anon/authenticated — managed by service_role)

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE TRIGGER update_celebrity_memorials_updated_at
  BEFORE UPDATE ON celebrity_memorials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_items_updated_at
  BEFORE UPDATE ON news_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Seed Data: 30+ historical figures across all 12 months
-- ============================================================

INSERT INTO celebrity_memorials (full_name, first_name, last_name, date_of_birth, date_of_death, age_at_death, nationality, occupation, biography_summary, category, death_month, death_day, source) VALUES

-- January
('Martin Luther King Jr.', 'Martin Luther', 'King Jr.', '1929-01-15', '1968-04-04', 39, 'American', 'Civil Rights Leader', 'Baptist minister and activist who became the most visible spokesperson and leader in the American civil rights movement.', 'historical', 4, 4, 'manual'),
('David Bowie', 'David', 'Bowie', '1947-01-08', '2016-01-10', 69, 'British', 'Musician & Actor', 'English singer-songwriter and actor who was a leading figure in the music industry.', 'historical', 1, 10, 'manual'),

-- February
('Kobe Bryant', 'Kobe', 'Bryant', '1978-08-23', '2020-01-26', 41, 'American', 'Basketball Player', 'American professional basketball player who spent his entire 20-year career with the Los Angeles Lakers.', 'historical', 1, 26, 'manual'),

-- March
('Stephen Hawking', 'Stephen', 'Hawking', '1942-01-08', '2018-03-14', 76, 'British', 'Physicist', 'English theoretical physicist, cosmologist, and author who was director of research at the Centre for Theoretical Cosmology.', 'historical', 3, 14, 'manual'),

-- April
('Prince', 'Prince', 'Rogers Nelson', '1958-06-07', '2016-04-21', 57, 'American', 'Musician', 'American singer, songwriter, musician, record producer, and filmmaker known for his eclectic and flamboyant style.', 'historical', 4, 21, 'manual'),

-- May
('Maya Angelou', 'Maya', 'Angelou', '1928-04-04', '2014-05-28', 86, 'American', 'Poet & Author', 'American poet, memoirist, and civil rights activist. Known for her series of seven autobiographies.', 'historical', 5, 28, 'manual'),

-- June
('Muhammad Ali', 'Muhammad', 'Ali', '1942-01-17', '2016-06-03', 74, 'American', 'Boxer', 'American professional boxer, activist, and philanthropist, widely regarded as one of the most significant sports figures of the 20th century.', 'historical', 6, 3, 'manual'),
('Anthony Bourdain', 'Anthony', 'Bourdain', '1956-06-25', '2018-06-08', 61, 'American', 'Chef & Author', 'American celebrity chef, author, and travel documentarian who starred in programs focusing on the exploration of international culture.', 'historical', 6, 8, 'manual'),

-- July
('Chadwick Boseman', 'Chadwick', 'Boseman', '1976-11-29', '2020-08-28', 43, 'American', 'Actor', 'American actor known for his portrayal of Black Panther in the Marvel Cinematic Universe.', 'historical', 8, 28, 'manual'),

-- August
('Robin Williams', 'Robin', 'Williams', '1951-07-21', '2014-08-11', 63, 'American', 'Actor & Comedian', 'American actor and comedian known for his improvisational skills and the wide variety of characters he created.', 'historical', 8, 11, 'manual'),
('Aretha Franklin', 'Aretha', 'Franklin', '1942-03-25', '2018-08-16', 76, 'American', 'Singer', 'American singer, songwriter, and pianist referred to as the "Queen of Soul."', 'historical', 8, 16, 'manual'),

-- September
('Queen Elizabeth II', 'Queen', 'Elizabeth II', '1926-04-21', '2022-09-08', 96, 'British', 'Monarch', 'Queen of the United Kingdom and other Commonwealth realms from 1952 until her death in 2022.', 'historical', 9, 8, 'manual'),

-- October
('Steve Jobs', 'Steve', 'Jobs', '1955-02-24', '2011-10-05', 56, 'American', 'Tech Visionary', 'American business magnate, inventor, and investor, co-founder of Apple Inc.', 'historical', 10, 5, 'manual'),

-- November
('Stan Lee', 'Stan', 'Lee', '1922-12-28', '2018-11-12', 95, 'American', 'Comic Book Creator', 'American comic book writer, editor, publisher, and producer who co-created Spider-Man, X-Men, and many other iconic characters.', 'historical', 11, 12, 'manual'),

-- December
('John Lennon', 'John', 'Lennon', '1940-10-09', '1980-12-08', 40, 'British', 'Musician', 'English singer, songwriter, musician, and peace activist who co-founded the Beatles.', 'historical', 12, 8, 'manual'),

-- More historical figures to ensure coverage
('Nelson Mandela', 'Nelson', 'Mandela', '1918-07-18', '2013-12-05', 95, 'South African', 'President & Activist', 'South African anti-apartheid revolutionary, political leader, and philanthropist who served as President of South Africa.', 'historical', 12, 5, 'manual'),
('Princess Diana', 'Princess', 'Diana', '1961-07-01', '1997-08-31', 36, 'British', 'Princess of Wales', 'Member of the British royal family, first wife of Charles, Prince of Wales.', 'historical', 8, 31, 'manual'),
('Albert Einstein', 'Albert', 'Einstein', '1879-03-14', '1955-04-18', 76, 'German-American', 'Physicist', 'German-born theoretical physicist who developed the theory of relativity.', 'historical', 4, 18, 'manual'),
('Whitney Houston', 'Whitney', 'Houston', '1963-08-09', '2012-02-11', 48, 'American', 'Singer & Actress', 'American singer and actress, known as "The Voice," one of the best-selling music artists of all time.', 'historical', 2, 11, 'manual'),
('Bob Marley', 'Bob', 'Marley', '1945-02-06', '1981-05-11', 36, 'Jamaican', 'Musician', 'Jamaican singer, songwriter, and musician, considered one of the pioneers of reggae.', 'historical', 5, 11, 'manual'),
('Mother Teresa', 'Mother', 'Teresa', '1910-08-26', '1997-09-05', 87, 'Albanian-Indian', 'Humanitarian', 'Roman Catholic nun and missionary, founded the Missionaries of Charity.', 'historical', 9, 5, 'manual'),
('Tupac Shakur', 'Tupac', 'Shakur', '1971-06-16', '1996-09-13', 25, 'American', 'Rapper & Actor', 'American rapper, songwriter, and actor considered one of the most influential rappers of all time.', 'historical', 9, 13, 'manual'),
('Freddie Mercury', 'Freddie', 'Mercury', '1946-09-05', '1991-11-24', 45, 'British', 'Musician', 'British singer, songwriter, record producer, and lead vocalist of the rock band Queen.', 'historical', 11, 24, 'manual'),
('Nipsey Hussle', 'Nipsey', 'Hussle', '1985-08-15', '2019-03-31', 33, 'American', 'Rapper & Activist', 'American rapper, songwriter, and entrepreneur known for his community activism in South Los Angeles.', 'historical', 3, 31, 'manual'),
('Ruth Bader Ginsburg', 'Ruth Bader', 'Ginsburg', '1933-03-15', '2020-09-18', 87, 'American', 'Supreme Court Justice', 'American jurist who served as an associate justice of the Supreme Court from 1993 until her death.', 'historical', 9, 18, 'manual'),
('Mac Miller', 'Mac', 'Miller', '1992-01-19', '2018-09-07', 26, 'American', 'Rapper & Producer', 'American rapper, singer, songwriter, and record producer known for his introspective lyrics.', 'historical', 9, 7, 'manual'),
('Virgil Abloh', 'Virgil', 'Abloh', '1980-09-30', '2021-11-28', 41, 'American', 'Fashion Designer', 'American fashion designer, entrepreneur, and DJ who served as the artistic director of Louis Vuitton men''s wear.', 'historical', 11, 28, 'manual'),
('Alex Trebek', 'Alex', 'Trebek', '1940-07-22', '2020-11-08', 80, 'Canadian-American', 'TV Host', 'Canadian-American television personality who hosted the game show Jeopardy! for 37 years.', 'historical', 11, 8, 'manual'),
('Betty White', 'Betty', 'White', '1922-01-17', '2021-12-31', 99, 'American', 'Actress & Comedian', 'American actress, comedian, and television personality with a career spanning over 80 years.', 'historical', 12, 31, 'manual'),
('Paul Walker', 'Paul', 'Walker', '1973-09-12', '2013-11-30', 40, 'American', 'Actor', 'American actor best known for his role as Brian O''Conner in The Fast and the Furious franchise.', 'historical', 11, 30, 'manual'),
('Juice WRLD', 'Juice', 'WRLD', '1998-12-02', '2019-12-08', 21, 'American', 'Rapper & Singer', 'American rapper, singer, and songwriter known for his emotional and introspective music.', 'historical', 12, 8, 'manual'),
('Pop Smoke', 'Pop', 'Smoke', '1999-07-20', '2020-02-19', 20, 'American', 'Rapper', 'American rapper, singer, and songwriter who was a leading figure in the Brooklyn drill music scene.', 'historical', 2, 19, 'manual'),
('XXXTentacion', 'XXXTentacion', '', '1998-01-23', '2018-06-18', 20, 'American', 'Rapper & Singer', 'American rapper, singer, and songwriter known for his versatile musical style.', 'historical', 6, 18, 'manual'),
('Avicii', 'Avicii', '', '1989-09-08', '2018-04-20', 28, 'Swedish', 'DJ & Producer', 'Swedish DJ, remixer, record producer, musician, and songwriter, one of the most famous electronic music artists.', 'historical', 4, 20, 'manual'),
('Carrie Fisher', 'Carrie', 'Fisher', '1956-10-21', '2016-12-27', 60, 'American', 'Actress & Writer', 'American actress, writer, and comedian, best known for playing Princess Leia in the Star Wars films.', 'historical', 12, 27, 'manual');


-- ============================================================
-- Seed Data: News items
-- ============================================================
INSERT INTO news_items (title, summary, category, is_featured, published_at, source_name) VALUES
('Welcome to Foreverr', 'The Foreverr community is dedicated to honoring and celebrating the lives of those who have passed. Create memorials, share tributes, and keep memories alive.', 'platform_update', true, now(), 'Foreverr'),
('How to Create a Meaningful Memorial', 'Tips for building a lasting tribute: include personal stories, favorite photos, and invite others to contribute their memories.', 'platform_update', false, now() - interval '1 day', 'Foreverr'),
('The Power of Shared Remembrance', 'Studies show that communal remembrance helps with the grieving process. Connecting with others who share memories can provide comfort and healing.', 'memorial_news', true, now() - interval '2 days', 'Foreverr'),
('New Feature: Light a Virtual Candle', 'Express your remembrance by lighting a virtual candle on any memorial. The animated candle represents your love and respect.', 'platform_update', false, now() - interval '3 days', 'Foreverr'),
('Community Spotlight: Most Tributed Memorials This Month', 'See which memorials received the most tributes and engagement from the Foreverr community this month.', 'memorial_news', false, now() - interval '5 days', 'Foreverr');


-- ============================================================
-- 00015_vault_enhancements.sql
-- ============================================================
-- Migration 00015: Vault Enhancements
-- Adds: vault_folders, vault_item_tags, vault_item_folders, scrapbook_elements, prompt_categories
-- Alters: memory_vault_items (+ folder_id), memory_prompts (+ category_id, is_ai_suggested)

-- ============================================================
-- Vault Folders (collection/folder organization for vault items)
-- ============================================================
CREATE TABLE IF NOT EXISTS vault_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#7C3AED',
  parent_folder_id UUID REFERENCES vault_folders(id) ON DELETE SET NULL,
  item_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_folders_memorial ON vault_folders(memorial_id);
CREATE INDEX IF NOT EXISTS idx_vault_folders_created_by ON vault_folders(created_by);

ALTER TABLE vault_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vault folders"
  ON vault_folders FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create vault folders"
  ON vault_folders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their vault folders"
  ON vault_folders FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their vault folders"
  ON vault_folders FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================
-- Vault Item Tags (many-to-many tagging)
-- ============================================================
CREATE TABLE IF NOT EXISTS vault_item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES memory_vault_items(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_vault_item_tags_memorial ON vault_item_tags(memorial_id);
CREATE INDEX IF NOT EXISTS idx_vault_item_tags_item ON vault_item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_vault_item_tags_tag ON vault_item_tags(tag);

ALTER TABLE vault_item_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vault item tags"
  ON vault_item_tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can tag items"
  ON vault_item_tags FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can untag items"
  ON vault_item_tags FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- Vault Item Folder Assignment
-- ============================================================
CREATE TABLE IF NOT EXISTS vault_item_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES memory_vault_items(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES vault_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_id, folder_id)
);

CREATE INDEX IF NOT EXISTS idx_vault_item_folders_item ON vault_item_folders(item_id);
CREATE INDEX IF NOT EXISTS idx_vault_item_folders_folder ON vault_item_folders(folder_id);

ALTER TABLE vault_item_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vault item folders"
  ON vault_item_folders FOR SELECT USING (true);

CREATE POLICY "Authenticated users can assign items to folders"
  ON vault_item_folders FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can remove items from folders"
  ON vault_item_folders FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- Scrapbook Elements (individual elements on a page)
-- ============================================================
CREATE TABLE IF NOT EXISTS scrapbook_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES scrapbook_pages(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL CHECK (element_type IN ('photo', 'text', 'sticker', 'shape', 'divider')),
  content TEXT,
  media_url TEXT,
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  width DOUBLE PRECISION DEFAULT 200,
  height DOUBLE PRECISION DEFAULT 200,
  rotation DOUBLE PRECISION DEFAULT 0,
  z_index INTEGER DEFAULT 0,
  style_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scrapbook_elements_page ON scrapbook_elements(page_id);

ALTER TABLE scrapbook_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scrapbook elements"
  ON scrapbook_elements FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create scrapbook elements"
  ON scrapbook_elements FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update scrapbook elements"
  ON scrapbook_elements FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete scrapbook elements"
  ON scrapbook_elements FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- Prompt Categories (pre-defined prompt groups)
-- ============================================================
CREATE TABLE IF NOT EXISTS prompt_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'bulb',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prompt categories"
  ON prompt_categories FOR SELECT USING (true);

-- Seed prompt categories
INSERT INTO prompt_categories (name, slug, description, icon, sort_order) VALUES
  ('Childhood', 'childhood', 'Memories from growing up', 'happy', 1),
  ('Career', 'career', 'Professional life and achievements', 'briefcase', 2),
  ('Relationships', 'relationships', 'Family, friends, and loved ones', 'heart', 3),
  ('Favorites', 'favorites', 'Favorite things and preferences', 'star', 4),
  ('Milestones', 'milestones', 'Key life events and achievements', 'trophy', 5),
  ('Traditions', 'traditions', 'Family and cultural traditions', 'gift', 6),
  ('Personality', 'personality', 'Character traits and quirks', 'sparkles', 7),
  ('Travel', 'travel', 'Places visited and adventures', 'airplane', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ALTER existing tables
-- ============================================================

-- Add folder_id to memory_vault_items
ALTER TABLE memory_vault_items ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES vault_folders(id) ON DELETE SET NULL;

-- Add category_id and is_ai_suggested to memory_prompts
ALTER TABLE memory_prompts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES prompt_categories(id) ON DELETE SET NULL;
ALTER TABLE memory_prompts ADD COLUMN IF NOT EXISTS is_ai_suggested BOOLEAN DEFAULT false;

-- ============================================================
-- Trigger: Auto-update vault_folders.item_count
-- ============================================================
CREATE OR REPLACE FUNCTION update_vault_folder_item_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE vault_folders SET item_count = item_count + 1 WHERE id = NEW.folder_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE vault_folders SET item_count = item_count - 1 WHERE id = OLD.folder_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_vault_folder_item_count
  AFTER INSERT OR DELETE ON vault_item_folders
  FOR EACH ROW EXECUTE FUNCTION update_vault_folder_item_count();

-- ============================================================
-- Trigger: Auto-update updated_at timestamps
-- ============================================================
CREATE TRIGGER set_vault_folders_updated_at
  BEFORE UPDATE ON vault_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_scrapbook_elements_updated_at
  BEFORE UPDATE ON scrapbook_elements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 00016_advanced_social.sql
-- ============================================================
-- ============================================================
-- 00016_advanced_social.sql
-- Advanced Social Features: Follows, Activity Feed, Badges, Mentions
-- ============================================================

-- ============================================================
-- 1. User Follows
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);

-- ============================================================
-- 2. User Activities (Activity Feed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN (
    'tribute_posted', 'memorial_followed', 'candle_lit', 'comment_posted',
    'reaction_given', 'streak_achieved', 'badge_earned', 'vault_item_added',
    'capsule_created', 'photo_uploaded', 'event_created', 'donation_made',
    'nft_minted', 'live_room_created', 'scrapbook_published', 'user_followed'
  )),
  target_type text, -- 'memorial', 'tribute', 'user', 'event', etc.
  target_id uuid,
  metadata jsonb DEFAULT '{}',
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_activities_user ON public.user_activities(user_id, created_at DESC);
CREATE INDEX idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX idx_user_activities_public ON public.user_activities(is_public, created_at DESC);

-- ============================================================
-- 3. Badge Definitions (Catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_type text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'ribbon',
  category text NOT NULL CHECK (category IN (
    'contribution', 'engagement', 'streak', 'social', 'special'
  )),
  requirement_count integer NOT NULL DEFAULT 1,
  tier_thresholds jsonb DEFAULT '{"bronze": 1, "silver": 5, "gold": 25, "platinum": 100}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. User Badges (Earned)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type text NOT NULL REFERENCES public.badge_definitions(badge_type) ON DELETE CASCADE,
  badge_tier text NOT NULL DEFAULT 'bronze' CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  progress integer NOT NULL DEFAULT 0,
  is_displayed boolean NOT NULL DEFAULT true,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_displayed ON public.user_badges(user_id, is_displayed) WHERE is_displayed = true;

-- ============================================================
-- 5. Mentions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentioned_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentioned_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type text NOT NULL CHECK (context_type IN ('tribute', 'comment', 'chat')),
  context_id uuid NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mentions_user ON public.mentions(mentioned_user_id, created_at DESC);
CREATE INDEX idx_mentions_unread ON public.mentions(mentioned_user_id, is_read) WHERE is_read = false;

-- ============================================================
-- 6. ALTER profiles — add social count columns
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS follower_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge_count integer NOT NULL DEFAULT 0;

-- ============================================================
-- 7. Triggers — Auto-update follower/following counts
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_follow_count_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_follow_count ON public.user_follows;
CREATE TRIGGER trg_follow_count
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_count_change();

-- Auto-update badge count on profiles
CREATE OR REPLACE FUNCTION public.handle_badge_count_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET badge_count = badge_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET badge_count = GREATEST(badge_count - 1, 0) WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_badge_count ON public.user_badges;
CREATE TRIGGER trg_badge_count
  AFTER INSERT OR DELETE ON public.user_badges
  FOR EACH ROW EXECUTE FUNCTION public.handle_badge_count_change();

-- ============================================================
-- 8. RLS Policies
-- ============================================================

-- user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
  ON public.user_follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public activities visible to all"
  ON public.user_activities FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own activities"
  ON public.user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- badge_definitions
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badge definitions"
  ON public.badge_definitions FOR SELECT USING (true);

-- user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view earned badges"
  ON public.user_badges FOR SELECT USING (true);

CREATE POLICY "System can insert badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can toggle badge display"
  ON public.user_badges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- mentions
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their mentions"
  ON public.mentions FOR SELECT
  USING (auth.uid() = mentioned_user_id OR auth.uid() = mentioned_by);

CREATE POLICY "Users can create mentions"
  ON public.mentions FOR INSERT
  WITH CHECK (auth.uid() = mentioned_by);

CREATE POLICY "Users can mark mentions read"
  ON public.mentions FOR UPDATE
  USING (auth.uid() = mentioned_user_id)
  WITH CHECK (auth.uid() = mentioned_user_id);

-- ============================================================
-- 9. Seed Badge Definitions
-- ============================================================
INSERT INTO public.badge_definitions (badge_type, name, description, icon, category, requirement_count, tier_thresholds) VALUES
  ('first_tribute', 'First Tribute', 'Posted your first tribute to a memorial', 'heart', 'contribution', 1, '{"bronze": 1, "silver": 10, "gold": 50, "platinum": 200}'),
  ('candlelight', 'Candlelight', 'Lit candles in remembrance', 'flame', 'contribution', 1, '{"bronze": 1, "silver": 25, "gold": 100, "platinum": 500}'),
  ('devoted', 'Devoted', 'Visited memorials consistently', 'calendar', 'streak', 7, '{"bronze": 7, "silver": 30, "gold": 90, "platinum": 365}'),
  ('memory_keeper', 'Memory Keeper', 'Added items to the Memory Vault', 'archive', 'contribution', 1, '{"bronze": 1, "silver": 10, "gold": 50, "platinum": 200}'),
  ('community_builder', 'Community Builder', 'Followed other community members', 'people', 'social', 5, '{"bronze": 5, "silver": 25, "gold": 100, "platinum": 500}'),
  ('storyteller', 'Storyteller', 'Shared stories and memories', 'book', 'contribution', 1, '{"bronze": 1, "silver": 5, "gold": 25, "platinum": 100}'),
  ('generous_heart', 'Generous Heart', 'Made donations to memorial campaigns', 'gift', 'engagement', 1, '{"bronze": 1, "silver": 5, "gold": 20, "platinum": 50}'),
  ('event_planner', 'Event Planner', 'Created memorial events', 'calendar', 'engagement', 1, '{"bronze": 1, "silver": 5, "gold": 15, "platinum": 50}'),
  ('time_traveler', 'Time Traveler', 'Created time capsules', 'time', 'special', 1, '{"bronze": 1, "silver": 3, "gold": 10, "platinum": 25}'),
  ('digital_artist', 'Digital Artist', 'Published scrapbook pages', 'brush', 'special', 1, '{"bronze": 1, "silver": 5, "gold": 15, "platinum": 50}')
ON CONFLICT (badge_type) DO NOTHING;


-- ============================================================
-- 00017_sharing_deep_links.sql
-- ============================================================
-- ============================================================
-- Migration 00017: Social Sharing Infrastructure & Deep Links
-- Phase 5, Sprint 1: Make every piece of content shareable
-- ============================================================

-- ─── Share Cards (analytics for every share action) ─────────
CREATE TABLE IF NOT EXISTS public.share_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type     text NOT NULL CHECK (target_type IN ('memorial','tribute','event','profile','living_tribute','badge')),
  target_id       uuid NOT NULL,
  share_platform  text CHECK (share_platform IN ('instagram_story','facebook','twitter','whatsapp','sms','copy_link','native','other')),
  share_url       text NOT NULL,
  og_title        text,
  og_description  text,
  og_image_url    text,
  click_count     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_cards_target ON public.share_cards (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_share_cards_user ON public.share_cards (user_id);
CREATE INDEX IF NOT EXISTS idx_share_cards_created ON public.share_cards (created_at DESC);

-- RLS for share_cards
ALTER TABLE public.share_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Share cards are viewable by everyone"
  ON public.share_cards FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create share cards"
  ON public.share_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ─── Legacy Links (vanity URLs for user profiles) ──────────
CREATE TABLE IF NOT EXISTS public.legacy_links (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  slug            text NOT NULL UNIQUE,
  is_active       boolean NOT NULL DEFAULT true,
  click_count     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_legacy_links_slug ON public.legacy_links (slug);
CREATE INDEX IF NOT EXISTS idx_legacy_links_user ON public.legacy_links (user_id);

-- Slug validation: lowercase alphanumeric + hyphens, 3-30 chars
ALTER TABLE public.legacy_links
  ADD CONSTRAINT legacy_links_slug_format
  CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$');

-- RLS for legacy_links
ALTER TABLE public.legacy_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Legacy links are viewable by everyone"
  ON public.legacy_links FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own legacy link"
  ON public.legacy_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legacy link"
  ON public.legacy_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legacy link"
  ON public.legacy_links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── Add legacy_link_slug to profiles for quick lookups ─────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS legacy_link_slug text UNIQUE;

-- ─── Auto-update profiles.legacy_link_slug on legacy_links change ───
CREATE OR REPLACE FUNCTION public.sync_legacy_link_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.profiles SET legacy_link_slug = NEW.slug WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET legacy_link_slug = NULL WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_legacy_link_change
  AFTER INSERT OR UPDATE OR DELETE ON public.legacy_links
  FOR EACH ROW EXECUTE FUNCTION public.sync_legacy_link_slug();

-- ─── Auto-update updated_at on legacy_links ─────────────────
CREATE OR REPLACE FUNCTION public.update_legacy_link_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_legacy_link_update
  BEFORE UPDATE ON public.legacy_links
  FOR EACH ROW EXECUTE FUNCTION public.update_legacy_link_timestamp();


-- ============================================================
-- 00018_living_tributes.sql
-- ============================================================
-- ============================================================
-- Migration 00018: Living Tributes & Appreciation Letters
-- Phase 5, Sprint 2: Honor the Living
-- ============================================================

-- ============================================================
-- Table: living_tributes
-- Tribute pages for people who are ALIVE
-- ============================================================
CREATE TABLE IF NOT EXISTS living_tributes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  honoree_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  honoree_name    text NOT NULL,
  honoree_email   text,
  honoree_photo_url text,
  cover_photo_url text,
  title           text NOT NULL,
  description     text,
  occasion        text CHECK (occasion IN (
    'birthday', 'anniversary', 'retirement', 'graduation',
    'appreciation', 'get_well', 'wedding', 'achievement',
    'just_because', 'other'
  )),
  occasion_date   date,
  privacy         text DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'invited', 'honoree_only')),
  status          text DEFAULT 'active' CHECK (status IN ('active', 'converted_to_memorial', 'archived')),
  memorial_id     uuid REFERENCES memorials(id) ON DELETE SET NULL,
  slug            text NOT NULL UNIQUE,
  contributor_count integer DEFAULT 0,
  message_count   integer DEFAULT 0,
  view_count      integer DEFAULT 0,
  is_surprise     boolean DEFAULT false,
  reveal_at       timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_living_tribute_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 50);
  final_slug := base_slug;

  WHILE EXISTS(SELECT 1 FROM living_tributes WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_living_tribute_slug
  BEFORE INSERT ON living_tributes
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_living_tribute_slug();

-- ============================================================
-- Table: living_tribute_messages
-- Messages/contributions on living tributes
-- ============================================================
CREATE TABLE IF NOT EXISTS living_tribute_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id      uuid NOT NULL REFERENCES living_tributes(id) ON DELETE CASCADE,
  author_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         text,
  media_url       text,
  media_type      text CHECK (media_type IN ('photo', 'video', 'voice')),
  reaction_count  integer DEFAULT 0,
  is_anonymous    boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-increment contributor_count and message_count
CREATE OR REPLACE FUNCTION update_living_tribute_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE living_tributes
    SET message_count = message_count + 1,
        contributor_count = (
          SELECT COUNT(DISTINCT author_id)
          FROM living_tribute_messages
          WHERE tribute_id = NEW.tribute_id
        ),
        updated_at = now()
    WHERE id = NEW.tribute_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE living_tributes
    SET message_count = GREATEST(message_count - 1, 0),
        contributor_count = (
          SELECT COUNT(DISTINCT author_id)
          FROM living_tribute_messages
          WHERE tribute_id = OLD.tribute_id
        ),
        updated_at = now()
    WHERE id = OLD.tribute_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_living_tribute_message_counts
  AFTER INSERT OR DELETE ON living_tribute_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_living_tribute_counts();

-- ============================================================
-- Table: living_tribute_invites
-- Invite people to contribute to a living tribute
-- ============================================================
CREATE TABLE IF NOT EXISTS living_tribute_invites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id      uuid NOT NULL REFERENCES living_tributes(id) ON DELETE CASCADE,
  invited_by      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_email   text,
  invited_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  invite_code     text DEFAULT encode(gen_random_bytes(8), 'hex'),
  status          text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at      timestamptz DEFAULT now(),
  UNIQUE(tribute_id, invited_email)
);

-- ============================================================
-- Table: appreciation_letters
-- Letters of appreciation for living people
-- ============================================================
CREATE TABLE IF NOT EXISTS appreciation_letters (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_name    text NOT NULL,
  recipient_email   text,
  subject           text NOT NULL,
  content           text NOT NULL,
  media_url         text,
  delivery_type     text DEFAULT 'immediate' CHECK (delivery_type IN ('immediate', 'scheduled', 'on_occasion')),
  delivery_date     date,
  occasion          text,
  is_delivered      boolean DEFAULT false,
  delivered_at      timestamptz,
  is_read           boolean DEFAULT false,
  read_at           timestamptz,
  is_public         boolean DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_living_tributes_created_by ON living_tributes(created_by);
CREATE INDEX idx_living_tributes_honoree ON living_tributes(honoree_user_id);
CREATE INDEX idx_living_tributes_slug ON living_tributes(slug);
CREATE INDEX idx_living_tributes_status ON living_tributes(status);
CREATE INDEX idx_living_tributes_occasion ON living_tributes(occasion);

CREATE INDEX idx_living_tribute_messages_tribute ON living_tribute_messages(tribute_id);
CREATE INDEX idx_living_tribute_messages_author ON living_tribute_messages(author_id);

CREATE INDEX idx_living_tribute_invites_tribute ON living_tribute_invites(tribute_id);
CREATE INDEX idx_living_tribute_invites_code ON living_tribute_invites(invite_code);
CREATE INDEX idx_living_tribute_invites_email ON living_tribute_invites(invited_email);

CREATE INDEX idx_appreciation_letters_author ON appreciation_letters(author_id);
CREATE INDEX idx_appreciation_letters_recipient ON appreciation_letters(recipient_user_id);
CREATE INDEX idx_appreciation_letters_delivery ON appreciation_letters(delivery_type, delivery_date);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE living_tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_tribute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_tribute_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE appreciation_letters ENABLE ROW LEVEL SECURITY;

-- Living Tributes: public readable, creator-manageable
CREATE POLICY "living_tributes_select" ON living_tributes
  FOR SELECT USING (
    privacy = 'public'
    OR created_by = auth.uid()
    OR honoree_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM living_tribute_invites
      WHERE tribute_id = living_tributes.id
      AND (invited_user_id = auth.uid() OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      AND status = 'accepted'
    )
  );

CREATE POLICY "living_tributes_insert" ON living_tributes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "living_tributes_update" ON living_tributes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "living_tributes_delete" ON living_tributes
  FOR DELETE USING (auth.uid() = created_by);

-- Messages: readable if tribute is visible, insertable by authenticated
CREATE POLICY "living_tribute_messages_select" ON living_tribute_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM living_tributes
      WHERE id = living_tribute_messages.tribute_id
      AND (privacy = 'public' OR created_by = auth.uid() OR honoree_user_id = auth.uid())
    )
  );

CREATE POLICY "living_tribute_messages_insert" ON living_tribute_messages
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "living_tribute_messages_update" ON living_tribute_messages
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "living_tribute_messages_delete" ON living_tribute_messages
  FOR DELETE USING (auth.uid() = author_id);

-- Invites: visible to inviter and invitee
CREATE POLICY "living_tribute_invites_select" ON living_tribute_invites
  FOR SELECT USING (
    invited_by = auth.uid()
    OR invited_user_id = auth.uid()
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "living_tribute_invites_insert" ON living_tribute_invites
  FOR INSERT WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "living_tribute_invites_update" ON living_tribute_invites
  FOR UPDATE USING (
    invited_by = auth.uid()
    OR invited_user_id = auth.uid()
  );

-- Appreciation Letters: visible to author and recipient
CREATE POLICY "appreciation_letters_select" ON appreciation_letters
  FOR SELECT USING (
    author_id = auth.uid()
    OR recipient_user_id = auth.uid()
    OR is_public = true
  );

CREATE POLICY "appreciation_letters_insert" ON appreciation_letters
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "appreciation_letters_update" ON appreciation_letters
  FOR UPDATE USING (auth.uid() = author_id OR auth.uid() = recipient_user_id);

CREATE POLICY "appreciation_letters_delete" ON appreciation_letters
  FOR DELETE USING (auth.uid() = author_id);


-- ============================================================
-- 00019_daily_engagement.sql
-- ============================================================
-- ============================================================
-- Migration 00019: Daily Engagement System
-- Phase 5, Sprint 3: Daily Life Integration
-- ============================================================

-- ============================================================
-- Table: daily_prompts
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_prompts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text     text NOT NULL,
  prompt_category text NOT NULL CHECK (prompt_category IN ('gratitude','remembrance','appreciation','reflection','connection','milestone')),
  icon            text DEFAULT 'sparkles',
  is_active       boolean DEFAULT true,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- Table: user_prompt_responses
-- ============================================================
CREATE TABLE IF NOT EXISTS user_prompt_responses (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id          uuid NOT NULL REFERENCES daily_prompts(id) ON DELETE CASCADE,
  content            text NOT NULL,
  media_url          text,
  is_public          boolean DEFAULT true,
  tagged_memorial_id uuid REFERENCES memorials(id) ON DELETE SET NULL,
  tagged_user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reaction_count     integer DEFAULT 0,
  created_at         timestamptz DEFAULT now(),
  UNIQUE(user_id, prompt_id, (created_at::date))
);

-- ============================================================
-- Table: smart_reminders
-- ============================================================
CREATE TABLE IF NOT EXISTS smart_reminders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_type   text NOT NULL CHECK (reminder_type IN ('birthday','anniversary','death_anniversary','holiday','custom','auto_generated')),
  title           text NOT NULL,
  description     text,
  memorial_id     uuid REFERENCES memorials(id) ON DELETE SET NULL,
  recurrence      text DEFAULT 'annual' CHECK (recurrence IN ('once','annual','monthly','weekly')),
  reminder_date   date NOT NULL,
  reminder_time   time DEFAULT '09:00',
  days_before     integer DEFAULT 0,
  is_enabled      boolean DEFAULT true,
  last_triggered  timestamptz,
  notification_sent boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ============================================================
-- Table: engagement_streaks
-- ============================================================
CREATE TABLE IF NOT EXISTS engagement_streaks (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak         integer DEFAULT 0,
  longest_streak         integer DEFAULT 0,
  last_activity_date     date,
  total_days_active      integer DEFAULT 0,
  total_prompts_answered integer DEFAULT 0,
  total_shares           integer DEFAULT 0,
  streak_shared_at       timestamptz,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_daily_prompts_category ON daily_prompts(prompt_category);
CREATE INDEX idx_daily_prompts_active ON daily_prompts(is_active);
CREATE INDEX idx_user_prompt_responses_user ON user_prompt_responses(user_id);
CREATE INDEX idx_user_prompt_responses_prompt ON user_prompt_responses(prompt_id);
CREATE INDEX idx_smart_reminders_user ON smart_reminders(user_id);
CREATE INDEX idx_smart_reminders_date ON smart_reminders(reminder_date);
CREATE INDEX idx_engagement_streaks_user ON engagement_streaks(user_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prompt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_streaks ENABLE ROW LEVEL SECURITY;

-- Daily prompts: readable by all
CREATE POLICY "daily_prompts_select" ON daily_prompts FOR SELECT USING (true);

-- Responses: public ones readable, own always readable, insertable by owner
CREATE POLICY "user_prompt_responses_select" ON user_prompt_responses
  FOR SELECT USING (is_public = true OR user_id = auth.uid());
CREATE POLICY "user_prompt_responses_insert" ON user_prompt_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_prompt_responses_update" ON user_prompt_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Reminders: owner only
CREATE POLICY "smart_reminders_select" ON smart_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "smart_reminders_insert" ON smart_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "smart_reminders_update" ON smart_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "smart_reminders_delete" ON smart_reminders FOR DELETE USING (auth.uid() = user_id);

-- Streaks: owner only
CREATE POLICY "engagement_streaks_select" ON engagement_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "engagement_streaks_insert" ON engagement_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "engagement_streaks_update" ON engagement_streaks FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- SEED: Daily prompts
-- ============================================================
INSERT INTO daily_prompts (prompt_text, prompt_category, icon, sort_order) VALUES
-- Gratitude
('Who made you smile today?', 'gratitude', 'happy', 1),
('Name someone who changed your life for the better.', 'gratitude', 'heart', 2),
('What kindness did you witness or receive today?', 'gratitude', 'hand-left', 3),
('What is one thing you are grateful for right now?', 'gratitude', 'sparkles', 4),
('Who deserves a thank you that you haven''t given yet?', 'gratitude', 'gift', 5),
('What small moment brought you joy recently?', 'gratitude', 'sunny', 6),
('Name a teacher, mentor, or guide who shaped who you are.', 'gratitude', 'school', 7),
('What is a skill someone taught you that you still use?', 'gratitude', 'bulb', 8),
-- Remembrance
('Share a favorite memory of someone you miss.', 'remembrance', 'heart-circle', 10),
('What song reminds you of a loved one?', 'remembrance', 'musical-notes', 11),
('What lesson did you learn from someone who has passed?', 'remembrance', 'book', 12),
('Describe a tradition that keeps a loved one''s memory alive.', 'remembrance', 'flame', 13),
('What would you say if you had one more conversation?', 'remembrance', 'chatbubble', 14),
('Share a photo that captures a special moment.', 'remembrance', 'camera', 15),
('What smell or taste brings back a cherished memory?', 'remembrance', 'rose', 16),
('How do you honor someone who is no longer with you?', 'remembrance', 'candle', 17),
-- Appreciation
('Tell someone alive how they''ve impacted you.', 'appreciation', 'person', 20),
('Who deserves a thank you today?', 'appreciation', 'thumbs-up', 21),
('Name someone whose work ethic inspires you.', 'appreciation', 'star', 22),
('Who is your biggest cheerleader?', 'appreciation', 'megaphone', 23),
('What friend has stood by you through thick and thin?', 'appreciation', 'people', 24),
('Who in your family deserves more recognition?', 'appreciation', 'home', 25),
('Name a colleague who makes your work life better.', 'appreciation', 'briefcase', 26),
('Who is a quiet hero in your community?', 'appreciation', 'shield', 27),
-- Reflection
('What life lesson would you pass on to the next generation?', 'reflection', 'bulb', 30),
('What moment shaped who you are today?', 'reflection', 'compass', 31),
('If you could relive one day, which would it be?', 'reflection', 'time', 32),
('What do you want to be remembered for?', 'reflection', 'ribbon', 33),
('What advice would your younger self need to hear?', 'reflection', 'chatbubble-ellipses', 34),
('What is the bravest thing you''ve ever done?', 'reflection', 'flash', 35),
('How has your definition of success changed over time?', 'reflection', 'trending-up', 36),
('What value do you hold most dear?', 'reflection', 'diamond', 37),
-- Connection
('Who should you call today?', 'connection', 'call', 40),
('Share a family tradition worth preserving.', 'connection', 'people-circle', 41),
('What community do you feel most connected to?', 'connection', 'earth', 42),
('Name someone you''ve lost touch with that you miss.', 'connection', 'person-add', 43),
('How do you stay connected with loved ones far away?', 'connection', 'globe', 44),
('What meal brings your family together?', 'connection', 'restaurant', 45),
('Share a story that gets told at every family gathering.', 'connection', 'chatbubbles', 46),
('Who would you invite to your dream dinner party?', 'connection', 'wine', 47),
-- Milestone
('What achievement are you most proud of?', 'milestone', 'trophy', 50),
('Celebrate someone''s recent win — who accomplished something great?', 'milestone', 'ribbon', 51),
('What goal are you working toward right now?', 'milestone', 'flag', 52),
('Name a milestone birthday or anniversary coming up.', 'milestone', 'gift', 53),
('What is the best compliment you''ve ever received?', 'milestone', 'star', 54),
('Share a "first" that was meaningful to you.', 'milestone', 'rocket', 55),
('What skill have you recently learned or improved?', 'milestone', 'school', 56),
('What is something you accomplished that once seemed impossible?', 'milestone', 'checkmark-circle', 57)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 00020_viral_growth.sql
-- ============================================================
-- ============================================================
-- Migration 00020: Viral Growth Mechanics
-- Sprint 4 of Phase 5 — invite links, conversions, share
-- card templates, seasonal campaigns
-- ============================================================

-- ----------------------------------------------------------
-- 1. invite_links — trackable invite URLs
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invite_links (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invite_type     text NOT NULL CHECK (invite_type IN ('memorial_contributor','living_tribute_contributor','app_invite','family_tree_join')),
    target_id       uuid,
    invite_code     text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    message         text,
    max_uses        integer,
    use_count       integer DEFAULT 0,
    expires_at      timestamptz,
    is_active       boolean DEFAULT true,
    created_at      timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- 2. invite_conversions — tracks who signed up via invites
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invite_conversions (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_link_id    uuid NOT NULL REFERENCES public.invite_links(id) ON DELETE CASCADE,
    converted_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    conversion_type   text NOT NULL CHECK (conversion_type IN ('app_signup','memorial_follow','tribute_contribution','family_tree_join')),
    created_at        timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- 3. share_card_templates — visual templates for share cards
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.share_card_templates (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name              text NOT NULL,
    template_type     text NOT NULL CHECK (template_type IN ('memorial','tribute','living_tribute','streak','badge','prompt_response','event','milestone')),
    background_color  text DEFAULT '#2D1B4E',
    text_color        text DEFAULT '#FFFFFF',
    layout            text DEFAULT 'standard' CHECK (layout IN ('standard','photo_overlay','minimal','celebration')),
    is_active         boolean DEFAULT true,
    sort_order        integer DEFAULT 0,
    created_at        timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- 4. campaigns — seasonal & special campaigns
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title             text NOT NULL,
    description       text,
    campaign_type     text NOT NULL CHECK (campaign_type IN ('mothers_day','fathers_day','memorial_day','veterans_day','grandparents_day','remembrance_day','foreverr_day','custom')),
    start_date        date NOT NULL,
    end_date          date NOT NULL,
    cover_image_url   text,
    cta_text          text DEFAULT 'Honor Someone Special',
    cta_route         text DEFAULT '/living-tribute/create',
    is_active         boolean DEFAULT true,
    participant_count integer DEFAULT 0,
    created_at        timestamptz DEFAULT now(),
    updated_at        timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_invite_links_creator ON public.invite_links(creator_id);
CREATE INDEX IF NOT EXISTS idx_invite_links_code ON public.invite_links(invite_code);
CREATE INDEX IF NOT EXISTS idx_invite_conversions_link ON public.invite_conversions(invite_link_id);
CREATE INDEX IF NOT EXISTS idx_share_card_templates_type ON public.share_card_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(campaign_type);

-- ----------------------------------------------------------
-- Trigger: auto-increment use_count on conversion
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_invite_use_count()
RETURNS trigger AS $$
BEGIN
    UPDATE public.invite_links
    SET use_count = use_count + 1
    WHERE id = NEW.invite_link_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_invite_use ON public.invite_conversions;
CREATE TRIGGER trg_increment_invite_use
    AFTER INSERT ON public.invite_conversions
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_invite_use_count();

-- ----------------------------------------------------------
-- RLS Policies
-- ----------------------------------------------------------
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- invite_links: creator can manage, anyone can read active links
CREATE POLICY "invite_links_read" ON public.invite_links
    FOR SELECT USING (is_active = true);
CREATE POLICY "invite_links_insert" ON public.invite_links
    FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "invite_links_update" ON public.invite_links
    FOR UPDATE USING (auth.uid() = creator_id);

-- invite_conversions: readable by invite creator, insertable by authenticated
CREATE POLICY "invite_conversions_read" ON public.invite_conversions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.invite_links
            WHERE id = invite_link_id AND creator_id = auth.uid()
        )
    );
CREATE POLICY "invite_conversions_insert" ON public.invite_conversions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- share_card_templates: readable by all
CREATE POLICY "share_card_templates_read" ON public.share_card_templates
    FOR SELECT USING (is_active = true);

-- campaigns: readable by all
CREATE POLICY "campaigns_read" ON public.campaigns
    FOR SELECT USING (is_active = true);

-- ----------------------------------------------------------
-- Seed: Share card templates
-- ----------------------------------------------------------
INSERT INTO public.share_card_templates (name, template_type, background_color, text_color, layout, sort_order) VALUES
    ('Memorial Classic',    'memorial',        '#2D1B4E', '#FFFFFF', 'standard',      1),
    ('Memorial Photo',      'memorial',        '#1F1145', '#FFFFFF', 'photo_overlay', 2),
    ('Tribute Elegant',     'tribute',         '#4A2D7A', '#FFFFFF', 'standard',      1),
    ('Tribute Minimal',     'tribute',         '#FFFFFF', '#2D1B4E', 'minimal',       2),
    ('Living Tribute',      'living_tribute',  '#059669', '#FFFFFF', 'celebration',   1),
    ('Living Tribute Photo','living_tribute',  '#047857', '#FFFFFF', 'photo_overlay', 2),
    ('Streak Fire',         'streak',          '#EF4444', '#FFFFFF', 'celebration',   1),
    ('Badge Earned',        'badge',           '#7C3AED', '#FFFFFF', 'celebration',   1),
    ('Prompt Response',     'prompt_response', '#F59E0B', '#FFFFFF', 'standard',      1),
    ('Event Invite',        'event',           '#2563EB', '#FFFFFF', 'standard',      1),
    ('Milestone',           'milestone',       '#2D1B4E', '#F59E0B', 'celebration',   1);

-- ----------------------------------------------------------
-- Seed: Campaign definitions
-- ----------------------------------------------------------
INSERT INTO public.campaigns (title, description, campaign_type, start_date, end_date, cta_text, cta_route) VALUES
    ('Mother''s Day',
     'Honor the mothers and maternal figures in your life with a living tribute.',
     'mothers_day', '2026-05-04', '2026-05-10',
     'Honor a Mother', '/living-tribute/create'),
    ('Father''s Day',
     'Celebrate fathers and father figures with a heartfelt tribute.',
     'fathers_day', '2026-06-15', '2026-06-21',
     'Honor a Father', '/living-tribute/create'),
    ('Memorial Day',
     'Remember and honor those who served our country.',
     'memorial_day', '2026-05-22', '2026-05-25',
     'Remember a Hero', '/memorial/create/basic-info'),
    ('Veterans Day',
     'Thank a veteran for their service with a living tribute.',
     'veterans_day', '2026-11-09', '2026-11-11',
     'Thank a Veteran', '/living-tribute/create'),
    ('Grandparents Day',
     'Celebrate the wisdom and love of grandparents.',
     'grandparents_day', '2026-09-07', '2026-09-13',
     'Honor a Grandparent', '/living-tribute/create'),
    ('Foreverr Day',
     'Our annual celebration of legacy, love, and remembrance.',
     'foreverr_day', '2026-10-01', '2026-10-07',
     'Join the Celebration', '/living-tribute/create');


-- ============================================================
-- 00021_living_legacy_polish.sql
-- ============================================================
-- ============================================================
-- Migration 00021: Living Legacy Polish
-- Sprint 5 of Phase 5 — profile enhancements, memorial
-- conversion tracking, user share stats
-- ============================================================

-- ----------------------------------------------------------
-- 1. Profile enhancements for legacy features
-- ----------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legacy_message text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_living_tribute_enabled boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prompt_streak integer DEFAULT 0;

-- ----------------------------------------------------------
-- 2. Memorial conversion tracking
-- ----------------------------------------------------------
ALTER TABLE public.memorials ADD COLUMN IF NOT EXISTS converted_from_living_tribute_id uuid;
ALTER TABLE public.memorials ADD COLUMN IF NOT EXISTS page_type text DEFAULT 'memorial';

-- ----------------------------------------------------------
-- 3. user_share_stats — aggregate sharing metrics per user
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_share_stats (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    total_shares          integer DEFAULT 0,
    total_invites_sent    integer DEFAULT 0,
    total_conversions     integer DEFAULT 0,
    total_prompts_answered integer DEFAULT 0,
    most_shared_type      text,
    created_at            timestamptz DEFAULT now(),
    updated_at            timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_share_stats_user ON public.user_share_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_memorials_converted ON public.memorials(converted_from_living_tribute_id)
    WHERE converted_from_living_tribute_id IS NOT NULL;

-- ----------------------------------------------------------
-- Trigger: auto-create user_share_stats on profile creation
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_user_share_stats()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_share_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_share_stats ON public.profiles;
CREATE TRIGGER trg_ensure_share_stats
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_user_share_stats();

-- ----------------------------------------------------------
-- Trigger: auto-update share stats on share_cards insert
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_share_stats_on_share()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_share_stats (user_id, total_shares, most_shared_type)
    VALUES (NEW.user_id, 1, NEW.target_type)
    ON CONFLICT (user_id) DO UPDATE SET
        total_shares = user_share_stats.total_shares + 1,
        most_shared_type = NEW.target_type,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_share_stats ON public.share_cards;
CREATE TRIGGER trg_update_share_stats
    AFTER INSERT ON public.share_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_share_stats_on_share();

-- ----------------------------------------------------------
-- Trigger: auto-update invite stats on invite_links insert
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_invite_stats()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_share_stats (user_id, total_invites_sent)
    VALUES (NEW.creator_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        total_invites_sent = user_share_stats.total_invites_sent + 1,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invite_stats ON public.invite_links;
CREATE TRIGGER trg_update_invite_stats
    AFTER INSERT ON public.invite_links
    FOR EACH ROW
    EXECUTE FUNCTION public.update_invite_stats();

-- ----------------------------------------------------------
-- RLS Policies
-- ----------------------------------------------------------
ALTER TABLE public.user_share_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_share_stats_read" ON public.user_share_stats
    FOR SELECT USING (true);
CREATE POLICY "user_share_stats_insert" ON public.user_share_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_share_stats_update" ON public.user_share_stats
    FOR UPDATE USING (auth.uid() = user_id);


-- ============================================================
-- 00022_gift_economy.sql
-- ============================================================
-- ============================================================
-- 00022_gift_economy.sql
-- Gift Economy: Gift Catalog, Transactions, Flower Walls, Reactions
-- ============================================================

-- ============================================================
-- 1. Gift Catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gift_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('flowers', 'candles', 'cards', 'stuffed_animals', 'balloons', 'custom', 'money')),
  icon text NOT NULL DEFAULT 'gift',
  image_url text,
  price_cents integer NOT NULL DEFAULT 0,
  is_premium boolean DEFAULT false,
  is_physical boolean DEFAULT false,
  physical_partner_id uuid,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gift_catalog_category ON public.gift_catalog(category);

-- ============================================================
-- 2. Gift Transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gift_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_type text NOT NULL CHECK (recipient_type IN ('user', 'memorial', 'living_tribute')),
  recipient_id uuid NOT NULL,
  recipient_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  gift_id uuid NOT NULL REFERENCES public.gift_catalog(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  message text,
  is_anonymous boolean DEFAULT false,
  amount_cents integer DEFAULT 0,
  currency text DEFAULT 'USD',
  payment_status text DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_intent_id text,
  is_physical boolean DEFAULT false,
  shipping_address jsonb,
  delivery_status text CHECK (delivery_status IN ('pending', 'shipped', 'delivered', 'returned')),
  tracking_number text,
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gift_transactions_recipient ON public.gift_transactions(recipient_type, recipient_id);
CREATE INDEX idx_gift_transactions_sender ON public.gift_transactions(sender_id);

-- ============================================================
-- 3. Flower Walls (Aggregated gift counts per target)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flower_walls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('user', 'memorial', 'living_tribute')),
  target_id uuid NOT NULL,
  total_flowers integer DEFAULT 0,
  total_candles integer DEFAULT 0,
  total_gifts integer DEFAULT 0,
  total_amount_cents integer DEFAULT 0,
  last_gift_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(target_type, target_id)
);

-- ============================================================
-- 4. Gift Reactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gift_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_transaction_id uuid NOT NULL REFERENCES public.gift_transactions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('heart', 'pray', 'thanks', 'hug')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(gift_transaction_id, user_id)
);

-- ============================================================
-- 5. Row Level Security
-- ============================================================

-- gift_catalog: readable by all
ALTER TABLE public.gift_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift_catalog_select" ON public.gift_catalog
  FOR SELECT USING (true);

-- gift_transactions: readable by all, insertable by authenticated
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift_transactions_select" ON public.gift_transactions
  FOR SELECT USING (true);

CREATE POLICY "gift_transactions_insert" ON public.gift_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- flower_walls: readable by all
ALTER TABLE public.flower_walls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flower_walls_select" ON public.flower_walls
  FOR SELECT USING (true);

-- gift_reactions: readable by all, insertable by authenticated
ALTER TABLE public.gift_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift_reactions_select" ON public.gift_reactions
  FOR SELECT USING (true);

CREATE POLICY "gift_reactions_insert" ON public.gift_reactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 6. Trigger: Auto-update flower_walls + calculate points_earned
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_gift_transaction()
RETURNS TRIGGER AS $$
DECLARE
  gift_category text;
  earned_points integer;
BEGIN
  -- Look up the gift category
  SELECT category INTO gift_category
  FROM public.gift_catalog
  WHERE id = NEW.gift_id;

  -- Calculate points earned based on category
  CASE gift_category
    WHEN 'flowers' THEN earned_points := 5;
    WHEN 'candles' THEN earned_points := 5;
    WHEN 'cards' THEN earned_points := 10;
    WHEN 'money' THEN earned_points := 15;
    ELSE earned_points := 10;
  END CASE;

  -- Set points_earned on the new row
  NEW.points_earned := earned_points;

  -- Upsert into flower_walls
  INSERT INTO public.flower_walls (target_type, target_id, total_flowers, total_candles, total_gifts, total_amount_cents, last_gift_at, updated_at)
  VALUES (
    NEW.recipient_type,
    NEW.recipient_id,
    CASE WHEN gift_category = 'flowers' THEN NEW.quantity ELSE 0 END,
    CASE WHEN gift_category = 'candles' THEN NEW.quantity ELSE 0 END,
    NEW.quantity,
    COALESCE(NEW.amount_cents, 0),
    now(),
    now()
  )
  ON CONFLICT (target_type, target_id) DO UPDATE SET
    total_flowers = flower_walls.total_flowers + CASE WHEN gift_category = 'flowers' THEN NEW.quantity ELSE 0 END,
    total_candles = flower_walls.total_candles + CASE WHEN gift_category = 'candles' THEN NEW.quantity ELSE 0 END,
    total_gifts = flower_walls.total_gifts + NEW.quantity,
    total_amount_cents = flower_walls.total_amount_cents + COALESCE(NEW.amount_cents, 0),
    last_gift_at = now(),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_gift_transaction_insert
  BEFORE INSERT ON public.gift_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_gift_transaction();

-- ============================================================
-- 7. Seed Data: Gift Catalog (30+ items)
-- ============================================================

-- Flowers (sort_order 1-6)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Single Rose', 'A single red rose to show you care', 'flowers', 'rose', 0, false, 1),
  ('Bouquet', 'A beautiful mixed bouquet of fresh flowers', 'flowers', 'rose', 299, false, 2),
  ('Sunflower', 'A bright sunflower to bring warmth and light', 'flowers', 'rose', 199, false, 3),
  ('Lily', 'An elegant lily symbolizing peace and remembrance', 'flowers', 'rose', 249, false, 4),
  ('Orchid', 'A graceful orchid representing eternal love', 'flowers', 'rose', 399, false, 5),
  ('Eternal Rose', 'A preserved rose that lasts forever, just like your love', 'flowers', 'rose', 999, true, 6);

-- Candles (sort_order 7-10)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Prayer Candle', 'Light a prayer candle in remembrance', 'candles', 'flame', 0, false, 7),
  ('Memorial Candle', 'A memorial candle that burns bright', 'candles', 'flame', 199, false, 8),
  ('Vigil Light', 'A vigil light to keep the memory alive', 'candles', 'flame', 299, false, 9),
  ('Eternal Flame', 'An eternal flame that never goes out', 'candles', 'flame', 799, true, 10);

-- Cards (sort_order 11-16)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Thank You Card', 'Express your gratitude with a heartfelt thank you', 'cards', 'mail', 0, false, 11),
  ('Thinking of You', 'Let someone know they are in your thoughts', 'cards', 'mail', 149, false, 12),
  ('Birthday Card', 'Celebrate a birthday with a special card', 'cards', 'mail', 199, false, 13),
  ('Get Well', 'Send warm wishes for a speedy recovery', 'cards', 'mail', 149, false, 14),
  ('Anniversary Card', 'Mark a special anniversary with love', 'cards', 'mail', 199, false, 15),
  ('Custom Message', 'Write your own personal message from the heart', 'cards', 'mail', 0, false, 16);

-- Stuffed Animals (sort_order 17-19)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Comfort Bear', 'A soft bear to bring comfort during difficult times', 'stuffed_animals', 'heart', 499, false, 17),
  ('Memorial Butterfly', 'A butterfly symbolizing transformation and hope', 'stuffed_animals', 'heart', 599, false, 18),
  ('Guardian Angel', 'A guardian angel to watch over your loved ones', 'stuffed_animals', 'heart', 699, false, 19);

-- Balloons (sort_order 20-22)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Celebration Bundle', 'A festive bundle of balloons for any occasion', 'balloons', 'balloon', 399, false, 20),
  ('Birthday Balloons', 'Colorful birthday balloons to brighten the day', 'balloons', 'balloon', 299, false, 21),
  ('Congratulations', 'Congratulations balloons to celebrate achievements', 'balloons', 'balloon', 349, false, 22);

-- Custom (sort_order 23-24)
INSERT INTO public.gift_catalog (name, description, category, icon, price_cents, is_premium, sort_order) VALUES
  ('Photo Frame', 'A digital photo frame to display cherished memories', 'custom', 'gift', 499, false, 23),
  ('Memory Book', 'A collaborative memory book for friends and family', 'custom', 'gift', 799, false, 24);


-- ============================================================
-- 00023_legacy_points.sql
-- ============================================================
-- ============================================================
-- 00023_legacy_points.sql
-- Legacy Points & Reward System
-- ============================================================

-- ============================================================
-- 1. Legacy Levels (catalog — created first for FK reference)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.legacy_levels (
  id integer PRIMARY KEY,
  level_name text NOT NULL,
  min_points integer NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  perks text[]
);

-- ============================================================
-- 2. Legacy Point Balances
-- ============================================================
CREATE TABLE IF NOT EXISTS public.legacy_point_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  current_balance integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  level_name text NOT NULL DEFAULT 'Seedling',
  next_level_at integer NOT NULL DEFAULT 100,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_legacy_point_balances_user ON public.legacy_point_balances(user_id);

-- ============================================================
-- 3. Legacy Points (individual point transactions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.legacy_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  action_type text NOT NULL CHECK (action_type IN (
    'daily_login',
    'create_memorial',
    'create_tribute',
    'send_gift',
    'send_flowers',
    'invite_accepted',
    'share_content',
    'respond_to_prompt',
    'complete_streak_day',
    'create_living_tribute',
    'write_appreciation',
    'contribute_to_tribute',
    'follow_memorial',
    'add_photo',
    'add_video',
    'complete_profile',
    'first_memorial',
    'first_tribute',
    'milestone_100_tributes',
    'campaign_participation',
    'referral_signup'
  )),
  reference_id uuid,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_legacy_points_user ON public.legacy_points(user_id, created_at DESC);

-- ============================================================
-- 4. Point Redemptions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.point_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_spent integer NOT NULL,
  redemption_type text NOT NULL CHECK (redemption_type IN (
    'gift_purchase',
    'premium_feature',
    'donation_boost',
    'custom_theme'
  )),
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. Trigger: Auto-update balances on points earned
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_legacy_points_insert()
RETURNS TRIGGER AS $$
DECLARE
  _balance_row public.legacy_point_balances%ROWTYPE;
  _new_total integer;
  _new_level integer;
  _level_row public.legacy_levels%ROWTYPE;
  _next_level public.legacy_levels%ROWTYPE;
BEGIN
  -- Upsert the balance row
  INSERT INTO public.legacy_point_balances (user_id, total_earned, current_balance, level, level_name, next_level_at)
  VALUES (NEW.user_id, NEW.points, NEW.points, 1, 'Seedling', 100)
  ON CONFLICT (user_id) DO UPDATE SET
    total_earned = public.legacy_point_balances.total_earned + NEW.points,
    current_balance = public.legacy_point_balances.current_balance + NEW.points,
    updated_at = now()
  RETURNING * INTO _balance_row;

  _new_total := _balance_row.total_earned;

  -- Determine current level based on total earned
  SELECT * INTO _level_row
  FROM public.legacy_levels
  WHERE min_points <= _new_total
  ORDER BY min_points DESC
  LIMIT 1;

  IF _level_row IS NOT NULL THEN
    _new_level := _level_row.id;

    -- Determine next level threshold
    SELECT * INTO _next_level
    FROM public.legacy_levels
    WHERE id = _level_row.id + 1;

    UPDATE public.legacy_point_balances SET
      level = _level_row.id,
      level_name = _level_row.level_name,
      next_level_at = COALESCE(_next_level.min_points, _level_row.min_points),
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_legacy_points_insert ON public.legacy_points;
CREATE TRIGGER trg_legacy_points_insert
  AFTER INSERT ON public.legacy_points
  FOR EACH ROW EXECUTE FUNCTION public.handle_legacy_points_insert();

-- ============================================================
-- 6. Trigger: Auto-update balances on point redemption
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_point_redemption_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.legacy_point_balances SET
    total_spent = total_spent + NEW.points_spent,
    current_balance = GREATEST(current_balance - NEW.points_spent, 0),
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_point_redemption_insert ON public.point_redemptions;
CREATE TRIGGER trg_point_redemption_insert
  AFTER INSERT ON public.point_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_point_redemption_insert();

-- ============================================================
-- 7. RLS Policies
-- ============================================================

-- legacy_points
ALTER TABLE public.legacy_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
  ON public.legacy_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert points"
  ON public.legacy_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- legacy_point_balances
ALTER TABLE public.legacy_point_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view point balances"
  ON public.legacy_point_balances FOR SELECT
  USING (true);

CREATE POLICY "Users can update own balance"
  ON public.legacy_point_balances FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert balances"
  ON public.legacy_point_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- legacy_levels
ALTER TABLE public.legacy_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view levels"
  ON public.legacy_levels FOR SELECT
  USING (true);

-- point_redemptions
ALTER TABLE public.point_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON public.point_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemptions"
  ON public.point_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 8. Seed Legacy Levels
-- ============================================================
INSERT INTO public.legacy_levels (id, level_name, min_points, icon, color, perks) VALUES
  (1, 'Seedling',   0,     'leaf',     '#22C55E', ARRAY['Basic access']),
  (2, 'Sprout',     100,   'leaf',     '#16A34A', ARRAY['Custom themes']),
  (3, 'Bloom',      500,   'flower',   '#A855F7', ARRAY['Premium gifts']),
  (4, 'Tree',       2000,  'tree',     '#059669', ARRAY['Badge showcase']),
  (5, 'Grove',      5000,  'forest',   '#0D9488', ARRAY['Profile highlight']),
  (6, 'Forest',     15000, 'mountain', '#1D4ED8', ARRAY['Legacy builder badge']),
  (7, 'Eternal',    50000, 'star',     '#F59E0B', ARRAY['Legendary status'])
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 00024_trust_system.sql
-- ============================================================
-- ============================================================
-- 00024_trust_system.sql
-- Phase 6 Sprint 3: Trust System & Memorial Creation Logic
-- Tables: trust_levels, memorial_claims, memorial_managers,
--         duplicate_reports, fundraise_campaigns_v2
-- Alters: profiles, memorials
-- ============================================================

-- 1. Trust Levels (lookup table)
CREATE TABLE IF NOT EXISTS trust_levels (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text,
  can_create_memorial boolean DEFAULT true,
  can_fundraise boolean DEFAULT false,
  can_claim_memorial boolean DEFAULT false,
  can_moderate boolean DEFAULT false,
  max_fundraise_amount_cents integer DEFAULT 0,
  verification_required boolean DEFAULT false
);

-- 2. Memorial Claims
CREATE TABLE IF NOT EXISTS memorial_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  claimer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('spouse','parent','child','sibling','grandchild','grandparent','extended_family','executor','close_friend')),
  evidence_type text CHECK (evidence_type IN ('obituary_link','death_certificate','family_photo','other')),
  evidence_url text,
  evidence_note text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','disputed')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(memorial_id, claimer_id)
);

-- 3. Memorial Managers
CREATE TABLE IF NOT EXISTS memorial_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','family_admin','contributor','moderator')),
  granted_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(memorial_id, user_id)
);

-- 4. Duplicate Reports
CREATE TABLE IF NOT EXISTS duplicate_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memorial_id_a uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  memorial_id_b uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','merged')),
  merged_into_id uuid REFERENCES memorials(id),
  notes text,
  reviewed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Fundraise Campaigns V2 (trust-gated)
CREATE TABLE IF NOT EXISTS fundraise_campaigns_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  goal_cents integer NOT NULL,
  raised_cents integer DEFAULT 0,
  donor_count integer DEFAULT 0,
  beneficiary_name text,
  beneficiary_relation text,
  is_verified boolean DEFAULT false,
  trust_level integer DEFAULT 1,
  platform_fee_pct numeric DEFAULT 5.0,
  status text DEFAULT 'active' CHECK (status IN ('draft','active','paused','completed','cancelled')),
  expires_at timestamptz,
  payout_method text CHECK (payout_method IN ('stripe','paypal','check')),
  payout_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- ALTER existing tables
-- ============================================================

-- Add trust_level to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_level integer DEFAULT 1;

-- Add claim & celebrity columns to memorials
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false;
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS claimed_by uuid;
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS is_celebrity boolean DEFAULT false;
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS celebrity_verified boolean DEFAULT false;

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_memorial_claims_memorial ON memorial_claims(memorial_id);
CREATE INDEX IF NOT EXISTS idx_memorial_managers_memorial ON memorial_managers(memorial_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_reports_status ON duplicate_reports(status);
CREATE INDEX IF NOT EXISTS idx_fundraise_v2_memorial ON fundraise_campaigns_v2(memorial_id);

-- ============================================================
-- Seed trust levels
-- ============================================================

INSERT INTO trust_levels (id, name, description, can_create_memorial, can_fundraise, can_claim_memorial, can_moderate, max_fundraise_amount_cents, verification_required)
VALUES
  (1, 'Community', 'Default level', true, false, false, false, 0, false),
  (2, 'Verified', 'Email and phone verified', true, true, false, false, 100000, true),
  (3, 'Family Verified', 'Approved family claim', true, true, true, true, 2500000, true),
  (4, 'Executor', 'Legal documentation provided', true, true, true, true, 0, true),
  (5, 'Admin', 'Platform moderator', true, true, true, true, 0, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE trust_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraise_campaigns_v2 ENABLE ROW LEVEL SECURITY;

-- trust_levels: readable by all
CREATE POLICY "trust_levels_select" ON trust_levels
  FOR SELECT USING (true);

-- memorial_claims: readable by claimer or memorial creator
CREATE POLICY "memorial_claims_select" ON memorial_claims
  FOR SELECT USING (
    claimer_id = auth.uid()
    OR memorial_id IN (
      SELECT id FROM memorials WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "memorial_claims_insert" ON memorial_claims
  FOR INSERT WITH CHECK (claimer_id = auth.uid());

-- memorial_managers: readable by memorial participants
CREATE POLICY "memorial_managers_select" ON memorial_managers
  FOR SELECT USING (
    user_id = auth.uid()
    OR memorial_id IN (
      SELECT memorial_id FROM memorial_managers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "memorial_managers_insert" ON memorial_managers
  FOR INSERT WITH CHECK (
    granted_by = auth.uid()
    AND memorial_id IN (
      SELECT memorial_id FROM memorial_managers
      WHERE user_id = auth.uid() AND role IN ('owner', 'family_admin')
    )
  );

CREATE POLICY "memorial_managers_delete" ON memorial_managers
  FOR DELETE USING (
    memorial_id IN (
      SELECT memorial_id FROM memorial_managers
      WHERE user_id = auth.uid() AND role IN ('owner', 'family_admin')
    )
  );

-- duplicate_reports: readable by reporter
CREATE POLICY "duplicate_reports_select" ON duplicate_reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "duplicate_reports_insert" ON duplicate_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- fundraise_campaigns_v2: readable by all, insertable by authenticated
CREATE POLICY "fundraise_v2_select" ON fundraise_campaigns_v2
  FOR SELECT USING (true);

CREATE POLICY "fundraise_v2_insert" ON fundraise_campaigns_v2
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "fundraise_v2_update" ON fundraise_campaigns_v2
  FOR UPDATE USING (creator_id = auth.uid());

-- ============================================================
-- Updated_at trigger helper (reuse if exists)
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memorial_claims_updated_at
  BEFORE UPDATE ON memorial_claims
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER duplicate_reports_updated_at
  BEFORE UPDATE ON duplicate_reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER fundraise_v2_updated_at
  BEFORE UPDATE ON fundraise_campaigns_v2
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 00025_content_import.sql
-- ============================================================
-- ============================================================
-- 00025_content_import.sql
-- Phase 6 Sprint 4: Content Import Center
-- Tables: import_jobs, import_items, connected_accounts
-- ============================================================

-- -------------------------------------------------------
-- 1. import_jobs — tracks bulk import operations
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type   text NOT NULL CHECK (source_type IN (
    'facebook','instagram','twitter','tiktok','google_photos','apple_photos',
    'gedcom','csv','legacy_com','findagrave','ancestry','manual'
  )),
  target_type   text NOT NULL CHECK (target_type IN (
    'memorial','living_tribute','memory_vault','family_tree','profile'
  )),
  target_id     uuid,
  status        text DEFAULT 'pending' CHECK (status IN (
    'pending','processing','completed','failed','partial'
  )),
  total_items     integer DEFAULT 0,
  imported_items  integer DEFAULT 0,
  failed_items    integer DEFAULT 0,
  error_log       jsonb DEFAULT '[]'::jsonb,
  source_metadata jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- -------------------------------------------------------
-- 2. import_items — individual items within an import job
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id   uuid NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  source_url      text,
  source_id       text,
  content_type    text NOT NULL CHECK (content_type IN (
    'photo','video','text','post','story','memory','person','relationship'
  )),
  content         text,
  media_url       text,
  metadata        jsonb,
  status          text DEFAULT 'pending' CHECK (status IN (
    'pending','imported','skipped','failed'
  )),
  target_item_id  uuid,
  created_at      timestamptz DEFAULT now()
);

-- -------------------------------------------------------
-- 3. connected_accounts — OAuth social account links
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS connected_accounts (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform                text NOT NULL CHECK (platform IN (
    'facebook','instagram','twitter','tiktok','google','apple'
  )),
  platform_user_id        text,
  access_token_encrypted  text,
  refresh_token_encrypted text,
  token_expires_at        timestamptz,
  display_name            text,
  avatar_url              text,
  is_active               boolean DEFAULT true,
  last_sync_at            timestamptz,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- -------------------------------------------------------
-- Indexes
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_import_jobs_user
  ON import_jobs (user_id, status);

CREATE INDEX IF NOT EXISTS idx_import_items_job
  ON import_items (import_job_id);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user
  ON connected_accounts (user_id);

-- -------------------------------------------------------
-- RLS — all tables private to the owning user
-- -------------------------------------------------------

-- import_jobs
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_jobs_select_own"
  ON import_jobs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "import_jobs_insert_own"
  ON import_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "import_jobs_update_own"
  ON import_jobs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "import_jobs_delete_own"
  ON import_jobs FOR DELETE
  USING (user_id = auth.uid());

-- import_items (access via parent job ownership)
ALTER TABLE import_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_items_select_own"
  ON import_items FOR SELECT
  USING (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "import_items_insert_own"
  ON import_items FOR INSERT
  WITH CHECK (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "import_items_update_own"
  ON import_items FOR UPDATE
  USING (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "import_items_delete_own"
  ON import_items FOR DELETE
  USING (
    import_job_id IN (
      SELECT id FROM import_jobs WHERE user_id = auth.uid()
    )
  );

-- connected_accounts
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connected_accounts_select_own"
  ON connected_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "connected_accounts_insert_own"
  ON connected_accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "connected_accounts_update_own"
  ON connected_accounts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "connected_accounts_delete_own"
  ON connected_accounts FOR DELETE
  USING (user_id = auth.uid());

-- -------------------------------------------------------
-- updated_at trigger for import_jobs
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_import_jobs_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_import_jobs_updated_at
  BEFORE UPDATE ON import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_import_jobs_updated_at();

-- -------------------------------------------------------
-- updated_at trigger for connected_accounts
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_connected_accounts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_connected_accounts_updated_at
  BEFORE UPDATE ON connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_connected_accounts_updated_at();


-- ============================================================
-- 00026_directory_lifecycle.sql
-- ============================================================
-- ============================================================
-- Migration 00026: Directory Mass Import & Lifecycle Stages
-- Phase 6, Sprint 5
-- ============================================================

-- 1. Directory Import Batches
CREATE TABLE IF NOT EXISTS directory_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('google_places','yelp','manual_csv','partnership','web_scrape')),
  category text NOT NULL,
  region text,
  total_listings integer DEFAULT 0,
  imported_count integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  imported_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Celebrity Memorial Requests
CREATE TABLE IF NOT EXISTS celebrity_memorial_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  celebrity_name text NOT NULL,
  wikipedia_url text,
  known_for text,
  date_of_birth date,
  date_of_death date,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','created','rejected')),
  memorial_id uuid REFERENCES memorials(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 3. Lifecycle Stages
CREATE TABLE IF NOT EXISTS lifecycle_stages (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text NOT NULL,
  color text NOT NULL,
  features text[],
  sort_order integer
);

-- 4. ALTER existing tables
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'remember';

-- living_tributes may not exist yet; wrap in DO block
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'living_tributes') THEN
    ALTER TABLE living_tributes ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'celebrate';
  END IF;
END $$;

-- ============================================================
-- SEED: Lifecycle Stages
-- ============================================================
INSERT INTO lifecycle_stages (id, name, description, icon, color, features, sort_order) VALUES
  (1, 'Celebrate', 'Honor achievements, milestones, and birthdays while they are living', 'sparkles', '#F59E0B', ARRAY['Living tributes','Birthday celebrations','Achievement honors'], 1),
  (2, 'Preserve', 'Capture stories, photos, and memories before they fade', 'camera', '#3B82F6', ARRAY['Memory vault','Family tree','Story recording'], 2),
  (3, 'Support', 'Rally around those who are aging, ill, or transitioning', 'heart', '#EC4899', ARRAY['Care circles','Gift flowers','Support messages'], 3),
  (4, 'Remember', 'After passing, keep their memory alive', 'flame', '#8B5CF6', ARRAY['Memorials','Tribute wall','Candle lighting'], 4),
  (5, 'Legacy', 'Their impact continues through stories, lessons, and inspiration', 'star', '#F97316', ARRAY['Legacy profiles','Inspiration feed','Impact stories'], 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: Sample Directory Import Batches
-- ============================================================
INSERT INTO directory_import_batches (source, category, region, total_listings, imported_count, status) VALUES
  ('google_places', 'Funeral Homes', 'New York, NY', 250, 250, 'completed'),
  ('yelp', 'Florists', 'Los Angeles, CA', 180, 180, 'completed'),
  ('manual_csv', 'Grief Counselors', 'Chicago, IL', 45, 45, 'completed'),
  ('partnership', 'Memorial Parks', 'Houston, TX', 120, 98, 'processing'),
  ('web_scrape', 'Estate Attorneys', 'Miami, FL', 90, 0, 'pending')
ON CONFLICT DO NOTHING;

-- ============================================================
-- RLS Policies
-- ============================================================

-- directory_import_batches: readable by admins only
ALTER TABLE directory_import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read import batches"
  ON directory_import_batches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert import batches"
  ON directory_import_batches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- celebrity_memorial_requests: insertable by authenticated, readable by requester
ALTER TABLE celebrity_memorial_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can request celebrity memorials"
  ON celebrity_memorial_requests FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Users can read their own requests"
  ON celebrity_memorial_requests FOR SELECT
  USING (auth.uid() = requested_by);

-- lifecycle_stages: readable by all (public reference data)
ALTER TABLE lifecycle_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lifecycle stages"
  ON lifecycle_stages FOR SELECT
  USING (true);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_directory_import_batches_status ON directory_import_batches(status);
CREATE INDEX IF NOT EXISTS idx_directory_import_batches_region ON directory_import_batches(region);
CREATE INDEX IF NOT EXISTS idx_celebrity_memorial_requests_status ON celebrity_memorial_requests(status);
CREATE INDEX IF NOT EXISTS idx_celebrity_memorial_requests_requested_by ON celebrity_memorial_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_lifecycle_stages_sort_order ON lifecycle_stages(sort_order);
CREATE INDEX IF NOT EXISTS idx_memorials_lifecycle_stage ON memorials(lifecycle_stage);


-- ============================================================
-- 00027_phase6_polish.sql
-- ============================================================
-- Phase 6 Sprint 6: Polish & notifications enhancement
-- Add metadata column for rich notification data
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Index for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);


-- ============================================================
-- 00028_premium_subscriptions.sql
-- ============================================================
-- ============================================================
-- Migration 00028: Premium Subscriptions & Monetization
-- ============================================================
-- Tables: subscription_plans, user_subscriptions, premium_entitlements,
--         billing_history, premium_feature_gates
-- ============================================================

-- ── Subscription Plans ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text NOT NULL,                                -- "Free", "Premium", "Elite"
  slug            text NOT NULL UNIQUE,                         -- "free", "premium", "elite"
  description     text,
  price_cents     integer NOT NULL DEFAULT 0,                   -- Monthly price in cents (999 = $9.99)
  annual_price_cents integer DEFAULT 0,                         -- Annual price in cents (7999 = $79.99)
  currency        text NOT NULL DEFAULT 'USD',
  tier            integer NOT NULL DEFAULT 0,                   -- 0=free, 1=premium, 2=elite
  features        jsonb DEFAULT '[]'::jsonb,                    -- Array of feature keys
  limits          jsonb DEFAULT '{}'::jsonb,                    -- { "vault_items": 100, "share_cards": -1 }
  badge_icon      text,                                         -- Icon name for badge display
  badge_color     text,                                         -- Hex color for badge
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      integer DEFAULT 0,
  store_product_id_monthly  text,                               -- RevenueCat/App Store product ID (monthly)
  store_product_id_annual   text,                               -- RevenueCat/App Store product ID (annual)
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── User Subscriptions ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id             uuid NOT NULL REFERENCES public.subscription_plans(id),
  status              text NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'expired', 'paused')),
  billing_period      text NOT NULL DEFAULT 'monthly'
                      CHECK (billing_period IN ('monthly', 'annual', 'lifetime')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end  timestamptz,
  trial_start         timestamptz,
  trial_end           timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at        timestamptz,
  -- Payment provider references
  provider            text DEFAULT 'revenuecat'
                      CHECK (provider IN ('revenuecat', 'stripe', 'apple', 'google', 'manual')),
  provider_subscription_id  text,                               -- RevenueCat/Stripe subscription ID
  provider_customer_id      text,                               -- RevenueCat/Stripe customer ID
  -- Points bonus
  points_multiplier   numeric(3,1) DEFAULT 1.0,                 -- 1.5x for premium, 2.0x for elite
  -- Metadata
  metadata            jsonb DEFAULT '{}'::jsonb,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE(user_id)                                               -- One active subscription per user
);

-- ── Premium Entitlements ────────────────────────────────────
-- Granular feature access — ties plan features to boolean gates

CREATE TABLE IF NOT EXISTS public.premium_entitlements (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id         uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  feature_key     text NOT NULL,                                -- "premium_templates", "ai_voice", etc.
  description     text,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(plan_id, feature_key)
);

-- ── Billing History ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.billing_history (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id     uuid REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  amount_cents        integer NOT NULL,
  currency            text NOT NULL DEFAULT 'USD',
  description         text,
  status              text NOT NULL DEFAULT 'completed'
                      CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider            text,
  provider_payment_id text,                                     -- Stripe charge ID / RevenueCat transaction
  invoice_url         text,
  receipt_url         text,
  metadata            jsonb DEFAULT '{}'::jsonb,
  created_at          timestamptz DEFAULT now()
);

-- ── Premium Feature Gates ───────────────────────────────────
-- Master list of all gatable features with their required tier

CREATE TABLE IF NOT EXISTS public.premium_feature_gates (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key     text NOT NULL UNIQUE,
  label           text NOT NULL,                                -- Human-readable name
  description     text,
  required_tier   integer NOT NULL DEFAULT 1,                   -- Minimum plan tier (0=free, 1=premium, 2=elite)
  category        text DEFAULT 'general'
                  CHECK (category IN ('general', 'templates', 'ai', 'gifts', 'storage', 'social', 'customization')),
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON public.billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_created_at ON public.billing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_premium_entitlements_plan_id ON public.premium_entitlements(plan_id);
CREATE INDEX IF NOT EXISTS idx_premium_entitlements_feature_key ON public.premium_entitlements(feature_key);
CREATE INDEX IF NOT EXISTS idx_premium_feature_gates_feature_key ON public.premium_feature_gates(feature_key);
CREATE INDEX IF NOT EXISTS idx_premium_feature_gates_tier ON public.premium_feature_gates(required_tier);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_feature_gates ENABLE ROW LEVEL SECURITY;

-- Plans: readable by everyone
CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (true);

-- User subscriptions: users can view their own
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Entitlements: readable by everyone (just a config table)
CREATE POLICY "Anyone can view entitlements"
  ON public.premium_entitlements FOR SELECT
  USING (true);

-- Billing history: users can view their own
CREATE POLICY "Users can view own billing history"
  ON public.billing_history FOR SELECT
  USING (auth.uid() = user_id);

-- Feature gates: readable by everyone (config table)
CREATE POLICY "Anyone can view feature gates"
  ON public.premium_feature_gates FOR SELECT
  USING (true);

-- ============================================================
-- Seed: Subscription Plans
-- ============================================================

INSERT INTO public.subscription_plans (name, slug, description, price_cents, annual_price_cents, tier, badge_icon, badge_color, features, limits, sort_order, store_product_id_monthly, store_product_id_annual) VALUES
(
  'Free',
  'free',
  'Everything you need to honor and remember loved ones',
  0,
  0,
  0,
  'heart',
  '#6B7280',
  '["memorials", "tributes", "basic_gifts", "basic_templates", "points", "streaks", "5_vault_items", "1_living_tribute"]'::jsonb,
  '{"vault_items": 5, "living_tributes": 1, "share_cards_per_month": 3, "ai_generations_per_month": 2}'::jsonb,
  0,
  NULL,
  NULL
),
(
  'Foreverr Premium',
  'premium',
  'Unlock premium templates, AI features, and unlimited access',
  999,
  7999,
  1,
  'diamond',
  '#7C3AED',
  '["all_free_features", "premium_templates", "premium_gifts", "animated_cards", "ad_free", "custom_themes", "unlimited_vault", "unlimited_living_tributes", "ai_voice", "ai_photo_restore", "ai_memorial_video", "priority_support", "points_1_5x"]'::jsonb,
  '{"vault_items": -1, "living_tributes": -1, "share_cards_per_month": -1, "ai_generations_per_month": 50}'::jsonb,
  1,
  'foreverr_premium_monthly',
  'foreverr_premium_annual'
),
(
  'Foreverr Elite',
  'elite',
  'The ultimate experience with exclusive perks and family plans',
  1999,
  15999,
  2,
  'star',
  '#D97706',
  '["all_premium_features", "physical_gifts", "family_plan_5", "branded_cards", "vip_events", "priority_celebrity_requests", "custom_domains", "white_label_exports", "dedicated_support", "points_2x"]'::jsonb,
  '{"vault_items": -1, "living_tributes": -1, "share_cards_per_month": -1, "ai_generations_per_month": -1, "family_members": 5}'::jsonb,
  2,
  'foreverr_elite_monthly',
  'foreverr_elite_annual'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed: Premium Feature Gates
-- ============================================================

INSERT INTO public.premium_feature_gates (feature_key, label, description, required_tier, category) VALUES
-- Templates & Customization (tier 1 = Premium)
('premium_templates',       'Premium Templates',           'Unlock Gold, Rose, Ocean and more card templates',       1, 'templates'),
('animated_cards',          'Animated Cards',              'Create animated share cards with motion effects',         1, 'templates'),
('custom_themes',           'Custom Themes',               'Personalize your memorial and tribute pages',             1, 'customization'),
('branded_cards',           'Branded Cards',               'Custom branded share cards with your own logo',           2, 'customization'),
('white_label_exports',    'White-Label Exports',          'Export content without Foreverr branding',                2, 'customization'),

-- AI Features (tier 1 = Premium)
('ai_voice',               'AI Voice Cloning',            'Generate voice messages using AI voice synthesis',         1, 'ai'),
('ai_photo_restore',       'AI Photo Restoration',        'Restore and enhance old photos using AI',                 1, 'ai'),
('ai_memorial_video',      'AI Memorial Video',           'Auto-generate tribute videos from photos and text',       1, 'ai'),
('unlimited_ai',           'Unlimited AI Generations',    'No monthly limit on AI-powered features',                 2, 'ai'),

-- Gifts (tier 1 = Premium)
('premium_gifts',          'Premium Digital Gifts',       'Access exclusive premium gift catalog items',              1, 'gifts'),
('physical_gifts',         'Physical Gifts',              'Send real flowers, cards, and keepsakes',                  2, 'gifts'),

-- Storage (tier 1 = Premium)
('unlimited_vault',        'Unlimited Memory Vault',      'Store unlimited photos, videos, and documents',           1, 'storage'),
('unlimited_living_tributes', 'Unlimited Living Tributes', 'Create unlimited living tribute pages',                  1, 'storage'),
('unlimited_share_cards',  'Unlimited Share Cards',        'Create unlimited announcement and share cards',           1, 'storage'),

-- Social & Events (tier 2 = Elite)
('vip_events',             'VIP Event Hosting',           'Host premium virtual events with advanced features',      2, 'social'),
('priority_celebrity_requests', 'Priority Celebrity Requests', 'Fast-track celebrity memorial requests',             2, 'social'),
('family_plan',            'Family Plan',                 'Share your subscription with up to 5 family members',     2, 'social'),
('custom_domains',         'Custom Domains',              'Use your own domain for legacy profile pages',            2, 'social'),

-- General (tier 1 = Premium)
('ad_free',                'Ad-Free Experience',          'Browse without any advertisements',                       1, 'general'),
('priority_support',       'Priority Support',            'Get faster responses from our support team',              1, 'general'),
('points_multiplier',      'Points Multiplier',           '1.5x-2x legacy points on all actions',                   1, 'general'),
('dedicated_support',      'Dedicated Support',           'Personal support representative',                         2, 'general')

ON CONFLICT (feature_key) DO NOTHING;

-- ============================================================
-- Seed: Premium Entitlements (link plans ↔ features)
-- ============================================================

-- Premium plan entitlements
INSERT INTO public.premium_entitlements (plan_id, feature_key, description)
SELECT sp.id, fg.feature_key, fg.description
FROM public.subscription_plans sp
CROSS JOIN public.premium_feature_gates fg
WHERE sp.slug = 'premium' AND fg.required_tier <= 1
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- Elite plan entitlements (gets everything)
INSERT INTO public.premium_entitlements (plan_id, feature_key, description)
SELECT sp.id, fg.feature_key, fg.description
FROM public.subscription_plans sp
CROSS JOIN public.premium_feature_gates fg
WHERE sp.slug = 'elite'
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- ============================================================
-- Trigger: Auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_subscription_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_subscription_update
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_subscription_updated_at();

CREATE TRIGGER on_subscription_plan_update
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_subscription_updated_at();

-- ============================================================
-- Add premium_tier column to profiles for fast lookups
-- ============================================================

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN premium_tier integer DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ============================================================
-- Function: Sync premium tier to profile on subscription change
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_premium_tier()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET premium_tier = CASE
    WHEN NEW.status IN ('active', 'trialing') THEN (
      SELECT tier FROM public.subscription_plans WHERE id = NEW.plan_id
    )
    ELSE 0
  END
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_change_sync_tier
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_premium_tier();


-- ============================================================
-- 00029_life_timeline_photos.sql
-- ============================================================
-- ============================================================
-- Migration 00029: Life Timeline, Milestones & Photo Face Tagging
-- Captures the complete lifecycle: birth → milestones → present/passing
-- ============================================================

-- ============================================================
-- 1. LIFE MILESTONES — Structured milestone tracking per memorial
-- ============================================================
CREATE TABLE IF NOT EXISTS life_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Milestone details
  milestone_type text NOT NULL CHECK (milestone_type IN (
    'birth','first_steps','first_words','first_day_school','graduation_elementary',
    'graduation_high_school','graduation_college','first_job','promotion','retirement',
    'engagement','wedding','anniversary','first_child','adoption',
    'baptism','bar_mitzvah','confirmation','first_communion',
    'first_trip','milestone_birthday','achievement','award','military_service',
    'homeownership','learned_to_drive','first_pet','custom'
  )),
  title text NOT NULL,
  description text,
  milestone_date date,
  age_at_milestone integer,
  location text,

  -- Media
  photo_url text,
  media_urls text[] DEFAULT '{}',

  -- Metadata
  is_verified boolean DEFAULT false,
  verified_by uuid REFERENCES profiles(id),
  emoji text,
  sort_order integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. LIFE TIMELINE EVENTS — Unified chronological events feed
-- ============================================================
CREATE TABLE IF NOT EXISTS life_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id),

  -- Event type (can be auto-generated from various sources)
  event_type text NOT NULL CHECK (event_type IN (
    'milestone','tribute','photo','memory','achievement',
    'life_event','medical','travel','education','career',
    'relationship','spiritual','hobby','community','custom'
  )),
  source_type text CHECK (source_type IN (
    'manual','auto_milestone','auto_tribute','auto_photo','import','ai_generated'
  )),
  source_id uuid, -- Reference to the original record (milestone_id, tribute_id, etc.)

  -- Content
  title text NOT NULL,
  description text,
  event_date date,
  event_end_date date, -- For multi-day events
  location text,

  -- Media
  photo_url text,
  media_urls text[] DEFAULT '{}',

  -- Display
  icon text DEFAULT 'calendar',
  color text DEFAULT '#8B5CF6',
  is_highlight boolean DEFAULT false,
  is_private boolean DEFAULT false,

  -- Ordering
  sort_date date, -- Computed date for timeline ordering (uses event_date or created_at)

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. MILESTONE TEMPLATES — Pre-defined milestone categories
-- ============================================================
CREATE TABLE IF NOT EXISTS milestone_templates (
  id serial PRIMARY KEY,
  milestone_type text NOT NULL UNIQUE,
  label text NOT NULL,
  emoji text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'childhood','education','career','relationships',
    'family','spiritual','achievements','lifestyle'
  )),
  typical_age_range text, -- e.g. "0-1", "5-6", "18-22"
  description text,
  sort_order integer DEFAULT 0
);

-- ============================================================
-- 4. PHOTO FACE TAGS — Tag people in photos
-- ============================================================
CREATE TABLE IF NOT EXISTS photo_face_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text NOT NULL, -- The photo being tagged
  memorial_id uuid REFERENCES memorials(id) ON DELETE CASCADE,

  -- Who is tagged
  tagged_memorial_id uuid REFERENCES memorials(id) ON DELETE SET NULL,
  tagged_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  tagged_name text, -- Fallback name if no memorial/profile linked

  -- Face location in image (normalized 0-1 coordinates)
  face_x numeric(5,4), -- Center X
  face_y numeric(5,4), -- Center Y
  face_width numeric(5,4),
  face_height numeric(5,4),

  -- Recognition
  confidence numeric(5,4), -- ML confidence score 0-1
  is_verified boolean DEFAULT false, -- User confirmed the tag
  is_auto_detected boolean DEFAULT false, -- Created by ML vs manual

  -- Metadata
  tagged_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 5. FACE EMBEDDINGS — ML face recognition vectors (backend)
-- ============================================================
CREATE TABLE IF NOT EXISTS face_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid REFERENCES memorials(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,

  -- The reference photo for this face
  source_photo_url text NOT NULL,

  -- ML embedding vector (stored as JSON array of floats)
  embedding jsonb NOT NULL,
  embedding_model text DEFAULT 'google_vision_v1',

  -- Quality
  quality_score numeric(5,4) DEFAULT 0,
  is_primary boolean DEFAULT false, -- Primary face for this person

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Either memorial_id or profile_id must be set
  CONSTRAINT face_embeddings_person_check CHECK (
    memorial_id IS NOT NULL OR profile_id IS NOT NULL
  )
);

-- ============================================================
-- 6. AUTO-REMINDER RULES — Smart reminder generation
-- ============================================================
CREATE TABLE IF NOT EXISTS auto_reminder_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memorial_id uuid REFERENCES memorials(id) ON DELETE CASCADE,

  rule_type text NOT NULL CHECK (rule_type IN (
    'birthday','death_anniversary','wedding_anniversary',
    'milestone_birthday','custom_recurring','days_before'
  )),
  title_template text NOT NULL, -- e.g. "{name}'s birthday is tomorrow!"
  days_before integer DEFAULT 1, -- How many days before to remind
  is_recurring boolean DEFAULT true,
  is_enabled boolean DEFAULT true,

  -- For custom recurring
  recurring_month integer, -- 1-12
  recurring_day integer, -- 1-31

  last_triggered_at timestamptz,
  next_trigger_date date,

  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-set sort_date on life_timeline_events
CREATE OR REPLACE FUNCTION set_timeline_sort_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sort_date := COALESCE(NEW.event_date, NEW.created_at::date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_timeline_sort_date
  BEFORE INSERT OR UPDATE ON life_timeline_events
  FOR EACH ROW EXECUTE FUNCTION set_timeline_sort_date();

-- Auto-create timeline event when milestone is created
CREATE OR REPLACE FUNCTION auto_timeline_from_milestone()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO life_timeline_events (
    memorial_id, created_by, event_type, source_type, source_id,
    title, description, event_date, photo_url, media_urls,
    icon, is_highlight
  ) VALUES (
    NEW.memorial_id, NEW.created_by, 'milestone', 'auto_milestone', NEW.id,
    NEW.title, NEW.description, NEW.milestone_date, NEW.photo_url, NEW.media_urls,
    COALESCE(NEW.emoji, 'star'), true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_timeline_from_milestone
  AFTER INSERT ON life_milestones
  FOR EACH ROW EXECUTE FUNCTION auto_timeline_from_milestone();

-- Auto-compute next_trigger_date for auto_reminder_rules
CREATE OR REPLACE FUNCTION compute_next_trigger()
RETURNS TRIGGER AS $$
DECLARE
  base_date date;
BEGIN
  IF NEW.rule_type IN ('birthday','death_anniversary','wedding_anniversary','milestone_birthday') THEN
    -- Calculate from memorial dates
    IF NEW.memorial_id IS NOT NULL THEN
      SELECT
        CASE NEW.rule_type
          WHEN 'birthday' THEN date_of_birth
          WHEN 'death_anniversary' THEN date_of_death
          ELSE date_of_birth
        END INTO base_date
      FROM memorials WHERE id = NEW.memorial_id;

      IF base_date IS NOT NULL THEN
        -- Next occurrence this year or next year
        base_date := make_date(
          EXTRACT(YEAR FROM CURRENT_DATE)::int,
          EXTRACT(MONTH FROM base_date)::int,
          EXTRACT(DAY FROM base_date)::int
        );
        IF base_date < CURRENT_DATE THEN
          base_date := base_date + interval '1 year';
        END IF;
        NEW.next_trigger_date := base_date - (NEW.days_before || ' days')::interval;
      END IF;
    END IF;
  ELSIF NEW.rule_type = 'custom_recurring' AND NEW.recurring_month IS NOT NULL AND NEW.recurring_day IS NOT NULL THEN
    base_date := make_date(
      EXTRACT(YEAR FROM CURRENT_DATE)::int,
      NEW.recurring_month,
      NEW.recurring_day
    );
    IF base_date < CURRENT_DATE THEN
      base_date := base_date + interval '1 year';
    END IF;
    NEW.next_trigger_date := base_date - (NEW.days_before || ' days')::interval;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_next_trigger
  BEFORE INSERT OR UPDATE ON auto_reminder_rules
  FOR EACH ROW EXECUTE FUNCTION compute_next_trigger();

-- ============================================================
-- SEED: Milestone Templates
-- ============================================================
INSERT INTO milestone_templates (milestone_type, label, emoji, category, typical_age_range, description, sort_order) VALUES
  -- Childhood
  ('birth', 'Born', '👶', 'childhood', '0', 'The day it all began', 1),
  ('first_steps', 'First Steps', '🚶', 'childhood', '0-2', 'Those magical first steps', 2),
  ('first_words', 'First Words', '🗣️', 'childhood', '0-2', 'The first time they spoke', 3),
  ('first_day_school', 'First Day of School', '🎒', 'childhood', '4-6', 'A big day for everyone', 4),
  ('first_pet', 'First Pet', '🐾', 'childhood', '3-10', 'Their first furry friend', 5),

  -- Education
  ('graduation_elementary', 'Elementary Graduation', '🎓', 'education', '10-12', 'Moving on up', 10),
  ('graduation_high_school', 'High School Graduation', '🎓', 'education', '17-19', 'A major achievement', 11),
  ('graduation_college', 'College Graduation', '🎓', 'education', '21-25', 'Degree earned', 12),

  -- Career
  ('first_job', 'First Job', '💼', 'career', '16-22', 'Entering the workforce', 20),
  ('promotion', 'Promotion', '📈', 'career', NULL, 'Moving up in their career', 21),
  ('retirement', 'Retirement', '🏖️', 'career', '55-70', 'A well-earned rest', 22),
  ('military_service', 'Military Service', '🎖️', 'career', '18-65', 'Serving their country', 23),

  -- Relationships
  ('engagement', 'Engagement', '💍', 'relationships', NULL, 'They said yes!', 30),
  ('wedding', 'Wedding Day', '💒', 'relationships', NULL, 'The big day', 31),
  ('anniversary', 'Anniversary', '🕊️', 'relationships', NULL, 'Celebrating years together', 32),

  -- Family
  ('first_child', 'First Child Born', '👨‍👩‍👧', 'family', NULL, 'Welcome to parenthood', 40),
  ('adoption', 'Adoption', '❤️', 'family', NULL, 'A family grows with love', 41),

  -- Spiritual
  ('baptism', 'Baptism', '💧', 'spiritual', '0-1', 'A spiritual beginning', 50),
  ('bar_mitzvah', 'Bar/Bat Mitzvah', '✡️', 'spiritual', '12-13', 'Coming of age', 51),
  ('first_communion', 'First Communion', '🕯️', 'spiritual', '7-8', 'A sacred moment', 52),
  ('confirmation', 'Confirmation', '✝️', 'spiritual', '13-16', 'Affirming faith', 53),

  -- Achievements
  ('achievement', 'Achievement', '🏆', 'achievements', NULL, 'Something worth celebrating', 60),
  ('award', 'Award', '🏅', 'achievements', NULL, 'Recognized for excellence', 61),

  -- Lifestyle
  ('learned_to_drive', 'Learned to Drive', '🚗', 'lifestyle', '16-18', 'Freedom on wheels', 70),
  ('homeownership', 'Bought a Home', '🏠', 'lifestyle', NULL, 'Keys to their own place', 71),
  ('first_trip', 'First Big Trip', '✈️', 'lifestyle', NULL, 'Exploring the world', 72),
  ('milestone_birthday', 'Milestone Birthday', '🎂', 'lifestyle', NULL, 'A birthday worth celebrating', 73),
  ('custom', 'Custom Milestone', '⭐', 'lifestyle', NULL, 'A special moment in their story', 99)
ON CONFLICT (milestone_type) DO NOTHING;

-- ============================================================
-- RLS Policies
-- ============================================================

-- life_milestones
ALTER TABLE life_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read milestones"
  ON life_milestones FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create milestones"
  ON life_milestones FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update their milestones"
  ON life_milestones FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete their milestones"
  ON life_milestones FOR DELETE
  USING (auth.uid() = created_by);

-- life_timeline_events
ALTER TABLE life_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public timeline events are readable"
  ON life_timeline_events FOR SELECT
  USING (is_private = false OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create timeline events"
  ON life_timeline_events FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update their timeline events"
  ON life_timeline_events FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete their timeline events"
  ON life_timeline_events FOR DELETE
  USING (auth.uid() = created_by);

-- milestone_templates (public read-only)
ALTER TABLE milestone_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read milestone templates"
  ON milestone_templates FOR SELECT USING (true);

-- photo_face_tags
ALTER TABLE photo_face_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read face tags"
  ON photo_face_tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create face tags"
  ON photo_face_tags FOR INSERT
  WITH CHECK (auth.uid() = tagged_by);

CREATE POLICY "Tag creator can update"
  ON photo_face_tags FOR UPDATE
  USING (auth.uid() = tagged_by);

CREATE POLICY "Tag creator can delete"
  ON photo_face_tags FOR DELETE
  USING (auth.uid() = tagged_by);

-- face_embeddings (admin/system only for writes, restricted reads)
ALTER TABLE face_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage face embeddings"
  ON face_embeddings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read embeddings for their memorials"
  ON face_embeddings FOR SELECT
  USING (
    memorial_id IN (
      SELECT id FROM memorials WHERE created_by = auth.uid()
    )
    OR profile_id = auth.uid()
  );

-- auto_reminder_rules
ALTER TABLE auto_reminder_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminder rules"
  ON auto_reminder_rules FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_life_milestones_memorial ON life_milestones(memorial_id);
CREATE INDEX IF NOT EXISTS idx_life_milestones_type ON life_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_life_milestones_date ON life_milestones(milestone_date);

CREATE INDEX IF NOT EXISTS idx_life_timeline_memorial ON life_timeline_events(memorial_id);
CREATE INDEX IF NOT EXISTS idx_life_timeline_sort_date ON life_timeline_events(sort_date DESC);
CREATE INDEX IF NOT EXISTS idx_life_timeline_event_type ON life_timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_life_timeline_source ON life_timeline_events(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_photo_face_tags_photo ON photo_face_tags(photo_url);
CREATE INDEX IF NOT EXISTS idx_photo_face_tags_memorial ON photo_face_tags(memorial_id);
CREATE INDEX IF NOT EXISTS idx_photo_face_tags_tagged_memorial ON photo_face_tags(tagged_memorial_id);
CREATE INDEX IF NOT EXISTS idx_photo_face_tags_tagged_profile ON photo_face_tags(tagged_profile_id);

CREATE INDEX IF NOT EXISTS idx_face_embeddings_memorial ON face_embeddings(memorial_id);
CREATE INDEX IF NOT EXISTS idx_face_embeddings_profile ON face_embeddings(profile_id);

CREATE INDEX IF NOT EXISTS idx_auto_reminder_rules_user ON auto_reminder_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_reminder_rules_next ON auto_reminder_rules(next_trigger_date) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_auto_reminder_rules_memorial ON auto_reminder_rules(memorial_id);


-- ============================================================
-- 00030_search_notifications_email.sql
-- ============================================================
-- ============================================================
-- Migration 00030: Full-text Search, Push Triggers & Email Log
-- ============================================================

-- ============================================================
-- 1. FULL-TEXT SEARCH — tsvector columns + indexes
-- ============================================================

-- Memorials search
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION memorials_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.first_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.nickname, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.biography, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.place_of_birth, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.place_of_death, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_memorials_search ON memorials;
CREATE TRIGGER trg_memorials_search
  BEFORE INSERT OR UPDATE OF first_name, last_name, nickname, biography, place_of_birth, place_of_death
  ON memorials FOR EACH ROW EXECUTE FUNCTION memorials_search_update();

CREATE INDEX IF NOT EXISTS idx_memorials_search ON memorials USING gin(search_vector);

-- Backfill existing memorials
UPDATE memorials SET search_vector =
  setweight(to_tsvector('english', COALESCE(first_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(last_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(nickname, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(biography, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(place_of_birth, '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(place_of_death, '')), 'D')
WHERE search_vector IS NULL;

-- Tributes search
ALTER TABLE tributes ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION tributes_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tributes_search ON tributes;
CREATE TRIGGER trg_tributes_search
  BEFORE INSERT OR UPDATE OF content
  ON tributes FOR EACH ROW EXECUTE FUNCTION tributes_search_update();

CREATE INDEX IF NOT EXISTS idx_tributes_search ON tributes USING gin(search_vector);

UPDATE tributes SET search_vector = to_tsvector('english', COALESCE(content, ''))
WHERE search_vector IS NULL;

-- Directory listings search
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION directory_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.business_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.business_type, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_directory_search ON directory_listings;
CREATE TRIGGER trg_directory_search
  BEFORE INSERT OR UPDATE OF business_name, description, city, business_type
  ON directory_listings FOR EACH ROW EXECUTE FUNCTION directory_search_update();

CREATE INDEX IF NOT EXISTS idx_directory_search ON directory_listings USING gin(search_vector);

UPDATE directory_listings SET search_vector =
  setweight(to_tsvector('english', COALESCE(business_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(city, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(business_type, '')), 'C')
WHERE search_vector IS NULL;

-- ============================================================
-- 2. PUSH NOTIFICATION TRIGGERS
-- ============================================================

-- Trigger: New tribute → notify memorial creator
CREATE OR REPLACE FUNCTION notify_tribute_created() RETURNS TRIGGER AS $$
DECLARE
  memorial_creator_id uuid;
  memorial_name text;
  author_name text;
BEGIN
  SELECT created_by, CONCAT(first_name, ' ', last_name)
    INTO memorial_creator_id, memorial_name
    FROM memorials WHERE id = NEW.memorial_id;

  SELECT COALESCE(display_name, username, 'Someone')
    INTO author_name
    FROM profiles WHERE id = NEW.author_id;

  -- Don't notify self
  IF memorial_creator_id IS NOT NULL AND memorial_creator_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      memorial_creator_id,
      'tribute',
      'New Tribute',
      author_name || ' left a tribute on ' || memorial_name,
      jsonb_build_object(
        'type', 'tribute',
        'memorial_id', NEW.memorial_id,
        'tribute_id', NEW.id,
        'author_id', NEW.author_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_tribute ON tributes;
CREATE TRIGGER trg_notify_tribute
  AFTER INSERT ON tributes
  FOR EACH ROW EXECUTE FUNCTION notify_tribute_created();

-- Trigger: Gift received → notify recipient
CREATE OR REPLACE FUNCTION notify_gift_received() RETURNS TRIGGER AS $$
DECLARE
  sender_name text;
  gift_name text;
  gift_emoji text;
BEGIN
  SELECT COALESCE(display_name, username, 'Someone')
    INTO sender_name FROM profiles WHERE id = NEW.sender_id;

  SELECT name, icon INTO gift_name, gift_emoji
    FROM gift_catalog WHERE id = NEW.gift_id;

  IF NEW.recipient_id IS NOT NULL AND NEW.recipient_id != NEW.sender_id THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.recipient_id,
      'gift',
      COALESCE(gift_emoji, '🌸') || ' Gift Received!',
      sender_name || ' sent you ' || COALESCE(gift_name, 'a gift'),
      jsonb_build_object(
        'type', 'gift',
        'gift_transaction_id', NEW.id,
        'sender_id', NEW.sender_id,
        'gift_name', COALESCE(gift_name, 'gift')
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_gift ON gift_transactions;
CREATE TRIGGER trg_notify_gift
  AFTER INSERT ON gift_transactions
  FOR EACH ROW EXECUTE FUNCTION notify_gift_received();

-- Trigger: New follower → notify
CREATE OR REPLACE FUNCTION notify_new_follower() RETURNS TRIGGER AS $$
DECLARE
  follower_name text;
BEGIN
  SELECT COALESCE(display_name, username, 'Someone')
    INTO follower_name FROM profiles WHERE id = NEW.follower_id;

  IF NEW.following_id != NEW.follower_id THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.following_id,
      'follow',
      'New Follower',
      follower_name || ' started following you',
      jsonb_build_object(
        'type', 'follow',
        'follower_id', NEW.follower_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_follow ON user_follows;
CREATE TRIGGER trg_notify_follow
  AFTER INSERT ON user_follows
  FOR EACH ROW EXECUTE FUNCTION notify_new_follower();

-- Trigger: Milestone added → notify memorial followers
CREATE OR REPLACE FUNCTION notify_milestone_added() RETURNS TRIGGER AS $$
DECLARE
  memorial_name text;
  creator_name text;
BEGIN
  SELECT CONCAT(first_name, ' ', last_name) INTO memorial_name
    FROM memorials WHERE id = NEW.memorial_id;

  SELECT COALESCE(display_name, username, 'Someone')
    INTO creator_name FROM profiles WHERE id = NEW.created_by;

  -- Notify memorial creator if different from milestone creator
  DECLARE memorial_owner uuid;
  BEGIN
    SELECT created_by INTO memorial_owner FROM memorials WHERE id = NEW.memorial_id;
    IF memorial_owner IS NOT NULL AND memorial_owner != NEW.created_by THEN
      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES (
        memorial_owner,
        'milestone',
        'New Milestone Added',
        creator_name || ' added "' || NEW.title || '" to ' || memorial_name || '''s timeline',
        jsonb_build_object(
          'type', 'memorial',
          'memorial_id', NEW.memorial_id,
          'milestone_id', NEW.id
        )
      );
    END IF;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_milestone ON life_milestones;
CREATE TRIGGER trg_notify_milestone
  AFTER INSERT ON life_milestones
  FOR EACH ROW EXECUTE FUNCTION notify_milestone_added();

-- ============================================================
-- 3. EMAIL LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  email_type text NOT NULL,
  subject text,
  status text DEFAULT 'sent' CHECK (status IN ('sent','failed','bounced')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read email log"
  ON email_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_log(recipient);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON email_log(email_type);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON email_log(created_at DESC);

-- ============================================================
-- 4. SEARCH FUNCTION — Universal search across all content
-- ============================================================
CREATE OR REPLACE FUNCTION search_all(query text, result_limit int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  result_type text,
  title text,
  subtitle text,
  image_url text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    -- Memorials
    SELECT
      m.id,
      'memorial'::text as result_type,
      CONCAT(m.first_name, ' ', m.last_name) as title,
      COALESCE(m.place_of_birth, '') as subtitle,
      m.cover_photo_url as image_url,
      ts_rank(m.search_vector, websearch_to_tsquery('english', query)) as rank
    FROM memorials m
    WHERE m.search_vector @@ websearch_to_tsquery('english', query)
      AND m.status = 'active'

    UNION ALL

    -- Directory Listings
    SELECT
      d.id,
      'directory'::text,
      d.business_name,
      CONCAT(d.city, ', ', COALESCE(d.state, '')),
      d.photo_url,
      ts_rank(d.search_vector, websearch_to_tsquery('english', query))
    FROM directory_listings d
    WHERE d.search_vector @@ websearch_to_tsquery('english', query)
      AND d.status = 'active'
  ) results
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;


-- ============================================================
-- 00031_celebrity_profiles.sql
-- ============================================================
-- ============================================================
-- Migration 00031: Add lifecycle_stage column + Celebrity Profiles
--
-- This migration:
-- 1. Adds lifecycle_stage column to memorials (if not exists)
-- 2. Adds biography_is_ai_generated column (if not exists)
-- 3. Adds place_of_birth / place_of_death columns (if not exists)
-- 4. Inserts 7 diverse celebrity/demo profiles
--
-- Safe to run multiple times (uses IF NOT EXISTS + ON CONFLICT DO NOTHING)
-- ============================================================

-- Step 1: Add lifecycle_stage column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memorials' AND column_name = 'lifecycle_stage'
  ) THEN
    ALTER TABLE memorials ADD COLUMN lifecycle_stage text DEFAULT 'remember';
  END IF;
END $$;

-- Step 2: Add biography_is_ai_generated column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memorials' AND column_name = 'biography_is_ai_generated'
  ) THEN
    ALTER TABLE memorials ADD COLUMN biography_is_ai_generated boolean DEFAULT false;
  END IF;
END $$;

-- Step 3: Add place columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memorials' AND column_name = 'place_of_birth'
  ) THEN
    ALTER TABLE memorials ADD COLUMN place_of_birth text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memorials' AND column_name = 'place_of_death'
  ) THEN
    ALTER TABLE memorials ADD COLUMN place_of_death text;
  END IF;
END $$;

-- Step 4: Insert celebrity profiles (skip if they already exist)

-- 1. Chadwick Boseman — Memorial (remember)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth, date_of_death,
  place_of_birth, place_of_death,
  biography, obituary,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000001-0000-0000-0000-000000000001',
  'Chadwick', 'Boseman',
  '1976-11-29', '2020-08-28',
  'Anderson, South Carolina', 'Los Angeles, California',
  'Chadwick Aaron Boseman was an American actor and playwright who rose to international fame for his portrayal of T''Challa / Black Panther in the Marvel Cinematic Universe. A graduate of Howard University, Boseman brought dignity and depth to every role, from Jackie Robinson in "42" to James Brown in "Get on Up" to Thurgood Marshall in "Marshall." His quiet four-year battle with colon cancer, during which he continued to work and inspire millions, revealed a strength that transcended the screen.',
  'Chadwick Boseman, beloved actor and cultural icon, passed away on August 28, 2020, at the age of 43 after a courageous battle with colon cancer. He is remembered for his transformative performances, his commitment to representation, and the joy he brought to millions worldwide. Wakanda Forever.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop',
  'remember', 'chadwick-boseman', 'public', 'active',
  1250, 340
) ON CONFLICT (id) DO NOTHING;

-- 2. Kobe Bryant — Memorial (remember)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth, date_of_death,
  place_of_birth, place_of_death,
  biography, obituary,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000002-0000-0000-0000-000000000002',
  'Kobe', 'Bryant',
  '1978-08-23', '2020-01-26',
  'Philadelphia, Pennsylvania', 'Calabasas, California',
  'Kobe Bean Bryant was an American professional basketball player who spent his entire 20-year NBA career with the Los Angeles Lakers. A five-time NBA champion, two-time Finals MVP, and 18-time All-Star, Bryant''s relentless work ethic and competitive fire earned him the nickname "Mamba." After retiring in 2016, he became an Oscar-winning filmmaker, a devoted father, and a mentor to the next generation of athletes.',
  'Kobe Bryant, legendary basketball player and devoted father, was tragically taken from us on January 26, 2020, alongside his daughter Gianna and seven others. His Mamba Mentality, his dedication to family, and his passion for storytelling left an indelible mark on the world.',
  'https://images.unsplash.com/photo-1546961342-ea5f71b193f3?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1200&h=600&fit=crop',
  'remember', 'kobe-bryant', 'public', 'active',
  2100, 890
) ON CONFLICT (id) DO NOTHING;

-- 3. Queen Elizabeth II — Legacy
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth, date_of_death,
  place_of_birth, place_of_death,
  biography, obituary,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000003-0000-0000-0000-000000000003',
  'Queen Elizabeth', 'II',
  '1926-04-21', '2022-09-08',
  'Mayfair, London', 'Balmoral Castle, Scotland',
  'Queen Elizabeth II was the longest-reigning British monarch, serving as Queen of the United Kingdom and other Commonwealth realms from 1952 until her death in 2022. Over her 70-year reign, she witnessed enormous social change, guided the monarchy through periods of both celebration and crisis, and became a symbol of stability and duty.',
  'Her Majesty Queen Elizabeth II passed peacefully at Balmoral Castle on September 8, 2022, at the age of 96. The longest-reigning monarch in British history, she served with unwavering dedication for over seven decades.',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=600&fit=crop',
  'legacy', 'queen-elizabeth-ii', 'public', 'active',
  3400, 1200
) ON CONFLICT (id) DO NOTHING;

-- 4. Sarah & James Chen — Wedding (celebrate)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth,
  place_of_birth,
  biography,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000004-0000-0000-0000-000000000004',
  'Sarah & James', 'Chen',
  '2024-06-15',
  'Napa Valley, California',
  'Sarah and James first met during a study abroad program in Florence, Italy, where a shared love of art and adventure sparked a connection that would last a lifetime. After five years together exploring the world from Tokyo to Patagonia, James proposed at the same cafe where they first shared a cappuccino. Their wedding celebration in Napa Valley brought together 150 of their closest friends and family.',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=600&fit=crop',
  'celebrate', 'sarah-james-chen-wedding', 'public', 'active',
  89, 45
) ON CONFLICT (id) DO NOTHING;

-- 5. Baby Aria Rodriguez — Birth (celebrate)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth,
  place_of_birth,
  biography,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000005-0000-0000-0000-000000000005',
  'Baby Aria', 'Rodriguez',
  '2024-12-03',
  'Austin, Texas',
  'Aria Sofia Rodriguez arrived on December 3, 2024, at 7:42 AM, weighing 7 lbs 3 oz. She has her mother Elena''s brown eyes and her father Miguel''s curious expression. The Rodriguez family is overjoyed to welcome this little miracle into the world. Big brother Lucas, age 4, has already declared himself her official protector.',
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=600&fit=crop',
  'celebrate', 'baby-aria-rodriguez', 'public', 'active',
  56, 28
) ON CONFLICT (id) DO NOTHING;

-- 6. Coach David Thompson — Retirement (celebrate)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth,
  place_of_birth,
  biography,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000006-0000-0000-0000-000000000006',
  'Coach David', 'Thompson',
  '1959-03-18',
  'Portland, Oregon',
  'After 35 remarkable years coaching high school basketball at Lincoln High, Coach David Thompson is hanging up his whistle. With a career record of 687-234, 12 state championships, and hundreds of student-athletes who went on to play college ball, Coach T''s impact extends far beyond the court. His philosophy of "character first, championships second" shaped generations.',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1461896836934-bd45ba04a950?w=1200&h=600&fit=crop',
  'celebrate', 'coach-david-thompson-retirement', 'public', 'active',
  234, 156
) ON CONFLICT (id) DO NOTHING;

-- 7. Grandma Rose Williams — 90th Birthday (celebrate)
INSERT INTO memorials (
  id, first_name, last_name, date_of_birth,
  place_of_birth,
  biography,
  profile_photo_url, cover_photo_url,
  lifecycle_stage, slug, privacy, status,
  follower_count, tribute_count
) VALUES (
  'c0000007-0000-0000-0000-000000000007',
  'Grandma Rose', 'Williams',
  '1935-07-22',
  'Savannah, Georgia',
  'Rose Marie Williams, affectionately known as Grandma Rose, is celebrating 90 incredible years of life. Born in Savannah, Georgia, Rose was a trailblazing elementary school teacher for 40 years, a church choir director, and the undisputed queen of peach cobbler. Mother of five, grandmother of twelve, and great-grandmother of eight.',
  'https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=600&fit=crop',
  'celebrate', 'grandma-rose-williams-90th', 'public', 'active',
  178, 92
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 00032_proximity_support.sql
-- ============================================================
-- Migration 00032: Proximity Support
-- Adds location columns to events and profiles for proximity-based feed

-- ─── 1. Add lat/long to events ────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'latitude') THEN
    ALTER TABLE events ADD COLUMN latitude double precision;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'longitude') THEN
    ALTER TABLE events ADD COLUMN longitude double precision;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_location ON events USING gist (point(longitude, latitude));

-- ─── 2. Add location to user profiles ─────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
    ALTER TABLE profiles ADD COLUMN city text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'region') THEN
    ALTER TABLE profiles ADD COLUMN region text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
    ALTER TABLE profiles ADD COLUMN country text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'latitude') THEN
    ALTER TABLE profiles ADD COLUMN latitude double precision;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'longitude') THEN
    ALTER TABLE profiles ADD COLUMN longitude double precision;
  END IF;
END $$;

-- ─── 3. Nearby content RPC ────────────────────────────────────────────────────
-- Returns events, marketplace listings, and directory businesses within a radius
-- Uses point-based distance (approx km via 111.045 km/degree)
CREATE OR REPLACE FUNCTION nearby_content(
  user_lat double precision,
  user_lon double precision,
  radius_km double precision DEFAULT 50,
  content_limit integer DEFAULT 20
) RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'events', COALESCE((
      SELECT jsonb_agg(row_to_json(e))
      FROM (
        SELECT id, title, description, type, location, start_date, end_date, status,
          latitude, longitude, memorial_id,
          round(((point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045)::numeric, 1) AS distance_km
        FROM events
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          AND status IN ('upcoming', 'ongoing')
          AND (point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045 <= radius_km
        ORDER BY (point(longitude, latitude) <-> point(user_lon, user_lat))
        LIMIT content_limit
      ) e
    ), '[]'::jsonb),
    'marketplace', COALESCE((
      SELECT jsonb_agg(row_to_json(m))
      FROM (
        SELECT id, title, description, price_cents, listing_type, location,
          latitude, longitude, images, category_id,
          round(((point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045)::numeric, 1) AS distance_km
        FROM marketplace_listings
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          AND status = 'active'
          AND (point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045 <= radius_km
        ORDER BY (point(longitude, latitude) <-> point(user_lon, user_lat))
        LIMIT content_limit
      ) m
    ), '[]'::jsonb),
    'directory', COALESCE((
      SELECT jsonb_agg(row_to_json(d))
      FROM (
        SELECT id, business_name, business_type, description, city, state,
          latitude, longitude, rating_avg, rating_count, is_verified,
          round(((point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045)::numeric, 1) AS distance_km
        FROM directory_listings
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          AND status = 'active'
          AND (point(longitude, latitude) <-> point(user_lon, user_lat)) * 111.045 <= radius_km
        ORDER BY (point(longitude, latitude) <-> point(user_lon, user_lat))
        LIMIT content_limit
      ) d
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;


-- ============================================================
-- 00033_profiles_role_donation_rpc.sql
-- ============================================================
-- =============================================
-- Migration 00033: Add profiles.role column + atomic donation RPC
-- =============================================

-- ── 1. Add role column to profiles ──
-- Referenced by RLS policies in migrations 00026, 00029, 00030
-- and by admin-directory-import + duplicate-detection edge functions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'moderator'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role);

-- ── 2. Atomic donation increment RPC ──
-- Prevents race conditions when multiple donations arrive concurrently.
-- Uses UPDATE ... SET col = col + N (atomic in Postgres) instead of
-- read-modify-write from the client.
CREATE OR REPLACE FUNCTION public.increment_fundraiser_donation(
  p_fundraiser_id uuid,
  p_amount_cents integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Validate input
  IF p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'Donation amount must be positive';
  END IF;

  -- Atomic increment — no race condition possible
  UPDATE public.fundraise_campaigns_v2
  SET
    raised_cents = raised_cents + p_amount_cents,
    donor_count  = donor_count + 1,
    updated_at   = now()
  WHERE id = p_fundraiser_id
    AND status = 'active'
  RETURNING to_jsonb(fundraise_campaigns_v2.*) INTO v_result;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Campaign not found or not active';
  END IF;

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_fundraiser_donation(uuid, integer) TO authenticated;


-- ============================================================
-- 00034_enrich_seed_content.sql
-- ============================================================
-- ============================================================================
-- Migration 00034: Enrich Seed Content
-- Adds milestones, timeline events, and varied-type tributes to the 5 sample
-- memorials created in migration 00013, making profiles feel fully populated.
-- ============================================================================

-- ============================================================================
-- 1. LIFE MILESTONES — across all 5 memorials
-- ============================================================================

INSERT INTO life_milestones (id, memorial_id, created_by, milestone_type, title, description, milestone_date, age_at_milestone, location, emoji, sort_order) VALUES

-- Eleanor Thompson milestones
('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'birth', 'Born in Burlington, Vermont', 'Eleanor Grace was born on a snowy March morning to loving parents.', '1938-03-15', 0, 'Burlington, VT', '👶', 1),
('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'graduation_college', 'Graduated from UVM', 'Earned her teaching degree from the University of Vermont with honors.', '1960-06-15', 22, 'Burlington, VT', '🎓', 2),
('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'wedding', 'Married Robert Thompson', 'A beautiful summer wedding at the Burlington Community Church.', '1961-08-12', 23, 'Burlington, VT', '💒', 3),
('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'first_child', 'First Child Born', 'Welcomed their first son, Robert Jr., into the world.', '1963-04-10', 25, 'Burlington, VT', '👨‍👩‍👧', 4),
('60000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'retirement', 'Retired After 40 Years of Teaching', 'Retired from Maple Street Elementary after four decades of inspiring young minds.', '2000-06-01', 62, 'Burlington, VT', '🏖️', 5),

-- Marcus Rivera milestones
('60000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'birth', 'Born on the Fourth of July', 'Marcus came into the world on Independence Day — fitting for a future hero.', '1985-07-04', 0, 'San Antonio, TX', '👶', 1),
('60000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'graduation_high_school', 'Graduated Alamo Heights High', 'Class president and varsity soccer captain.', '2003-06-01', 17, 'San Antonio, TX', '🎓', 2),
('60000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'first_job', 'Joined Fire Station 7', 'Became a firefighter at Station 7, fulfilling a childhood dream.', '2012-03-01', 26, 'Downtown', '💼', 3),
('60000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'wedding', 'Married Maria Gonzalez', 'A joyful celebration with the entire fire station in attendance.', '2014-10-18', 29, 'San Antonio, TX', '💒', 4),
('60000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'promotion', 'Promoted to Captain', 'Youngest captain in Station 7 history at age 35.', '2020-01-15', 34, 'Station 7', '📈', 5),

-- Dr. Amara Okafor milestones
('60000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'birth', 'Born in Lagos, Nigeria', 'Amara was born into a family that valued education above all else.', '1950-12-01', 0, 'Lagos, Nigeria', '👶', 1),
('60000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'graduation_college', 'Medical School Graduation', 'Graduated top of her class from Howard University College of Medicine.', '1978-05-20', 27, 'Washington, D.C.', '🎓', 2),
('60000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'achievement', 'Opened the Community Free Clinic', 'Founded a free clinic serving 10,000+ patients in its first decade.', '1990-03-15', 39, 'City General', '🏆', 3),
('60000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'award', 'Physician of the Year Award', 'Recognized for outstanding service and community impact.', '2005-11-10', 54, 'City General Hospital', '🏅', 4),

-- Jimmy Chen milestones
('60000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'birth', 'Born in Millbrook', 'James "Jimmy" Chen arrived with his parents'' love of music already in his DNA.', '2005-09-20', 0, 'Millbrook', '👶', 1),
('60000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'achievement', 'First Guitar Performance', 'Played his first public performance at the school talent show at age 10.', '2015-12-05', 10, 'Millbrook Elementary', '🏆', 2),
('60000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'achievement', 'YouTube Milestone — 10K Views', 'His acoustic cover of a classic ballad went viral in the local community.', '2022-03-15', 16, 'Home Studio', '🏆', 3),

-- Rose Williams milestones
('60000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'birth', 'Born During the Great Depression', 'Rose Marie was born into tough times that forged an even tougher spirit.', '1932-05-08', 0, 'Brooklyn, NY', '👶', 1),
('60000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'wedding', 'Married Harold Williams', 'Harold returned from Europe and married Rose in a simple, beautiful ceremony.', '1946-06-22', 14, 'Brooklyn, NY', '💒', 2),
('60000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'homeownership', 'Bought Their First Home', 'Rose and Harold saved for years to buy their first home on Oak Street.', '1952-09-01', 20, 'Oak Street', '🏠', 3),
('60000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'milestone_birthday', '90th Birthday Celebration', 'The whole family gathered — all five children, twelve grandkids, and eight great-grands.', '2022-05-08', 90, 'Family Home', '🎂', 4)

ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 2. LIFE TIMELINE EVENTS — varied event types
-- ============================================================================

INSERT INTO life_timeline_events (id, memorial_id, created_by, event_type, source_type, title, description, event_date, location, icon, color, is_highlight) VALUES

-- Eleanor timeline
('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'career', 'manual', 'Started Teaching at Maple Street Elementary', 'Eleanor began what would become a 40-year career shaping young minds.', '1960-09-01', 'Burlington, VT', 'school', '#4A2D7A', true),
('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'community', 'manual', 'Founded the Neighborhood Garden Club', 'Eleanor started a garden club that brought neighbors together for 25+ years.', '1975-04-15', 'Burlington, VT', 'leaf', '#22c55e', false),
('70000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 'hobby', 'manual', 'Won the County Cookie Bake-Off', 'Her chocolate chip cookies were famous, and she finally entered the competition.', '1985-10-20', 'Chittenden County Fair', 'restaurant', '#f59e0b', false),

-- Marcus timeline
('70000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'achievement', 'manual', 'Commendation for Bravery', 'Received a commendation for rescuing a family from a collapsed building.', '2018-07-22', 'City Hall', 'medal', '#d97706', true),
('70000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'community', 'manual', 'Started Youth Soccer Program', 'Marcus launched a free soccer program for underprivileged kids in his district.', '2019-03-01', 'Community Park', 'football', '#22c55e', false),
('70000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'relationship', 'manual', 'Welcomed Daughter Sofia', 'Marcus became a dad for the first time — and couldn''t stop smiling for weeks.', '2016-05-12', 'General Hospital', 'heart', '#ef4444', true),

-- Dr. Okafor timeline
('70000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'travel', 'manual', 'Immigrated to the United States', 'Left Lagos with $200 and a dream of becoming a doctor.', '1972-08-15', 'New York, NY', 'airplane', '#3b82f6', true),
('70000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'community', 'manual', 'Organized First Community Health Fair', 'Amara brought free health screenings to 500+ community members.', '1995-09-10', 'Community Center', 'medkit', '#22c55e', false),
('70000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'education', 'manual', 'Secretly Funded 3 Students Through College', 'Quietly paid tuition for three young women pursuing science careers.', '2000-06-01', NULL, 'school', '#7C3AED', true),

-- Jimmy timeline
('70000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'hobby', 'manual', 'First Coffee Shop Acoustic Set', 'Jimmy started playing Friday night sets at the local coffee shop at age 14.', '2019-11-08', 'Bean & Brew Coffee', 'musical-notes', '#f59e0b', true),
('70000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'education', 'manual', 'Made Honor Roll Every Semester', 'Straight-A student while juggling music commitments and volunteering.', '2022-06-15', 'Millbrook High School', 'school', '#4A2D7A', false),
('70000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'community', 'manual', 'Stood Up Against Bullying', 'Jimmy organized a kindness campaign at school that changed the culture.', '2021-02-01', 'Millbrook High School', 'shield', '#22c55e', false),

-- Rose timeline
('70000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'career', 'manual', 'Factory Worker During WWII', 'At just 12, Rose worked in a munitions factory to support the war effort.', '1944-06-01', 'Brooklyn, NY', 'hammer', '#6b7280', true),
('70000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'hobby', 'manual', 'Knitted Blankets for Every Family Baby', 'Over 40 handmade blankets — one for every child born into the Williams family.', '1950-01-01', 'Family Home', 'heart', '#ec4899', false),
('70000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'relationship', 'manual', 'Celebrated 50th Wedding Anniversary', 'Rose and Harold threw a legendary party for their golden anniversary.', '1996-06-22', 'Family Home', 'heart-circle', '#ef4444', true)

ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 3. ADDITIONAL TRIBUTES — varied types (poem, quote, memory)
-- ============================================================================

INSERT INTO tributes (id, memorial_id, author_id, type, content, ribbon_type, ribbon_count, like_count, comment_count, created_at) VALUES

-- Eleanor — poems and memories
('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'poem',
 'In a garden where the roses grow,
Where autumn leaves dance soft and slow,
There lives a warmth no cold can chill —
The love of one who taught us still.
Her cookies cooled on windowsills,
Her laughter echoed over hills,
And though she''s gone beyond our sight,
She planted seeds of endless light.',
 'gold', 3, 11, 3, NOW() - INTERVAL '28 days'),

('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 'memory',
 'I remember the day Eleanor helped me plant my first tomato garden. She was so patient, showing me how deep to dig, how much water to use. She said, "Gardens teach you that beautiful things take time." I think about that every spring when I plant my tomatoes.',
 'silver', 1, 5, 1, NOW() - INTERVAL '22 days'),

-- Marcus — quote and memory
('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'quote',
 '"Courage is not the absence of fear, but the judgment that something else is more important than fear." — This was pinned to Marcus''s locker at Station 7. He lived by these words every single day.',
 'gold', 3, 18, 4, NOW() - INTERVAL '12 days'),

('20000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000013', 'memory',
 'Marcus brought Diego to the station every Saturday morning. He''d put the little guy in an oversized helmet and let him sit in the truck. Diego would wave at everyone like he was in a parade. Marcus''s face lit up every time. That''s the Marcus I want to remember — the dad who made his son feel like a superhero.',
 'purple', 2, 14, 3, NOW() - INTERVAL '9 days'),

-- Dr. Okafor — poem and quote
('20000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', 'poem',
 'She crossed an ocean with a dream,
With hands that healed and eyes that gleamed.
For every life she chose to mend,
She wasn''t just a doctor — friend.
The clinic stands, her legacy bright,
A beacon born from borrowed light.
Two hundred dollars, boundless soul —
She made the broken somehow whole.',
 'eternal', 5, 22, 6, NOW() - INTERVAL '52 days'),

('20000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', 'quote',
 '"When you heal one person, you heal a family. When you heal a family, you heal a community." — Dr. Amara Okafor. These words guided her entire career and continue to inspire everyone at the clinic.',
 'gold', 3, 15, 3, NOW() - INTERVAL '48 days'),

-- Jimmy — poem and memory
('20000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'poem',
 'The strings are quiet now, but still
His melodies hang in the air,
On Friday nights the coffee spills
Into an empty corner chair.
He played for those who needed grace,
A seventeen-year-old with an old soul''s song,
And though we''ll never see his face,
His music carries us along.',
 'crystal', 4, 26, 7, NOW() - INTERVAL '82 days'),

('20000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000013', 'memory',
 'Jimmy learned to play "Happy Birthday" on piano when he was 4 so he could surprise me. He got one note wrong every time but refused to let me help. He said, "It has to come from ME, Mom." That stubborn sweetness was Jimmy in a nutshell. Now Lily plays it for me on his birthday, with the same wrong note. On purpose.',
 'eternal', 5, 35, 9, NOW() - INTERVAL '78 days'),

-- Rose — quote and memory
('20000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000011', 'quote',
 '"Life doesn''t get easier — you just get tougher." — Rose Williams. She said this to every grandchild on their 18th birthday, right before handing them a card with $50 and the recipe for her mashed potatoes.',
 'gold', 3, 12, 3, NOW() - INTERVAL '4 days'),

('20000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000013', 'memory',
 'I was 8 when Grandma Rose taught me her secret lemonade recipe. She made me promise never to tell anyone. Twenty-seven years later, I still haven''t. But I make it every Fourth of July, and when my kids ask why it tastes different from store-bought, I just say, "It has a secret ingredient: love." That''s what Rose would have said.',
 'purple', 2, 10, 2, NOW() - INTERVAL '1 day'),

('20000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', 'poem',
 'She fed us all from a kitchen small,
With recipes no book contained,
Her Sunday table, wide and tall,
Where love was served and joy remained.
Through wars and loss she stood unbowed,
Through ninety winters, warm and proud,
And knitted into every seam
The fabric of a family''s dream.',
 'gold', 3, 14, 4, NOW() - INTERVAL '2 days')

ON CONFLICT (id) DO NOTHING;

