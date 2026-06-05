// Motivational sea animal alerts — shown as ambient notifications
// Never reveal the full list. Rotate randomly, weight toward low-bubble contexts.
//
// `week` = ISO week number (of 2026) from which this alert becomes available.
// 0 = always available. New batches of 10 unlock each week.

// Returns the current ISO week number (year-independent — we use 2026 as epoch base)
function currentISOWeek() {
  const now  = new Date()
  const jan4 = new Date(now.getFullYear(), 0, 4)
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  return Math.ceil((dayOfYear + jan4.getDay()) / 7)
}

export const ALERTS = [
  // ── Week 0 — original set (always available) ───────────────────────────────
  {
    id: 'octopus-hearts', week: 0,
    animal: '🐙',
    text: "An octopus has three hearts and still finds time to use all eight arms. Your shoulders aren't going to strengthen themselves.",
    context: 'shoulder_missed',
  },
  {
    id: 'seahorse-birth', week: 0,
    animal: '🌊',
    text: "The seahorse is the only animal where the male gives birth. He didn't skip leg day either.",
    context: 'skipped_run',
  },
  {
    id: 'orca-hunt', week: 0,
    animal: '🐋',
    text: "Orcas teach their young to hunt. Pass something good on today — go for that run.",
    context: 'run_reminder',
  },
  {
    id: 'manta-migrate', week: 0,
    animal: '🌊',
    text: "Manta rays migrate thousands of miles without a Google Maps notification. The pool is 20 minutes away. Just saying.",
    context: 'swim_reminder',
  },
  {
    id: 'whale-heart', week: 0,
    animal: '🐳',
    text: "A blue whale's heart is the size of a small car and beats just twice a minute. Calm, consistent, unstoppable. Sound familiar? It could.",
    context: 'general',
  },
  {
    id: 'barracuda-speed', week: 0,
    animal: '🐟',
    text: "Barracudas can hit 40km/h in open water. Your run doesn't need to be fast. It just needs to happen.",
    context: 'run_reminder',
  },
  {
    id: 'pufferfish-bigger', week: 0,
    animal: '🐡',
    text: "Pufferfish double in size when they need to. Today's the day to show up bigger than yesterday.",
    context: 'general',
  },
  {
    id: 'dolphin-sleep', week: 0,
    animal: '🐬',
    text: "Dolphins sleep with one eye open. You hit snooze four times. There's room to grow.",
    context: 'woke_late',
  },
  {
    id: 'mantis-punch', week: 0,
    animal: '🦞',
    text: "A mantis shrimp can punch with the force of a bullet. Imagine channeling 10% of that into your morning.",
    context: 'morning',
  },
  {
    id: 'jellyfish-immortal', week: 0,
    animal: '🪼',
    text: "The immortal jellyfish can revert to its juvenile state and start over. You get a fresh log every day. Use it.",
    context: 'general',
  },
  {
    id: 'lobster-grow', week: 0,
    animal: '🦞',
    text: "Lobsters keep growing their entire lives. They don't plateau. Neither should you.",
    context: 'general',
  },
  {
    id: 'clownfish-habitat', week: 0,
    animal: '🐠',
    text: "Clownfish never leave their anemone. Your gym bag has been on the floor for three days. One of you needs to move.",
    context: 'skipped_run',
  },
  {
    id: 'seahorse-patience', week: 0,
    animal: '🌊',
    text: "Seahorses have no stomach — they must eat constantly to survive. A single protein shake is not a lot to ask.",
    context: 'protein_missed',
  },
  {
    id: 'whale-migration', week: 0,
    animal: '🐳',
    text: "Humpback whales travel up to 16,000 miles without stopping. You have 3km on the plan today. The math is in your favour.",
    context: 'run_reminder',
  },
  {
    id: 'starfish-regenerate', week: 0,
    animal: '⭐',
    text: "Starfish can regenerate a lost arm. You can regenerate a lost week. The bubbles don't care about yesterday.",
    context: 'bubbles_dropping',
  },
  {
    id: 'cuttlefish-camouflage', week: 0,
    animal: '🦑',
    text: "Cuttlefish have W-shaped pupils and can see polarised light. They see everything. Including your excuses.",
    context: 'general',
  },
  {
    id: 'anglerfish-depth', week: 0,
    animal: '🐟',
    text: "Anglerfish live at crushing depths with no light. You have running shoes and a Sunday morning. No contest.",
    context: 'run_reminder',
  },
  {
    id: 'sea-turtle-navigate', week: 0,
    animal: '🐢',
    text: "Sea turtles navigate by the Earth's magnetic field and return to the exact beach they were born on. Consistency is a superpower.",
    context: 'general',
  },
  {
    id: 'moray-eel-jaw', week: 0,
    animal: '🐍',
    text: "Moray eels have a second jaw that shoots forward to grab prey. That's two jaws of determination. How many do you have?",
    context: 'general',
  },
  {
    id: 'seahorse-grip', week: 0,
    animal: '🌊',
    text: "Seahorses grip seagrass with their tails in storms rather than swim away. Hold the habit when it's hard.",
    context: 'bubbles_dropping',
  },
  {
    id: 'orca-streak', week: 0,
    animal: '🐋',
    text: "Orcas maintain hunting strategies passed down through generations. Your streak is your strategy. Don't break the chain.",
    context: 'streak_warning',
  },
  {
    id: 'blue-whale-krill', week: 0,
    animal: '🐳',
    text: "A blue whale eats 4 tonnes of krill a day. One vegan protein shake is, by comparison, extremely manageable.",
    context: 'protein_missed',
  },
  {
    id: 'dolphin-play', week: 0,
    animal: '🐬',
    text: "Dolphins have been observed surfing waves purely for fun. They train and they play. So can you.",
    context: 'general',
  },
  {
    id: 'clam-age', week: 0,
    animal: '🐚',
    text: "The oldest known clam lived to 507 years old. It did not miss a single day of being a clam. Consistency.",
    context: 'streak_warning',
  },

  // ── Week 23 (2026) — Peacock mantis shrimp batch ──────────────────────────
  {
    id: 'peacock-mantis-colour', week: 23,
    animal: '🦐',
    text: "The peacock mantis shrimp has 16 types of colour receptors. Humans have 3. It sees the world in ways you can't imagine — and it still doesn't skip arm day.",
    context: 'general',
  },
  {
    id: 'peacock-mantis-punch', week: 23,
    animal: '🦐',
    text: "The peacock mantis shrimp's punch accelerates faster than a bullet, reaches 80km/h, and generates a flash of light. Your run can be slower. It just has to happen.",
    context: 'run_reminder',
  },
  {
    id: 'pistol-shrimp-sun', week: 23,
    animal: '🦐',
    text: "The pistol shrimp snaps its claw so fast it creates a cavitation bubble briefly hotter than the surface of the sun. This is the energy you're leaving on the table every time you snooze.",
    context: 'woke_late',
  },
  {
    id: 'mimic-octopus', week: 23,
    animal: '🐙',
    text: "The mimic octopus can impersonate over 15 different species on the fly — flatfish, lionfish, sea snakes. It doesn't have a fixed form. Neither does a good week.",
    context: 'general',
  },
  {
    id: 'barreleye-fish', week: 23,
    animal: '🐟',
    text: "The barreleye fish has a transparent dome for a head and tubular eyes that rotate to look straight up. It lives in permanent darkness and still keeps its eyes on the goal.",
    context: 'general',
  },
  {
    id: 'vampire-squid', week: 23,
    animal: '🦑',
    text: "The vampire squid isn't a squid or an octopus — it's its own thing entirely. When threatened, it turns itself inside out. Adapt. That's the move.",
    context: 'bubbles_dropping',
  },
  {
    id: 'goblin-shark', week: 23,
    animal: '🦈',
    text: "The goblin shark's jaw can launch forward out of its own face to catch prey. It's been doing this since the Cretaceous. Some habits are older than you think — time to start new ones.",
    context: 'general',
  },
  {
    id: 'blanket-octopus-female', week: 23,
    animal: '🐙',
    text: "A female blanket octopus is 40,000 times heavier than the male. She also rips the stinging tentacles off Portuguese man-o-wars to use as weapons. Log your shoulder work.",
    context: 'shoulder_missed',
  },
  {
    id: 'leafy-sea-dragon', week: 23,
    animal: '🌊',
    text: "The leafy sea dragon has such perfect camouflage that predators swim right past it. The only way they find you is if you stop moving entirely. Keep going.",
    context: 'general',
  },
  {
    id: 'sunfish-vibes', week: 23,
    animal: '🌊',
    text: "The ocean sunfish (Mola mola) is the world's heaviest bony fish — up to 2.3 tonnes — and spends its days floating near the surface doing basically nothing. This is not a role model. Do your run.",
    context: 'skipped_run',
  },

  // ── Week 24 ────────────────────────────────────────────────────────────────
  {
    id: 'bobtail-squid-bacteria', week: 24,
    animal: '🦑',
    text: "The bobtail squid cultivates bioluminescent bacteria in its body to match moonlight and eliminate its own shadow at night. It actively manages its environment to thrive. That's the whole point.",
    context: 'general',
  },
  {
    id: 'dumbo-octopus-depth', week: 24,
    animal: '🐙',
    text: "The dumbo octopus lives at 7,000 metres — one of the deepest known octopuses. Named for its ear-like fins. It never sees sunlight and it never stops moving. What's your excuse?",
    context: 'general',
  },
  {
    id: 'nudibranch-sting', week: 24,
    animal: '🌊',
    text: "Nudibranchs eat stinging anemones and repurpose the stinging cells in their own backs as defence. They take what hurts them and weaponise it. That's what good training does.",
    context: 'general',
  },
  {
    id: 'hairy-frogfish', week: 24,
    animal: '🐡',
    text: "The hairy frogfish can swallow prey larger than itself in 6 milliseconds — faster than the blink of an eye. It walks on its fins and looks like a rock. Unassuming things can be extraordinary.",
    context: 'general',
  },
  {
    id: 'flying-fish-glide', week: 24,
    animal: '🐟',
    text: "Flying fish can glide up to 400 metres and stay airborne for 45 seconds by spreading their pectoral fins like wings. They evolved to do more than they were built for. You can too.",
    context: 'run_reminder',
  },
  {
    id: 'frilled-shark-fossil', week: 24,
    animal: '🦈',
    text: "The frilled shark has 300 teeth arranged in 25 rows and looks like an eel. It's been swimming unchanged for 80 million years. Consistency so extreme it became permanent. Something to aspire to.",
    context: 'streak_warning',
  },
  {
    id: 'giant-isopod-fast', week: 24,
    animal: '🦀',
    text: "The giant isopod went without food for 5 years in captivity. When food finally arrived, it didn't binge — it was methodical. You skipped one meal. Log the protein shake and move on.",
    context: 'protein_missed',
  },
  {
    id: 'sarcastic-fringehead', week: 24,
    animal: '🐟',
    text: "The sarcastic fringehead opens a mouth wider than its own body when threatened, revealing a shocking flash of colour. Defend your routine with that same energy.",
    context: 'bubbles_dropping',
  },
  {
    id: 'boxer-crab', week: 24,
    animal: '🦀',
    text: "The boxer crab holds a stinging anemone in each claw and uses them as weapons — and as mops to clean its food. Multi-tasking perfected at the cellular level. Log both things today.",
    context: 'general',
  },
  {
    id: 'ribbon-eel-sex', week: 24,
    animal: '🌊',
    text: "All ribbon eels are born male and vibrant blue. When they mature, they turn yellow and become female. Growth means becoming something different. Don't resist the next version of yourself.",
    context: 'general',
  },

  // ── Week 25 ────────────────────────────────────────────────────────────────
  {
    id: 'mantis-shrimp-club', week: 25,
    animal: '🦐',
    text: "The peacock mantis shrimp's striking club is made of a composite material so tough that engineers have studied it to design better helmets and body armour. What are you building?",
    context: 'general',
  },
  {
    id: 'tasseled-wobbegong', week: 25,
    animal: '🦈',
    text: "The tasseled wobbegong carpet shark lies perfectly flat on the ocean floor and waits. Its patience is its predatory advantage. Rest when you need to. Then strike.",
    context: 'general',
  },
  {
    id: 'bioluminescent-plankton', week: 25,
    animal: '🌊',
    text: "Bioluminescent plankton light up every wave they touch at night — billions of organisms creating something extraordinary just by doing their tiny individual thing. Show up. Add your light.",
    context: 'general',
  },
  {
    id: 'dragonfish-teeth', week: 25,
    animal: '🐟',
    text: "The deep-sea dragonfish has transparent teeth that are functionally invisible in the dark — prey never see them coming. Quiet consistency is the most underrated predator.",
    context: 'streak_warning',
  },
  {
    id: 'christmas-tree-worm', week: 25,
    animal: '🌊',
    text: "Christmas tree worms drill into coral and live there for up to 40 years, using the same spiral structure to feed and breathe. Find your system. Use it for decades.",
    context: 'general',
  },
  {
    id: 'mantis-shrimp-vision2', week: 25,
    animal: '🦐',
    text: "The mantis shrimp can see ultraviolet, infrared, and 12 more colour channels humans don't have. It processes colour in its eyes, not its brain — freeing up brainpower for other things. Work smarter.",
    context: 'general',
  },
  {
    id: 'blobfish-pressure', week: 25,
    animal: '🐟',
    text: "A blobfish looks completely normal at 900 metres depth. The sad, deflated face only appears when it's dragged to the surface. Everything has a context where it thrives. Find yours.",
    context: 'bubbles_dropping',
  },
  {
    id: 'sea-cucumber-eviscerate', week: 25,
    animal: '🌊',
    text: "When threatened, the sea cucumber eviscerates — ejects its own organs. Then regrows them in weeks. You can survive a bad stretch. You can regrow. Log what you can today.",
    context: 'bubbles_dropping',
  },
  {
    id: 'flashlight-fish', week: 25,
    animal: '🐟',
    text: "The flashlight fish has organs under each eye full of bioluminescent bacteria. It can flash them on and off to communicate, attract prey, and confuse predators. Signal your intent. Then execute.",
    context: 'general',
  },
  {
    id: 'greenland-shark-age', week: 25,
    animal: '🦈',
    text: "The Greenland shark lives up to 500 years — the longest of any vertebrate. It doesn't reach sexual maturity until 150. The long game is the only game. One log at a time.",
    context: 'streak_warning',
  },

  // ── Week 26 ────────────────────────────────────────────────────────────────
  {
    id: 'mimic-octopus-fly', week: 26,
    animal: '🐙',
    text: "The mimic octopus not only impersonates other animals — it chooses which one based on the current threat. Situational intelligence. Read the day and respond accordingly.",
    context: 'general',
  },
  {
    id: 'mantis-shrimp-cavity', week: 26,
    animal: '🦐',
    text: "When a pistol shrimp snaps its claw, the cavitation bubble collapses at 218 decibels — louder than a gunshot. You won't hear this one. But log your shoulder work and you'll feel it in a year.",
    context: 'shoulder_missed',
  },
  {
    id: 'axolotl-regenerate', week: 26,
    animal: '🌊',
    text: "The axolotl can regenerate its heart, spinal cord, and parts of its brain. Not a sea animal — but it lives in water and the point stands: recovery is built into the system. Rest. Then return.",
    context: 'bubbles_dropping',
  },
  {
    id: 'wobbegong-ambush', week: 26,
    animal: '🦈',
    text: "The wobbegong doesn't chase anything. It perfects its position, becomes invisible, and waits. There are days for effort and days for positioning. Know the difference.",
    context: 'general',
  },
  {
    id: 'flying-gurnard', week: 26,
    animal: '🐟',
    text: "The flying gurnard walks along the seafloor on modified pectoral fins and fans out enormous wing-like displays when threatened. It didn't evolve to stay still. Neither did you.",
    context: 'skipped_run',
  },
  {
    id: 'sea-angel-predator', week: 26,
    animal: '🌊',
    text: "The sea angel is a tiny, translucent, free-swimming sea slug with wings. It looks delicate. It is a voracious predator that hunts other sea slugs exclusively. Looks are irrelevant. Output is everything.",
    context: 'general',
  },
  {
    id: 'torpedo-ray', week: 26,
    animal: '🌊',
    text: "The torpedo ray generates electric jolts of up to 220 volts to stun prey. Ancient Greeks used it as an anaesthetic. Even the ocean had sports medicine. Your shoulder work is non-negotiable.",
    context: 'shoulder_missed',
  },
  {
    id: 'flamboyant-cuttlefish', week: 26,
    animal: '🦑',
    text: "The flamboyant cuttlefish is so toxic it can afford to be neon pink and yellow in broad daylight — it has nothing to fear. Build enough capability and you don't need camouflage either.",
    context: 'general',
  },
  {
    id: 'oarfish-depth', week: 26,
    animal: '🌊',
    text: "The oarfish can reach 11 metres in length and is thought to be the origin of sea serpent myths. It's rarely seen alive. Rare sightings, long life, no fuss. Quiet consistency.",
    context: 'streak_warning',
  },
  {
    id: 'humuhumunukunukuapuaa', week: 26,
    animal: '🐟',
    text: "The humuhumunukunukuapua'a — Hawaii's state fish — makes grunting sounds by grinding its teeth. It's been doing this since before Hawaii had a state. Find your sound. Make it.",
    context: 'general',
  },

  // ── Week 27 ────────────────────────────────────────────────────────────────
  {
    id: 'tardigrade-water', week: 27,
    animal: '🌊',
    text: "Tardigrades are microscopic, live in water films, and can survive the vacuum of space, 150°C heat, and 5,000 grays of radiation. The word 'optimal conditions' is not in their vocabulary. Neither is it in yours today.",
    context: 'general',
  },
  {
    id: 'mantis-eye-speed', week: 27,
    animal: '🦐',
    text: "The mantis shrimp's eyes move independently and can see a spectrum no other animal can. It doesn't use all 16 channels at once — it routes the right channel to the right situation. Attention is a skill.",
    context: 'general',
  },
  {
    id: 'jawfish-mouthbrooder', week: 27,
    animal: '🐟',
    text: "Male jawfish carry their eggs in their mouths for weeks, unable to eat until they hatch. They did not log this as a setback. They logged it as the job. Do your job.",
    context: 'shoulder_missed',
  },
  {
    id: 'pistol-shrimp-colony', week: 27,
    animal: '🦐',
    text: "Pistol shrimp form colonies with a single breeding queen, like ants — the only known example in the ocean. They built a social system from scratch. Systems work. Build yours.",
    context: 'general',
  },
  {
    id: 'mantis-meral-spread', week: 27,
    animal: '🦐',
    text: "Before striking, the mantis shrimp performs a 'meral spread' — flashing its bright patterns at the opponent. A warning before impact. Your habits are compounding in silence. Consider this yours.",
    context: 'bubbles_dropping',
  },
  {
    id: 'seahorse-speed', week: 27,
    animal: '🌊',
    text: "Despite being almost entirely unable to swim, the seahorse hunts with a 90% success rate — the highest of almost any predator. Method and precision beat raw speed every time.",
    context: 'general',
  },
  {
    id: 'vampire-squid-ink', week: 27,
    animal: '🦑',
    text: "The vampire squid doesn't have ink. Instead it ejects a cloud of glowing mucus. It improvised entirely new defences from whatever it had. Adapt with what you've got.",
    context: 'general',
  },
  {
    id: 'ringed-octopus', week: 27,
    animal: '🐙',
    text: "The blue-ringed octopus is the size of a golf ball and carries enough venom to kill 26 humans. The rings only appear when it's about to act. Don't announce — do.",
    context: 'general',
  },
  {
    id: 'whale-song', week: 27,
    animal: '🐋',
    text: "Humpback whales sing songs that evolve across the population over years — one whale innovates a phrase and it spreads across entire ocean basins within a season. Progress spreads when you share it.",
    context: 'general',
  },
  {
    id: 'sea-otter-tool', week: 27,
    animal: '🌊',
    text: "Sea otters are one of the few non-primate tool users — they keep a favourite rock tucked in their armpit to crack shells. They are prepared before the need arises. Pack your bag the night before.",
    context: 'general',
  },

  // ── Week 28 ────────────────────────────────────────────────────────────────
  {
    id: 'mantis-colour3', week: 28,
    animal: '🦐',
    text: "The peacock mantis shrimp doesn't just see more colours — it makes decisions at a speed that bypasses the kind of deliberation that keeps you from logging your run. It reacts. So should you.",
    context: 'run_reminder',
  },
  {
    id: 'sea-spider-gut', week: 28,
    animal: '🌊',
    text: "Sea spiders are so thin their guts extend into their legs. There is no wasted space. Every part contributes. Your habits work the same way when they compound.",
    context: 'general',
  },
  {
    id: 'siphonophore-colony', week: 28,
    animal: '🌊',
    text: "The Portuguese man-o-war isn't a jellyfish — it's a siphonophore: a colony of individual organisms so specialised they function as a single animal. No one does everything. Everyone does their part.",
    context: 'general',
  },
  {
    id: 'bobbit-worm', week: 28,
    animal: '🌊',
    text: "The bobbit worm burrows into the seafloor and waits — sometimes for years — before striking at prey passing overhead. Patience and precision have been evolving since the Devonian. Build them.",
    context: 'general',
  },
  {
    id: 'electric-eel-sense', week: 28,
    animal: '🌊',
    text: "Electric eels have three electric organs and can sense the faintest electrical field from nearby prey. They don't need to see what they're hunting. Develop a sense for your progress even when it isn't visible.",
    context: 'bubbles_dropping',
  },
  {
    id: 'crown-of-thorns', week: 28,
    animal: '⭐',
    text: "The crown-of-thorns starfish can have up to 21 arms. When one is removed it regrows. The ocean doesn't do subtraction well. Neither should your discipline.",
    context: 'streak_warning',
  },
  {
    id: 'peacock-flounder', week: 28,
    animal: '🐟',
    text: "The peacock flounder can change colour in under 8 seconds using only 3 types of colour cells, despite being colourblind. It adapts with the tools it has. So can you.",
    context: 'general',
  },
  {
    id: 'wunderpus-octopus', week: 28,
    animal: '🐙',
    text: "The wunderpus octopus has a unique pattern of spots and rings — like a fingerprint. No two are alike. Your progress path is also entirely your own. Don't compare it to anyone else's.",
    context: 'general',
  },
  {
    id: 'longhorn-cowfish', week: 28,
    animal: '🐡',
    text: "The longhorn cowfish releases a toxin when stressed that kills everything around it, including itself. Some defences hurt both parties. Don't let a bad day poison the whole week.",
    context: 'bubbles_dropping',
  },
  {
    id: 'coelacanth-ancient', week: 28,
    animal: '🐟',
    text: "The coelacanth was thought extinct for 65 million years until one was caught in 1938. It hadn't changed a bit. Some fundamentals don't need updating. Sleep. Protein. Movement. Always.",
    context: 'general',
  },
]

// Current ISO week of the year (resets annually; week 23 ≈ early June)
const THIS_WEEK = currentISOWeek()

// Returns alerts available this week (week 0 = always; else week <= THIS_WEEK)
export function getAvailableAlerts() {
  return ALERTS.filter(a => a.week === 0 || a.week <= THIS_WEEK)
}

export function getRandomAlert(context = 'general') {
  const available = getAvailableAlerts()
  const pool = available.filter(a => a.context === context || a.context === 'general')
  const final = pool.length > 0 ? pool : available
  return final[Math.floor(Math.random() * final.length)]
}

export function getAlertForBubblesContext(bubblesDelta) {
  if (bubblesDelta < -50) return getRandomAlert('bubbles_dropping')
  return getRandomAlert('general')
}
