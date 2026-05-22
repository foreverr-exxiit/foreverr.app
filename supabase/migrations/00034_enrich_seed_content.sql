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
