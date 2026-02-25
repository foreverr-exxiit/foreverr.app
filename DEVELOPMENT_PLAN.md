# FOREVERR by EXXiiT — Full Development Plan

## Table of Contents

1. Technology Stack & Architecture
2. Monorepo Structure
3. Supabase Database Schema
4. Navigation Architecture
5. Phase 1: MVP (Weeks 1-12)
6. Phase 2: Communication, Events & AI (Weeks 13-24)
7. Phase 3: Marketplace, Directory & Advanced Features (Weeks 25-40)
8. Phase 4: Immersive Experiences & Brand Expansion (Weeks 41-60+)
9. Fresh Ideas & Strategic Recommendations

---

## 1. Technology Stack & Architecture

### Core Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Expo SDK 52+ with Expo Router | File-based routing, single codebase for iOS + Android + Web, OTA updates |
| **Language** | TypeScript (strict mode) | Type safety across entire codebase, auto-generated Supabase types |
| **Backend** | Supabase (Auth, Database, Storage, Edge Functions, Realtime) | All-in-one BaaS, PostgreSQL with RLS, real-time subscriptions |
| **Styling** | NativeWind v4 (Tailwind CSS for React Native) | Utility-first, cross-platform, dark mode, design tokens |
| **Client State** | Zustand | Lightweight, minimal boilerplate, focused stores per domain |
| **Server State** | TanStack Query v5 | Caching, background refetch, optimistic updates, offline support |
| **Forms** | React Hook Form + Zod | Declarative validation, schema-based, minimal re-renders |
| **Payments (Mobile)** | RevenueCat | Wraps StoreKit and Google Play Billing, cross-platform |
| **Payments (Donations)** | Stripe | Industry-standard, one-time and recurring donations |
| **AI Providers** | OpenAI (text), ElevenLabs (voice), Hugging Face (images) | Best-in-class per modality, all called via Supabase Edge Functions |
| **Push Notifications** | Expo Notifications + Supabase Webhooks | Native push, triggered by DB events |
| **Image Display** | expo-image | Optimized loading, caching, progressive display |
| **Testing** | Jest + React Native Testing Library + Detox (E2E) | Industry standard for React Native |
| **CI/CD** | EAS Build + EAS Submit + GitHub Actions | Expo-native build pipeline, automated app store submissions |
| **Package Manager** | pnpm | Strict dependency isolation, fast, first-class Expo monorepo support |

### Architecture Principles

1. **Shared-first** — All business logic, API clients, types, and most UI components live in shared packages. Platform-specific code is the exception.
2. **Offline-capable** — TanStack Query cache persistence via MMKV. Core read flows work offline.
3. **Security-by-default** — Supabase RLS on every table. Edge Functions handle all AI API calls (keys never reach client). Auth tokens in secure storage.
4. **Progressive disclosure** — Wizard-based memorial creation reveals complexity gradually.

---

## 2. Monorepo Structure

```
foreverr-app/
├── apps/
│   ├── mobile/                          # Expo mobile app (iOS + Android)
│   │   ├── app/                         # Expo Router file-based routes
│   │   │   ├── _layout.tsx              # Root layout (providers, fonts, splash)
│   │   │   ├── (auth)/                  # Auth group
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── login.tsx
│   │   │   │   ├── register.tsx
│   │   │   │   └── forgot-password.tsx
│   │   │   ├── (tabs)/                  # Main tab navigator
│   │   │   │   ├── _layout.tsx          # Tab bar config (Home, Search, Create, Notifications, Profile)
│   │   │   │   ├── index.tsx            # Home feed
│   │   │   │   ├── search.tsx           # Discover
│   │   │   │   ├── create.tsx           # Create memorial entry
│   │   │   │   ├── notifications.tsx
│   │   │   │   └── profile.tsx          # User profile
│   │   │   ├── memorial/
│   │   │   │   ├── [id]/               # Memorial detail (top tabs)
│   │   │   │   │   ├── _layout.tsx
│   │   │   │   │   ├── index.tsx       # Memory Feed
│   │   │   │   │   ├── timeline.tsx
│   │   │   │   │   ├── obituary.tsx
│   │   │   │   │   ├── events.tsx
│   │   │   │   │   ├── support.tsx     # Donations
│   │   │   │   │   ├── wall.tsx        # Sympathy Wall
│   │   │   │   │   ├── gallery.tsx
│   │   │   │   │   └── settings.tsx    # Host only
│   │   │   │   └── create/
│   │   │   │       ├── _layout.tsx     # Wizard layout
│   │   │   │       ├── basic-info.tsx  # Step 1
│   │   │   │       ├── details.tsx     # Step 2
│   │   │   │       └── media.tsx       # Step 3
│   │   │   ├── chat/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [id].tsx
│   │   │   ├── events/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [id].tsx
│   │   │   ├── marketplace/            # Phase 3
│   │   │   ├── directory/              # Phase 3
│   │   │   └── resources/
│   │   ├── components/                  # Mobile-specific components only
│   │   ├── app.json
│   │   ├── eas.json
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── web/                             # Expo Web (same routes, responsive layouts)
│       └── package.json
│
├── packages/
│   ├── ui/                              # Shared UI component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── MemorialCard.tsx
│   │   │   │   ├── TributeCard.tsx
│   │   │   │   ├── RibbonBadge.tsx
│   │   │   │   ├── DonationProgress.tsx
│   │   │   │   ├── TimelineItem.tsx
│   │   │   │   ├── MediaGallery.tsx
│   │   │   │   ├── GiftSelector.tsx
│   │   │   │   └── index.ts
│   │   │   ├── primitives/             # Base design system
│   │   │   │   ├── Text.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── index.ts
│   │   │   └── layouts/
│   │   │       ├── ScreenWrapper.tsx
│   │   │       └── TabHeader.tsx
│   │   └── package.json
│   │
│   ├── core/                            # Shared business logic
│   │   ├── src/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts           # Supabase client singleton
│   │   │   │   ├── types.ts            # Auto-generated DB types
│   │   │   │   └── helpers.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useMemorial.ts
│   │   │   │   ├── useTributes.ts
│   │   │   │   ├── useEvents.ts
│   │   │   │   ├── useChat.ts
│   │   │   │   ├── useDonations.ts
│   │   │   │   ├── useNotifications.ts
│   │   │   │   ├── useRibbons.ts
│   │   │   │   └── useAI.ts
│   │   │   ├── queries/                # TanStack Query definitions
│   │   │   ├── mutations/              # TanStack Mutation definitions
│   │   │   ├── stores/                 # Zustand stores
│   │   │   │   ├── authStore.ts
│   │   │   │   ├── uiStore.ts
│   │   │   │   ├── wizardStore.ts
│   │   │   │   ├── ribbonStore.ts
│   │   │   │   └── notificationStore.ts
│   │   │   ├── schemas/                # Zod validation schemas
│   │   │   ├── utils/
│   │   │   └── types/
│   │   └── package.json
│   │
│   └── config/                          # Shared configuration
│       ├── src/
│       │   ├── env.ts
│       │   ├── theme.ts                 # FOREVERR brand tokens (purples, etc.)
│       │   └── features.ts             # Feature flags
│       └── package.json
│
├── supabase/                            # Supabase local dev + migrations
│   ├── migrations/
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_rls_policies.sql
│   │   ├── 00003_functions_triggers.sql
│   │   └── 00004_seed.sql
│   ├── functions/                       # Edge Functions (Deno)
│   │   ├── ai-obituary/index.ts
│   │   ├── ai-biography/index.ts
│   │   ├── ai-tribute/index.ts
│   │   ├── ai-voice/index.ts
│   │   ├── ai-photo-restore/index.ts
│   │   ├── duplicate-detection/index.ts
│   │   ├── stripe-webhook/index.ts
│   │   ├── push-notification/index.ts
│   │   └── content-moderation/index.ts
│   ├── seed.sql
│   └── config.toml
│
├── package.json                         # Workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .eslintrc.js
└── turbo.json                           # Build orchestration
```

---

## 3. Supabase Database Schema

### Core Tables

**profiles** (extends auth.users)
- id, username, display_name, avatar_url, bio, ribbon_balance, is_verified, verification_score, notification_preferences, onboarding_completed

**memorials**
- id, created_by, first_name, last_name, middle_name, nickname
- date_of_birth, date_of_death, place_of_birth, place_of_death
- profile_photo_url, cover_photo_url
- obituary, biography, obituary_is_ai_generated, biography_is_ai_generated
- privacy (public/private/invited), status (draft/active/archived/purge_pending)
- follower_count, tribute_count
- face_encoding (pgvector for duplicate detection)
- last_interaction_at, purge_after_days (default 7)
- slug (URL-friendly, auto-generated)

**memorial_hosts** (co-host system)
- memorial_id, user_id, role (owner/co_host/contributor)
- relationship (immediate_family/extended_family/friend/colleague/fan)
- relationship_detail, invited_by, accepted_at

**memorial_invitations** (for private memorials)
- memorial_id, invited_by, invited_email, invited_user_id, invite_code

**followers**
- memorial_id, user_id, notify_on_new_tribute, notify_on_events

**media** (photos, videos, audio)
- memorial_id, uploaded_by, type, storage_path, url, thumbnail_url
- caption, date_taken, location, dimensions, duration
- is_profile_photo, is_cover_photo, ai_restored

**tributes** (posts on a memorial's wall)
- memorial_id, author_id, type (text/photo/video/audio/memory/poem/quote)
- content, media_url, is_ai_generated
- like_count, comment_count
- ribbon_type (mandatory), ribbon_count, is_pinned

**tribute_comments** (threaded)
- tribute_id, author_id, content, parent_comment_id, like_count

**reactions**
- user_id, target_type (tribute/comment), target_id
- reaction_type (heart/candle/flower/prayer/etc.)

**gift_catalog** (available gifts)
- category (candle/flower/plant/sympathy_card/wreath/ribbon_bouquet)
- name, description, image_url, ribbon_cost

**memorial_gifts** (gifts sent to memorials)
- memorial_id, sender_id, gift_id, message, ribbon_cost, is_anonymous

**ribbon_transactions** (in-app currency ledger)
- user_id, amount, type (purchase/earned/spent_gift/spent_tribute/spent_promote/bonus/daily_reward)
- reference_id, description, balance_after

**ribbon_packages** (purchasable bundles)
- name, ribbon_amount, price_cents, bonus_ribbons, store_product_id

**events**
- memorial_id, created_by, title, description
- type (funeral/memorial_service/celebration_of_life/anniversary/birthday/virtual_gathering/live_stream)
- format (in_person/virtual/hybrid)
- start_time, end_time, timezone
- venue_name, address, latitude, longitude
- meeting_url, live_stream_url
- is_recurring, max_attendees, rsvp_count

**event_rsvps**
- event_id, user_id, status (attending/maybe/declined)

**important_dates**
- memorial_id, title, date, is_recurring, reminder_days_before

**fundraising_campaigns**
- memorial_id, created_by, title, description
- goal_cents, raised_cents, beneficiary_name, charity_partner_id

**donations**
- campaign_id, donor_id, amount_cents, payment_method
- payment_intent_id, status, donor_message, is_anonymous, tree_planted

**chat_rooms**
- type (memorial_group/direct/event_group), memorial_id, event_id
- name, created_by, last_message_at

**chat_members**
- room_id, user_id, role (admin/member), last_read_at, is_muted

**messages**
- room_id, sender_id, type (text/photo/video/audio/voice_note/document/poll/system)
- content, media_url, reply_to_id, poll_data

**notifications**
- user_id, type, title, body, data (JSONB), is_read

**ai_generations** (AI content audit log)
- memorial_id, requested_by, type, provider, model
- prompt_data, output_text, output_url, tokens_used, cost_cents, status

**marketplace_listings** (Phase 3)
- seller_id, category, title, description, price_cents, images, status

**nfts** (Phase 3)
- memorial_id, creator_id, owner_id, title, media_url
- token_id, contract_address, chain, price_cents, status

**directory_listings** (Phase 3)
- owner_id, business_name, business_type, services, price_range
- address, latitude, longitude, rating, review_count, is_verified

**articles** (Resources/Blog)
- author_id, title, slug, content, excerpt, cover_image_url, category, tags

**reports** (Content moderation)
- reporter_id, target_type, target_id, reason, status

### Key Database Features
- **Row Level Security (RLS)** on every table
- **Realtime subscriptions** on: messages, tributes, notifications, memorial_gifts, donations, event_rsvps
- **pgvector** extension for facial recognition duplicate detection
- **pg_cron** for auto-purging inactive memorials
- **Triggers** for: follower count sync, last_interaction_at updates, slug generation
- **Storage buckets**: profile-photos, memorial-photos, memorial-videos, memorial-audio, chat-media, marketplace-images, nft-assets, ai-outputs

---

## 4. Navigation Architecture (Expo Router)

```
Root _layout.tsx
├── Providers: QueryClient, Auth, Theme, NativeWind
├── Font loading + Splash screen
│
├── (auth)/ — Unauthenticated
│   ├── login
│   ├── register
│   ├── forgot-password
│   └── onboarding (3-screen welcome)
│
├── (tabs)/ — Main app (bottom tab bar)
│   ├── index → Home Feed (IG-style vertical scroll)
│   ├── search → Discover (memorials + people + directory)
│   ├── create → Memorial Creation Wizard entry
│   ├── notifications → Notification center
│   └── profile → User profile + settings
│
├── memorial/
│   ├── create/ → 3-step wizard
│   └── [id]/ → Memorial detail (top tab bar)
│       ├── index (Memory Feed)
│       ├── timeline
│       ├── obituary
│       ├── events
│       ├── support (Donations)
│       ├── wall (Sympathy Wall)
│       ├── gallery
│       └── settings (Host only)
│
├── chat/ → Chat list + [id] conversation
├── events/ → Event list + [id] detail
├── marketplace/ (Phase 3)
├── directory/ (Phase 3)
├── resources/ → Articles/Blog
└── user/[id] → Other user profiles
```

**Web differences**: Sidebar navigation instead of bottom tabs, responsive layouts, SEO-optimized memorial pages.

---

## 5. Phase 1: MVP (Weeks 1-12)

**Goal**: A functional memorial creation and viewing app with basic social features — enough for real user testing.

### Week 1-2: Foundation + Auth
- Initialize Expo monorepo with pnpm workspaces
- Configure NativeWind with FOREVERR brand tokens (purple palette)
- Set up Supabase project, run initial schema migrations
- Auto-generate TypeScript types from Supabase
- Implement auth flow: email/password + Apple + Google social login
- Password reset flow
- Profile creation (username, display name, avatar upload)
- 3-screen onboarding welcome flow
- Session persistence with secure token storage

### Week 3-5: Memorial Creation Wizard
- 3-step wizard with progress indicator
  - Step 1: First name, last name, dates, relationship declaration (immediate family/extended/friend/fan)
  - Step 2: Personality description, accomplishments, hobbies, favorite memories (feeds AI later)
  - Step 3: Profile photo upload + optional cover photo
- Draft auto-save to Supabase (resume later)
- Memorial slug generation for shareable URLs
- Privacy selection (public/private/invited)
- Duplicate detection — name + DOB + DOD match check (warn user, suggest co-hosting)
- Zod validation on all inputs

### Week 5-7: Memorial Profile Viewing
- Profile header (photo, name, dates, follower count, relationship badge)
- Top tab navigation within memorial
- Memory Feed tab (vertical scroll of tributes)
- Photo/video gallery with grid view
- Sympathy Wall (Condolences + Tributes + Social Tags sub-tabs)
- Follow/unfollow memorials
- Share memorial (generates formatted invitation-style card image for social media)
- "Help us honor the life of [Name]" share template

### Week 7-9: Basic Social Features
- Home feed — Instagram-style vertical scroll of tributes from followed memorials
- Create tributes (text + single photo) on memorials
- Mandatory ribbon selection with every tribute (5 free ribbon types at launch)
- Like tributes (heart + candle + flower + prayer reaction options)
- Comment on tributes (threaded)
- Search memorials by name, search users by username
- User profile page (my memorials, followers/following, stats)

### Week 9-10: Notifications
- In-app notification center (Today/Earlier grouping)
- Push notifications via Expo Notifications
- Types: new tribute, new comment, new follower, co-host invite
- Read/unread state, badge count on tab

### Week 10-12: Polish + TestFlight
- Error boundaries and fallback screens
- Loading skeletons throughout
- Pull-to-refresh, infinite scroll pagination
- Image optimization (thumbnails, progressive loading)
- Deep linking setup
- App icon (FOREVERR purple), splash screen
- Content reporting system (flag inappropriate content)
- Basic analytics tracking
- **TestFlight / Internal Testing release**

### Phase 1 Milestones
| Week | Milestone |
|------|-----------|
| 2 | Auth flow complete, users can sign up/login |
| 5 | First memorial created end-to-end |
| 7 | Memorial profiles viewable with all tabs |
| 9 | Social loop complete (tribute → notify → view → like) |
| 12 | TestFlight / internal testing release |

---

## 6. Phase 2: Communication, Events & AI (Weeks 13-24)

**Goal**: Transform from static memorial viewer to a living, interactive platform with AI differentiation.

### Week 13-16: AI-Generated Content
- **AI Obituary Generator** (Supabase Edge Function → OpenAI GPT-4o)
  - Uses questionnaire data from memorial creation
  - 3 style options: formal, warm, celebratory
  - Edit, regenerate, or write manually
- **AI Biography Generator** — longer narrative from same data
  - Chronological vs. thematic structure options
- **AI Tribute Suggester** — prompts for attributes, impact, memories → generates draft
- **Content Moderation** — screens tributes/comments via OpenAI moderation endpoint
  - Auto-flag, queue for review, or auto-block based on severity
- All generations logged in `ai_generations` table for audit

### Week 16-19: Chat & Messaging
- Memorial group chats (auto-created per memorial)
- Direct messaging (1-on-1)
- Message types: text, photo, video, voice note, document
- Voice messages via Expo AV recording
- Real-time delivery via Supabase Realtime subscriptions
- Unread message badges
- Chat member management
- Message reply threading
- Poll creation in group chats
- Archive chats

### Week 19-21: Events System
- Create events tied to memorials
  - Types: funeral, memorial service, celebration of life, anniversary, birthday remembrance, virtual gathering, live stream
  - Formats: in-person, virtual, hybrid
- RSVP system (attending/maybe/declined)
- Auto-created important dates (birthday + death anniversary)
- Anniversary countdown timer on memorial profiles
- Event reminders (push notifications)
- Calendar integration (add to device calendar)
- Recurring events

### Week 21-24: Donations + Ribbon Economy
- Fundraising campaigns per memorial
- Stripe integration via Edge Function
- Donation progress bar (real-time updates via Realtime)
- Donor wall with messages, anonymous option
- Multiple payment methods (Stripe card + PayPal/Venmo links)
- Physical tree planting option
- Donation receipts
- **Ribbon Economy Launch:**
  - Ribbon packages purchasable via RevenueCat (IAP)
  - Daily login reward (small ribbon bonus)
  - Spend ribbons on: premium tribute types, memorial gifts
  - Gift catalog: 15-20 initial items (candles, flowers, plants, wreaths, sympathy cards)
  - Gift animations when received
  - Transaction history + balance in profile

### Phase 2 Milestones
| Week | Milestone |
|------|-----------|
| 16 | AI obituary + biography generation working end-to-end |
| 19 | Real-time chat with all message types |
| 21 | Events with RSVP + reminder notifications |
| 24 | Donations live, ribbon economy launched |

---

## 7. Phase 3: Marketplace, Directory & Advanced (Weeks 25-40)

**Goal**: Full platform ecosystem with monetization engines and advanced AI.

### Week 25-29: Marketplace
- Seller onboarding + listing creation
- Categories: caskets, flowers, mugs, t-shirts, cleaning services, funeral services
- Product detail pages with image galleries
- Search + filter by category, price, location
- Inquiry/booking flow (connect buyer to seller)
- Seller dashboard (manage listings, view inquiries)
- Featured/promoted listings (paid via ribbons)

### Week 29-32: NFT System
- NFT creation from memorial photos/artwork
- Custom artwork upload
- Minting on Polygon (low gas, eco-friendly)
- NFT gallery on memorial profiles
- NFT marketplace (list, browse, buy)
- WalletConnect integration
- Royalties on secondary sales → memorial fund

### Week 32-35: Funeral Directory
- Business listing pages (funeral homes, cemeteries, florists)
- Geolocation search with radius filter
- Reviews + ratings
- "Book Now" / "Request Quote" lead flow
- Verified business badge
- Featured listings (paid)
- Links to EXXiiT physical logistics brand

### Week 35-38: Live Rooms & Streaming
- Clubhouse-style audio rooms per memorial
- Stage feature (hosts speak, audience listens, raise hand)
- Memorial live streams (virtual funeral services)
- WebRTC via LiveKit or 100ms SDK
- Recording + archiving sessions
- Schedule live events

### Week 35-40: Advanced AI
- **AI Voice Recreation** (ElevenLabs)
  - Upload voice samples → generate voice clips reading obituary, birthday messages
  - Consent acknowledgment required, hosts only
- **Photo Restoration & Colorization** (Hugging Face)
  - Upload old/damaged photos → AI restore with before/after
  - Black-and-white colorization
- **Auto-compiled Memorial Videos**
  - Select photos + music → AI slideshow with transitions
  - Export as shareable video
- **Smart Memory Surfacing**
  - "On this day" feature on anniversaries
  - Push notification with memory snippet

### Week 38-40: Highlights & Discovery
- Editor picks (curated by FOREVERR team)
- Celebrity memorials section
- Promoted memorials (paid via ribbons)
- Trending memorials
- Verified badge algorithm (activity score, engagement, completeness)

### Phase 3 Milestones
| Week | Milestone |
|------|-----------|
| 29 | Marketplace MVP live |
| 32 | NFT minting + gallery functional |
| 35 | Directory with geosearch |
| 38 | Live rooms + advanced AI deployed |
| 40 | Full Phase 3 release |

---

## 8. Phase 4: Immersive & Brand Expansion (Weeks 41-60+)

**Goal**: Experiences no other memorial platform offers + JUBELAT brand expansion.

### Week 41-48: AR/VR Memorial Spaces
- Virtual memorial room (Three.js on web, React Native AR on mobile)
- Place virtual candles, flowers, photos in 3D space
- Walk through virtual gravesite
- AR overlay: point phone at physical grave → see digital memorial
- Virtual Candle (perpetual animated candle)
- Virtual Flower Garden (grows based on gifts received)

### Week 45-50: Digital Memory Vaults
- Digital Memory Box (cloud storage per memorial — docs, recipes, letters)
- Memory Time Capsule (content unlocks on future dates)
- Legacy Letters (write letters delivered to specific people on specific dates)
- Digital Scrapbooking (drag-and-drop layout builder)
- Audio Playlists (curated music)
- Recipe Book + Quote Collection

### Week 48-54: Advanced Social
- Family History/Tree (connect memorials into lineages)
- "Remember When?" AI prompts to spark memory sharing
- Random Memory Generator
- Annual Awards (most active contributor, most tributes)
- Instagram-style in-feed ads (tasteful, memorial-appropriate)
- Memorial Merchandise (print-on-demand integration)

### Week 54-60: JUBELAT Brand Extension
- Celebration profiles for living people (birthdays, achievements, milestones)
- Same tech stack, new branding/theme layer
- Event planning features (party planning, guest lists)
- Gifting system (real gifts via partner integrations)
- Cross-pollination: memorial users discover celebrations features

### Ongoing: Expo Web Launch
- Progressive web deployment from Phase 2 onward
- SEO-optimized public memorial pages (critical for discoverability)
- Responsive desktop layouts (sidebar nav instead of bottom tabs)
- Consider Next.js wrapper for SSR/SEO if needed

---

## 9. Fresh Ideas & Strategic Recommendations

### Game-Changing Features Not In Current Plans

1. **"Grief Journey" Companion**
   A personalized AI-driven support experience that checks in with users over time. Based on relationship to deceased and time since passing, it surfaces appropriate resources, prompts gentle memory sharing, and connects users with grief support communities. Turns FOREVERR from an occasional visit into a daily companion during the hardest period of someone's life.

2. **Memorial QR Codes for Physical Graves**
   Generate weatherproof QR codes attachable to headstones, urns, or plaques. When scanned, opens the FOREVERR memorial. Bridges physical and digital worlds. Anyone visiting a grave becomes a potential user — organic acquisition at the most emotional moment.

3. **"Last Words" Audio/Video Messages**
   Allow LIVING users to record messages delivered to specific people after they pass. This captures users BEFORE they need the app for grief. Positions FOREVERR as end-of-life planning, not just post-death. Massively expands addressable market.

4. **Community Grief Circles**
   Moderated support groups organized by type of loss (spouse, parent, child, friend, pet), recency, and geography. Could include scheduled sessions with licensed grief counselors. Provides recurring engagement and genuine therapeutic value.

5. **Annual "Day of Remembrance" Digital Yearbook**
   On each death anniversary, automatically compile the year's tributes into a beautiful digital yearbook sent to all followers. Creates a powerful annual re-engagement moment.

6. **Collaborative Memory Projects**
   "Tell us about Dad's fishing trips" — multiple people contribute stories, AI compiles them into a cohesive narrative chapter for the biography.

### Engagement Hooks

- **"Memory Streak"** — Like Snapchat streaks but respectful. Light a virtual candle daily, share a memory, or visit. Subtle, not gamified.
- **Seasonal Memorial Decorations** — Holiday-themed virtual decorations (Christmas, Mother's Day, etc.). Some free, premium cost ribbons. Time-limited engagement spikes.
- **"This Day in Their Life" Notifications** — On significant dates, push notification asking followers to share a memory. Drives content on high-emotion days.
- **Guest Book with Pre-loaded Messages** — Quick condolence option for visitors who want to show support but don't know what to say.

### Monetization Opportunities Being Missed

1. **Premium Memorial Tiers** — Free = limited photos/storage. Premium ($4.99/mo or $39.99/yr) = unlimited storage, AI features, custom domain (john-doe.foreverr.app), priority search, visitor analytics.

2. **Funeral Home SaaS Dashboard** — White-label dashboard for funeral homes to create/manage memorials for clients. Monthly SaaS fee. B2B revenue + user acquisition channel.

3. **Memorial Printing Service** — Print-on-demand: turn digital memorial into physical book, poster, or framed tribute. Per-order revenue.

4. **End-of-Life Planning Vault** — Premium feature for LIVING users to pre-plan their memorial (choose photos, write obituary, designate hosts, record "Last Words"). Recurring subscription.

5. **Corporate Sympathy Packages** — Companies buy bulk sympathy packages to send memorial gifts when employees lose someone. B2B sales channel.

### Valuable Partnerships

| Partner Type | Examples | Value |
|---|---|---|
| Funeral Home Chains | SCI/Dignity Memorial, Batesville | Distribution — directors recommend FOREVERR to families |
| Grief Counseling | BetterHelp, Talkspace | In-app referral, revenue share |
| Tree Planting | One Tree Planted, Arbor Day Foundation | Physical memorial action with donations |
| Print-on-Demand | Printful, Gooten | Memorial merchandise + books |
| Estate Planning | Trust & Will, Everplans | Cross-promote end-of-life planning |
| Religious Orgs | Denominational partnerships | Faith-specific memorial templates |
| Veterans Affairs | VA partnerships | Military memorial specialization — huge underserved market |

---

## Summary Timeline

| Phase | Duration | Months | Key Milestone |
|---|---|---|---|
| **Phase 1: MVP** | Weeks 1-12 | Months 1-3 | TestFlight release, core memorial creation + social |
| **Phase 2: Social + AI** | Weeks 13-24 | Months 4-6 | Chat, events, AI content generation, donations, ribbons |
| **Phase 3: Ecosystem** | Weeks 25-40 | Months 7-10 | Marketplace, NFTs, directory, live rooms, advanced AI |
| **Phase 4: Immersive** | Weeks 41-60 | Months 11-15 | AR/VR, memory vaults, family trees, JUBELAT launch |

**Realistic note for small team (1-3 people)**: Add 50-75% buffer to all estimates. Prioritize Phase 1 ruthlessly — get to TestFlight ASAP and iterate from real user feedback before committing to full Phase 2 scope.

---

## First 5 Files to Create (Implementation Starting Points)

1. **`/apps/mobile/app/_layout.tsx`** — Root layout: all providers, auth gate, splash screen, fonts
2. **`/packages/core/src/supabase/client.ts`** — Supabase client singleton with auth persistence
3. **`/supabase/migrations/00001_initial_schema.sql`** — Complete database schema (source of truth)
4. **`/packages/core/src/hooks/useMemorial.ts`** — Primary business logic hook (pattern for all others)
5. **`/apps/mobile/app/(tabs)/_layout.tsx`** — Main tab navigator (the app shell)
