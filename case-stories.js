/* ==========================================================================
   MOBILE APP CASE STUDIES
   Long-form case study pages, rendered by script.js (renderStory).
   Sources:
   - Qennect: Qennect UX Overview, UX Improvements and Redesign Overview docs,
     plus the Qennect platform guide
   - Just Show Up: "Just Show Up – MVP" brief and the dashboard UI/UX task docs
   - Enfuze: Enfuze user stories & requirements, landing page copy, and the
     influencer review session
   No metrics or research results are claimed that those documents don't contain.

   Block types: notes, cards, tiles, callout, steps, compare, flows,
   countries, checklist, deliverables
   ========================================================================== */

window.CASE_STORIES = {

  /* ----------------------------------------------------------------------- */
  'qennect': {
    theme: { g1: '#7b5cff', g2: '#c650ff' },
    logo: { img: 'assets/cases/qennect/symbol.svg', name: 'Qennect' },
    tag: 'Mobile app · Accessibility redesign',
    title: ['A community app', 'anyone can use.'],
    sub: 'Qennect is a private community platform for sailing clubs, sports clubs, housing communities and member organizations. I redesigned the app around its members aged 50+: easier to read, easier to tap, easier to find your way.',
    chips: [['Role', 'UI/UX Designer'], ['Focus', 'Accessibility redesign'], ['Users', 'Members aged 50+'], ['Platform', 'Mobile app']],
    hero: ['assets/cases/qennect/onboarding.jpg', 'assets/cases/qennect/feed.jpg', 'assets/cases/qennect/rallis.jpg'],
    chapters: [
      {
        kicker: 'The problem',
        title: ['Busy screens.', 'Tiny targets.'],
        sub: 'I audited the existing app screen by screen. For older members, the same issues showed up again and again.',
        block: {
          type: 'notes',
          items: [
            { t: 'Small text & icons', d: 'Cause eye strain.' },
            { t: 'Low contrast', d: 'Makes reading difficult.' },
            { t: 'Complex navigation', d: 'Increases confusion.' },
            { t: 'Small tap targets', d: 'Lead to tapping errors.' },
            { t: 'Busy backgrounds', d: 'Images and banners behind text pull focus.' }
          ]
        }
      },
      {
        kicker: 'Who it’s for',
        title: ['One platform,', 'four kinds of community.'],
        sub: 'Each community switches on only the parts it needs, so the design had to feel familiar whichever modules are turned on.',
        block: {
          type: 'cards',
          items: [
            { icon: 'sail', t: 'Sailing clubs', d: 'Boats, crew finding, rallies and live boat tracking.' },
            { icon: 'ball', t: 'Sports clubs', d: 'Facility bookings, approvals and tournaments.' },
            { icon: 'home', t: 'Housing communities', d: 'Homes, shared amenities and community projects.' },
            { icon: 'people', t: 'Member organizations', d: 'Committees, boards and community projects.' }
          ]
        }
      },
      {
        kicker: 'The rules',
        title: ['Design rules,', 'written for 50+ eyes.'],
        sub: 'Before redesigning a single screen, I set the rules every screen had to follow.',
        block: {
          type: 'tiles',
          items: [
            { v: '16–20px', l: 'Body text', d: 'Bigger, easier-to-read type.' },
            { v: '52–56px', l: 'Buttons', d: 'Large targets that reduce mis-taps.' },
            { v: '22–26px', l: 'Icons', d: 'Recognisable at a glance.' },
            { v: 'High', l: 'Contrast', d: 'Clear text on clean surfaces.' },
            { v: 'Zero', l: 'Images behind text', d: 'Nothing competing with the words.' },
            { v: 'Fewer', l: 'Steps', d: 'Simple, predictable navigation.' }
          ]
        }
      },
      {
        kicker: 'Screen by screen',
        title: ['What changed,', 'and why.'],
        sub: 'Every fix traces back to a specific problem from the audit. Scroll through the screens.',
        block: {
          type: 'compare',
          items: [
            {
              name: 'Login', img: 'assets/cases/qennect/login.jpg',
              problems: ['Distracting background', 'Small input fields', 'Form placed too high for one-handed use'],
              fixes: ['Form moved to a clean bottom section, within thumb reach', 'Larger fields and buttons', 'Simple inline error messages']
            },
            {
              name: 'Home feed', img: 'assets/cases/qennect/feed.jpg',
              problems: ['An unclear “What’s on your mind?”', 'Small like and share actions', 'Inconsistent post sizes'],
              fixes: ['A clear search bar and create-post button', 'Larger action icons', 'Standard post sizes: 1:1, 3:4 and 16:9']
            },
            {
              name: 'Rallies', img: 'assets/cases/qennect/rallis.jpg',
              problems: ['Crowded cards', 'Hard to tell upcoming from past rallies', 'Oversized, cluttered buttons'],
              fixes: ['Tabs: Trending, Upcoming, Registered, Past', 'Clean, scannable rally cards', 'Balanced buttons and larger text']
            },
            {
              name: 'Events', img: 'assets/cases/qennect/events.jpg',
              problems: ['A bulky filter bar', 'Too much text on cards', 'Background images hurting readability'],
              fixes: ['Small segmented controls and a simple search', 'Simplified event cards', 'Plain backgrounds']
            },
            {
              name: 'Member map', img: 'assets/cases/qennect/member-map.jpg',
              problems: ['No useful boat information', 'Icons too small to tap', 'Nothing happened when a boat was selected'],
              fixes: ['Large custom boat markers', 'Rally lines and active boats', 'A bottom sheet with boat details on tap']
            },
            {
              name: 'Profile & settings', img: 'assets/cases/qennect/logout.jpg',
              problems: ['Distracting banners', 'Important items mixed with minor ones', 'Inconsistent text and spacing'],
              fixes: ['A clean profile card', 'A simple settings list', 'A separate danger zone for Delete Account']
            }
          ]
        }
      },
      {
        kicker: 'The final UI',
        title: ['Every screen,', 'flow by flow.'],
        sub: 'Pick a flow to see its screens. Tap any screen to look closer.',
        block: {
          type: 'flows',
          tabs: [
            {
              label: 'Getting in', desc: 'A calm first impression, then sign-in with a one-time code.',
              screens: [['splash', 'Splash'], ['onboarding', 'Choose a community'], ['login', 'Log in'], ['location-enable', 'Location permission']]
            },
            {
              label: 'Community', desc: 'The feed, news and people, a tap away.',
              screens: [['feed', 'Feed'], ['news', 'News'], ['members', 'Member directory'], ['member-map', 'Member map']]
            },
            {
              label: 'Clubs & events', desc: 'Events, sailing rallies, tournaments and bookings.',
              screens: [['events', 'Events'], ['rallis', 'Rallies'], ['tournaments', 'Tournaments'], ['play', 'Facility bookings'], ['crew', 'Crew finding']]
            },
            {
              label: 'Community life', desc: 'Giving, shopping, learning and recognition.',
              screens: [['donation', 'Fundraising'], ['shop', 'Shop'], ['webinars', 'Courses & webinars'], ['awards', 'Awards'], ['sponsors', 'Sponsors'], ['logout', 'Settings']]
            }
          ].map(t => ({ ...t, screens: t.screens.map(([f, c]) => ({ img: `assets/cases/qennect/${f}.jpg`, cap: c })) }))
        }
      },
      {
        kicker: 'What I delivered',
        title: ['From audit', 'to final screens.'],
        block: {
          type: 'deliverables',
          items: ['UX audit of the existing app', 'UX overview & improvement documents for the client', 'Accessibility rules for 50+ users', 'Redesigned high-fidelity mobile screens']
        }
      }
    ],
    wrap: { title: ['Thanks for', 'scrolling by.'], line: 'Four kinds of community, one familiar experience.' }
  },

  /* ----------------------------------------------------------------------- */
  'just-show-up': {
    theme: { g1: '#ff6a2b', g2: '#ffb347' },
    logo: { mark: 'J', name: 'Just Show Up' },
    tag: 'Mobile app · MVP',
    title: ['Plans that', 'actually happen.'],
    sub: 'Just Show Up helps friend groups spend time together without the planning. Every week a plan lands on WhatsApp, and everyone answers with one tap: In, Maybe or Out.',
    chips: [['Role', 'UI/UX Designer'], ['Stage', 'MVP'], ['Platform', 'Mobile app + WhatsApp'], ['Canvas', '375px mobile']],
    hero: ['assets/cases/just-show-up/intro.jpg', 'assets/cases/just-show-up/home.jpg', 'assets/cases/just-show-up/plan-details.jpg'],
    chapters: [
      {
        kicker: 'The problem',
        title: ['Everyone wants to meet.', 'No one wants to plan.'],
        sub: 'Busy schedules, no organiser and noisy group chats mean plans stay “maybe”, and meetups slowly stop.',
        block: {
          type: 'notes',
          items: [
            { t: 'Decision fatigue', d: 'No one wants to propose plans.' },
            { t: 'Coordination friction', d: 'Group chats create noise, not decisions.' },
            { t: 'No ownership', d: 'There’s no consistent organiser.' },
            { t: 'Low commitment', d: 'Plans remain tentative.' },
            { t: 'Fewer meetups', d: 'Social time drops off over time.' },
            { t: 'Tool fatigue', d: 'No one wants another app to manage.' }
          ]
        }
      },
      {
        kicker: 'The idea',
        title: ['Make showing up', 'the default.'],
        block: {
          type: 'callout',
          kicker: 'The opportunity',
          text: 'What if the plan already existed, and all you had to decide was whether to go?',
          sub: 'Plans are created automatically and shared every week. Members only decide if they attend.'
        }
      },
      {
        kicker: 'How it works',
        title: ['One tap,', 'every week.'],
        sub: 'The whole experience fits inside a WhatsApp message.',
        block: {
          type: 'steps',
          img: 'assets/cases/just-show-up/whatsapp-plan.jpg',
          steps: [
            { t: 'Set up the group', d: 'The organiser adds a name, city, language, members and the kinds of plans the group likes. About two minutes.' },
            { t: 'A plan is picked', d: 'Each week a plan is chosen from the group’s favourite categories, avoiding recent repeats.' },
            { t: 'It lands on WhatsApp', d: 'Every member gets the plan with three buttons: In, Maybe, Out.' },
            { t: 'People just show up', d: 'No back-and-forth. The chat reacts to a plan instead of debating one.' },
            { t: 'It gets smarter', d: 'Responses quietly shape which plans come next.' }
          ]
        }
      },
      {
        kicker: 'Design decisions',
        title: ['Five decisions', 'behind the dashboard.'],
        sub: 'The dashboard had to feel warm and simple for teenagers, families and older adults alike.',
        block: {
          type: 'cards',
          numbered: true,
          items: [
            { t: 'Primary actions first', d: 'Cards show only View Group and Create Plan. Edit, invite, share and delete live in a 3-dot menu.' },
            { t: 'RSVP lives on plans', d: 'Group cards don’t show In / Out status. RSVP belongs to each plan, like 12 In · 3 Out · 5 Maybe.' },
            { t: 'Invites in one place', d: 'Group invites are accepted or declined from Notifications, then move into Joined Groups.' },
            { t: 'Readable at every age', d: 'Minimum 16px text, large touch targets, high contrast and generous spacing.' },
            { t: 'Warm and social', d: 'A cream background, soft orange accents, rounded cards and soft shadows.' }
          ]
        }
      },
      {
        kicker: 'The final UI',
        title: ['Every screen,', 'flow by flow.'],
        sub: 'Pick a flow to see its screens. Tap any screen to look closer.',
        block: {
          type: 'flows',
          tabs: [
            {
              label: 'Getting started', desc: 'A quick intro, sign-up and profile, in a few friendly steps.',
              screens: [['intro', 'How it works'], ['welcome', 'Welcome'], ['profile-setup', 'Profile setup'], ['account-created', 'Account created']]
            },
            {
              label: 'Groups', desc: 'Create a group, add friends from contacts and invite them.',
              screens: [['select-members', 'Select members'], ['create-group', 'Create group'], ['group-created', 'Group created'], ['group-details', 'Group details'], ['add-members', 'Add members']]
            },
            {
              label: 'Plans', desc: 'See what’s coming up and RSVP with one tap.',
              screens: [['home', 'Home'], ['create-plan', 'Create a plan'], ['plan-details', 'Plan details']]
            },
            {
              label: 'On WhatsApp', desc: 'Invites and weekly plans arrive where friends already talk.',
              screens: [['whatsapp-invite', 'Group invite'], ['whatsapp-plan', 'Weekly plan']]
            }
          ].map(t => ({ ...t, screens: t.screens.map(([f, c]) => ({ img: `assets/cases/just-show-up/${f}.jpg`, cap: c })) }))
        }
      },
      {
        kicker: 'What I delivered',
        title: ['From a brief', 'to a full flow.'],
        block: {
          type: 'deliverables',
          items: ['Onboarding flow', 'Group creation & invites', 'Home dashboard', 'Group & plan details with RSVP', 'WhatsApp invite & plan messages']
        }
      }
    ],
    wrap: { title: ['Thanks for', 'showing up.'], line: 'From “we should hang out” to a plan everyone can see.' }
  },

  /* ----------------------------------------------------------------------- */
  'enfuze': {
    theme: { g1: '#7c4dff', g2: '#ff4f8b' },
    logo: { img: 'assets/cases/enfuze/icon.png', name: 'Enfuze' },
    tag: 'Mobile app · Concept',
    title: ['Where brands', 'meet creators.'],
    sub: 'Enfuze brings the whole brand–creator collaboration into one app: find the right match, agree on deliverables, review content and get paid. No chaos. No chasing.',
    chips: [['Role', 'UI/UX Designer'], ['Type', 'Product concept'], ['Users', 'Brands · Creators · Talent managers'], ['Platform', 'Mobile app']],
    hero: ['assets/cases/enfuze/brand-home.jpg', 'assets/cases/enfuze/campaign-details.jpg', 'assets/cases/enfuze/influencer-profile.jpg'],
    chapters: [
      {
        kicker: 'The problem',
        title: ['Influencer marketing', 'is broken.'],
        sub: 'Collaborations between brands and creators were scattered across tools, chats and follow-ups.',
        block: {
          type: 'notes',
          items: [
            { t: 'Endless DMs', d: 'Zero clarity on what was agreed.' },
            { t: 'Late payments', d: 'Delayed, awkward and messy.' },
            { t: 'Hidden deliverables', d: 'No transparency on what’s due, and when.' },
            { t: 'Too many tools', d: 'No single flow from brief to payment.' },
            { t: 'Wrong matches', d: 'Finding the right creators is a headache.' }
          ]
        }
      },
      {
        kicker: 'Who it’s for',
        title: ['Three people,', 'three journeys.'],
        sub: 'On sign-up, everyone picks who they are, and onboarding adapts to match.',
        block: {
          type: 'cards',
          items: [
            { icon: 'brand', t: 'Brands', d: 'Create campaigns, discover creators, review content and release payments.' },
            { icon: 'creator', t: 'Influencers', d: 'Browse campaigns like a feed, apply, negotiate, deliver and get paid.' },
            { icon: 'people', t: 'Talent managers', d: 'Manage creators and their campaigns, with social data fetched automatically.' }
          ]
        }
      },
      {
        kicker: 'One flow',
        title: ['Everything.', 'In one flow.'],
        sub: 'From discovering the right match to getting paid, both sides follow the same simple path.',
        block: {
          type: 'steps',
          tabs: [
            {
              label: 'For brands',
              steps: [
                { t: 'Create campaigns', d: 'Set goals, deliverables and budgets, from a template or a manual brief.' },
                { t: 'Discover creators', d: 'Filter by niche, location and relevance.' },
                { t: 'Chat & finalise', d: 'Align on expectations, pricing and timelines.' },
                { t: 'Review content', d: 'Approve or give feedback instantly.' },
                { t: 'Go live & pay', d: 'Publish, approve, and the creator gets paid.' }
              ]
            },
            {
              label: 'For creators',
              steps: [
                { t: 'Browse campaigns', d: 'Scroll opportunities like a feed.' },
                { t: 'Apply', d: 'Pick the campaigns that fit your style.' },
                { t: 'Negotiate', d: 'Discuss terms directly with the brand.' },
                { t: 'Submit content', d: 'Upload deliverables and handle revisions.' },
                { t: 'Get paid', d: 'No follow-ups, no chasing.' }
              ]
            }
          ]
        }
      },
      {
        kicker: 'A tricky requirement',
        title: ['Verification that', 'changes by country.'],
        sub: 'Brands verify with different documents depending on where they’re based, so the experience has to adapt to the country rather than use one fixed form.',
        block: {
          type: 'countries',
          countries: [
            { name: 'India', docs: ['GST certificate or business registration', 'PAN', 'Aadhaar (individual creator brands)'] },
            { name: 'United States', docs: ['EIN certificate', 'State business registration', 'Passport or state ID (individuals)'] },
            { name: 'United Kingdom', docs: ['Companies House registration', 'VAT certificate (optional)', 'Government photo ID'] },
            { name: 'UAE / Saudi', docs: ['Trade license', 'VAT certificate', 'Emirates ID (individuals)'] },
            { name: 'Europe', docs: ['VAT registration certificate', 'Business permit', 'National ID (individuals)'] }
          ],
          statuses: ['Pending verification', 'Approved', 'Rejected, with a reason and re-upload']
        }
      },
      {
        kicker: 'Story by story',
        title: ['Every user story,', 'a screen.'],
        sub: 'I reviewed the screens with the product team against each user story, one acceptance criterion at a time. Sign-up, for example:',
        block: {
          type: 'checklist',
          items: [
            'Enter a mobile number or email to begin',
            'Country code detected automatically',
            'Accept the terms and privacy policy',
            'Receive the OTP by SMS or email',
            'Resend the OTP if it doesn’t arrive',
            'Clear feedback when an OTP fails or expires',
            'Sign in with Google instead'
          ]
        }
      },
      {
        kicker: 'The final UI',
        title: ['Every screen,', 'flow by flow.'],
        sub: 'Pick a flow to see its screens. Tap any screen to look closer.',
        block: {
          type: 'flows',
          tabs: [
            {
              label: 'Getting started', desc: 'A welcome, a quick intro and a tailored profile.',
              screens: [['welcome', 'Welcome'], ['onboarding', 'Intro'], ['brand-profile', 'Brand profile'], ['categories', 'Pick categories']]
            },
            {
              label: 'Brand home', desc: 'Profile progress, a quick campaign shortcut and creators to discover.',
              screens: [['brand-home', 'Home'], ['brand-dashboard', 'Full dashboard'], ['recommended', 'Recommended creators'], ['discover', 'Discover']]
            },
            {
              label: 'Campaigns', desc: 'Start from a template, fill in the brief and track who applied.',
              screens: [['quick-actions', 'Quick actions'], ['templates', 'Choose a template'], ['create-campaign', 'Create campaign'], ['campaign-details', 'Campaign details'], ['campaigns', 'Campaign feed']]
            },
            {
              label: 'Collaboration', desc: 'Profiles, chat, awards, deliverables and reviews.',
              screens: [['influencer-profile', 'Creator profile'], ['chat', 'Chat'], ['award-summary', 'Award summary'], ['deliverables', 'Deliverables'], ['performance', 'Performance & review']]
            }
          ].map(t => ({ ...t, screens: t.screens.map(([f, c]) => ({ img: `assets/cases/enfuze/${f}.jpg`, cap: c })) }))
        }
      },
      {
        kicker: 'What I delivered',
        title: ['From user stories', 'to a full product.'],
        block: {
          type: 'deliverables',
          items: ['Onboarding for three personas', 'Brand home & creator discovery', 'Campaign creation from templates', 'Chat, deliverables & reviews', 'Prototype walkthroughs']
        }
      }
    ],
    wrap: { title: ['Thanks for', 'collaborating.'], line: 'Designed for both sides of the deal.' }
  }
};
