// Motivational sea animal alerts — shown as ambient notifications
// Never reveal the full list. Rotate randomly, weight toward low-bubble contexts.

export const ALERTS = [
  {
    id: 'octopus-hearts',
    animal: '🐙',
    text: "An octopus has three hearts and still finds time to use all eight arms. Your shoulders aren't going to strengthen themselves.",
    context: 'shoulder_missed',
  },
  {
    id: 'seahorse-birth',
    animal: '🌊',
    text: "The seahorse is the only animal where the male gives birth. He didn't skip leg day either.",
    context: 'skipped_run',
  },
  {
    id: 'orca-hunt',
    animal: '🐋',
    text: "Orcas teach their young to hunt. Pass something good on today — go for that run.",
    context: 'run_reminder',
  },
  {
    id: 'manta-migrate',
    animal: '🌊',
    text: "Manta rays migrate thousands of miles without a Google Maps notification. The pool is 20 minutes away. Just saying.",
    context: 'swim_reminder',
  },
  {
    id: 'whale-heart',
    animal: '🐳',
    text: "A blue whale's heart is the size of a small car and beats just twice a minute. Calm, consistent, unstoppable. Sound familiar? It could.",
    context: 'general',
  },
  {
    id: 'barracuda-speed',
    animal: '🐟',
    text: "Barracudas can hit 40km/h in open water. Your run doesn't need to be fast. It just needs to happen.",
    context: 'run_reminder',
  },
  {
    id: 'pufferfish-bigger',
    animal: '🐡',
    text: "Pufferfish double in size when they need to. Today's the day to show up bigger than yesterday.",
    context: 'general',
  },
  {
    id: 'dolphin-sleep',
    animal: '🐬',
    text: "Dolphins sleep with one eye open. You hit snooze four times. There's room to grow.",
    context: 'woke_late',
  },
  {
    id: 'mantis-punch',
    animal: '🦞',
    text: "A mantis shrimp can punch with the force of a bullet. Imagine channeling 10% of that into your morning.",
    context: 'morning',
  },
  {
    id: 'jellyfish-immortal',
    animal: '🪼',
    text: "The immortal jellyfish can revert to its juvenile state and start over. You get a fresh log every day. Use it.",
    context: 'general',
  },
  {
    id: 'lobster-grow',
    animal: '🦞',
    text: "Lobsters keep growing their entire lives. They don't plateau. Neither should you.",
    context: 'general',
  },
  {
    id: 'clownfish-habitat',
    animal: '🐠',
    text: "Clownfish never leave their anemone. Your gym bag has been on the floor for three days. One of you needs to move.",
    context: 'skipped_run',
  },
  {
    id: 'seahorse-patience',
    animal: '🌊',
    text: "Seahorses have no stomach — they must eat constantly to survive. A single protein shake is not a lot to ask.",
    context: 'protein_missed',
  },
  {
    id: 'whale-migration',
    animal: '🐳',
    text: "Humpback whales travel up to 16,000 miles without stopping. You have 3km on the plan today. The math is in your favour.",
    context: 'run_reminder',
  },
  {
    id: 'starfish-regenerate',
    animal: '⭐',
    text: "Starfish can regenerate a lost arm. You can regenerate a lost week. The bubbles don't care about yesterday.",
    context: 'bubbles_dropping',
  },
  {
    id: 'cuttlefish-camouflage',
    animal: '🦑',
    text: "Cuttlefish have W-shaped pupils and can see polarised light. They see everything. Including your excuses.",
    context: 'general',
  },
  {
    id: 'anglerfish-depth',
    animal: '🐟',
    text: "Anglerfish live at crushing depths with no light. You have running shoes and a Sunday morning. No contest.",
    context: 'run_reminder',
  },
  {
    id: 'sea-turtle-navigate',
    animal: '🐢',
    text: "Sea turtles navigate by the Earth's magnetic field and return to the exact beach they were born on. Consistency is a superpower.",
    context: 'general',
  },
  {
    id: 'moray-eel-jaw',
    animal: '🐍',
    text: "Moray eels have a second jaw that shoots forward to grab prey. That's two jaws of determination. How many do you have?",
    context: 'general',
  },
  {
    id: 'seahorse-grip',
    animal: '🌊',
    text: "Seahorses grip seagrass with their tails in storms rather than swim away. Hold the habit when it's hard.",
    context: 'bubbles_dropping',
  },
  {
    id: 'orca-streak',
    animal: '🐋',
    text: "Orcas maintain hunting strategies passed down through generations. Your streak is your strategy. Don't break the chain.",
    context: 'streak_warning',
  },
  {
    id: 'blue-whale-krill',
    animal: '🐳',
    text: "A blue whale eats 4 tonnes of krill a day. One vegan protein shake is, by comparison, extremely manageable.",
    context: 'protein_missed',
  },
  {
    id: 'dolphin-play',
    animal: '🐬',
    text: "Dolphins have been observed surfing waves purely for fun. They train and they play. So can you.",
    context: 'general',
  },
  {
    id: 'clam-age',
    animal: '🐚',
    text: "The oldest known clam lived to 507 years old. It did not miss a single day of being a clam. Consistency.",
    context: 'streak_warning',
  },
]

export function getRandomAlert(context = 'general') {
  const contextAlerts = ALERTS.filter(a => a.context === context || a.context === 'general')
  const pool = contextAlerts.length > 0 ? contextAlerts : ALERTS
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getAlertForBubblesContext(bubblesDelta) {
  if (bubblesDelta < -50) return getRandomAlert('bubbles_dropping')
  return getRandomAlert('general')
}
