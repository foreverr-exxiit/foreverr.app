-- ============================================================================
-- Phase 4B: Seed Sample Content for Content-First UX
-- Populates the app with realistic, emotionally compelling sample data
-- so the app feels alive from first launch for guest users.
-- ============================================================================

-- Create a system user for sample content
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system@foreverr.app',
  '{"username": "foreverr_team", "display_name": "Foreverr Team"}',
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

INSERT INTO memorial_hosts (memorial_id, user_id, role) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'owner')
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
