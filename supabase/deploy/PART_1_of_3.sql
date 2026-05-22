-- PART 1 of 3: Cleanup + Migrations 00013-00018

DELETE FROM reactions WHERE user_id IN (
  '00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000013'
);
DELETE FROM tributes WHERE memorial_id IN (
  '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005'
);
DELETE FROM memorial_hosts WHERE memorial_id IN (
  '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005'
);
DELETE FROM memorials WHERE id IN (
  '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005'
);
DELETE FROM profiles WHERE id IN (
  '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000013'
);


-- === 00013_seed_sample_content.sql ===

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
  user_id::uuid,
  'tribute',
  tribute_id::uuid,
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
  'vigil',
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

-- === 00014_celebrity_content.sql ===

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

-- === 00015_vault_enhancements.sql ===

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

-- === 00016_advanced_social.sql ===

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

-- === 00017_sharing_deep_links.sql ===

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

-- === 00018_living_tributes.sql ===

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
